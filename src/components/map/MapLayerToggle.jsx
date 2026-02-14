import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Sparkles } from 'lucide-react';

export default function MapLayerToggle({ activeLayer, onLayerChange, isPremium }) {
  const layers = [
    { id: 'moments', label: 'Moments', icon: MapPin, free: true },
    { id: 'zones', label: 'Zones', icon: Zap, free: true },
    { id: 'overlap', label: 'Overlap', icon: Sparkles, free: false }
  ];

  return (
    <div className="absolute top-6 left-6 right-6 z-[9999] overflow-x-auto scrollbar-hide">
      <div className="inline-flex bg-black/80 backdrop-blur-xl border border-[#E70F72]/30 rounded-2xl p-2 gap-2 min-w-min">
        {layers.map(layer => {
        const Icon = layer.icon;
        const isLocked = !layer.free && !isPremium;
        const isActive = activeLayer === layer.id;

        return (
          <motion.button
            key={layer.id}
            whileHover={{ scale: isLocked ? 1 : 1.05 }}
            whileTap={{ scale: isLocked ? 1 : 0.95 }}
            onClick={() => !isLocked && onLayerChange(layer.id)}
            disabled={isLocked}
            className={`relative px-4 py-2 rounded-xl transition-all ${
              isActive
                ? 'bg-[#E70F72] text-black'
                : 'bg-transparent text-white/60 hover:text-white'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{layer.label}</span>
              {isLocked && (
                <span className="text-xs">🔒</span>
              )}
            </div>
          </motion.button>
        );
      })}
      </div>
      
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