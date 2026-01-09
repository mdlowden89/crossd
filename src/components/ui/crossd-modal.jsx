import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

export function CrossdModal({ 
  isOpen, 
  onClose, 
  children,
  title,
  className,
  showClose = true
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "bg-gradient-to-b from-[#0B0B0B] to-[#050505]",
              "border border-[#E70F72]/25 rounded-2xl p-6",
              "w-full max-w-md max-h-[90vh] overflow-y-auto",
              className
            )}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between mb-6">
                {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CrossdModal;