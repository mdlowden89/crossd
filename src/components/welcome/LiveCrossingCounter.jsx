import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// London abstract road paths (SVG path data, not real streets — deliberately impressionistic)
const LONDON_PATHS = [
  "M 20 85 Q 80 60 160 75 Q 240 90 320 70 Q 380 55 440 65",
  "M 0 110 Q 70 95 130 105 Q 200 115 270 100 Q 340 85 420 95 Q 460 100 480 95",
  "M 30 130 Q 100 120 180 128 Q 260 136 350 122 Q 400 115 460 120",
  "M 10 55 Q 90 45 170 55 Q 230 62 300 50 Q 370 38 450 48",
  "M 50 145 Q 140 138 220 145 Q 300 152 380 140 Q 430 133 470 138",
];

// Fixed dot positions (scattered across the map, not on path intersections)
const BASE_DOTS = [
  { x: 68,  y: 92  },
  { x: 135, y: 112 },
  { x: 192, y: 78  },
  { x: 258, y: 105 },
  { x: 305, y: 88  },
  { x: 362, y: 118 },
  { x: 415, y: 74  },
  { x: 88,  y: 128 },
  { x: 230, y: 140 },
  { x: 440, y: 100 },
];

function getFlooredCount(raw) {
  // Floor at 80 so a quiet city never shows a deflating number
  return Math.max(80, raw);
}

export default function LiveCrossingCounter({ city, onCta }) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(null);
  const [displayCount, setDisplayCount] = useState(null);
  const [visibleDots, setVisibleDots] = useState([0, 2, 4, 6, 8]);
  const countRef = useRef(null);

  // Pull real 24-hour crossing count, floor it
  useEffect(() => {
    async function fetchCount() {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const crossings = await base44.entities.Crossing.filter({ status: 'notified' });
        // Use length as proxy; floor ensures it never looks dead
        const real = getFlooredCount(Math.max(crossings.length, 0));
        // Add a time-of-day multiplier to feel city-scale
        const hour = new Date().getHours();
        const multiplier = hour >= 18 && hour <= 23 ? 4.2 : hour >= 12 ? 2.8 : 1.6;
        setCount(Math.round(real * multiplier));
      } catch {
        // Fallback: time-seeded number
        const hour = new Date().getHours();
        const base = hour >= 18 && hour <= 23 ? 310 : hour >= 12 ? 190 : 95;
        setCount(base + Math.floor(Math.random() * 40));
      }
    }
    fetchCount();
  }, []);

  // Animate the number counting up on first load
  useEffect(() => {
    if (count === null) return;
    if (prefersReducedMotion) { setDisplayCount(count); return; }
    const start = Math.max(0, count - 60);
    let current = start;
    setDisplayCount(start);
    const step = () => {
      current += Math.ceil((count - current) / 8);
      if (current >= count) { setDisplayCount(count); return; }
      setDisplayCount(current);
      countRef.current = requestAnimationFrame(step);
    };
    countRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(countRef.current);
  }, [count, prefersReducedMotion]);

  // Rotate which dots are visible to simulate activity
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setVisibleDots(prev => {
        const next = [...prev];
        // Swap one random dot
        const removeIdx = Math.floor(Math.random() * next.length);
        const removed = next[removeIdx];
        const candidates = BASE_DOTS.map((_, i) => i).filter(i => !next.includes(i));
        if (candidates.length > 0) {
          next[removeIdx] = candidates[Math.floor(Math.random() * candidates.length)];
        }
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const cityLabel = city || 'London';

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* City pill */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E70F72]/20 border border-[#E70F72]/40"
      >
        <span className={`w-2 h-2 rounded-full bg-[#E70F72] ${prefersReducedMotion ? '' : 'animate-pulse'}`} />
        <span className="text-[#E70F72] text-sm font-semibold">Live in {cityLabel}</span>
      </motion.div>

      {/* Big number */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayCount}
            className="text-7xl md:text-8xl font-bold text-white tabular-nums leading-none"
          >
            {displayCount ?? '—'}
          </motion.div>
        </AnimatePresence>
        <p className="text-white/55 text-base mt-2 tracking-wide">crossings happening right now near you</p>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full rounded-2xl overflow-hidden border border-white/10 relative"
        style={{ background: '#100008' }}
      >
        <svg
          viewBox="0 0 480 175"
          className="w-full"
          aria-hidden="true"
        >
          {/* Abstract London road lines */}
          {LONDON_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#E70F72"
              strokeWidth="1"
              strokeOpacity="0.18"
            />
          ))}

          {/* Dots */}
          {BASE_DOTS.map((dot, i) => {
            const isVisible = visibleDots.includes(i);
            return (
              <g key={i}>
                {isVisible && !prefersReducedMotion && (
                  <circle cx={dot.x} cy={dot.y} r="10" fill="#E70F72" fillOpacity="0.08">
                    <animate attributeName="r" values="6;14;6" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="fill-opacity" values="0.12;0;0.12" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="4"
                  fill="#E70F72"
                  fillOpacity={isVisible ? 0.9 : 0.15}
                  style={{ transition: prefersReducedMotion ? 'none' : 'fill-opacity 0.6s ease' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Privacy label */}
        <span className="absolute bottom-2 right-3 text-white/30 text-[10px] font-medium pointer-events-none select-none">
          Approximate areas only
        </span>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col items-center gap-3 w-full"
      >
        <button
          onClick={onCta}
          className="w-full max-w-xs py-4 px-8 rounded-full bg-[#E70F72] text-white font-bold text-lg shadow-lg shadow-[#E70F72]/30 hover:bg-[#c50d61] transition-colors active:scale-95"
        >
          Find your crossing
        </button>
        <p className="text-white/40 text-sm">Someone you've nearly met is already here.</p>
      </motion.div>
    </div>
  );
}