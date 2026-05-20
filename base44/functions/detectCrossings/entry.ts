import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { momentId, userId } = await req.json();

    if (!momentId || !userId) {
      return Response.json({ error: 'Missing momentId or userId' }, { status: 400 });
    }

    // Get the newly logged moment
    const moments = await base44.asServiceRole.entities.Moment.filter({ id: momentId });
    if (!moments || moments.length === 0) {
      return Response.json({ error: 'Moment not found' }, { status: 404 });
    }
    const moment = moments[0];

    // Find other users' moments with the same tile_key within a 3-hour window
    const allTileMoments = await base44.asServiceRole.entities.Moment.filter({
      tile_key: moment.tile_key
    });

    // Parse this moment's time bucket (format: "YYYY-MM-DDTHH:00:00Z")
    const momentTime = new Date(moment.time_bucket).getTime();
    const THREE_HOURS = 3 * 60 * 60 * 1000;

    const nearbyMoments = allTileMoments.filter(m => {
      if (m.user_id === userId) return false; // skip own moments
      if (m.id === momentId) return false;
      const mTime = new Date(m.time_bucket).getTime();
      return Math.abs(mTime - momentTime) <= THREE_HOURS;
    });

    if (nearbyMoments.length === 0) {
      return Response.json({ message: 'No crossings detected', crossings_created: 0 });
    }

    let crossingsCreated = 0;

    for (const otherMoment of nearbyMoments) {
      const otherUserId = otherMoment.user_id;

      // Prevent duplicate crossings using idempotency key
      const idempotencyKey = [userId, otherUserId].sort().join('_') + '_' + moment.tile_key + '_' + moment.time_bucket.slice(0, 13);

      const existing = await base44.asServiceRole.entities.Crossing.filter({
        idempotency_key: idempotencyKey
      });

      if (existing && existing.length > 0) {
        // Crossing already exists — increment occurrence count
        await base44.asServiceRole.entities.Crossing.update(existing[0].id, {
          occurrence_count: (existing[0].occurrence_count || 1) + 1,
          status: 'new'
        });
        continue;
      }

      // Calculate a basic crossing score based on time proximity
      const timeDiffHours = Math.abs(new Date(otherMoment.time_bucket).getTime() - momentTime) / (60 * 60 * 1000);
      const crossingScore = Math.round((1 - timeDiffHours / 3) * 100);

      // Create the crossing record
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72h window

      await base44.asServiceRole.entities.Crossing.create({
        user_a_id: userId,
        user_b_id: otherUserId,
        moment_a_id: momentId,
        moment_b_id: otherMoment.id,
        crossing_at: new Date().toISOString(),
        crossing_score: crossingScore,
        status: 'new',
        expires_at: expiresAt,
        location_key: moment.tile_key + '_' + moment.time_bucket.slice(0, 13),
        location_label: moment.venue_name || 'Nearby location',
        occurrence_count: 1,
        idempotency_key: idempotencyKey
      });

      crossingsCreated++;

      // Notify both users
      const [profileA, profileB] = await Promise.all([
        base44.asServiceRole.entities.Profile.filter({ user_id: userId }),
        base44.asServiceRole.entities.Profile.filter({ user_id: otherUserId })
      ]);

      if (profileA.length > 0 && profileB.length > 0) {
        await Promise.all([
          base44.asServiceRole.entities.Notification.create({
            user_id: profileA[0].id,
            type: 'new_crossing',
            title: 'You crossed paths!',
            body: `You were near ${profileB[0].display_name} at ${moment.venue_name || 'a nearby location'}`,
            data: { crossing_id: idempotencyKey, user_id: profileB[0].id, display_name: profileB[0].display_name },
            read: false,
            sent: false
          }),
          base44.asServiceRole.entities.Notification.create({
            user_id: profileB[0].id,
            type: 'new_crossing',
            title: 'You crossed paths!',
            body: `You were near ${profileA[0].display_name} at ${moment.venue_name || 'a nearby location'}`,
            data: { crossing_id: idempotencyKey, user_id: profileA[0].id, display_name: profileA[0].display_name },
            read: false,
            sent: false
          })
        ]);
      }
    }

    return Response.json({ success: true, crossings_created: crossingsCreated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});