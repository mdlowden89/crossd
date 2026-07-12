import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Sparkles, Clock, Zap, Lightbulb } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_MARKERS = [0, 6, 12, 18, 23];

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
  if (m.time_bucket) return parseInt(m.time_bucket.split('-')[3], 10);
  return new Date(m.created_date).getHours();
}

function getMomentDay(m) {
  if (m.time_bucket) {
    const p = m.time_bucket.split('-');
    return new Date(`${p[0]}-${p[1]}-${p[2]}`).getDay();
  }
  return new Date(m.created_date).getDay();
}

function getPeakHourLabel(h) {
  if (h >= 6 && h < 12) return 'mornings';
  if (h >= 12 && h < 17) return 'afternoons';
  if (h >= 17 && h < 21) return 'evenings';
  return 'nights';
}

const TABS = ['This week', 'Last week', 'Last month', 'Compare'];

function useWindowMoments(allMoments, tab) {
  return useMemo(() => {
    const now = new Date();
    const week = 7 * 24 * 60 * 60 * 1000;
    if (tab === 'Last week') {
      const start = new Date(now - 2 * week);
      const end = new Date(now - week);
      return allMoments.filter(m => { const d = new Date(m.created_date); return d > start && d <= end; });
    }
    if (tab === 'Last month') {
      const start = new Date(now - 30 * 24 * 60 * 60 * 1000);
      return allMoments.filter(m => new Date(m.created_date) > start);
    }
    // This week (default + Compare)
    return allMoments.filter(m => new Date(m.created_date) > new Date(now - week));
  }, [allMoments, tab]);
}

export default function CityPulseWeekly() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('This week');

  const { data: profile } = useQuery({
    queryKey: ['cpw-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });
      return profiles[0] || null;
    },
  });

  const { data: allMoments = [] } = useQuery({
    queryKey: ['cpw-moments', profile?.id],
    queryFn: () => base44.entities.Moment.filter({ user_id: profile.id }),
    enabled: !!profile,
  });

  const thisWeekMoments = useWindowMoments(allMoments, activeTab);
  const prevWeekMoments = useMemo(() => {
    const now = new Date();
    const week = 7 * 24 * 60 * 60 * 1000;
    const start = new Date(now - 2 * week);
    const end = new Date(now - week);
    return allMoments.filter(m => { const d = new Date(m.created_date); return d > start && d <= end; });
  }, [allMoments]);

  const stats = useMemo(() => {
    const moments = thisWeekMoments;

    // Top zones
    const zoneMap = {};
    moments.forEach(m => {
      const key = m.venue_name || m.geohash?.substring(0, 4) || 'Unknown';
      zoneMap[key] = (zoneMap[key] || 0) + 1;
    });
    const topZones = Object.entries(zoneMap).sort((a, b) => b[1] - a[1]);
    const uniqueVenues = topZones.length;

    // PlacesDNA mix
    const dnaMap = {};
    moments.forEach(m => {
      const arch = deriveArchetype(m.venue_types || []);
      dnaMap[arch] = (dnaMap[arch] || 0) + 1;
    });
    const totalDna = Object.values(dnaMap).reduce((s, v) => s + v, 0) || 1;
    const dnaMix = Object.entries(dnaMap)
      .sort((a, b) => b[1] - a[1])
      .map(([arch, count]) => ({ arch, pct: Math.round((count / totalDna) * 100) }));

    // Day rhythm (0-6, Sun-Sat)
    const dayCount = Array(7).fill(0);
    moments.forEach(m => { dayCount[getMomentDay(m)]++; });
    const peakDayIdx = dayCount.indexOf(Math.max(...dayCount));
    const maxDay = Math.max(...dayCount, 1);

    // Hour rhythm (0-23)
    const hourCount = Array(24).fill(0);
    moments.forEach(m => { hourCount[getMomentHour(m)]++; });
    const peakHour = hourCount.indexOf(Math.max(...hourCount));
    const maxHour = Math.max(...hourCount, 1);

    const peakDay = DAY_LABELS[peakDayIdx] || 'Fri';
    const peakTimeLabel = getPeakHourLabel(peakHour);
    const sparkWindow = `${peakDay} ${peakTimeLabel}`;
    const peakStat = moments.length > 0 ? `${peakDay} ${peakHour}:00` : '—';

    const delta = moments.length - prevWeekMoments.length;

    // Nudges
    const nudges = [];
    if (moments.length === 0) {
      nudges.push("Log your first moment this week to start building your pulse.");
    } else {
      if (delta > 0) nudges.push(`You're on a roll — ${delta} more moments than the previous period.`);
      if (topZones[0]) nudges.push(`${topZones[0][0]} was your anchor — great for reliable crossings.`);
      if (dnaMix[0]) {
        const info = getArchetypeInfo(dnaMix[0].arch);
        nudges.push(`Your vibe leaned ${info.label.toLowerCase()} — try one contrasting spot to widen your Spark map.`);
      }
      nudges.push(`Your energy peaked on ${peakTimeLabel}. Log a moment then to boost Spark Energy.`);
    }

    return { moments, uniqueVenues, topZones, dnaMix, dayCount, hourCount, maxDay, maxHour, sparkWindow, peakStat, peakTimeLabel, delta, nudges };
  }, [thisWeekMoments, prevWeekMoments]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#E70F72]" />
            <h1 className="text-white font-bold text-2xl">City Pulse — This week</h1>
          </div>
        </div>
        <p className="text-white/45 text-sm ml-12">A recap of where you've been and what it says about your vibe.</p>
      </div>

      {/* Tab bar */}
      <div className="mx-4 mb-5 flex items-center bg-white/6 rounded-full p-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#E70F72] text-white shadow'
                : 'text-white/50 hover:text-white/75'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4 pb-24">

        {/* Summary stats row */}
        <div className="rounded-2xl border border-[#E70F72]/30 p-4"
          style={{ background: 'linear-gradient(135deg, #1a0012 0%, #0d0008 100%)' }}>
          <div className="grid grid-cols-3 gap-3">
            {/* Moments */}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Moments</p>
              <p className="text-white text-3xl font-black leading-none mb-2">{stats.moments.length}</p>
              {stats.delta !== 0 && (
                <p className={`text-[11px] font-semibold flex items-center gap-1 ${stats.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.delta > 0 ? '↗' : '↘'} vs previous period
                </p>
              )}
            </div>
            {/* Zones */}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Zones</p>
              <p className="text-white text-3xl font-black leading-none mb-2">{stats.uniqueVenues}</p>
              <p className="text-white/40 text-[11px]">unique venues</p>
            </div>
            {/* Peak */}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Peak</p>
              <p className="text-white text-lg font-black leading-tight mb-1">{stats.peakStat}</p>
              <p className="text-white/40 text-[11px]">{stats.peakTimeLabel}</p>
            </div>
          </div>
        </div>

        {/* Your Zones */}
        {stats.topZones.length > 0 && (
          <div className="rounded-2xl border border-[#E70F72]/25 p-5"
            style={{ background: '#0d0008' }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-[#E70F72]" />
              <h2 className="text-white font-bold text-lg">Your Zones</h2>
            </div>
            <p className="text-white/40 text-sm mb-5">Where your this week actually happened.</p>
            <div className="space-y-4">
              {stats.topZones.map(([name, count], i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white font-medium text-sm">{name}</span>
                    <span className="text-white/40 text-sm">{count} {count === 1 ? 'moment' : 'moments'}</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.topZones[0][1]) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #E70F72, #FFB800)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PlacesDNA Mix */}
        {stats.dnaMix.length > 0 && (
          <div className="rounded-2xl border border-[#E70F72]/25 p-5"
            style={{ background: '#0d0008' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#E70F72]" />
              <h2 className="text-white font-bold text-lg">PlacesDNA Mix</h2>
            </div>
            <p className="text-white/40 text-sm mb-5">The archetypes that showed up in your moments this week.</p>
            <div className="space-y-4">
              {stats.dnaMix.map(({ arch, pct }, i) => {
                const info = getArchetypeInfo(arch);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm flex items-center gap-2" style={{ color: info.color }}>
                        <span>{info.emoji}</span> {info.label}
                      </span>
                      <span className="text-white/60 text-sm font-semibold">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.06 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Your Rhythm */}
        <div className="rounded-2xl border border-[#E70F72]/25 p-5"
          style={{ background: '#0d0008' }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold text-lg">Your Rhythm</h2>
          </div>
          <p className="text-white/40 text-sm mb-6">When you tended to be out and about.</p>

          {/* BY DAY bar chart */}
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">By Day</p>
          <div className="flex items-end gap-0 h-20 mb-1">
            {DAY_LABELS.map((day, i) => {
              const count = stats.dayCount[i];
              const pct = count / stats.maxDay;
              const isPeak = count === stats.maxDay && count > 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct * 64, count > 0 ? 6 : 0)}px` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full mx-0.5 rounded-t"
                    style={{
                      background: isPeak ? '#E70F72' : count > 0 ? '#E70F7260' : '#ffffff0a',
                      minHeight: count > 0 ? 6 : 0,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex mb-6">
            {DAY_LABELS.map((day, i) => {
              const isPeak = stats.dayCount[i] === stats.maxDay && stats.dayCount[i] > 0;
              return (
                <div key={day} className="flex-1 text-center">
                  <span className={`text-[10px] font-medium ${isPeak ? 'text-[#E70F72]' : 'text-white/30'}`}>{day}</span>
                </div>
              );
            })}
          </div>

          {/* BY HOUR bar chart */}
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">By Hour</p>
          <div className="flex items-end gap-px h-20 mb-1">
            {stats.hourCount.map((count, h) => {
              const pct = count / stats.maxHour;
              const isPeak = count === stats.maxHour && count > 0;
              return (
                <motion.div
                  key={h}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct * 64, count > 0 ? 4 : 0)}px` }}
                  transition={{ duration: 0.4, delay: h * 0.015 }}
                  className="flex-1 rounded-t"
                  style={{
                    background: isPeak ? '#FFB800' : count > 0 ? '#FFB80060' : '#ffffff08',
                    minHeight: count > 0 ? 4 : 0,
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mb-5">
            {HOUR_MARKERS.map(h => (
              <span key={h} className="text-white/25 text-[10px]">{h}</span>
            ))}
          </div>

          {/* Best spark window pill */}
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm">Best spark window: <span className="font-bold">{stats.sparkWindow}</span></span>
          </div>
        </div>

        {/* Insights & nudges */}
        <div className="rounded-2xl border border-[#E70F72]/25 p-5"
          style={{ background: '#0d0008' }}>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold text-lg">Insights & nudges</h2>
          </div>
          <div className="space-y-3">
            {stats.nudges.map((nudge, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <Sparkles className="w-4 h-4 text-[#E70F72] flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm leading-relaxed">{nudge}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="flex items-center gap-4 pt-1">
          <Link to="/LogMoment"
            className="px-6 py-3 rounded-full bg-[#E70F72] text-white font-bold text-sm hover:bg-[#E70F72]/80 transition-colors">
            Log a moment
          </Link>
          <Link to="/ActivityMapPage"
            className="text-white/60 font-semibold text-sm hover:text-white transition-colors">
            Open Activity Map
          </Link>
        </div>

      </div>
    </div>
  );
}