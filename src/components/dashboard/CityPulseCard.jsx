import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';
import CityPulseSetup from '@/components/dashboard/CityPulseSetup';

function InfoPopover({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button onClick={() => setOpen(v => !v)} className="text-white/25 hover:text-white/60 transition-colors">
        <Info className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#1a1a2e] border border-white/15 rounded-2xl p-3 shadow-xl z-50 pointer-events-none"
          >
            <p className="text-white/80 text-[11px] leading-relaxed">{text}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a2e] border-r border-b border-white/15 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

const INFO = {
  zones: "Your most-visited areas this week. We use these to find people who regularly cross paths with you in the same parts of the city — not just once, but as a pattern.",
  peak: "The day and time you're most active out. When two people's peak windows overlap in the same zone, your crossing score gets a big boost.",
  dna: "PlacesDNA is your location personality — the kinds of places you naturally gravitate to. We match it against others' DNA to surface people who move through the city the same way you do.",
};

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

export default function CityPulseCard({ moments = [], profile = null, isNew = true }) {
  const [setupDone, setSetupDone] = useState(false);
  const navigate = useNavigate();
  const isSampleData = moments.some(m => m._isSample);
  const realMoments = moments.filter(m => !m._isSample);

  // Profile is considered "setup" if they have hangout_areas OR PlacesDNA vibe_tags
  const profileSetupDone = (profile?.hangout_areas?.length > 0) ||
    (profile?.vibe_tags || []).some(t => !t.startsWith('peak_'));

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

  // Derive pulse from profile setup data when no real moments exist yet
  const profilePulse = useMemo(() => {
    if (!profile || (!setupDone && !profileSetupDone)) return null;
    const hangoutAreas = profile.hangout_areas || [];
    const vibeTags = profile.vibe_tags || [];
    const dnaIds = vibeTags.filter(t => !t.startsWith('peak_'));
    const peakIds = vibeTags.filter(t => t.startsWith('peak_')).map(t =>
      t.replace('peak_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    const ARCHETYPE_MAP = {
      calm_cozy: 'calm_cozy', social_buzzing: 'social_buzzing',
      active_energetic: 'active_energetic', creative: 'creative',
      romantic: 'romantic', nightlife: 'nightlife',
      nature_grounded: 'nature_grounded', deep_intellectual: 'deep_intellectual',
      live_electric: 'live_electric', intimate_local: 'intimate_local',
    };

    const topZones = hangoutAreas.slice(0, 2).map(a => a.name);
    const topArchetypes = dnaIds.slice(0, 2).filter(d => ARCHETYPE_MAP[d]);
    const peakLabel = peakIds.length > 0 ? peakIds.slice(0, 2).join(' & ') : 'Evening';
    const sparkWindow = peakIds.find(p => p.toLowerCase().includes('weekend') || p.toLowerCase().includes('evening')) || peakLabel;

    if (!topZones.length && !topArchetypes.length) return null;
    return { topZones, topArchetypes, peakLabel, sparkWindow, logCount: 0, fromSetup: true };
  }, [profile, setupDone, profileSetupDone]);

  const activePulse = pulse || profilePulse;

  if (!activePulse && !setupDone && !profileSetupDone) {
    if (profile) {
      return <CityPulseSetup profile={profile} onSaved={() => setSetupDone(true)} />;
    }
    return null;
  }

  if (!activePulse) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-5 border border-[#E70F72]/30"
      style={{ background: '#0B0B0B', boxShadow: '0 0 30px rgba(231,15,114,0.10)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          <span className="text-white font-bold text-lg">Your City Pulse</span>
          {isNew && (
            <span className="text-xs bg-[#E70F72] text-white px-2 py-0.5 rounded-full font-semibold">NEW</span>
          )}
        </div>
        <button onClick={() => navigate('/city-pulse', { state: { from: 'dashboard' } })} className="text-white/30 hover:text-white/60 transition-colors">
          <span className="text-lg">›</span>
        </button>
      </div>

      <p className="text-white/45 text-sm mb-4 leading-snug">
        {activePulse.fromSetup
          ? 'City Pulse is your personal Spark Navigator—mapping your social rhythm, favourite places, PlacesDNA, and best spark windows to help guide you towards more meaningful real-world connections.'
          : 'City Pulse is your personal Spark Navigator—mapping your social rhythm, favourite places, PlacesDNA, and best spark windows to help guide you towards more meaningful real-world connections.'}
      </p>

      <div className="flex flex-col gap-3">
        {/* Top Zones */}
        {activePulse.topZones.length > 0 && (
          <div className="bg-black/60 rounded-2xl p-4 border border-white/15">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#E70F72]" />
              <span className="text-white/45 text-sm">Top Zones</span>
              <InfoPopover text={INFO.zones} />
            </div>
            {activePulse.topZones.map((z, i) => (
              <p key={i} className="text-white text-lg font-bold leading-tight">{z}</p>
            ))}
          </div>
        )}

        {/* Peak Time */}
        <div className="bg-black/60 rounded-2xl p-4 border border-white/15">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/45 text-sm">Peak Time</span>
            <InfoPopover text={INFO.peak} />
          </div>
          <p className="text-white text-lg font-bold">{activePulse.peakLabel}</p>
        </div>

        {/* PlacesDNA */}
        {activePulse.topArchetypes.length > 0 && (
          <div className="bg-black/60 rounded-2xl p-4 border border-white/15">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-white/45 text-sm">Your PlacesDNA this week</span>
              <InfoPopover text={INFO.dna} />
            </div>
            <div className="flex flex-col gap-2">
              {activePulse.topArchetypes.map((arch, i) => {
                const info = getArchetypeInfo(arch);
                return (
                  <span key={i} className="inline-flex items-center gap-2 self-start text-sm px-4 py-2 rounded-full font-bold"
                    style={{ backgroundColor: `${info.color}25`, color: info.color, border: `1px solid ${info.color}50` }}>
                    {info.emoji} {info.label}
                  </span>
                );
              })}
              <span className="inline-flex items-center gap-2 self-start text-sm px-4 py-2 rounded-full bg-white/8 text-white/55 border border-white/12 font-medium">
                ⚡ Best: {activePulse.sparkWindow}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <button
        onClick={() => navigate('/city-pulse', { state: { from: 'dashboard' } })}
        className="w-full mt-4 text-sm text-white/40 hover:text-white/70 transition-colors text-center"
      >
        View this week →
      </button>
    </motion.div>
  );
}