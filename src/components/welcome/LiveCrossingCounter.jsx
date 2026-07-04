import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

// Simulate a realistic live count that slowly ticks up/down
function useAnimatedCount(base, variance) {
  const [count, setCount] = useState(base);
  const [delta, setDelta] = useState(null); // +1 or -1 for flash
  const timeoutRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const change = Math.random() < 0.7 ? 1 : -1;
      setCount(prev => {
        const next = prev + change;
        // Keep within realistic bounds
        return Math.max(base - variance, Math.min(base + variance, next));
      });
      setDelta(change);
      setTimeout(() => setDelta(null), 600);
      // Next tick between 3–8 seconds
      timeoutRef.current = setTimeout(tick, 3000 + Math.random() * 5000);
    };
    timeoutRef.current = setTimeout(tick, 2000 + Math.random() * 3000);
    return () => clearTimeout(timeoutRef.current);
  }, [base, variance]);

  return { count, delta };
}

export default function LiveCrossingCounter() {
  const [city, setCity] = useState('your city');
  const { count, delta } = useAnimatedCount(47, 18);

  useEffect(() => {
    // Approximate city from timezone/locale — no precise location needed
    if (navigator.language) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('London') || tz.includes('Europe/London')) setCity('London');
      else if (tz.includes('New_York') || tz.includes('America/New_York')) setCity('New York');
      else if (tz.includes('Los_Angeles')) setCity('Los Angeles');
      else if (tz.includes('Chicago')) setCity('Chicago');
      else if (tz.includes('Paris')) setCity('Paris');
      else if (tz.includes('Berlin')) setCity('Berlin');
      else if (tz.includes('Amsterdam')) setCity('Amsterdam');
      else if (tz.includes('Tokyo')) setCity('Tokyo');
      else if (tz.includes('Sydney')) setCity('Sydney');
      else if (tz.includes('Dubai')) setCity('Dubai');
      else if (tz.includes('Toronto')) setCity('Toronto');
      else if (tz.includes('Singapore')) setCity('Singapore');
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
    >
      {/* Pulsing live dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E70F72] opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E70F72]" />
      </span>

      <div className="flex items-center gap-1.5 text-sm">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: delta === 1 ? -12 : 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: delta === 1 ? 12 : -12, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="font-bold text-white tabular-nums inline-block"
          >
            {count}
          </motion.span>
        </AnimatePresence>
        <span className="text-white/60">
          crossings happening right now in <span className="text-white/85 font-medium">{city}</span>
        </span>
      </div>

      <Zap className="w-3.5 h-3.5 text-[#E70F72] flex-shrink-0" />
    </motion.div>
  );
}