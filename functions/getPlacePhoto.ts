import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { venue_name, lat, lng } = await req.json();

    if (!venue_name) {
      return Response.json({ error: 'Venue name required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Search for the place
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.append('query', venue_name);
    if (lat && lng) {
      searchUrl.searchParams.append('location', `${lat},${lng}`);
    }
    searchUrl.searchParams.append('key', apiKey);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      return Response.json({ photo_url: null }, { status: 200 });
    }

    const place = searchData.results[0];
    const placeId = place.place_id;

    // Get place details including photos
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.append('place_id', placeId);
    detailsUrl.searchParams.append('fields', 'photos');
    detailsUrl.searchParams.append('key', apiKey);

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = await detailsResponse.json();

    if (!detailsData.result?.photos || detailsData.result.photos.length === 0) {
      return Response.json({ photo_url: null }, { status: 200 });
    }

    const photoRef = detailsData.result.photos[0].photo_reference;

    // Get the photo URL
    const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
    photoUrl.searchParams.append('maxwidth', '400');
    photoUrl.searchParams.append('photo_reference', photoRef);
    photoUrl.searchParams.append('key', apiKey);

    return Response.json({ photo_url: photoUrl.toString() }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});