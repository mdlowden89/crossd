import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, ChevronRight, Clock, Sparkles, Info } from 'lucide-react';
import { generateSparkZoneRecommendations } from '@/components/spark/googlePlacesDnaMapper';
import { Link } from 'react-router-dom';

const TIME_LABELS = {
  morning: { label: 'Morning', icon: '🌅', sub: '7–10am' },
  day:     { label: 'Daytime', icon: '☀️',  sub: '11am–5pm' },
  evening: { label: 'Evening', icon: '🌆', sub: '6–9pm' },
  night:   { label: 'Night',   icon: '🌙', sub: '9pm+' },
  late:    { label: 'Late',    icon: '🌃', sub: 'After midnight' },
  weekend: { label: 'Weekend', icon: '🎉', sub: 'Sat–Sun' },
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function MatchBar({ score, color = '#E70F72' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(score * 100)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

function PickRow({ venue, rank, isLocked, isPremium }) {
  const [open, setOpen] = useState(false);
  const rankColor = RANK_COLORS[rank - 1] || '#E70F72';
  const bestTime = TIME_LABELS[venue.bestTimes?.[0]] || TIME_LABELS.evening;

  return (
    <div className={`relative transition-all ${isLocked ? 'opacity-50 pointer-events-none select-none' : ''}`}>
      <button
        className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-2xl hover:bg-white/5 active:bg-white/8 transition-colors"
        onClick={() => !isLocked && setOpen(v => !v)}
      >
        {/* Rank badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
          style={{ background: `${rankColor}20`, border: `1.5px solid ${rankColor}60`, color: rankColor }}>
          {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : rank}
        </div>

        {/* Icon */}
        <span className="text-xl flex-shrink-0">{venue.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span className="text-white font-semibold text-sm truncate">{venue.label}</span>
            <span className="text-[10px] text-white/35 flex-shrink-0 flex items-center gap-0.5">
              {bestTime.icon} {bestTime.label}
            </span>
          </div>
          <MatchBar score={venue.score} color={rank <= 3 ? rankColor : '#E70F72'} />
        </div>

        {!isLocked && (
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 text-white/20 transition-transform ${open ? 'rotate-90' : ''}`} />
        )}
        {isLocked && <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#E70F72]/50" />}
      </button>

      {/* Expanded row */}
      <AnimatePresence>
        {open && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 space-y-2">
              <p className="text-white/55 text-xs leading-relaxed">{venue.why}</p>
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
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'MBTI fit',   value: venue.mbtiScore,   color: '#E70F72' },
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

  const picks = useMemo(() => {
    return generateSparkZoneRecommendations(profile, moments.filter(m => !m._isSample));
  }, [profile, moments]);

  if (!picks.length) return null;

  const mbti = profile?.mbti_type;
  const compatibleType = mbti ? {
    INTJ: 'ENFP', INTP: 'ENTJ', ENTJ: 'INTP', ENTP: 'INFJ',
    INFJ: 'ENFP', INFP: 'ENFJ', ENFJ: 'INFP', ENFP: 'INFJ',
    ISTJ: 'ESFP', ISFJ: 'ESFP', ESTJ: 'ISTP', ESFJ: 'ISFP',
    ISTP: 'ESTJ', ISFP: 'ESFJ', ESTP: 'ISFJ', ESFP: 'ISTJ',
  }[mbti] : null;

  // Free: show 5, first 3 fully open; Premium: show all 10
  const visible = isPremium ? picks : picks.slice(0, 7);
  const lockedFrom = isPremium ? 999 : 6;

  return (
    <div
      className="rounded-3xl border border-[#E70F72]/30 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d0218 0%, #0B0B0B 100%)', boxShadow: '0 0 30px rgba(231,15,114,0.08)' }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          <span className="text-white font-bold text-lg">Your Top 10 Picks</span>
          {isPremium && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#E70F72]/15 border border-[#E70F72]/30 text-[#E70F72] font-semibold">Crossd+</span>
          )}
        </div>
        <p className="text-white/45 text-xs leading-relaxed">
          {mbti && compatibleType
            ? `As an ${mbti}, your best encounters with ${compatibleType} types tend to happen here — ranked by personality fit, PlacesDNA overlap, and your typical timing.`
            : 'Venues ranked by where your compatible crowd is most likely to be, based on your PlacesDNA and habits.'}
        </p>

        {!isPremium && (
          <div className="mt-3 flex items-center justify-between gap-2 bg-[#E70F72]/8 border border-[#E70F72]/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#E70F72]" />
              <span className="text-white/55 text-xs">Picks 6–10 + full breakdown with <span className="text-[#E70F72] font-semibold">Crossd+</span></span>
            </div>
            <Link to="/CrossdPlus" className="text-[10px] font-bold text-[#E70F72] hover:text-[#E70F72]/80 whitespace-nowrap">
              Unlock →
            </Link>
          </div>
        )}
      </div>

      {/* Privacy note */}
      <div className="mx-6 mb-2 flex items-center gap-1.5 text-[10px] text-white/25">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>Venue types only — we never share real-time locations of other users.</span>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-white/6 mb-1" />

      {/* Picks list */}
      <div className="pb-4">
        {visible.map((venue, i) => (
          <PickRow
            key={venue.label}
            venue={venue}
            rank={i + 1}
            isPremium={isPremium}
            isLocked={i + 1 >= lockedFrom && !isPremium}
          />
        ))}
      </div>

      {/* Bottom CTA for non-premium */}
      {!isPremium && (
        <div className="px-6 pb-6">
          <Link to="/CrossdPlus">
            <button className="w-full py-2.5 rounded-xl bg-[#E70F72]/10 border border-[#E70F72]/30 text-[#E70F72] text-xs font-semibold hover:bg-[#E70F72]/20 transition-colors flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Unlock all 10 picks with Crossd+
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}