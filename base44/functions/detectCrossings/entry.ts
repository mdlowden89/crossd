import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map LogMoment hair colour values to Profile ethnicity enum values
const ETHNICITY_MAP = {
  white: 'White/Caucasian',
  black: 'Black/African Descent',
  east_asian: 'East Asian',
  hispanic: 'Hispanic/Latino',
  middle_eastern: 'Middle Eastern',
  south_asian: 'South Asian',
  other: 'Other'
};

// Scoring weights
const SCORE_TIME = 40;      // max points for time proximity
const SCORE_ETHNICITY = 35; // points for ethnicity match
const SCORE_HAIR = 25;      // points for hair colour match

// Minimum score to create a crossing (requires at least one descriptor match + same tile)
const MIN_SCORE = 35;

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

    // Find other users' moments with the same tile_key
    const allTileMoments = await base44.asServiceRole.entities.Moment.filter({
      tile_key: moment.tile_key
    });

    const momentTime = new Date(moment.time_bucket).getTime();
    const ONE_HOUR = 60 * 60 * 1000;

    // Filter to 1-hour window, excluding own moments
    const nearbyMoments = allTileMoments.filter(m => {
      if (m.user_id === userId) return false;
      if (m.id === momentId) return false;
      const mTime = new Date(m.time_bucket).getTime();
      return Math.abs(mTime - momentTime) <= ONE_HOUR;
    });

    if (nearbyMoments.length === 0) {
      return Response.json({ message: 'No crossings detected', crossings_created: 0 });
    }

    let crossingsCreated = 0;

    for (const otherMoment of nearbyMoments) {
      const otherUserId = otherMoment.user_id;

      // Fetch the other user's profile to match against descriptors
      const otherProfile = await base44.asServiceRole.entities.Profile.filter({ user_id: otherUserId });
      if (!otherProfile || otherProfile.length === 0) continue;
      const profile = otherProfile[0];

      // --- Descriptor matching ---
      let score = 0;
      const hasEthnicityDescriptor = !!moment.target_ethnicity;
      const hasHairDescriptor = !!moment.target_hair_color;

      // Time proximity score (0–40 pts)
      const timeDiffMs = Math.abs(new Date(otherMoment.time_bucket).getTime() - momentTime);
      const timeDiffHours = timeDiffMs / ONE_HOUR;
      score += Math.round((1 - timeDiffHours) * SCORE_TIME);

      // Ethnicity match (35 pts) — only scored if the logger provided it
      if (hasEthnicityDescriptor) {
        const mappedEthnicity = ETHNICITY_MAP[moment.target_ethnicity];
        if (mappedEthnicity && profile.ethnicity === mappedEthnicity) {
          score += SCORE_ETHNICITY;
        } else {
          // They described someone's ethnicity but it doesn't match — skip this user
          continue;
        }
      }

      // Hair colour match (25 pts) — only scored if the logger provided it
      // Profile stores hair colour as part of vibe_tags or we use a simple string match on note
      // For now we store it on the moment's target_hair_color and match against other moment's target_hair_color
      // (both users would describe each other symmetrically)
      if (hasHairDescriptor && otherMoment.target_hair_color) {
        if (moment.target_hair_color === otherMoment.target_hair_color) {
          score += SCORE_HAIR;
        } else {
          // Hair described but doesn't match — skip
          continue;
        }
      } else if (hasHairDescriptor && !otherMoment.target_hair_color) {
        // Logger described hair but other user didn't log — partial match, no penalty
        score += Math.round(SCORE_HAIR * 0.5);
      }

      // Require minimum score to create a crossing
      if (score < MIN_SCORE) continue;

      // Idempotency key to prevent duplicates
      const idempotencyKey = [userId, otherUserId].sort().join('_') + '_' + moment.tile_key + '_' + moment.time_bucket.slice(0, 13);

      const existing = await base44.asServiceRole.entities.Crossing.filter({
        idempotency_key: idempotencyKey
      });

      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.Crossing.update(existing[0].id, {
          occurrence_count: (existing[0].occurrence_count || 1) + 1,
          status: 'new'
        });
        continue;
      }

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      await base44.asServiceRole.entities.Crossing.create({
        user_a_id: userId,
        user_b_id: otherUserId,
        moment_a_id: momentId,
        moment_b_id: otherMoment.id,
        crossing_at: new Date().toISOString(),
        crossing_score: Math.min(score, 100),
        status: 'new',
        expires_at: expiresAt,
        location_key: moment.tile_key + '_' + moment.time_bucket.slice(0, 13),
        location_label: moment.venue_name || 'Nearby location',
        occurrence_count: 1,
        idempotency_key: idempotencyKey
      });

      crossingsCreated++;

      // Notify both users
      const currentProfile = await base44.asServiceRole.entities.Profile.filter({ user_id: userId });
      if (currentProfile.length > 0) {
        await Promise.all([
          base44.asServiceRole.entities.Notification.create({
            user_id: currentProfile[0].id,
            type: 'new_crossing',
            title: 'You crossed paths!',
            body: `You were near ${profile.display_name} at ${moment.venue_name || 'a nearby location'}`,
            data: { crossing_id: idempotencyKey, user_id: profile.id, display_name: profile.display_name },
            read: false,
            sent: false
          }),
          base44.asServiceRole.entities.Notification.create({
            user_id: profile.id,
            type: 'new_crossing',
            title: 'You crossed paths!',
            body: `You were near ${currentProfile[0].display_name} at ${moment.venue_name || 'a nearby location'}`,
            data: { crossing_id: idempotencyKey, user_id: currentProfile[0].id, display_name: currentProfile[0].display_name },
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