import React from 'react';
import { Heart } from 'lucide-react';

export default function CrossdLogo({ size = 'default', showText = true }) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    default: { icon: 28, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-4xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Heart 
          className="text-[#E70F72] fill-[#E70F72]" 
          size={icon}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[30%] h-[30%] bg-black rounded-full" />
        </div>
      </div>
      {showText && (
        <span className={`font-bold text-white ${text}`}>
          Crossd
        </span>
      )}
    </div>
  );
}