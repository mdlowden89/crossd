import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

// Build a 7×24 grid (days × hours) from crossings data
// We'll display a condensed 7-day × 6-time-band view for readability on mobile

const TIME_BANDS = [
  { label: 'Night', hours: [0, 1, 2, 3, 4, 5] },
  { label: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
  { label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
  { label: 'Evening', hours: [18, 19, 20, 21] },
  { label: 'Late', hours: [22, 23] },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Returns a colour between deep purple (cold) and neon pink (hot)
function heatColor(intensity) {
  // intensity 0..1
  if (intensity <= 0) return 'rgba(60,0,80,0.25)';
  if (intensity < 0.2) return `rgba(80,0,120,${0.3 + intensity * 1.5})`;
  if (intensity < 0.5) return `rgba(140,0,140,${0.45 + intensity})`;
  if (intensity < 0.75) return `rgba(200,0,120,${0.6 + intensity * 0.4})`;
  return `rgba(231,15,114,${0.7 + intensity * 0.3})`;
}

function glowStyle(intensity) {
  if (intensity < 0.5) return {};
  return { boxShadow: `0 0 ${Math.round(intensity * 12)}px rgba(231,15,114,${intensity * 0.7})` };
}

export default function CrossingsHeatmap({ crossings = [], moments = [] }) {
  const { grid, maxCount, hotSpot, totalThisWeek } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Use crossings if available, fall back to moments for heatmap signal
    const source = crossings.length > 0
      ? crossings.filter(c => new Date(c.crossing_at || c.created_date) > weekAgo)
      : moments.filter(m => !m._isSample && new Date(m.created_date) > weekAgo);

    // grid[dayIndex][timeBandIndex] = count
    const grid = DAYS.map(() => TIME_BANDS.map(() => 0));

    source.forEach(item => {
      const d = new Date(item.crossing_at || item.created_date);
      if (isNaN(d)) return;
      const dayIndex = (d.getDay() + 6) % 7; // Mon=0
      const h = d.getHours();
      const bandIndex = TIME_BANDS.findIndex(b => b.hours.includes(h));
      if (bandIndex >= 0) grid[dayIndex][bandIndex]++;
    });

    let maxCount = 1;
    let hotSpot = { day: '', band: '', count: 0 };
    grid.forEach((row, di) => {
      row.forEach((count, bi) => {
        if (count > maxCount) maxCount = count;
        if (count > hotSpot.count) hotSpot = { day: DAYS[di], band: TIME_BANDS[bi].label, count };
      });
    });

    const totalThisWeek = source.length;
    return { grid, maxCount, hotSpot, totalThisWeek };
  }, [crossings, moments]);

  return (
    <div
      className="rounded-2xl border border-[#E70F72]/25 overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E70F72]" />
            <span className="text-white font-bold text-base">Crossings Heatmap</span>
          </div>
          {totalThisWeek > 0 && (
            <span className="text-xs text-[#E70F72] font-semibold bg-[#E70F72]/10 px-2 py-0.5 rounded-full border border-[#E70F72]/20">
              {totalThisWeek} this week
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs leading-snug">
          Where paths are crossing most — darker pink = more activity.
        </p>

        {hotSpot.count > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-3 h-3 text-[#E70F72]" />
            <span className="text-white/55 text-xs">
              Hottest: <span className="text-[#E70F72] font-semibold">{hotSpot.day} {hotSpot.band}</span>
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 pb-5">
        {/* Time band labels */}
        <div className="flex mb-1.5 pl-8">
          {TIME_BANDS.map(b => (
            <div key={b.label} className="flex-1 text-center text-[9px] text-white/25 font-medium">
              {b.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-1">
          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center gap-1.5">
              <span className="w-7 text-right text-[10px] text-white/30 font-medium flex-shrink-0">{day}</span>
              <div className="flex flex-1 gap-1">
                {TIME_BANDS.map((band, bi) => {
                  const count = grid[di][bi];
                  const intensity = count / maxCount;
                  return (
                    <motion.div
                      key={band.label}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (di * 5 + bi) * 0.012, duration: 0.3 }}
                      className="flex-1 h-7 rounded-md relative"
                      style={{ backgroundColor: heatColor(intensity), ...glowStyle(intensity) }}
                      title={`${day} ${band.label}: ${count}`}
                    >
                      {count > 0 && intensity > 0.6 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/80">
                          {count}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-white/25 text-[9px]">Low</span>
          <div className="flex gap-0.5">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
              <div key={v} className="w-4 h-2 rounded-sm" style={{ backgroundColor: heatColor(v) }} />
            ))}
          </div>
          <span className="text-white/25 text-[9px]">High</span>
        </div>
      </div>
    </div>
  );
}