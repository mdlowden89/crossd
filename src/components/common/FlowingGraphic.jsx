import React from 'react';
import { motion } from 'framer-motion';

export default function FlowingGraphic() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden pointer-events-none">
      <motion.svg
        viewBox="0 0 1200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E70F72" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#E70F72" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E70F72" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Flowing wave paths */}
        <motion.path
          d="M-100 200 Q 200 100, 400 150 T 800 180 T 1200 150 L 1200 300 L -100 300 Z"
          fill="url(#flowGradient)"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M-100 220 Q 300 120, 500 170 T 900 200 T 1300 170 L 1300 300 L -100 300 Z"
          fill="url(#flowGradient)"
          opacity="0.5"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
        />
        
        {/* Animated particles along the flow */}
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            r="3"
            fill="#E70F72"
            initial={{ 
              cx: -50 + (i * 150), 
              cy: 200,
              opacity: 0 
            }}
            animate={{ 
              cx: [
                -50 + (i * 150), 
                100 + (i * 150), 
                250 + (i * 150), 
                400 + (i * 150)
              ],
              cy: [200, 150, 180, 150],
              opacity: [0, 0.8, 0.8, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}