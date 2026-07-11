import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, lat, lng, radius = 5000 } = await req.json();
    if (!query || !lat || !lng) {
      return Response.json({ error: 'query, lat, lng required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) return Response.json({ error: 'API key not configured' }, { status: 500 });

    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', query);
    url.searchParams.append('location', `${lat},${lng}`);
    url.searchParams.append('radius', String(radius));
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    const places = (data.results || []).slice(0, 5).map((p: any) => ({
      name: p.name,
      address: p.formatted_address || p.vicinity || '',
      rating: p.rating,
      lat: p.geometry?.location?.lat,
      lng: p.geometry?.location?.lng,
      place_id: p.place_id,
    }));

    return Response.json({ places });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});