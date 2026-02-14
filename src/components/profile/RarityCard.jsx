import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, TrendingUp } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { createPageUrl } from '@/utils';
import { generateRarityInsights } from '@/components/spark/rarityEngine';

export default function RarityCard({ rarity, isPremium, onClose }) {
  if (!rarity || rarity.tier === 'common') return null;
  
  const insights = generateRarityInsights(rarity, isPremium);
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-[10000]"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[10001] bg-[#0B0B0B] rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: `0 0 60px ${rarity.color}40, inset 0 0 80px ${rarity.color}10`
        }}
      >
        <div className="relative">
          {/* Animated background glow */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${rarity.color}40, transparent 70%)`
            }}
          />
          
          {/* Content */}
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
            
            {/* Rarity Display */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {rarity.emoji}
              </motion.div>
              
              <h2 
                className="text-3xl font-bold mb-2"
                style={{ color: rarity.color }}
              >
                {rarity.label} Energy
              </h2>
              
              {isPremium && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                  <p className="text-white/60 text-sm">
                    Top {(rarity.rarity * 100).toFixed(1)}% in {rarity.city}
                  </p>
                </div>
              )}
              
              <p className="text-white/80 text-base">
                {rarity.description || "Your vibe stands out"}
              </p>
            </div>
            
            {/* Insights */}
            {isPremium && insights && insights.length > 0 && (
              <div className="space-y-3 mb-6">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <p className="text-white/90 text-sm leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Premium Upsell */}
            {!isPremium && (
              <div className="text-center p-6 bg-gradient-to-br from-[#E70F72]/20 to-transparent border border-[#E70F72]/30 rounded-2xl">
                <Sparkles className="w-10 h-10 text-[#E70F72] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Unlock Full Rarity Insights</h3>
                <p className="text-white/60 text-sm mb-4">
                  See exact percentages, match predictions, and what makes you magnetic
                </p>
                <CrossdButton
                  onClick={() => window.location.href = createPageUrl('CrossdPlus')}
                  size="sm"
                  className="w-full"
                >
                  Upgrade to Crossd+
                </CrossdButton>
              </div>
            )}
            
            {/* Info Box */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-white/50 text-xs text-center leading-relaxed">
                Rarity is based on your PlacesDNA archetypes compared to {rarity.city} users. 
                {isPremium ? ' Premium members see exact statistics.' : ' Upgrade for detailed insights.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}