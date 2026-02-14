import React from 'react';
import { motion } from 'framer-motion';

export default function RarityBadge({ rarity, size = 'default', showPercentage = false }) {
  if (!rarity || rarity.hidden) return null;
  
  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs',
      emoji: 'text-xs',
      text: 'text-xs'
    },
    default: {
      container: 'px-3 py-1.5 text-sm',
      emoji: 'text-sm',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      emoji: 'text-lg',
      text: 'text-base'
    }
  };
  
  const sizeClass = sizes[size] || sizes.default;
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass.container}`}
      style={{
        background: `linear-gradient(135deg, ${rarity.color}30, ${rarity.color}10)`,
        border: `1.5px solid ${rarity.color}60`,
        boxShadow: `0 0 20px ${rarity.color}20`,
        color: rarity.color
      }}
    >
      <motion.span 
        className={sizeClass.emoji}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {rarity.emoji}
      </motion.span>
      <span className={sizeClass.text}>
        {rarity.label}
        {showPercentage && ` ${rarity.percentage}%`}
      </span>
    </motion.div>
  );
}