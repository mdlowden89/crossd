import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Consistency', value: data.components.consistency, hint: 'Log streak' },
          { label: 'Variety', value: data.components.variety, hint: 'Place types' },
          { label: 'Peak Clarity', value: data.components.peakClarity, hint: 'Time pattern' },
          { label: 'DNA Confidence', value: data.components.dnaConfidence, hint: 'Total logs' },
        ].map(({ label, value, hint }) => (
          <div key={label} className="bg-black/40 rounded-xl p-3 border border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/60 text-xs">{label}</span>
              <span className="text-white text-xs font-bold">{value}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: barColor }}
              />
            </div>
            <p className="text-white/30 text-xs mt-1">{hint}</p>
          </div>
        ))}
      </div>

      <p className="text-white/35 text-xs text-center mt-4 italic">
        People with 60%+ Spark Chance match faster. Keep logging.
      </p>
    </div>
  );
}