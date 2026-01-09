import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SparkIcon({ 
  size = 24, 
  animated = false,
  className = ""
}) {
  if (animated) {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Sparkles size={size} className={`text-[#E70F72] ${className}`} />
      </motion.div>
    );
  }

  return <Sparkles size={size} className={`text-[#E70F72] ${className}`} />;
}