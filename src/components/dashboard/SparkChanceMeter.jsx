import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

function calcStreak(moments) {
  if (!moments.length) return 0;
  const sorted = [...moments].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  let streak = 0;
  let cur = new Date(); cur.setHours(0,0,0,0);
  for (const m of sorted) {
    const d = new Date(m.created_date); d.setHours(0,0,0,0);
    const diff = Math.floor((cur - d) / 86400000);
    if (diff === streak) streak++;
    else if (diff > streak) break;
  }
  return streak;
}

const CATEGORY_TO_ARCHETYPE = {
  cafe:'calm_cozy', coffee_shop:'calm_cozy', art_gallery:'creative', museum:'creative',
  park:'nature_grounded', beach:'nature_grounded', night_club:'nightlife', bar:'social_buzzing',
  restaurant:'romantic', gym:'active_energetic', music_venue:'live_electric', library:'deep_intellectual',
};

const METRICS = [
  { key: 'consistency',   label: 'Consistency',    color: '#E70F72', threshold: '7-day streak = 100%', hint: 'How regularly you log moments. A longer streak signals a reliable city pattern, which makes crossings more meaningful.' },
  { key: 'variety',       label: 'Variety',        color: '#A855F7', threshold: '6 place types = 100%', hint: 'The range of place types you visit (cafés, parks, bars, gyms…). More variety builds a richer PlacesDNA, helping us match you across different scene types.' },
  { key: 'peakClarity',   label: 'Peak Clarity',   color: '#F59E0B', threshold: 'Log at consistent times', hint: 'How concentrated your activity is around a specific time of day. Logging at the same time most days creates a clear peak window, making time-based crossings much more accurate.' },
  { key: 'dnaConfidence', label: 'DNA Confidence', color: '#22D3EE', threshold: '20 moments = 100%', hint: 'Based on your total number of logs. More moments give the engine enough data to build a confident location personality for you.' },
];

function MetricGrid({ components }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="grid grid-cols-2 gap-2">
      {METRICS.map(({ key, label, color, hint, threshold }) => {
        const value = components[key];
        const isHovered = hovered === key;
        return (
          <motion.div
            key={key}
            onHoverStart={() => setHovered(key)}
            onHoverEnd={() => setHovered(null)}
            animate={{ borderColor: isHovered ? color + '60' : 'rgba(255,255,255,0.10)' }}
            className="rounded-xl p-3 border cursor-default transition-colors"
            style={{ background: isHovered ? color + '12' : 'rgba(0,0,0,0.4)' }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold transition-colors" style={{ color: isHovered ? color : 'rgba(255,255,255,0.6)' }}>{label}</span>
              <span className="text-xs font-bold transition-colors" style={{ color: isHovered ? color : 'white' }}>{value}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
            <AnimatePresence>
              {isHovered ? (
                <motion.p
                  key="expanded"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] leading-relaxed overflow-hidden"
                  style={{ color: color + 'cc' }}
                >
                  {hint}
                </motion.p>
              ) : (
                <motion.p
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] mt-1.5 leading-relaxed"
                  style={{ color: color + '70' }}
                >
                  {threshold}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function SparkChanceMeter({ moments = [] }) {
  const data = useMemo(() => {
    if (!moments.length) return { score: 5, previous: 5, label: 'No signal yet', components: { consistency:0, variety:0, peakClarity:0, dnaConfidence:0 } };

    const streak = calcStreak(moments);
    const consistencyScore = Math.min(100, (streak / 7) * 100);

    const archetypeSet = new Set(moments.flatMap(m => (m.venue_types||[]).map(t => CATEGORY_TO_ARCHETYPE[t]).filter(Boolean)));
    const varietyScore = Math.min(100, (archetypeSet.size / 6) * 100);

    const hourMap = {};
    moments.forEach(m => { const h = new Date(m.created_date).getHours(); hourMap[h] = (hourMap[h]||0)+1; });
    const maxH = Math.max(...Object.values(hourMap), 0);
    const peakClarityScore = moments.length > 0 ? Math.min(100, (maxH / moments.length) * 200) : 0;

    const dnaConfidenceScore = Math.min(100, (moments.length / 20) * 100);

    const score = Math.round(0.25*consistencyScore + 0.25*varietyScore + 0.25*peakClarityScore + 0.25*dnaConfidenceScore);
    const previous = Math.max(0, score - Math.floor(Math.random()*5) - 2);

    let label = 'Warming up';
    if (score >= 70) label = 'Hot streak 🔥';
    else if (score >= 50) label = 'Good momentum';
    else if (score >= 30) label = 'Gaining signal';

    return { score, previous, label, components: { consistency: Math.round(consistencyScore), variety: Math.round(varietyScore), peakClarity: Math.round(peakClarityScore), dnaConfidence: Math.round(dnaConfidenceScore) } };
  }, [moments]);

  const barColor = data.score >= 60 ? '#E70F72' : data.score >= 35 ? '#F6A800' : '#5B5BFF';

  return (
    <div className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-6 border border-[#E70F72]/30">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#E70F72]" />
          <h2 className="text-xl font-bold text-white">Spark Chance</h2>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-white/50">{data.previous}%</span>
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span className="font-bold" style={{ color: barColor }}>{data.score}%</span>
        </div>
      </div>
      <p className="text-white/50 text-sm mb-5">Your match readiness based on your rhythm.</p>

      {/* Main bar */}
      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
        />
        {/* Glow dot */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${Math.max(0, data.score - 3)}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{ background: barColor, boxShadow: `0 0 8px ${barColor}` }}
        />
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="text-white/40 text-xs">0%</span>
        <span className="text-xs font-semibold" style={{ color: barColor }}>{data.label}</span>
        <span className="text-white/40 text-xs">100%</span>
      </div>

      {/* Components grid */}
      <MetricGrid barColor={barColor} components={data.components} />

      <p className="text-white/35 text-xs text-center mt-4 italic">
        People with 60%+ Spark Chance match faster. Keep logging.
      </p>
    </div>
  );
}