import React from 'react';

export default function CrossdLogo({ size = 'default', showText = true }) {
  const sizes = {
    sm: { dimension: 24, text: 'text-lg' },
    default: { dimension: 32, text: 'text-2xl' },
    lg: { dimension: 48, text: 'text-4xl' }
  };

  const { dimension, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <svg 
        width={dimension} 
        height={dimension} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="#E70F72"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
        <path d="m18 15-2-2" />
        <path d="m15 18-2-2" />
      </svg>
      {showText && (
        <span className={`font-bold text-[#E70F72] ${text}`}>
          Crossd
        </span>
      )}
    </div>
  );
}