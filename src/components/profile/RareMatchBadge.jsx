import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function RareMatchBadge({ matchRarity }) {
  if (!matchRarity || matchRarity.hidden) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="absolute top-4 right-4 z-10"
    >
      <motion.div
        animate={{ 
          boxShadow: [
            `0 0 20px ${matchRarity.color}40`,
            `0 0 40px ${matchRarity.color}60`,
            `0 0 20px ${matchRarity.color}40`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="px-4 py-2 rounded-full backdrop-blur-xl flex items-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${matchRarity.color}90, ${matchRarity.color}70)`,
          border: `2px solid ${matchRarity.color}`
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-4 h-4 text-white" fill="white" />
        </motion.div>
        <div className="text-white">
          <p className="text-xs font-bold leading-none">{matchRarity.label} Match</p>
          <p className="text-[10px] opacity-90">{matchRarity.percentage}% of users</p>
        </div>
      </motion.div>
    </motion.div>
  );
}