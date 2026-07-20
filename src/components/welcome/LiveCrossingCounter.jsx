import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, X } from 'lucide-react';

const CITY_SPOTS = {
  London: ['Soho', 'Shoreditch', 'Camden', 'Notting Hill', 'Covent Garden', 'Brixton', 'Hackney', 'Peckham'],
  'New York': ['SoHo', 'Brooklyn', 'West Village', 'Midtown', 'Astoria', 'The Bronx', 'Harlem'],
  'Los Angeles': ['Silver Lake', 'Venice', 'Echo Park', 'Koreatown', 'DTLA', 'Culver City'],
  Paris: ['Le Marais', 'Montmartre', 'Bastille', 'Saint-Germain', 'Belleville', 'Pigalle'],
  Berlin: ['Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Friedrichshain', 'Neukölln'],
  Amsterdam: ['Jordaan', 'De Pijp', 'Centrum', 'Oost', 'Noord'],
  Tokyo: ['Shibuya', 'Shinjuku', 'Harajuku', 'Shimokitazawa', 'Nakameguro'],
  Sydney: ['Surry Hills', 'Newtown', 'Darlinghurst', 'Bondi', 'Glebe'],
  Dubai: ['Downtown', 'DIFC', 'JBR', 'Jumeirah', 'Deira'],
  Toronto: ['Kensington', 'Distillery', 'Queen West', 'Annex', 'Leslieville'],
  Singapore: ['Tiong Bahru', 'Chinatown', 'Clarke Quay', 'Bugis', 'Tanjong Pagar'],
};

const DEFAULT_SPOTS = ['City Centre', 'Old Town', 'Waterfront', 'Arts District', 'Market Square'];

const VIBES = ['coffee shop', 'park', 'gallery', 'bookstore', 'rooftop bar', 'street market', 'gym', 'station'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCrossing(spots) {
  const minsAgo = Math.floor(Math.random() * 8) + 1;
  return {
    id: Date.now() + Math.random(),
    spot: randomFrom(spots),
    vibe: randomFrom(VIBES),
    minsAgo,
    label: minsAgo === 1 ? 'just now' : `${minsAgo}m ago`,
  };
}

function useAnimatedCount(base, variance) {
  const [count, setCount] = useState(base);
  const [delta, setDelta] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const change = Math.random() < 0.7 ? 1 : -1;
      setCount(prev => Math.max(base - variance, Math.min(base + variance, prev + change)));
      setDelta(change);
      setTimeout(() => setDelta(null), 600);
      timeoutRef.current = setTimeout(tick, 3000 + Math.random() * 5000);
    };
    timeoutRef.current = setTimeout(tick, 2000 + Math.random() * 3000);
    return () => clearTimeout(timeoutRef.current);
  }, [base, variance]);

  return { count, delta };
}

export default function LiveCrossingCounter() {
  const [city, setCity] = useState('your city');
  const [expanded, setExpanded] = useState(false);
  const [feed, setFeed] = useState([]);
  const spots = CITY_SPOTS[city] || DEFAULT_SPOTS;
  const { count, delta } = useAnimatedCount(47, 18);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('London')) setCity('London');
    else if (tz.includes('New_York')) setCity('New York');
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
  }, []);

  // Seed feed and keep adding new crossings
  useEffect(() => {
    if (!expanded) return;
    const initial = Array.from({ length: 4 }, () => generateCrossing(spots));
    setFeed(initial);
    const interval = setInterval(() => {
      setFeed(prev => [generateCrossing(spots), ...prev].slice(0, 6));
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [expanded, city]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="relative"
    >
      {/* Pill trigger */}
      <motion.button
        onClick={() => setExpanded(v => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer transition-colors hover:border-[#E70F72]/40 hover:bg-[#E70F72]/5 whitespace-nowrap"
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
            crossings right now in <span className="text-white/85 font-medium">{city}</span>
          </span>
        </div>

        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Zap className="w-3.5 h-3.5 text-[#E70F72] flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Expanded live feed */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl overflow-hidden z-50"
            style={{ boxShadow: '0 0 40px rgba(231,15,114,0.12), 0 8px 32px rgba(0,0,0,0.6)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E70F72] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E70F72]" />
                </span>
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Live in {city}</span>
              </div>
              <button onClick={() => setExpanded(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feed */}
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {feed.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {/* Icon */}
                    <div className="w-7 h-7 rounded-full bg-[#E70F72]/15 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[#E70F72]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 text-sm leading-tight">
                        Two paths crossed near <span className="text-white font-medium">{item.spot}</span>
                      </p>
                      <p className="text-white/35 text-xs mt-0.5">{item.vibe} · {item.label}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div className="px-4 py-3 border-t border-white/8 text-center">
              <p className="text-white/35 text-xs">Anonymous · No data stored · <span className="text-[#E70F72]/70">Join to see your crossings</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}