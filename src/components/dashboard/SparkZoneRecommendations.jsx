import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { generateSparkZoneRecommendations } from '@/components/spark/googlePlacesDnaMapper';

const DNA_COLORS = {
  "Calm & Cosy":        { bg: "#C49A6C22", border: "#C49A6C55", text: "#C49A6C" },
  "Creative":           { bg: "#9B5DE522", border: "#9B5DE555", text: "#9B5DE5" },
  "Live Events":        { bg: "#F6C90E22", border: "#F6C90E55", text: "#F6C90E" },
  "Romantic":           { bg: "#E74C7822", border: "#E74C7855", text: "#E74C78" },
  "Active":             { bg: "#FF408122", border: "#FF408155", text: "#FF4081" },
  "Social Buzz":        { bg: "#FFB80022", border: "#FFB80055", text: "#FFB800" },
  "Foodie":             { bg: "#FF6B3522", border: "#FF6B3555", text: "#FF6B35" },
  "Nightlife":          { bg: "#8A63F622", border: "#8A63F655", text: "#8A63F6" },
  "Outdoors":           { bg: "#2DD88122", border: "#2DD88155", text: "#2DD881" },
  "Wellness":           { bg: "#00B4D822", border: "#00B4D855", text: "#00B4D8" },
  "Learning & Culture": { bg: "#4169E122", border: "#4169E155", text: "#4169E1" },
  "Shopping":           { bg: "#F9A8D422", border: "#F9A8D455", text: "#F9A8D4" },
  "Premium Lifestyle":  { bg: "#D4AF3722", border: "#D4AF3755", text: "#D4AF37" },
};

function DNAChip({ dna }) {
  const style = DNA_COLORS[dna] || { bg: "#ffffff11", border: "#ffffff22", text: "#ffffff66" };
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
    >
      {dna}
    </span>
  );
}

function ScoreBar({ value, color }) {
  return (
    <div className="h-1 bg-white/10 rounded-full overflow-hidden w-12">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function VenueCard({ venue, rank, isPremium, isLocked }) {
  const [expanded, setExpanded] = useState(false);
  const topDNA = venue.dna[0] || "Social Buzz";
  const dnaStyle = DNA_COLORS[topDNA] || { bg: "#ffffff11", border: "#ffffff22", text: "#E70F72" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`relative rounded-2xl border overflow-hidden transition-all ${isLocked ? 'opacity-60' : ''}`}
      style={{ background: "linear-gradient(135deg, #0d0218 0%, #0B0B0B 100%)", borderColor: dnaStyle.border }}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 bg-black/70 rounded-full px-3 py-1.5 border border-white/15">
            <Lock className="w-3 h-3 text-[#E70F72]" />
            <span className="text-white/60 text-xs">Crossd+ to unlock</span>
          </div>
        </div>
      )}

      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => !isLocked && setExpanded(v => !v)}
      >
        {/* Rank + icon */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <span className="text-white/25 text-[10px] font-bold">#{rank}</span>
          <span className="text-2xl leading-none">{venue.icon}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-semibold text-sm">{venue.label}</span>
            {!isLocked && (
              expanded
                ? <ChevronUp className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            )}
          </div>

          {/* DNA chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {venue.dna.slice(0, 3).map(d => <DNAChip key={d} dna={d} />)}
          </div>

          {/* Score bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(venue.score * 100)}%` }}
                transition={{ duration: 0.8, delay: rank * 0.04 }}
                className="h-full rounded-full"
                style={{ backgroundColor: dnaStyle.text }}
              />
            </div>
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: dnaStyle.text }}>
              {Math.round(venue.score * 100)}% match
            </span>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/8 pt-3 space-y-3">
              {/* Why copy */}
              <p className="text-white/60 text-xs leading-relaxed">{venue.why}</p>

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "MBTI fit", value: venue.mbtiScore, color: "#E70F72" },
                  { label: "PlacesDNA", value: venue.placesScore, color: "#9B5DE5" },
                  { label: "Timing", value: venue.timeScore, color: "#F6C90E" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-white/35 text-[10px]">{label}</span>
                    <ScoreBar value={value} color={color} />
                    <span className="text-[10px] font-semibold" style={{ color }}>
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SparkZoneRecommendations({ profile, moments = [] }) {
  const [showAll, setShowAll] = useState(false);
  const isPremium = profile?.crossd_plus;

  const recommendations = useMemo(() => {
    return generateSparkZoneRecommendations(profile, moments.filter(m => !m._isSample));
  }, [profile, moments]);

  if (!recommendations.length) return null;

  const visibleCount = showAll ? 10 : 5;
  const visible = recommendations.slice(0, visibleCount);
  const lockedStart = isPremium ? 999 : 6; // non-premium: lock from rank 6+

  const mbti = profile?.mbti_type;
  const compatibleType = mbti ? {
    INTJ: "ENFP", INTP: "ENTJ", ENTJ: "INTP", ENTP: "INFJ",
    INFJ: "ENFP", INFP: "ENFJ", ENFJ: "INFP", ENFP: "INFJ",
    ISTJ: "ESFP", ISFJ: "ESFP", ESTJ: "ISTP", ESFJ: "ISFP",
    ISTP: "ESTJ", ISFP: "ESFJ", ESTP: "ISFJ", ESFP: "ISTJ",
  }[mbti] : null;

  return (
    <div
      className="rounded-3xl border border-[#E70F72]/30 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d0218 0%, #0B0B0B 100%)", boxShadow: "0 0 30px rgba(231,15,114,0.08)" }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          <span className="text-white font-bold text-lg">Your Spark Zone Guide</span>
        </div>
        <p className="text-white/45 text-xs leading-relaxed">
          {mbti && compatibleType
            ? `Based on your ${mbti} profile and compatibility with ${compatibleType} types — these are the places where your crowd naturally overlaps with people you'd connect with.`
            : "Places where your PlacesDNA and personality type creates the most natural crossing opportunities."}
        </p>
        {!isPremium && (
          <div className="mt-3 flex items-center gap-2 bg-[#E70F72]/10 border border-[#E70F72]/25 rounded-xl px-3 py-2">
            <Lock className="w-3.5 h-3.5 text-[#E70F72] flex-shrink-0" />
            <p className="text-white/60 text-xs">
              <span className="text-[#E70F72] font-semibold">Crossd+</span> unlocks your full Top 10 with score breakdowns.
            </p>
          </div>
        )}
      </div>

      {/* Zone note */}
      <div className="mx-6 mb-4 flex items-start gap-2 bg-white/3 rounded-xl px-3 py-2.5 border border-white/8">
        <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
        <p className="text-white/35 text-[11px] leading-relaxed">
          Your compatible crowd is most active in these kinds of spaces — we never expose real-time locations.
        </p>
      </div>

      {/* Venue list */}
      <div className="px-6 pb-2 space-y-2">
        {visible.map((venue, i) => (
          <VenueCard
            key={venue.label}
            venue={venue}
            rank={i + 1}
            isPremium={isPremium}
            isLocked={i + 1 >= lockedStart && !isPremium}
          />
        ))}
      </div>

      {/* Show more / less */}
      {recommendations.length > 5 && (
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={() => {
              if (!isPremium && !showAll) return; // gated
              setShowAll(v => !v);
            }}
            className="w-full py-2.5 rounded-xl border border-white/12 text-white/50 text-xs font-medium hover:border-white/25 hover:text-white/70 transition-all flex items-center justify-center gap-1.5"
          >
            {showAll
              ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              : isPremium
                ? <><ChevronDown className="w-3.5 h-3.5" /> Show all 10</>
                : <><Lock className="w-3.5 h-3.5 text-[#E70F72]" /><span>See all 10 with <span className="text-[#E70F72]">Crossd+</span></span></>
            }
          </button>
        </div>
      )}
    </div>
  );
}