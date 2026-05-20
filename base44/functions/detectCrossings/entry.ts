import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map LogMoment ethnicity values to Profile ethnicity enum values
const ETHNICITY_MAP = {
  white: 'White/Caucasian',
  black: 'Black/African Descent',
  east_asian: 'East Asian',
  hispanic: 'Hispanic/Latino',
  middle_eastern: 'Middle Eastern',
  south_asian: 'South Asian',
  other: 'Other'
};

// Check if user A is interested in user B's gender
function isInterestedIn(userAInterest, userBGender) {
  if (!userAInterest || !userBGender) return true; // missing data, don't block
  if (userAInterest === 'everyone') return true;
  if (userAInterest === 'men' && userBGender === 'man') return true;
  if (userAInterest === 'women' && userBGender === 'woman') return true;
  if (userAInterest === 'men_and_women' && (userBGender === 'man' || userBGender === 'woman')) return true;
  return false;
}

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

    // Get the logging user's profile
    const myProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: userId });
    if (!myProfiles || myProfiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const myProfile = myProfiles[0];

    // Find other users' moments with the same tile_key within 1-hour window
    const allTileMoments = await base44.asServiceRole.entities.Moment.filter({
      tile_key: moment.tile_key
    });

    const momentTime = new Date(moment.time_bucket).getTime();
    const ONE_HOUR = 60 * 60 * 1000;

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

      // --- FILTER 1: Gender / sexual interest (mutual) ---
      const otherProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: otherUserId });
      if (!otherProfiles || otherProfiles.length === 0) continue;
      const otherProfile = otherProfiles[0];

      // I must be interested in them AND they must be interested in me
      const iAmInterestedInThem = isInterestedIn(myProfile.interested_in, otherProfile.gender);
      const theyAreInterestedInMe = isInterestedIn(otherProfile.interested_in, myProfile.gender);
      if (!iAmInterestedInThem || !theyAreInterestedInMe) continue;

      // --- FILTER 2: Ethnicity ---
      // If the logger described ethnicity, it must match the other user's profile ethnicity
      if (moment.target_ethnicity) {
        const mappedEthnicity = ETHNICITY_MAP[moment.target_ethnicity];
        if (mappedEthnicity && otherProfile.ethnicity !== mappedEthnicity) continue;
      }
      // Also check the reverse: if the other user described ethnicity, it must match my profile
      if (otherMoment.target_ethnicity) {
        const mappedEthnicity = ETHNICITY_MAP[otherMoment.target_ethnicity];
        if (mappedEthnicity && myProfile.ethnicity !== mappedEthnicity) continue;
      }

      // --- FILTER 3: Hair colour ---
      // Cross-reference: each user's described hair colour against the other's logged hair colour
      // (Both users independently describe what they saw — symmetric check)
      if (moment.target_hair_color && otherMoment.target_hair_color) {
        // Both described — must agree
        if (moment.target_hair_color !== otherMoment.target_hair_color) continue;
      }
      // If only one side described hair, we allow it through (partial info)

      // --- All filters passed: calculate crossing score ---
      const timeDiffMs = Math.abs(new Date(otherMoment.time_bucket).getTime() - momentTime);
      const timeDiffHours = timeDiffMs / ONE_HOUR;
      let score = Math.round((1 - timeDiffHours) * 100);

      // Boost score when descriptors matched
      if (moment.target_ethnicity) score = Math.min(100, score + 10);
      if (moment.target_hair_color && otherMoment.target_hair_color) score = Math.min(100, score + 10);

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
        crossing_score: score,
        status: 'new',
        expires_at: expiresAt,
        location_key: moment.tile_key + '_' + moment.time_bucket.slice(0, 13),
        location_label: moment.venue_name || 'Nearby location',
        occurrence_count: 1,
        idempotency_key: idempotencyKey
      });

      crossingsCreated++;

      // Notify both users
      await Promise.all([
        base44.asServiceRole.entities.Notification.create({
          user_id: myProfile.id,
          type: 'new_crossing',
          title: 'You crossed paths!',
          body: `You were near ${otherProfile.display_name} at ${moment.venue_name || 'a nearby location'}`,
          data: { crossing_id: idempotencyKey, user_id: otherProfile.id, display_name: otherProfile.display_name },
          read: false,
          sent: false
        }),
        base44.asServiceRole.entities.Notification.create({
          user_id: otherProfile.id,
          type: 'new_crossing',
          title: 'You crossed paths!',
          body: `You were near ${myProfile.display_name} at ${moment.venue_name || 'a nearby location'}`,
          data: { crossing_id: idempotencyKey, user_id: myProfile.id, display_name: myProfile.display_name },
          read: false,
          sent: false
        })
      ]);
    }

    return Response.json({ success: true, crossings_created: crossingsCreated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});