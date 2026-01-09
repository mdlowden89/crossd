import React from 'react';
import { cn } from "@/lib/utils";

export function CrossdCard({ 
  children, 
  className,
  glow = false,
  ...props 
}) {
  return (
    <div
      className={cn(
        "bg-gradient-to-b from-[#0B0B0B] to-[#050505]",
        "border border-[#E70F72]/25 rounded-2xl p-6",
        "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        glow && "shadow-[0_0_30px_rgba(231,15,114,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default CrossdCard;