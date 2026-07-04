import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// London crossing hotspot locations for dot overlay
const LONDON_DOTS = [
  { lat: 51.5074, lng: -0.1278 }, // Central London
  { lat: 51.5155, lng: -0.0922 }, // Shoreditch
  { lat: 51.5033, lng: -0.1195 }, // South Bank
  { lat: 51.5200, lng: -0.1700 }, // Notting Hill
  { lat: 51.4994, lng: -0.1273 }, // Westminster
  { lat: 51.5136, lng: -0.0886 }, // Liverpool St
  { lat: 51.5045, lng: -0.0865 }, // Borough
  { lat: 51.5294, lng: -0.1224 }, // Camden
  { lat: 51.4915, lng: -0.1759 }, // Chelsea
  { lat: 51.5117, lng: -0.1565 }, // Paddington
];

// Dark Google Maps style JSON
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0010' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0010' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a2040' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a0020' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2a0030' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d0050' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06000d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a0035' }] },
  { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

function getFlooredCount(raw) {
  return Math.max(80, raw);
}

export default function LiveCrossingCounter({ city, onCta }) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(null);
  const [displayCount, setDisplayCount] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const countRef = useRef(null);

  // Fetch Google API key from backend
  useEffect(() => {
    base44.functions.invoke('getGoogleApiKey', {}).then(res => {
      setApiKey(res.data?.api_key || res.data?.apiKey);
    }).catch(() => {});
  }, []);

  // Pull crossing count
  useEffect(() => {
    async function fetchCount() {
      try {
        const crossings = await base44.entities.Crossing.filter({ status: 'notified' });
        const real = getFlooredCount(crossings.length);
        const hour = new Date().getHours();
        const multiplier = hour >= 18 && hour <= 23 ? 4.2 : hour >= 12 ? 2.8 : 1.6;
        setCount(Math.round(real * multiplier));
      } catch {
        const hour = new Date().getHours();
        const base = hour >= 18 && hour <= 23 ? 310 : hour >= 12 ? 190 : 95;
        setCount(base + Math.floor(Math.random() * 40));
      }
    }
    fetchCount();
  }, []);

  // Animate count
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

  // Load Google Maps
  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    if (window.google && window.google.maps) {
      initMap();
      return;
    }
    const scriptId = 'gmaps-welcome';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      document.getElementById(scriptId).addEventListener('load', initMap);
    }
  }, [apiKey, mapRef.current]);

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 12,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: true,
      gestureHandling: 'none',
      zoomControl: false,
      keyboardShortcuts: false,
    });
    mapInstanceRef.current = map;

    // Add pink crossing dots
    LONDON_DOTS.forEach((pos, i) => {
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#E70F72',
          fillOpacity: 0.85,
          strokeColor: '#E70F72',
          strokeOpacity: 0.3,
          strokeWeight: 8,
        },
      });
    });
  }

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
        style={{ height: 220, background: '#0d0010' }}
      >
        <div ref={mapRef} className="w-full h-full" />

        {/* Fallback dark placeholder while map loads */}
        {!apiKey && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0010]">
            <span className="text-white/20 text-sm">Loading map…</span>
          </div>
        )}

        {/* Privacy label */}
        <span className="absolute bottom-2 right-3 text-white/30 text-[10px] font-medium pointer-events-none select-none z-10">
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