import React from 'react';
import { cn } from "@/lib/utils";

export function CrossdInput({ 
  className, 
  icon: Icon,
  error,
  ...props
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 peer-focus:text-white/60" />
      )}
      <input
        className={cn(
          "peer w-full bg-[#0B0B0B] border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40",
          "focus:outline-none focus:border-[#E70F72] transition-colors duration-200",
          Icon && "pl-12",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default CrossdInput;