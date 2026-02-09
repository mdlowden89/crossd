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
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Heart shape */}
        <path
          d="M50 85C50 85 15 60 15 35C15 20 25 10 35 10C42 10 47 14 50 20C53 14 58 10 65 10C75 10 85 20 85 35C85 60 50 85 50 85Z"
          fill="#E70F72"
        />
        
        {/* Location pin integrated in the heart */}
        <circle
          cx="50"
          cy="35"
          r="12"
          fill="black"
        />
        <circle
          cx="50"
          cy="35"
          r="6"
          fill="#E70F72"
        />
      </svg>
      {showText && (
        <span className={`font-bold text-[#E70F72] ${text}`}>
          Crossd
        </span>
      )}
    </div>
  );
}