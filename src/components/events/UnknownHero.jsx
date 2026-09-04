import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const DOORWAY_PHOTO = 'https://media.base44.com/images/public/696101571241f794c88771c9/c676dc38d_generated_image.png';

// Cyan neon arc drawn in code (SVG path) with a soft glow.
function NeonArc() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute -left-16 top-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none"
      fill="none"
      style={{ filter: 'drop-shadow(0 0 14px rgba(0,242,255,0.55))' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="unknownArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f2ff" />
          <stop offset="100%" stopColor="#40e0d0" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M 320 40 C 120 60, 60 240, 220 380"
        stroke="url(#unknownArc)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Four-pointed sparkle divider line
function SparkleDivider() {
  return (
    <div className="flex items-center gap-3 w-full max-w-[230px] my-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#40e0d0]/70 to-[#40e0d0]/70" />
      <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" style={{ filter: 'drop-shadow(0 0 6px rgba(0,242,255,0.8))' }} />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#40e0d0]/70 to-[#40e0d0]/70" />
    </div>
  );
}

export default function UnknownHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl mb-6 -mx-4"
      style={{ background: '#020406' }}
    >
      {/* Cyan neon arc, drawn in code, behind everything */}
      <NeonArc />

      {/* Soft radial glow under the arc */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 90% at 15% 50%, rgba(0,242,255,0.10), transparent 55%)' }}
      />

      <div className="relative grid grid-cols-5 gap-3 px-4 pt-7 pb-7">
        {/* Left: text block (3 cols) */}
        <div className="col-span-3 relative z-10 flex flex-col justify-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] tracking-[0.35em] text-white/80 uppercase font-light">crossd</span>
            <span className="w-6 h-px bg-white/60" />
          </div>

          {/* Wordmark */}
          <h2 className="leading-[0.95] font-light tracking-tight">
            <span className="block text-white text-[28px]">CROSSD</span>
            <span
              className="block text-[28px]"
              style={{ color: '#40e0d0', textShadow: '0 0 18px rgba(0,242,255,0.45)' }}
            >
              UNKNOWN
            </span>
          </h2>

          <SparkleDivider />

          <p className="text-[13px] leading-snug text-white font-normal pr-2">
            Mystery experiences and unusual locations.
          </p>
        </div>

        {/* Right: doorway photo in a glowing circle (2 cols) */}
        <div className="col-span-2 relative flex items-center justify-center">
          <div
            className="relative aspect-square w-full max-w-[120px] rounded-full overflow-hidden"
            style={{
              boxShadow: '0 0 22px rgba(0,242,255,0.55), inset 0 0 0 1.5px rgba(0,242,255,0.85)',
            }}
          >
            <img
              src={DOORWAY_PHOTO}
              alt="People in formal wear entering a mysterious dark stone doorway"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* cyan tint over the photo */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, transparent 40%, rgba(0,242,255,0.18) 100%)' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}