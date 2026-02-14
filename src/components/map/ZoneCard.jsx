import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, Sparkles, Lock } from 'lucide-react';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';
import { CrossdButton } from '@/components/ui/crossd-button';
import { createPageUrl } from '@/utils';

export default function ZoneCard({ zone, onClose, isPremium }) {
  if (!zone) return null;

  const primary = getArchetypeInfo(zone.primaryArchetype);
  const secondary = zone.secondaryArchetype ? getArchetypeInfo(zone.secondaryArchetype) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[10000]"
      />
      
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[10001] bg-[#0B0B0B] rounded-t-3xl max-h-[70vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0B0B0B] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{primary.emoji}</span>
            <h2 className="text-xl font-bold text-white">{zone.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Zone Type */}
          <div>
            <p className="text-white/45 text-xs uppercase tracking-wider mb-2">Zone Vibe</p>
            <div className="flex items-center gap-2">
              <div 
                className="px-4 py-2 rounded-xl border-2 flex items-center gap-2"
                style={{ 
                  borderColor: primary.color, 
                  backgroundColor: `${primary.color}20` 
                }}
              >
                <span className="text-lg">{primary.emoji}</span>
                <span className="font-semibold" style={{ color: primary.color }}>
                  {primary.label}
                </span>
              </div>
              
              {secondary && (
                <>
                  <span className="text-white/40">+</span>
                  <div 
                    className="px-4 py-2 rounded-xl border-2 flex items-center gap-2"
                    style={{ 
                      borderColor: secondary.color, 
                      backgroundColor: `${secondary.color}20` 
                    }}
                  >
                    <span className="text-lg">{secondary.emoji}</span>
                    <span className="font-semibold" style={{ color: secondary.color }}>
                      {secondary.label}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active Time */}
          {zone.peakTime && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#E70F72]" />
                <p className="text-white/70 text-sm font-semibold">Most Active</p>
              </div>
              <p className="text-white text-base">{zone.peakTime}</p>
            </div>
          )}

          {/* Venue Types */}
          {zone.venueTypes && zone.venueTypes.length > 0 && (
            <div>
              <p className="text-white/45 text-xs uppercase tracking-wider mb-2">Common Places</p>
              <div className="flex flex-wrap gap-2">
                {zone.venueTypes.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 text-sm border border-white/10"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spark Insight */}
          {zone.sparkInsight && (
            <div className="bg-gradient-to-r from-[#E70F72]/20 to-transparent border border-[#E70F72]/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#E70F72] mt-0.5" />
                <div>
                  <p className="text-[#E70F72] text-xs font-bold mb-1 uppercase tracking-wider">
                    Spark Insight
                  </p>
                  <p className="text-white/90 text-sm">{zone.sparkInsight}</p>
                </div>
              </div>
            </div>
          )}

          {/* Premium Content */}
          {!isPremium && (
            <div className="bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a] border border-[#E70F72]/30 rounded-2xl p-6 text-center">
              <Lock className="w-10 h-10 text-[#E70F72] mx-auto mb-3" />
              <h3 className="text-white font-bold text-base mb-2">Unlock Zone Insights</h3>
              <p className="text-white/60 text-sm mb-4">
                See compatible types, best match windows, and top places with Crossd+
              </p>
              <CrossdButton
                onClick={() => window.location.href = createPageUrl('CrossdPlus')}
                size="sm"
                className="w-full"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Crossd+
              </CrossdButton>
            </div>
          )}

          {/* Premium Zone Details */}
          {isPremium && zone.compatibleTypes && (
            <div>
              <p className="text-white/45 text-xs uppercase tracking-wider mb-3">Compatible Types Here</p>
              <div className="space-y-2">
                {zone.compatibleTypes.map((type, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white text-sm">{type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}