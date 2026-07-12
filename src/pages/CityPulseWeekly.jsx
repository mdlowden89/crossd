import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Clock, Sparkles, TrendingUp, Zap, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_BUCKETS = [
  { label: 'Morning', range: [6, 11] },
  { label: 'Afternoon', range: [12, 16] },
  { label: 'Evening', range: [17, 21] },
  { label: 'Night', range: [22, 5] },
];

const CATEGORY_TO_ARCHETYPE = {
  cafe: 'calm_cozy', coffee_shop: 'calm_cozy', art_gallery: 'creative',
  museum: 'creative', park: 'nature_grounded', beach: 'nature_grounded',
  night_club: 'nightlife', bar: 'social_buzzing', pub: 'intimate_local',
  restaurant: 'romantic', gym: 'active_energetic', music_venue: 'live_electric',
  concert_hall: 'live_electric', library: 'deep_intellectual', wine_bar: 'romantic',
};

function deriveArchetype(venueTypes = []) {
  for (const t of venueTypes) {
    if (CATEGORY_TO_ARCHETYPE[t]) return CATEGORY_TO_ARCHETYPE[t];
  }
  return 'social_buzzing';
}

function getMomentHour(m) {
  if (m.time_bucket) {
    const parts = m.time_bucket.split('-');
    return parseInt(parts[3], 10);
  }
  return new Date(m.created_date).getHours();
}

function getMomentDay(m) {
  if (m.time_bucket) {
    const parts = m.time_bucket.split('-');
    return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`).getDay();
  }
  return new Date(m.created_date).getDay();
}

function getHourBucket(h) {
  for (const b of HOUR_BUCKETS) {
    const [start, end] = b.range;
    if (start <= end) { if (h >= start && h <= end) return b.label; }
    else { if (h >= start || h <= end) return b.label; }
  }
  return 'Evening';
}

export default function CityPulseWeekly() {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['city-pulse-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });
      return profiles[0] || null;
    },
  });

  const { data: allMoments = [] } = useQuery({
    queryKey: ['city-pulse-moments', profile?.id],
    queryFn: () => base44.entities.Moment.filter({ user_id: profile.id }),
    enabled: !!profile,
  });

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = allMoments.filter(m => new Date(m.created_date) > weekAgo);
    const lastWeek = allMoments.filter(m => {
      const d = new Date(m.created_date);
      return d > twoWeeksAgo && d <= weekAgo;
    });

    // Top zones
    const zoneMap = {};
    thisWeek.forEach(m => {
      const key = m.venue_name || m.geohash?.substring(0, 4) || 'Unknown';
      zoneMap[key] = (zoneMap[key] || 0) + 1;
    });
    const topZones = Object.entries(zoneMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    // PlacesDNA mix
    const dnaMap = {};
    thisWeek.forEach(m => {
      const arch = deriveArchetype(m.venue_types || []);
      dnaMap[arch] = (dnaMap[arch] || 0) + 1;
    });
    const totalDna = Object.values(dnaMap).reduce((s, v) => s + v, 0) || 1;
    const dnaMix = Object.entries(dnaMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([arch, count]) => ({ arch, pct: Math.round((count / totalDna) * 100) }));

    // Day rhythm
    const dayCount = Array(7).fill(0);
    thisWeek.forEach(m => { dayCount[getMomentDay(m)]++; });
    const maxDay = Math.max(...dayCount, 1);

    // Hour bucket rhythm
    const bucketCount = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    thisWeek.forEach(m => { bucketCount[getHourBucket(getMomentHour(m))]++; });
    const maxBucket = Math.max(...Object.values(bucketCount), 1);

    // Best spark window
    const peakBucket = Object.entries(bucketCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Evening';
    const peakDay = DAY_LABELS[dayCount.indexOf(Math.max(...dayCount))] || 'Fri';
    const sparkWindow = `${peakDay} ${peakBucket}`;

    // Delta vs last week
    const delta = thisWeek.length - lastWeek.length;

    // Nudges
    const nudges = [];
    if (thisWeek.length === 0) {
      nudges.push('Log your first moment this week to start building your pulse.');
    } else {
      if (delta < 0) nudges.push(`You logged ${Math.abs(delta)} fewer moments than last week — try to get out more!`);
      if (peakBucket === 'Night') nudges.push('Your spark peaks at night — prime time for live music and cocktail bars.');
      if (dnaMix[0]?.arch === 'calm_cozy') nudges.push('You lean calm & cosy — try a wine bar or gallery for a new kind of connection.');
      if (dayCount[0] > 0 || dayCount[6] > 0) nudges.push('You\'re active on weekends — your crossing chances spike on Sat/Sun evenings.');
      if (nudges.length === 0) nudges.push(`You're on a roll — ${thisWeek.length} moments this week keeps your pulse strong.`);
    }

    return { thisWeek, lastWeek, topZones, dnaMix, dayCount, bucketCount, maxDay, maxBucket, sparkWindow, delta, nudges };
  }, [allMoments]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/8 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-base">This Week's City Pulse</h1>
          <p className="text-white/40 text-xs">Your 7-day movement snapshot</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-20">

        {/* Moments delta */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-[#E70F72]/25 p-5"
          style={{ background: 'linear-gradient(135deg, #0d0218 0%, #0B0B0B 100%)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#E70F72]" />
            <span className="text-white font-semibold text-sm">Moments logged</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white">{stats.thisWeek.length}</span>
            <span className={`text-sm font-semibold mb-1 ${stats.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.delta >= 0 ? `+${stats.delta}` : stats.delta} vs last week
            </span>
          </div>
          {stats.lastWeek.length > 0 && (
            <p className="text-white/35 text-xs mt-1">{stats.lastWeek.length} moments last week</p>
          )}
        </motion.div>

        {/* Top zones */}
        {stats.topZones.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/4 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold text-sm">Top Zones</span>
            </div>
            <div className="space-y-2">
              {stats.topZones.map(([name, count], i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-white text-xs font-medium truncate">{name}</span>
                      <span className="text-white/40 text-[10px]">{count}×</span>
                    </div>
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / stats.topZones[0][1]) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                        className="h-full rounded-full bg-[#E70F72]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PlacesDNA mix */}
        {stats.dnaMix.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/10 bg-white/4 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">PlacesDNA Mix</span>
            </div>
            <div className="space-y-2.5">
              {stats.dnaMix.map(({ arch, pct }, i) => {
                const info = getArchetypeInfo(arch);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-base w-6 flex-shrink-0">{info.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/80 text-xs">{info.label}</span>
                        <span className="text-xs font-bold" style={{ color: info.color }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.25 + i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Day rhythm */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/4 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold text-sm">Day Rhythm</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {DAY_LABELS.map((day, i) => {
              const count = stats.dayCount[i];
              const pct = stats.maxDay > 0 ? (count / stats.maxDay) : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct * 100, 4)}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.04 }}
                    className="w-full rounded-t-sm"
                    style={{ backgroundColor: count > 0 ? '#E70F72' : '#ffffff10', minHeight: 4 }}
                  />
                  <span className="text-white/30 text-[9px]">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Hour buckets */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/10 bg-white/4 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-white font-semibold text-sm">Time of Day</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {HOUR_BUCKETS.map(({ label }) => {
              const count = stats.bucketCount[label] || 0;
              const pct = stats.maxBucket > 0 ? count / stats.maxBucket : 0;
              const isTop = count === stats.maxBucket && count > 0;
              return (
                <div key={label} className={`rounded-xl p-2.5 text-center border ${isTop ? 'border-[#E70F72]/40 bg-[#E70F72]/10' : 'border-white/8 bg-white/3'}`}>
                  <div className="text-xs text-white/50 mb-1">{label}</div>
                  <div className={`text-lg font-black ${isTop ? 'text-[#E70F72]' : 'text-white/30'}`}>{count}</div>
                  {isTop && <div className="text-[9px] text-[#E70F72] font-semibold mt-0.5">Peak</div>}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Best spark window */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#E70F72]/30 p-5"
          style={{ background: 'linear-gradient(135deg, #1a0010 0%, #0B0B0B 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#E70F72]" />
            <span className="text-white font-semibold text-sm">Best Spark Window</span>
          </div>
          <p className="text-2xl font-black text-[#E70F72]">{stats.sparkWindow}</p>
          <p className="text-white/40 text-xs mt-1">This is when your crossing chances are highest based on your movement patterns.</p>
        </motion.div>

        {/* Nudges */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/10 bg-white/4 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Personalised Nudges</span>
          </div>
          <div className="space-y-2.5">
            {stats.nudges.map((nudge, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-yellow-400 text-xs mt-0.5 flex-shrink-0">→</span>
                <p className="text-white/65 text-xs leading-relaxed">{nudge}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}