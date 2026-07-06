import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, MapPin, Clock } from 'lucide-react';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';

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

export default function CityPulseCard({ moments = [], isNew = true }) {
  const isSampleData = moments.some(m => m._isSample);
  const realMoments = moments.filter(m => !m._isSample);

  const pulse = useMemo(() => {
    if (!realMoments.length) return null;

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weekMoments = realMoments.filter(m => new Date(m.created_date) > weekAgo);
    const sourceMoments = weekMoments.length > 0 ? weekMoments : realMoments.slice(0, 5);

    // Top 2 zones by venue name
    const zoneMap = {};
    sourceMoments.forEach(m => {
      const key = m.venue_name || m.geohash?.substring(0, 4) || 'Unknown';
      zoneMap[key] = (zoneMap[key] || 0) + 1;
    });
    const topZones = Object.entries(zoneMap).sort((a,b) => b[1]-a[1]).slice(0,2).map(([name]) => name);

    // PlacesDNA top 2 archetypes
    const archetypeCount = {};
    sourceMoments.forEach(m => {
      const arch = deriveArchetype(m.venue_types || []);
      archetypeCount[arch] = (archetypeCount[arch] || 0) + 1;
    });
    const topArchetypes = Object.entries(archetypeCount).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([a]) => a);

    // Peak time — use time_bucket (YYYY-MM-DD-HH, logged in local time) to avoid UTC offset bugs.
    // Fall back to created_date only if time_bucket is absent.
    const hourMap = {};
    const dayMap = {};
    sourceMoments.forEach(m => {
      let h, day;
      if (m.time_bucket) {
        // time_bucket format: "2026-07-02-19"
        const parts = m.time_bucket.split('-');
        h = parseInt(parts[3], 10);
        const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        day = d.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        // Fallback: adjust for BST (UTC+1) to avoid midnight artefacts
        const localDate = new Date(m.created_date);
        h = localDate.getHours();
        day = localDate.toLocaleDateString('en-US', { weekday: 'short' });
      }
      // Skip 0–5am hours unless they're the only data — likely logging artefacts
      if (h >= 5 || Object.keys(hourMap).length === 0) {
        hourMap[h] = (hourMap[h] || 0) + 1;
      }
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const peakHour = Object.entries(hourMap).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const peakDay = Object.entries(dayMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Fri';

    const h = parseInt(peakHour ?? 19, 10);
    const peakLabel = `${peakDay} ${h}:00–${h + 3}:00`;

    // Best spark window
    const isWeekend = (d) => { const day = new Date(d).getDay(); return day === 0 || day === 6; };
    const weekendMoments = sourceMoments.filter(m => isWeekend(m.created_date));
    const sparkWindow = weekendMoments.length > sourceMoments.length * 0.4
      ? 'Sat afternoon'
      : `${peakDay} evening`;

    return { topZones, topArchetypes, peakLabel, sparkWindow, logCount: sourceMoments.length };
  }, [moments]);

  if (!pulse || isSampleData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0d0218 0%, #0B0B0B 100%)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E70F72]" />
            <span className="text-white font-bold text-lg">Your City Pulse</span>
          </div>
          <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full font-medium border border-white/10">Example</span>
        </div>
        <p className="text-white/40 text-xs mb-5">Here's what your weekly vibe recap will look like once you start logging moments.</p>

        <div className="grid grid-cols-2 gap-3 select-none">
          <div className="bg-black/40 rounded-2xl p-3 border border-white/10 opacity-50 blur-[1.5px]">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#E70F72]" />
              <span className="text-white/50 text-xs">Top Zones</span>
            </div>
            <p className="text-white text-sm font-semibold">Shoreditch</p>
            <p className="text-white text-sm font-semibold">Victoria Park</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-3 border border-white/10 opacity-50 blur-[1.5px]">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/50 text-xs">Peak Time</span>
            </div>
            <p className="text-white text-sm font-semibold">Fri 18:00–21:00</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-3 border border-white/10 col-span-2 opacity-50 blur-[1.5px]">
            <p className="text-white/50 text-xs mb-2">Your PlacesDNA this week</p>
            <div className="flex gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#C49A6C]/20 text-[#C49A6C] border border-[#C49A6C]/40">☕ Calm & Cozy</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#6A8F7A]/20 text-[#6A8F7A] border border-[#6A8F7A]/40">🌿 Nature</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[#E70F72] text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          Log your first moment to unlock this
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-6 border border-[#E70F72]/30"
      style={{ background: 'linear-gradient(135deg, #0d0218 0%, #0B0B0B 100%)', boxShadow: '0 0 30px rgba(231,15,114,0.12)' }}
    >
      {/* Shimmer bg */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 30%, #E70F72 0%, transparent 60%)' }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          <span className="text-white font-bold text-lg">Your City Pulse</span>
          {isNew && (
            <span className="text-xs bg-[#E70F72] text-white px-2 py-0.5 rounded-full font-semibold">NEW</span>
          )}
        </div>
      </div>

      <p className="text-white/50 text-xs mb-5">Weekly recap of where your vibe shows up.</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Top Zones */}
        <div className="bg-black/40 rounded-2xl p-3 border border-white/10">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#E70F72]" />
            <span className="text-white/50 text-xs">Top Zones</span>
          </div>
          {pulse.topZones.map((z, i) => (
            <p key={i} className="text-white text-sm font-semibold truncate">{z}</p>
          ))}
        </div>

        {/* Peak Time */}
        <div className="bg-black/40 rounded-2xl p-3 border border-white/10">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/50 text-xs">Peak Time</span>
          </div>
          <p className="text-white text-sm font-semibold">{pulse.peakLabel}</p>
        </div>

        {/* PlacesDNA */}
        <div className="bg-black/40 rounded-2xl p-3 border border-white/10 col-span-2">
          <p className="text-white/50 text-xs mb-2">Your PlacesDNA this week</p>
          <div className="flex gap-2 flex-wrap">
            {pulse.topArchetypes.map((arch, i) => {
              const info = getArchetypeInfo(arch);
              return (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40` }}>
                  {info.emoji} {info.label}
                </span>
              );
            })}
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10">
              ⚡ Best: {pulse.sparkWindow}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}