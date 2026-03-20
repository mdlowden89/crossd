import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This runs on a schedule - use service role
    const since = new Date(Date.now() - 75 * 60 * 1000).toISOString();
    const moments = await base44.asServiceRole.entities.Moment.filter(
      { created_date: { $gte: since } },
      '-created_date',
      500
    );

    const counts = {};
    for (const m of moments) {
      if (!m.geohash) continue;
      const zoneId = `z_${m.geohash.substring(0, 5)}`;
      counts[zoneId] = (counts[zoneId] || 0) + 1;
    }

    // Also fade zones not seen recently (get all live zones and reset ones with no recent activity)
    const allLive = await base44.asServiceRole.entities.ZoneLive.filter({});
    const activeZoneIds = new Set(Object.keys(counts));

    for (const lz of allLive) {
      if (!activeZoneIds.has(lz.zone_id)) {
        // Fade out - no recent activity
        await base44.asServiceRole.entities.ZoneLive.update(lz.id, {
          live_score: 0,
          state: 'calm',
          activity_band: 'low',
          recent_moment_count: 0
        });
      }
    }

    let updated = 0;
    for (const [zoneId, count] of Object.entries(counts)) {
      const live_score = Math.min(1, count / 20);
      const state = live_score > 0.65 ? 'peaking' : live_score > 0.3 ? 'active' : 'calm';
      const activity_band = count >= 15 ? 'high' : count >= 6 ? 'med' : 'low';

      const existing = await base44.asServiceRole.entities.ZoneLive.filter({ zone_id: zoneId });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.ZoneLive.update(existing[0].id, {
          live_score, state, activity_band, recent_moment_count: count
        });
      } else {
        await base44.asServiceRole.entities.ZoneLive.create({
          zone_id: zoneId,
          live_score, state, activity_band, recent_moment_count: count
        });
      }
      updated++;
    }

    return Response.json({ success: true, zones_updated: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});