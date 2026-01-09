import React from 'react';
import { cn } from "@/lib/utils";

export function CrossdButton({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className,
  disabled,
  loading,
  ...props 
}) {
  const baseStyles = "font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#E70F72] text-black hover:brightness-110 active:scale-[0.98]",
    secondary: "bg-transparent border border-white/20 text-white hover:border-[#E70F72] hover:text-[#E70F72]",
    ghost: "bg-transparent text-white/65 hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    icon: "p-3"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}

export default CrossdButton;