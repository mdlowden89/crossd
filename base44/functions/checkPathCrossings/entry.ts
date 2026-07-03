import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Haversine distance in meters
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Distance from point P to line segment AB (in lat/lng, small distances OK)
function distanceToSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const dx = bLat - aLat;
  const dy = bLng - aLng;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0) {
    t = Math.max(0, Math.min(1, ((pLat - aLat) * dx + (pLng - aLng) * dy) / lenSq));
  }
  return distanceMeters(pLat, pLng, aLat + t * dx, aLng + t * dy);
}

function toMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Does User B's path corridor pass within BUFFER_M of User A's moment location?
function pathHitsMoment(stops, momentLat, momentLng, momentHour, BUFFER_M = 200) {
  // Check each individual stop
  for (const stop of stops) {
    if (distanceMeters(momentLat, momentLng, stop.lat, stop.lng) <= BUFFER_M) {
      // Time check for this stop
      const arriveMin = toMinutes(stop.arrived_at);
      const leftMin = toMinutes(stop.left_at);
      if (arriveMin === null && leftMin === null) return true; // no times, spatial match enough
      const momentMin = momentHour * 60;
      const windowStart = (arriveMin ?? momentMin) - 30;
      const windowEnd = (leftMin ?? momentMin) + 30;
      if (momentMin >= windowStart && momentMin <= windowEnd) return true;
    }
  }

  // Check corridors between consecutive stops
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    const dist = distanceToSegment(momentLat, momentLng, a.lat, a.lng, b.lat, b.lng);
    if (dist > BUFFER_M) continue;

    // Time check: moment hour must fall within the travel window between stops
    const departMin = toMinutes(a.left_at);
    const arriveMin = toMinutes(b.arrived_at);
    if (departMin === null || arriveMin === null) return true; // no times, spatial match enough
    const momentMin = momentHour * 60;
    const windowStart = Math.min(departMin, arriveMin) - 30;
    const windowEnd = Math.max(departMin, arriveMin) + 30;
    if (momentMin >= windowStart && momentMin <= windowEnd) return true;
  }

  return false;
}

const ETHNICITY_MAP = {
  white: 'White/Caucasian',
  black: 'Black/African Descent',
  east_asian: 'East Asian',
  hispanic: 'Hispanic/Latino',
  middle_eastern: 'Middle Eastern',
  south_asian: 'South Asian',
  other: 'Other'
};

function isInterestedIn(userAInterest, userBGender) {
  if (!userAInterest || !userBGender) return true;
  if (userAInterest === 'everyone') return true;
  if (userAInterest === 'men' && userBGender === 'man') return true;
  if (userAInterest === 'women' && userBGender === 'woman') return true;
  if (userAInterest === 'men_and_women' && (userBGender === 'man' || userBGender === 'woman')) return true;
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // momentId = User A's moment; userId = User A's user ID
    const { momentId, userId } = await req.json();

    if (!momentId || !userId) {
      return Response.json({ error: 'Missing momentId or userId' }, { status: 400 });
    }

    // Load User A's moment
    const moments = await base44.asServiceRole.entities.Moment.filter({ id: momentId });
    if (!moments || moments.length === 0) {
      return Response.json({ error: 'Moment not found' }, { status: 404 });
    }
    const moment = moments[0];

    // Load User A's profile (to check gender interest filters)
    const myProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: userId });
    if (!myProfiles || myProfiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const myProfile = myProfiles[0];

    const dateStr = moment.time_bucket.slice(0, 10);
    const momentHour = new Date(moment.time_bucket).getUTCHours();

    // Load all DailyPaths from today (excluding User A)
    const todayPaths = await base44.asServiceRole.entities.DailyPath.filter({ date: dateStr });
    const otherPaths = todayPaths.filter(p => p.user_id !== userId);

    let notified = 0;

    for (const path of otherPaths) {
      const stops = path.stops || [];
      if (stops.length === 0) continue;

      // Check if User B's path passes near User A's moment
      if (!pathHitsMoment(stops, moment.lat, moment.lng, momentHour)) continue;

      // Load User B's profile
      const bProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: path.user_id });
      if (!bProfiles || bProfiles.length === 0) continue;
      const bProfile = bProfiles[0];

      // --- Gender interest filter (mutual) ---
      if (!isInterestedIn(myProfile.interested_in, bProfile.gender)) continue;
      if (!isInterestedIn(bProfile.interested_in, myProfile.gender)) continue;

      // --- Ethnicity filter: User A described what they saw; does it match User B's profile? ---
      if (moment.target_ethnicity) {
        const mapped = ETHNICITY_MAP[moment.target_ethnicity];
        if (mapped && bProfile.ethnicity && bProfile.ethnicity !== mapped) continue;
      }

      // --- Hair colour filter: does User A's description match User B's profile? ---
      // (We can only match if bProfile has a hair_color field set — soft match)
      if (moment.target_hair_color && bProfile.hair_color) {
        if (moment.target_hair_color !== bProfile.hair_color) continue;
      }

      // Idempotency key: one notification per User A moment + User B pair
      const idempotencyKey = [userId, path.user_id].sort().join('_') + '_path_' + dateStr + '_' + (moment.geohash?.slice(0, 5) || '');

      const existing = await base44.asServiceRole.entities.Crossing.filter({ idempotency_key: idempotencyKey });
      if (existing && existing.length > 0) continue; // already notified

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      // Create a crossing record with status 'new' — User B sees it as a pending review
      await base44.asServiceRole.entities.Crossing.create({
        user_a_id: userId,       // User A: logged the moment
        user_b_id: path.user_id, // User B: had the path that crossed — must review
        moment_a_id: momentId,
        crossing_at: new Date().toISOString(),
        crossing_score: 65,
        status: 'new',
        expires_at: expiresAt,
        location_key: 'path_' + dateStr + '_' + (moment.geohash?.slice(0, 5) || ''),
        location_label: moment.venue_name || 'Nearby location',
        occurrence_count: 1,
        idempotency_key: idempotencyKey
      });

      // Notify ONLY User B — they need to decide if they want to connect
      await base44.asServiceRole.entities.Notification.create({
        user_id: bProfile.id,
        type: 'new_crossing',
        title: '✨ You may have a moment waiting',
        body: `Someone crossed your path near ${moment.venue_name || 'a place you visited'} today. Tap to see if you'd like to connect.`,
        data: {
          crossing_id: idempotencyKey,
          moment_user_id: userId,
          moment_location: moment.venue_name,
          from_path: true
        },
        read: false,
        sent: false
      });

      notified++;
    }

    return Response.json({ success: true, path_crossings_notified: notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});