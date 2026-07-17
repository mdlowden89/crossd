import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildSparkSignals } from '@/components/spark/signalsGenerator';

export default function SparkSignatureRow({ profile, moments = [] }) {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const signals = buildSparkSignals(profile, moments);
  
  if (signals.length === 0) return null;
  
  return (
    <div className="relative mb-6 -mx-5 px-5">
      {/* Signals Row */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        {signals.map((signal, idx) => (
          <motion.button
            key={signal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSignal(signal);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all hover:scale-105"
            style={{
              borderColor: `${signal.color}40`,
              background: `linear-gradient(135deg, ${signal.color}10, ${signal.color}05)`,
              boxShadow: `0 0 20px ${signal.color}20`
            }}
          >
            <span className="text-base">{signal.icon}</span>
            <span 
              className="text-sm font-semibold truncate"
              style={{ color: signal.color }}
            >
              {signal.label}
            </span>
          </motion.button>
        ))}
      </div>
      
      {/* Explanation Popover */}
      <AnimatePresence>
        {selectedSignal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSignal(null)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            
            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto max-h-[80vh] overflow-y-auto"
              style={{ 
                maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)',
                top: 'calc(50% - env(safe-area-inset-top) / 2)'
              }}
            >
              <div 
                className="bg-[#0B0B0B] border-2 rounded-2xl p-6 shadow-2xl"
                style={{
                  borderColor: `${selectedSignal.color}60`,
                  boxShadow: `0 0 40px ${selectedSignal.color}30`
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedSignal.icon}</span>
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: selectedSignal.color }}
                  >
                    {selectedSignal.label}
                  </h3>
                </div>
                <p className="text-white/80 text-base leading-relaxed">
                  {selectedSignal.reason}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSignal(null);
                  }}
                  className="mt-4 w-full py-2.5 rounded-full font-semibold text-sm"
                  style={{
                    background: `${selectedSignal.color}20`,
                    color: selectedSignal.color
                  }}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}