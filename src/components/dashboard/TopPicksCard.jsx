import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { generateCrossdSparkPicks } from '@/components/spark/crossdPlacePool';
import { parseQuizDimensions, getPrimaryCompatibleType, getMatchArchetype, TYPE_DESCRIPTIONS } from '@/components/spark/crossdCompatibilityEngine';
import { Link } from 'react-router-dom';
import NearbyPlacesList from '@/components/dashboard/NearbyPlacesList';

const TIME_LABELS = {
  morning: { label: 'Morning', icon: '🌅', sub: '7–10am' },
  day:     { label: 'Daytime', icon: '☀️',  sub: '11am–5pm' },
  evening: { label: 'Evening', icon: '🌆', sub: '6–9pm' },
  night:   { label: 'Night',   icon: '🌙', sub: '9pm+' },
  late:    { label: 'Late',    icon: '🌃', sub: 'After midnight' },
  weekend: { label: 'Weekend', icon: '🎉', sub: 'Sat–Sun' },
};

const DNA_COLORS = {
  "Calm & Cosy":        "#C49A6C",
  "Creative":           "#9B5DE5",
  "Live Events":        "#F6C90E",
  "Romantic":           "#E74C78",
  "Active":             "#FF4081",
  "Social Buzz":        "#FFB800",
  "Foodie":             "#FF6B35",
  "Nightlife":          "#8A63F6",
  "Outdoors":           "#2DD881",
  "Wellness":           "#00B4D8",
  "Learning & Culture": "#4169E1",
  "Shopping":           "#F9A8D4",
  "Premium Lifestyle":  "#D4AF37",
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function DNAChip({ dna }) {
  const color = DNA_COLORS[dna] || '#ffffff';
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
    >
      {dna}
    </span>
  );
}

function PickRow({ venue, rank, isLocked, profile, moments }) {
  const [open, setOpen] = useState(false);
  const rankColor = RANK_COLORS[rank - 1] || '#E70F72';
  const barColor = rank <= 3 ? rankColor : '#E70F72';
  const bestTime = TIME_LABELS[venue.bestTimes?.[0]] || TIME_LABELS.evening;

  return (
    <div className="transition-all">
      <button
        className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-2xl hover:bg-white/5 active:bg-white/8 transition-colors"
        onClick={() => !isLocked && setOpen(v => !v)}
      >
        {/* Rank badge */}
        {rank <= 3 ? (
          <div className="relative flex-shrink-0 w-10 h-10">
            {/* Medal circle background */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{
                background: rank === 1 ? '#2a1f00' : rank === 2 ? '#1a1a1a' : '#1a0f00',
                border: `2px solid ${rankColor}`,
                boxShadow: `0 0 8px ${rankColor}60`,
              }}
            >
              🏅
            </div>
            {/* Number badge */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
              style={{ background: rankColor, color: rank === 2 ? '#000' : '#000' }}
            >
              {rank}
            </div>
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
            style={{
              background: isLocked ? 'rgba(231,15,114,0.08)' : `${rankColor}18`,
              border: `1.5px solid ${isLocked ? 'rgba(231,15,114,0.3)' : rankColor + '50'}`,
              color: isLocked ? '#E70F72' : rankColor,
            }}
          >
            {rank}
          </div>
        )}

        {/* Icon — always shown, dimmed when locked */}
        <span className={`text-xl flex-shrink-0 ${isLocked ? 'opacity-40' : ''}`}>{venue.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            {isLocked
              ? <span className="text-white/30 font-semibold text-sm">Locked</span>
              : <span className="text-white font-semibold text-sm truncate">{venue.label}</span>
            }
            <span className="text-[10px] text-white/30 flex-shrink-0">{bestTime.icon} {bestTime.label}</span>
          </div>
          {/* Match bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: isLocked ? `${Math.round(venue.score * 100)}%` : `${Math.round(venue.score * 100)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: rank * 0.03 }}
                className="h-full rounded-full"
                style={{ backgroundColor: isLocked ? 'rgba(231,15,114,0.25)' : barColor }}
              />
            </div>
            {isLocked
              ? <span className="text-[10px] tabular-nums flex-shrink-0 text-white/20">—</span>
              : <span className="text-[10px] font-bold tabular-nums flex-shrink-0" style={{ color: barColor }}>{Math.round(venue.score * 100)}%</span>
            }
          </div>
        </div>

        {!isLocked
          ? <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 text-white/20 transition-transform ${open ? 'rotate-90' : ''}`} />
          : <Lock className="w-3.5 h-3.5 flex-shrink-0 text-white/20" />
        }
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-2 px-3 py-3 rounded-xl bg-white/4 border border-white/8 space-y-3">
              {/* Why */}
              <p className="text-white/55 text-xs leading-relaxed">{venue.why}</p>

              {/* DNA chips */}
              <div className="flex flex-wrap gap-1">
                {venue.dna.slice(0, 3).map(d => <DNAChip key={d} dna={d} />)}
              </div>

              {/* Best times */}
              <div className="flex flex-wrap gap-1.5">
                {venue.bestTimes?.map(t => {
                  const tl = TIME_LABELS[t];
                  return tl ? (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/45 border border-white/10">
                      {tl.icon} {tl.label} <span className="text-white/25">{tl.sub}</span>
                    </span>
                  ) : null;
                })}
              </div>

              {/* Nearby places */}
              <NearbyPlacesList venue={venue} profile={profile} moments={moments} />

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {[
                  { label: 'MBTI fit',  value: venue.mbtiScore,   color: '#E70F72' },
                  { label: 'PlacesDNA', value: venue.placesScore, color: '#9B5DE5' },
                  { label: 'Timing',    value: venue.timeScore,   color: '#F6C90E' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-white/30 text-[9px] uppercase tracking-wide">{label}</span>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color }}>{Math.round(value * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TopPicksCard({ profile, moments = [] }) {
  const isPremium = profile?.crossd_plus;
  const mbti = profile?.mbti_type;

  const { picks, compatibleType, archetype } = useMemo(() => {
    if (!mbti) return { picks: [], compatibleType: null, archetype: null };
    const myDims = parseQuizDimensions(mbti, profile?.mbti_quiz_results || {});
    const targetType = getPrimaryCompatibleType(mbti, myDims);
    const generatedPicks = generateCrossdSparkPicks(
      profile,
      moments.filter(m => !m._isSample),
      targetType,
      targetType ? parseQuizDimensions(targetType, {}) : null
    );
    const arch = targetType ? getMatchArchetype(mbti, targetType) : null;
    return { picks: generatedPicks, compatibleType: targetType, archetype: arch };
  }, [profile, moments, mbti]);

  if (!picks.length) return null;

  const targetTypeInfo = compatibleType ? TYPE_DESCRIPTIONS[compatibleType] : null;

  // Free users see picks 4–6 (indices 3–5) — good enough to entice, not so good to replace premium.
  // Premium users see all 10.
  // For free users we show all 10 rows but lock picks 1–3 and 7–10.
  const visible = picks; // always render all 10
  const isLocked = (rank) => !isPremium && (rank <= 3 || rank >= 7);

  return (
    <div
      className="rounded-3xl border border-[#E70F72]/30 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d0218 0%, #0B0B0B 100%)', boxShadow: '0 0 30px rgba(231,15,114,0.08)' }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          <span className="text-white font-bold text-lg">Your Top 10 Spark Picks</span>
          {isPremium && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#E70F72]/15 border border-[#E70F72]/30 text-[#E70F72] font-semibold">Crossd+</span>
          )}
        </div>
        <p className="text-white/45 text-xs leading-relaxed">
          {mbti && compatibleType && targetTypeInfo
            ? `Your ${mbti} × ${compatibleType} Spark Picks — 10 venue types selected around your personality fit, PlacesDNA and preferred travel areas.`
            : 'Venues ranked by where your compatible crowd is most likely to be, based on your PlacesDNA and habits.'}
        </p>
        {archetype && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-white/35 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
            <span>{archetype.label}</span>
            <span className="text-white/20">·</span>
            <span className="italic">{archetype.crossdLine}</span>
          </div>
        )}

        {!isPremium && (
          <div className="mt-3 flex items-center justify-between gap-2 bg-[#E70F72]/8 border border-[#E70F72]/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#E70F72]" />
              <span className="text-white/55 text-xs">Picks 1–3 &amp; 7–10 + full breakdown with <span className="text-[#E70F72] font-semibold">Crossd+</span></span>
            </div>
            <Link to="/CrossdPlus" className="text-[10px] font-bold text-[#E70F72] hover:text-[#E70F72]/80 whitespace-nowrap">
              Unlock →
            </Link>
          </div>
        )}
      </div>

      {/* Privacy note */}
      <div className="mx-6 mb-2 flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-white/20 flex-shrink-0" />
        <span className="text-[10px] text-white/25">Venue types only — we never share real-time locations of other users.</span>
      </div>

      <div className="mx-6 h-px bg-white/6 mb-1" />

      {/* Picks list */}
      <div className="pb-4">
        {visible.map((venue, i) => (
          <PickRow
            key={venue.label}
            venue={venue}
            rank={i + 1}
            isLocked={isLocked(i + 1)}
            profile={profile}
            moments={moments}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      {!isPremium && (
        <div className="px-6 pb-6">
          <Link to="/CrossdPlus">
            <button className="w-full py-3.5 rounded-full bg-[#E70F72]/15 border border-[#E70F72]/50 text-[#E70F72] text-sm font-semibold hover:bg-[#E70F72]/25 transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Unlock all 10 picks with Crossd+
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}