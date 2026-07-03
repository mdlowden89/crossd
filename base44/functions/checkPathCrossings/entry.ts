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

// Closest point on segment AB to point P, and its distance to P
function distanceToSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const dx = bLat - aLat;
  const dy = bLng - aLng;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0) {
    t = Math.max(0, Math.min(1, ((pLat - aLat) * dx + (pLng - aLng) * dy) / lenSq));
  }
  const closeLat = aLat + t * dx;
  const closeLng = aLng + t * dy;
  return distanceMeters(pLat, pLng, closeLat, closeLng);
}

// Parse HH:MM time string into minutes since midnight
function toMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Does the corridor between stop A and stop B pass within BUFFER_M of the moment?
// Also checks approximate time overlap.
function corridorHitsMoment(stopA, stopB, moment, BUFFER_M = 200) {
  const dist = distanceToSegment(moment.lat, moment.lng, stopA.lat, stopA.lng, stopB.lat, stopB.lng);
  if (dist > BUFFER_M) return false;

  // Time check: moment bucket hour must overlap with travel window
  const momentHour = new Date(moment.time_bucket).getUTCHours();
  const momentMin = momentHour * 60;

  const departMin = toMinutes(stopA.left_at);
  const arriveMin = toMinutes(stopB.arrived_at);

  // If either time is missing, skip time check (spatial match is enough)
  if (departMin === null || arriveMin === null) return true;

  const windowStart = Math.min(departMin, arriveMin) - 30;
  const windowEnd = Math.max(departMin, arriveMin) + 30;
  return momentMin >= windowStart && momentMin <= windowEnd;
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
    const { momentId, userId } = await req.json();

    if (!momentId || !userId) {
      return Response.json({ error: 'Missing momentId or userId' }, { status: 400 });
    }

    const moments = await base44.asServiceRole.entities.Moment.filter({ id: momentId });
    if (!moments || moments.length === 0) {
      return Response.json({ error: 'Moment not found' }, { status: 404 });
    }
    const moment = moments[0];

    const myProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: userId });
    if (!myProfiles || myProfiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const myProfile = myProfiles[0];

    // Get today's date string from the moment's time bucket
    const dateStr = moment.time_bucket.slice(0, 10);

    // Find all DailyPaths from today (exclude self)
    const todayPaths = await base44.asServiceRole.entities.DailyPath.filter({ date: dateStr });
    const otherPaths = todayPaths.filter(p => p.user_id !== userId);

    let crossingsCreated = 0;

    for (const path of otherPaths) {
      const stops = path.stops || [];
      if (stops.length === 0) continue;

      // Check if any corridor segment hits the moment
      let hit = false;

      // Single stop: check if the stop itself is within buffer
      if (stops.length === 1) {
        const dist = distanceMeters(moment.lat, moment.lng, stops[0].lat, stops[0].lng);
        if (dist <= 200) hit = true;
      } else {
        for (let i = 0; i < stops.length - 1; i++) {
          if (corridorHitsMoment(stops[i], stops[i + 1], moment)) {
            hit = true;
            break;
          }
        }
        // Also check if moment is near any individual stop
        if (!hit) {
          for (const stop of stops) {
            if (distanceMeters(moment.lat, moment.lng, stop.lat, stop.lng) <= 200) {
              hit = true;
              break;
            }
          }
        }
      }

      if (!hit) continue;

      const otherUserId = path.user_id;
      const otherProfiles = await base44.asServiceRole.entities.Profile.filter({ user_id: otherUserId });
      if (!otherProfiles || otherProfiles.length === 0) continue;
      const otherProfile = otherProfiles[0];

      // Gender interest filters
      if (!isInterestedIn(myProfile.interested_in, otherProfile.gender)) continue;
      if (!isInterestedIn(otherProfile.interested_in, myProfile.gender)) continue;

      // Ethnicity filter
      if (moment.target_ethnicity) {
        const mapped = ETHNICITY_MAP[moment.target_ethnicity];
        if (mapped && otherProfile.ethnicity !== mapped) continue;
      }

      // Idempotency key (path-based crossing)
      const idempotencyKey = [userId, otherUserId].sort().join('_') + '_path_' + dateStr + '_' + moment.geohash?.slice(0, 5);

      const existing = await base44.asServiceRole.entities.Crossing.filter({ idempotency_key: idempotencyKey });
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
        crossing_at: new Date().toISOString(),
        crossing_score: 70, // path-based crossings score slightly lower than direct moments
        status: 'new',
        expires_at: expiresAt,
        location_key: 'path_' + dateStr + '_' + (moment.geohash?.slice(0, 5) || ''),
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
          title: 'Your paths may have crossed!',
          body: `Someone passed near ${moment.venue_name || 'your location'} today — log where you went to find out`,
          data: { crossing_id: idempotencyKey },
          read: false,
          sent: false
        }),
        base44.asServiceRole.entities.Notification.create({
          user_id: otherProfile.id,
          type: 'new_crossing',
          title: 'Your paths may have crossed!',
          body: `Someone you may have passed near ${moment.venue_name || 'your area'} — check your crossings`,
          data: { crossing_id: idempotencyKey, from_path: true },
          read: false,
          sent: false
        })
      ]);
    }

    return Response.json({ success: true, path_crossings_created: crossingsCreated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});