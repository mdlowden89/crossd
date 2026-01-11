import React from 'react';

export default function CrossdLogo({ size = 'default', showText = true }) {
  const sizes = {
    sm: { dimension: 24, text: 'text-lg' },
    default: { dimension: 32, text: 'text-2xl' },
    lg: { dimension: 48, text: 'text-4xl' }
  };

  const { dimension, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <svg 
        width={dimension} 
        height={dimension} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heart outline */}
        <path
          d="M50 85C50 85 15 65 15 40C15 30 20 20 30 20C40 20 45 30 50 35C55 30 60 20 70 20C80 20 85 30 85 40C85 65 50 85 50 85Z"
          stroke="#E70F72"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Crossed paths inside */}
        <path
          d="M35 45 Q 42 38, 50 45 Q 58 52, 65 45"
          stroke="#E70F72"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M35 55 Q 42 62, 50 55 Q 58 48, 65 55"
          stroke="#E70F72"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className={`font-bold text-white ${text}`}>
          Crossd
        </span>
      )}
    </div>
  );
}