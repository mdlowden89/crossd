import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Clock, ChevronDown } from 'lucide-react';

function MilestonePips({ value, max, color }) {
  return (
    <div className="flex gap-1.5 mt-3">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full transition-all duration-500"
          style={{
            backgroundColor: i < value ? color : 'rgba(255,255,255,0.1)',
            boxShadow: i < value ? `0 0 6px ${color}80` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, color, borderColor, expandedContent, pipMax, pipColor }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer"
      style={{ borderColor: open ? borderColor : `${borderColor}66`, background: 'rgba(0,0,0,0.4)' }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Summary row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${borderColor}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-3xl font-bold text-white leading-none">{value}</div>
          <div className="text-white/50 text-sm mt-0.5">{label}</div>
          {pipMax && (
            <MilestonePips value={Math.min(value, pipMax)} max={pipMax} color={pipColor || color} />
          )}
        </div>
        <ChevronDown
          className="w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-4 pt-1 border-t"
              style={{ borderColor: `${borderColor}30` }}
            >
              {expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MetricCards({ dayStreak, sparksThisWeek, expiringMoments }) {
  const streakPct = Math.min(dayStreak, 7) / 7 * 100;
  const sparksPct = Math.min(sparksThisWeek, 5) / 5 * 100;

  return (
    <div className="flex flex-col gap-3">
      {/* Day Streak */}
      <MetricCard
        icon={Flame}
        value={dayStreak}
        label="Day Streak"
        color="#F97316"
        borderColor="#F97316"
        pipMax={7}
        pipColor="#F97316"
        expandedContent={
          <div>
            <div className="flex items-center justify-between mb-2 mt-2">
              <span className="text-white/60 text-xs">Progress to max streak</span>
              <span className="text-orange-400 text-xs font-semibold">{dayStreak}/7 days</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${streakPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F97316, #E70F72)', boxShadow: '0 0 8px rgba(249,115,22,0.6)' }}
              />
              {/* 7-day milestone */}
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/30" />
            </div>
            <p className="text-white/55 text-xs leading-relaxed">
              {dayStreak === 0
                ? 'Log a moment today to start your streak!'
                : dayStreak >= 7
                ? '🎉 Max streak reached — your Streak score is fully charged!'
                : `${7 - dayStreak} more day${7 - dayStreak !== 1 ? 's' : ''} to max out your Streak score and boost Spark Energy ⚡`}
            </p>
          </div>
        }
      />

      {/* Sparks This Week */}
      <MetricCard
        icon={Sparkles}
        value={sparksThisWeek}
        label="Sparks this week"
        color="#E70F72"
        borderColor="#E70F72"
        pipMax={5}
        pipColor="#E70F72"
        expandedContent={
          <div>
            <div className="flex items-center justify-between mb-2 mt-2">
              <span className="text-white/60 text-xs">Progress to peak activity</span>
              <span className="text-[#E70F72] text-xs font-semibold">{sparksThisWeek}/5 moments</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sparksPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #E70F72, #ff6ba8)', boxShadow: '0 0 8px rgba(231,15,114,0.6)' }}
              />
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/30" />
            </div>
            <p className="text-white/55 text-xs leading-relaxed">
              {sparksThisWeek === 0
                ? 'Log your first moment this week to build momentum!'
                : sparksThisWeek >= 5
                ? '🎯 Peak activity reached — you\'re fully visible this week!'
                : `Log ${5 - sparksThisWeek} more moment${5 - sparksThisWeek !== 1 ? 's' : ''} to hit peak visibility and max out your Activity score`}
            </p>
          </div>
        }
      />

      {/* Expiring Moments */}
      <MetricCard
        icon={Clock}
        value={expiringMoments}
        label="Expiring Moments"
        color="#3B82F6"
        borderColor="#3B82F6"
        expandedContent={
          <div>
            <p className="text-white/55 text-xs leading-relaxed mt-2">
              {expiringMoments === 0
                ? '✅ All your moments are fresh and actively powering crossings!'
                : (
                  <>
                    <span className="text-blue-400 font-semibold">{expiringMoments} moment{expiringMoments !== 1 ? 's' : ''}</span>
                    {' '}{expiringMoments !== 1 ? 'are' : 'is'} older than 7 days and no longer contributing to active crossings.
                    {' '}Keep logging regularly to stay discoverable. 📍
                  </>
                )}
            </p>
            {expiringMoments > 0 && (
              <div
                className="mt-3 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(231,15,114,0.1)', border: '1px solid rgba(231,15,114,0.2)', color: '#E70F72' }}
              >
                Log a moment today to refresh your trail
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}