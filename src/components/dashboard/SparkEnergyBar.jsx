import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, ShieldCheck, Sparkles, Clock, TrendingUp, ChevronDown } from 'lucide-react';

const BREAKDOWN_ITEMS = [
  { icon: Activity,    label: 'Activity',        key: 'activity',       color: '#E70F72', desc: 'Moments logged in the last 7 days.' },
  { icon: Flame,       label: 'Streak',           key: 'streak',         color: '#F97316', desc: 'Consecutive daily logging streak.' },
  { icon: ShieldCheck, label: 'Profile Quality',  key: 'profileQuality', color: '#22C55E', desc: 'Photos, bio, prompts, MBTI & verification.' },
  { icon: Sparkles,    label: 'Resonance',        key: 'resonance',      color: '#A855F7', desc: 'Consistency of your PlacesDNA vibe.' },
  { icon: Clock,       label: 'Freshness',        key: 'freshness',      color: '#3B82F6', desc: 'How recently you were active.' },
];

export default function SparkEnergyBar({ energyData, sparksThisWeek }) {
  const [open, setOpen] = useState(false);
  const score = energyData.score;
  const remaining = Math.max(0, 5 - Math.min(sparksThisWeek, 5));

  return (
    <div
      className="rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer mb-3"
      style={{
        borderColor: open ? 'rgba(231,15,114,0.6)' : 'rgba(231,15,114,0.25)',
        background: 'rgba(0,0,0,0.4)',
      }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Summary */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/60">
            <span className="font-bold" style={{ color: '#E70F72' }}>{score}%</span> toward this week's Spark goal
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Goal: 80%</span>
            <ChevronDown
              className="w-3.5 h-3.5 text-white/30 transition-transform duration-200"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #E70F72, #ff6ba8)',
              boxShadow: '0 0 10px rgba(231,15,114,0.5)',
            }}
          />
          {/* 80% milestone marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: '80%' }} />
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-white/35 text-xs">
            {score >= 80
              ? '🎯 Spark goal reached — you\'re fully visible this week!'
              : `Log ${remaining} more moment${remaining !== 1 ? 's' : ''} to boost your score`}
          </span>
          <span className="text-white/30 text-xs">↑ 80% = peak</span>
        </div>
      </div>

      {/* Expanded breakdown */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="breakdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-3">
              <p className="text-white/50 text-xs pt-1">Energy breakdown</p>
              {BREAKDOWN_ITEMS.map(({ icon: Icon, label, key, color, desc }) => {
                const val = energyData.components[key];
                return (
                  <div key={label}>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                      <span className="flex-1 text-white/85 font-medium">{label}</span>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                        />
                      </div>
                      <span className="font-semibold w-8 text-right text-xs" style={{ color }}>{val}%</span>
                    </div>
                    <p className="text-white/35 text-xs ml-5 leading-snug">{desc}</p>
                  </div>
                );
              })}
              {energyData.components.boosts > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="flex-1 text-white/85 font-medium">Boosts</span>
                  <span className="font-semibold text-green-400">+{energyData.components.boosts}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}