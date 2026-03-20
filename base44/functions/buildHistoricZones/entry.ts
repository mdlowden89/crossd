import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Archetype mapping from venue types
const VENUE_TO_ARCHETYPES = {
  cafe: ['calm_cozy', 'creative'],
  coffee_shop: ['calm_cozy', 'creative'],
  book_store: ['calm_cozy', 'deep_intellectual'],
  library: ['deep_intellectual', 'calm_cozy'],
  art_gallery: ['creative'],
  museum: ['creative', 'deep_intellectual'],
  park: ['nature_grounded'],
  beach: ['nature_grounded', 'social_buzzing'],
  night_club: ['nightlife', 'live_electric'],
  bar: ['social_buzzing', 'nightlife'],
  restaurant: ['romantic', 'social_buzzing'],
  concert_hall: ['live_electric'],
  music_venue: ['live_electric'],
  gym: ['active_energetic'],
  yoga_studio: ['nature_grounded', 'calm_cozy'],
  wine_bar: ['romantic', 'intimate_local'],
  rooftop_bar: ['nightlife', 'romantic'],
  spa: ['romantic', 'calm_cozy'],
  bakery: ['calm_cozy', 'intimate_local'],
  university: ['deep_intellectual'],
};

const MOOD_TO_ARCHETYPE = {
  'Romantic': 'romantic',
  'Flirty': 'romantic',
  'Cozy': 'calm_cozy',
  'Calm': 'calm_cozy',
  'Creative': 'creative',
  'Artistic': 'creative',
  'Social': 'social_buzzing',
  'Energetic': 'active_energetic',
  'Vibrant': 'social_buzzing',
  'Peaceful': 'nature_grounded',
  'Natural': 'nature_grounded',
  'Loud': 'live_electric',
  'Intellectual': 'deep_intellectual',
  'Active': 'active_energetic',
  'Spontaneous': 'nightlife',
  'Low-key': 'intimate_local',
};

function getTimeBucket(dateStr) {
  const h = new Date(dateStr).getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 22) return 'evening';
  if (h >= 22 || h < 2) return 'night';
  return 'late';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const moments = await base44.asServiceRole.entities.Moment.filter(
      { created_date: { $gte: since } },
      '-created_date',
      2000
    );

    const zones = {};

    for (const m of moments) {
      if (!m.geohash || !m.lat || !m.lng) continue;
      const zoneId = `z_${m.geohash.substring(0, 5)}`;

      if (!zones[zoneId]) {
        zones[zoneId] = {
          zone_id: zoneId,
          latSum: 0, lngSum: 0, count: 0,
          bucketCounts: { morning: 0, day: 0, evening: 0, night: 0, late: 0 },
          archetypeScores: {}
        };
      }

      const z = zones[zoneId];
      z.latSum += m.lat;
      z.lngSum += m.lng;
      z.count++;
      z.bucketCounts[getTimeBucket(m.created_date)]++;

      // Score from venue types
      for (const vt of (m.venue_types || [])) {
        const archs = VENUE_TO_ARCHETYPES[vt] || [];
        for (const arch of archs) {
          z.archetypeScores[arch] = (z.archetypeScores[arch] || 0) + 1;
        }
      }
      // Score from mood tags
      for (const tag of (m.mood_tags || [])) {
        const arch = MOOD_TO_ARCHETYPE[tag];
        if (arch) z.archetypeScores[arch] = (z.archetypeScores[arch] || 0) + 0.5;
      }
    }

    // Upsert ZoneHistoric records
    let updated = 0;
    for (const z of Object.values(zones)) {
      const centroid_lat = z.latSum / z.count;
      const centroid_lng = z.lngSum / z.count;
      const historic_score = Math.min(1, Math.log10(1 + z.count) / 2.5);

      const dominantArchetypes = Object.entries(z.archetypeScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);

      const peakBuckets = Object.entries(z.bucketCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => k);

      // Check if record exists
      const existing = await base44.asServiceRole.entities.ZoneHistoric.filter({ zone_id: z.zone_id });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.ZoneHistoric.update(existing[0].id, {
          centroid_lat, centroid_lng, historic_score,
          dominant_archetypes: dominantArchetypes,
          archetype_scores: z.archetypeScores,
          peak_buckets: peakBuckets,
          moment_count: z.count
        });
      } else {
        await base44.asServiceRole.entities.ZoneHistoric.create({
          zone_id: z.zone_id,
          centroid_lat, centroid_lng, historic_score,
          dominant_archetypes: dominantArchetypes,
          archetype_scores: z.archetypeScores,
          peak_buckets: peakBuckets,
          moment_count: z.count
        });
      }
      updated++;
    }

    return Response.json({ success: true, zones_updated: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});