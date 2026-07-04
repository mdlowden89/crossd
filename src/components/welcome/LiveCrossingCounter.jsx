import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

// Simulate a live-ish count that feels real: seed by time-of-day, drift slowly
function getLiveCount() {
  const hour = new Date().getHours();
  // peak evening hours, quieter at night
  const base = hour >= 18 && hour <= 23 ? 340 : hour >= 12 && hour <= 17 ? 210 : 90;
  const jitter = Math.floor(Math.sin(Date.now() / 4000) * 18 + Math.random() * 12);
  return Math.max(40, base + jitter);
}

export default function LiveCrossingCounter({ city }) {
  const [count, setCount] = useState(getLiveCount());
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getLiveCount();
      if (next !== prevCount.current) {
        setFlash(true);
        setTimeout(() => setFlash(false), 600);
        prevCount.current = next;
        setCount(next);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#E70F72]/30 bg-[#E70F72]/10 backdrop-blur-sm"
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E70F72] opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E70F72]" />
      </span>

      <span className="text-white/80 text-sm font-medium flex items-center gap-1.5">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`font-bold tabular-nums ${flash ? 'text-[#E70F72]' : 'text-white'}`}
          >
            {count.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span>crossings happening right now{city ? ` in ${city}` : ''}</span>
        <Zap className="w-3.5 h-3.5 text-[#E70F72] fill-[#E70F72]" />
      </span>
    </motion.div>
  );
}