import React from 'react';
import { motion } from 'framer-motion';

export default function MapIllustration() {
  return (
    <div className="w-full max-w-md mx-auto my-8">
      <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        <g opacity="0.15" stroke="#E70F72" strokeWidth="0.5">
          <line x1="0" y1="50" x2="400" y2="50" />
          <line x1="0" y1="100" x2="400" y2="100" />
          <line x1="0" y1="150" x2="400" y2="150" />
          <line x1="0" y1="200" x2="400" y2="200" />
          <line x1="100" y1="0" x2="100" y2="250" />
          <line x1="200" y1="0" x2="200" y2="250" />
          <line x1="300" y1="0" x2="300" y2="250" />
        </g>

        {/* Connection paths - animated */}
        <motion.path
          d="M 80 180 Q 150 120 220 160"
          stroke="#E70F72"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
        <motion.path
          d="M 220 160 Q 270 100 320 140"
          stroke="#E70F72"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.path
          d="M 140 80 Q 180 110 220 80"
          stroke="#E70F72"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.7 }}
        />

        {/* Location pins */}
        <g>
          {/* Pin 1 */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <circle cx="80" cy="180" r="8" fill="#E70F72" opacity="0.3" />
            <circle cx="80" cy="180" r="4" fill="#E70F72" />
            <path d="M 80 180 L 80 170 C 80 165 75 162 75 157 C 75 153 78 150 82 150 C 86 150 89 153 89 157 C 89 162 84 165 84 170 L 84 180" 
                  fill="#E70F72" stroke="#E70F72" strokeWidth="1" />
          </motion.g>

          {/* Pin 2 */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <circle cx="220" cy="160" r="8" fill="#E70F72" opacity="0.3" />
            <circle cx="220" cy="160" r="4" fill="#E70F72" />
            <path d="M 220 160 L 220 150 C 220 145 215 142 215 137 C 215 133 218 130 222 130 C 226 130 229 133 229 137 C 229 142 224 145 224 150 L 224 160" 
                  fill="#E70F72" stroke="#E70F72" strokeWidth="1" />
          </motion.g>

          {/* Pin 3 */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <circle cx="320" cy="140" r="8" fill="#E70F72" opacity="0.3" />
            <circle cx="320" cy="140" r="4" fill="#E70F72" />
            <path d="M 320 140 L 320 130 C 320 125 315 122 315 117 C 315 113 318 110 322 110 C 326 110 329 113 329 117 C 329 122 324 125 324 130 L 324 140" 
                  fill="#E70F72" stroke="#E70F72" strokeWidth="1" />
          </motion.g>

          {/* Pin 4 */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <circle cx="140" cy="80" r="6" fill="#E70F72" opacity="0.3" />
            <circle cx="140" cy="80" r="3" fill="#E70F72" />
            <path d="M 140 80 L 140 72 C 140 69 137 67 137 64 C 137 61 139 59 142 59 C 145 59 147 61 147 64 C 147 67 144 69 144 72 L 144 80" 
                  fill="#E70F72" stroke="#E70F72" strokeWidth="0.8" />
          </motion.g>

          {/* Pin 5 */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <circle cx="220" cy="80" r="6" fill="#E70F72" opacity="0.3" />
            <circle cx="220" cy="80" r="3" fill="#E70F72" />
            <path d="M 220 80 L 220 72 C 220 69 217 67 217 64 C 217 61 219 59 222 59 C 225 59 227 61 227 64 C 227 67 224 69 224 72 L 224 80" 
                  fill="#E70F72" stroke="#E70F72" strokeWidth="0.8" />
          </motion.g>
        </g>

        {/* Pulsing dots at connection points */}
        <motion.circle
          cx="220"
          cy="160"
          r="6"
          fill="#E70F72"
          opacity="0.5"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        <motion.circle
          cx="80"
          cy="180"
          r="6"
          fill="#E70F72"
          opacity="0.5"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
        />
        <motion.circle
          cx="320"
          cy="140"
          r="6"
          fill="#E70F72"
          opacity="0.5"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
        />
      </svg>
    </div>
  );
}