import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function OverlapBadge({ sharedCount, overlapArchetype, bestWindow }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-24 left-1/2 -translate-x-1/2 z-[9999] bg-black/90 backdrop-blur-xl border-2 border-[#FFB800] rounded-2xl px-5 py-3 shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-6 h-6 text-[#FFB800]" fill="#FFB800" />
        </motion.div>
        <div>
          <p className="text-white font-bold text-sm">
            {sharedCount} Shared {sharedCount === 1 ? 'Zone' : 'Zones'}
          </p>
          {overlapArchetype && (
            <p className="text-[#FFB800] text-xs">
              Overlap: {overlapArchetype}
            </p>
          )}
          {bestWindow && (
            <p className="text-white/60 text-xs mt-0.5">
              Best time: {bestWindow}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}