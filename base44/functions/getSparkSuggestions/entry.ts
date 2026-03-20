import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId } = await req.json();

    // Get user profile
    const profile = await base44.entities.Profile.get(profileId);

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get recent moments to understand location patterns
    const recentMoments = await base44.entities.Moment.filter(
      { user_id: profile.user_id },
      '-created_date',
      10
    );

    const locationContext = recentMoments.length > 0
      ? `Recent places: ${recentMoments.map(m => m.venue_name).filter(Boolean).slice(0, 5).join(', ')}`
      : 'No recent location history';

    // Use AI to generate personalized suggestions
    const prompt = `You are a cool, in-the-know city guide who specializes in creating serendipitous connections.

User Profile:
- MBTI Type: ${profile.mbti_type || 'Not specified'}
- Vibe Tags: ${profile.vibe_tags?.join(', ') || 'Not specified'}
- City: ${profile.city || 'London'}
- ${locationContext}

Generate 5 REAL, specific places in ${profile.city || 'London'} where this person is likely to connect with compatible people. Focus on unique, interesting venues - NO generic chains.

For each place, provide a compelling reason that directly references their personality and vibes.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                placeName: { type: 'string' },
                type: { 
                  type: 'string',
                  enum: ['Hidden Gem', 'High-Spark Spot', 'Creative Corner', 'Date Night', 'Social Scene']
                },
                vibe: { type: 'string' },
                reason: { type: 'string' },
                address: { type: 'string' }
              },
              required: ['placeName', 'type', 'vibe', 'reason', 'address']
            }
          }
        }
      }
    });

    // Enrich with coordinates using Google Places
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const enrichedSuggestions = await Promise.all(
      response.suggestions.map(async (suggestion, index) => {
        try {
          // Search for place
          const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(suggestion.placeName + ' ' + (profile.city || 'London'))}&key=${apiKey}`;
          const searchRes = await fetch(searchUrl);
          const searchData = await searchRes.json();

          if (searchData.results && searchData.results[0]) {
            const place = searchData.results[0];
            
            // Get photo URL if available
            let imageUrl = null;
            if (place.photos && place.photos[0]) {
              imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`;
            }

            return {
              id: `spark-${Date.now()}-${index}`,
              placeName: suggestion.placeName,
              type: suggestion.type,
              vibe: suggestion.vibe,
              reason: suggestion.reason,
              address: place.formatted_address,
              coordinates: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              },
              imageUrl
            };
          }
        } catch (error) {
          console.error('Error enriching suggestion:', error);
        }

        return {
          id: `spark-${Date.now()}-${index}`,
          ...suggestion,
          coordinates: { lat: 51.5074, lng: -0.1278 },
          imageUrl: null
        };
      })
    );

    return Response.json({ suggestions: enrichedSuggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});