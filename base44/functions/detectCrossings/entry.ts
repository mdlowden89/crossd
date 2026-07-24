import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map LogMoment ethnicity values to Profile ethnicity enum values
const ETHNICITY_MAP: Record<string, string> = {
  white: 'White/Caucasian',
  black: 'Black/African Descent',
  east_asian: 'East Asian',
  hispanic: 'Hispanic/Latino',
  middle_eastern: 'Middle Eastern',
  south_asian: 'South Asian',
  other: 'Other'
};

// Check if user A is interested in user B's gender
function isInterestedIn(userAInterest: string, userBGender: string): boolean {
  if (!userAInterest || !userBGender) return true;
  if (userAInterest === 'everyone') return true;
  if (userAInterest === 'men' && userBGender === 'man') return true;
  if (userAInterest === 'women' && userBGender === 'woman') return true;
  if (userAInterest === 'men_and_women' && (userBGender === 'man' || userBGender === 'woman')) return true;
  return false;
}

// Geohash neighbour expansion — returns the 4-char prefix and its 8 neighbours
// so we catch users at tile boundaries who were physically close
function getNeighbourPrefixes(geohash: string): string[] {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  const NEIGHBOURS: Record<string, Record<string, string>> = {
    right:  { even: 'bc01fg45telerik89telerik89telerik89telerik89' , odd: 'p0r21436x8zb9dceftghijklmnopqrstuvwxy' },
    left:   { even: '238967debc01telerik89telerik89telerik89telerik89', odd: '14telerik89telerik89yz' },
    top:    { even: 'p0r21436x8zb9dceftghijklmnopqrstuvwxy', odd: 'bc01fg45' },
    bottom: { even: '14telerik89telerik89yz', odd: '238967debc01' }
  };

  // Simple approach: use 4-char prefix to get ~25km cells, collect self + prefix neighbours
  const prefix = geohash.slice(0, 4);
  // Rather than full neighbour calc (complex), return prefix for broad matching
  // The tile_key is 5 chars, so prefix-4 groups nearby tiles
  return [prefix];
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

    // Find nearby moments: match on 4-char geohash prefix (~25km²) to catch tile boundaries
    // tile_key is now a 5-char geohash, so prefix match covers adjacent tiles
    const tilePrefix = (moment.tile_key || moment.geohash || '').slice(0, 4);
    if (!tilePrefix) {
      return Response.json({ message: 'No location data on moment', crossings_created: 0 });
    }

    // Fetch moments in the same geohash prefix area (last 30 days to limit scan)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const allRecentMoments = await base44.asServiceRole.entities.Moment.filter({
      created_date: { $gte: thirtyDaysAgo }
    });

    const momentTime = new Date(moment.created_date || moment.time_bucket).getTime();
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    // Filter to same area + within 2-hour window + not the same user
    const nearbyMoments = allRecentMoments.filter((m: any) => {
      if (m.user_id === userId) return false;
      if (m.id === momentId) return false;

      // Geohash prefix match (4 chars = ~25km², good enough for city-level proximity)
      const mPrefix = (m.tile_key || m.geohash || '').slice(0, 4);
      if (mPrefix !== tilePrefix) return false;

      // Time window: within 2 hours of each other
      const mTime = new Date(m.created_date || m.time_bucket).getTime();
      return Math.abs(mTime - momentTime) <= TWO_HOURS;
    });

    if (nearbyMoments.length === 0) {
      return Response.json({ message: 'No crossings detected', crossings_created: 0 });
    }

    let crossingsCreated = 0;

    for (const otherMoment of nearbyMoments) {
      const otherUserId = otherMoment.user_id;

      // Get the other user's profile
      const otherProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: otherUserId });
      if (!otherProfiles || otherProfiles.length === 0) continue;
      const otherProfile = otherProfiles[0];

      // --- FILTER 1: Gender / sexual interest (mutual) ---
      const iAmInterestedInThem = isInterestedIn(myProfile.interested_in, otherProfile.gender);
      const theyAreInterestedInMe = isInterestedIn(otherProfile.interested_in, myProfile.gender);
      if (!iAmInterestedInThem || !theyAreInterestedInMe) continue;

      // --- FILTER 2: Age preference (mutual) ---
      // Calculate ages from birthdates
      if (myProfile.birthdate && otherProfile.birthdate) {
        const myAge = Math.floor((Date.now() - new Date(myProfile.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const theirAge = Math.floor((Date.now() - new Date(otherProfile.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        // Check my age range preference for them
        if (myProfile.age_min && theirAge < myProfile.age_min) continue;
        if (myProfile.age_max && theirAge > myProfile.age_max) continue;
        // Check their age range preference for me
        if (otherProfile.age_min && myAge < otherProfile.age_min) continue;
        if (otherProfile.age_max && myAge > otherProfile.age_max) continue;
      }

      // --- FILTER 3: Ethnicity (observation vs profile) ---
      // If A described ethnicity of person they noticed, check it matches B's profile ethnicity
      if (moment.target_ethnicity) {
        const mappedEthnicity = ETHNICITY_MAP[moment.target_ethnicity];
        if (mappedEthnicity && otherProfile.ethnicity && otherProfile.ethnicity !== 'Prefer Not to Say') {
          if (otherProfile.ethnicity !== mappedEthnicity) continue;
        }
      }
      // Reverse: B's description must match A's profile ethnicity
      if (otherMoment.target_ethnicity) {
        const mappedEthnicity = ETHNICITY_MAP[otherMoment.target_ethnicity];
        if (mappedEthnicity && myProfile.ethnicity && myProfile.ethnicity !== 'Prefer Not to Say') {
          if (myProfile.ethnicity !== mappedEthnicity) continue;
        }
      }

      // --- FILTER 4: Hair colour (cross-observation match) ---
      // If A describes the hair of who they noticed AND B describes the hair of who they noticed,
      // those two observations must agree (they each described seeing the other)
      if (moment.target_hair_color && otherMoment.target_hair_color) {
        if (moment.target_hair_color !== otherMoment.target_hair_color) continue;
      }

      // --- All filters passed: calculate crossing score ---
      const timeDiffMs = Math.abs(new Date(otherMoment.created_date || otherMoment.time_bucket).getTime() - momentTime);
      const timeDiffHours = timeDiffMs / (60 * 60 * 1000);
      let score = Math.round(Math.max(10, (1 - timeDiffHours / 2) * 80)); // base 0-80 from time

      // Boost score when descriptors matched — stronger signal
      if (moment.target_ethnicity && otherMoment.target_ethnicity) score = Math.min(100, score + 10);
      if (moment.target_hair_color && otherMoment.target_hair_color) score = Math.min(100, score + 10);

      // Idempotency key
      const idempotencyKey = [userId, otherUserId].sort().join('_') + '_' + tilePrefix + '_' + new Date(momentTime).toISOString().slice(0, 13);

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
        location_key: tilePrefix + '_' + new Date(momentTime).toISOString().slice(0, 13),
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
          title: 'You crossed paths! ✨',
          body: `You were near ${otherProfile.display_name} at ${moment.venue_name || 'a nearby location'}`,
          data: { crossing_id: idempotencyKey, profile_id: otherProfile.id, display_name: otherProfile.display_name },
          read: false,
          sent: false
        }),
        base44.asServiceRole.entities.Notification.create({
          user_id: otherProfile.id,
          type: 'new_crossing',
          title: 'You crossed paths! ✨',
          body: `You were near ${myProfile.display_name} at ${moment.venue_name || 'a nearby location'}`,
          data: { crossing_id: idempotencyKey, profile_id: myProfile.id, display_name: myProfile.display_name },
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