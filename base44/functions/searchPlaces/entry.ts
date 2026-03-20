import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { input, lat, lng } = await req.json();

    if (!input || input.length < 2) {
      return Response.json({ predictions: [] }, { status: 200 });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('input', input);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('components', 'country:uk'); // Default to UK, can be made flexible
    
    if (lat && lng) {
      url.searchParams.append('location', `${lat},${lng}`);
      url.searchParams.append('radius', '50000'); // 50km radius
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    return Response.json({ predictions: data.predictions || [] }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});