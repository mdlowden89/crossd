import React from 'react';

export default function CrossdLogo({ size = 'default', showText = true }) {
  const sizes = {
    sm: { dimension: 24, text: 'text-lg' },
    default: { dimension: 32, text: 'text-2xl' },
    lg: { dimension: 48, text: 'text-4xl' }
  };

  const { dimension, text } = sizes[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <svg 
        width={dimension} 
        height={dimension} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heart outline */}
        <path
          d="M50 85C50 85 20 70 20 45C20 35 25 25 35 25C42 25 47 30 50 35C53 30 58 25 65 25C75 25 80 35 80 45C80 70 50 85 50 85Z"
          stroke="#E70F72"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handshake - interlocking S-shape */}
        <path
          d="M32 50 L38 50 Q42 50 45 46 Q48 42 52 42 Q56 42 59 46 Q62 50 66 50 L72 50"
          stroke="#E70F72"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Finger lines on lower right hand */}
        <path d="M66 54 L66 60" stroke="#E70F72" strokeWidth="6" strokeLinecap="round" />
        <path d="M70 54 L70 58" stroke="#E70F72" strokeWidth="6" strokeLinecap="round" />
        <path d="M62 54 L62 58" stroke="#E70F72" strokeWidth="6" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={`font-bold text-[#E70F72] ${text}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
          Crossd
        </span>
      )}
    </div>
  );
}