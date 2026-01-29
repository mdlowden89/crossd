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
        {/* Heart outline with integrated handshake */}
        <path
          d="M50 18C45 13 38 10 32 10C22 10 14 18 14 28C14 42 24 54 34 64C40 70 46 76 50 80C54 76 60 70 66 64C76 54 86 42 86 28C86 18 78 10 68 10C62 10 55 13 50 18Z"
          stroke="#E70F72"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Interlocking handshake - S shape with fingers */}
        {/* Left hand coming in from left */}
        <path
          d="M32 38 L38 44 Q42 48 46 44 L50 40"
          stroke="#E70F72"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Right hand coming in from right with interlock */}
        <path
          d="M68 38 L62 44 Q58 48 54 44 L50 40"
          stroke="#E70F72"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Finger lines on lower right hand */}
        <path
          d="M54 50 L54 58 M58 50 L58 58 M62 50 L62 58"
          stroke="#E70F72"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
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