import React from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Sparkles, MapPin, Clock, Heart } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { createPageUrl } from '@/utils';
import { calculateCompatibility, getCompatibilityLabel } from '@/components/spark/compatibilityEngine';
import { calculateUserPlacesDNA, getArchetypeInfo } from '@/components/spark/placesDnaEngine';

export default function CompatibilityBreakdown({ 
  isOpen, 
  onClose, 
  profile,
  myProfile,
  signals = [],
  myMoments = [],
  theirMoments = [],
  compatibility = 85,
  isPremium = false 
}) {
  if (!isOpen) return null;

  // Calculate multi-layer compatibility
  const compatibilityData = myProfile && profile 
    ? calculateCompatibility(myProfile, profile, myMoments, theirMoments)
    : { total: compatibility, breakdown: { mbti: compatibility, places: 0, zones: 0, rhythm: 0 } };
  
  const compatibilityLabel = getCompatibilityLabel(compatibilityData);
  
  // Calculate PlacesDNA profiles
  const theirPlacesDNA = calculateUserPlacesDNA(theirMoments);
  const myPlacesDNA = calculateUserPlacesDNA(myMoments);

  const socialSignal = signals.find(s => s.dimension === 'social');
  const environmentSignal = signals.find(s => s.dimension === 'environment');
  const rhythmSignal = signals.find(s => s.dimension === 'rhythm');
  const communicationSignal = signals.find(s => s.dimension === 'communication');
  const tempoSignal = signals.find(s => s.dimension === 'tempo');

  const matchingSignals = [
    socialSignal && {
      icon: socialSignal.icon,
      label: socialSignal.label,
      reason: `Both thrive in ${socialSignal.label.toLowerCase()} settings`,
      color: socialSignal.color
    },
    environmentSignal && {
      icon: environmentSignal.icon,
      label: environmentSignal.label,
      reason: `Shared love for ${environmentSignal.label.toLowerCase()} spaces`,
      color: environmentSignal.color
    },
    rhythmSignal && {
      icon: rhythmSignal.icon,
      label: rhythmSignal.label,
      reason: `Compatible ${rhythmSignal.label.toLowerCase()} patterns`,
      color: rhythmSignal.color
    },
    communicationSignal && {
      icon: communicationSignal.icon,
      label: communicationSignal.label,
      reason: `Aligned communication style: ${communicationSignal.label.toLowerCase()}`,
      color: communicationSignal.color
    }
  ].filter(Boolean);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-50"
      />
      
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-[#0B0B0B] rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0B0B0B] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💞</span>
            <h2 className="text-xl font-bold text-white">Compatibility Breakdown</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Compatibility Score */}
          {isPremium ? (
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#E70F72] to-[#FF6B9D] relative mb-4"
              >
                <div className="absolute inset-2 bg-[#0B0B0B] rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{compatibilityData.total}%</span>
                </div>
              </motion.div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">{compatibilityLabel.label.split(' ')[0]}</span>
                <p className="text-white font-semibold text-lg">{compatibilityLabel.label.substring(2)}</p>
              </div>
              <p className="text-white/60 text-sm">{compatibilityLabel.description}</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#E70F72]/20 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl p-6 text-center">
              <Lock className="w-8 h-8 text-[#E70F72] mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Unlock Detailed Score</p>
              <p className="text-white/60 text-sm mb-4">See exact compatibility percentage with Crossd+</p>
              <CrossdButton
                onClick={() => window.location.href = createPageUrl('CrossdPlus')}
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Crossd+
              </CrossdButton>
            </div>
          )}

          {/* Multi-Layer Breakdown */}
          {isPremium && (
            <div className="mb-6 space-y-3">
              <p className="text-white/45 text-xs uppercase tracking-wider mb-3">Compatibility Layers</p>
              
              {/* MBTI Layer */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">🧬 Personality (MBTI)</span>
                  <span className="text-[#E70F72] font-bold">{compatibilityData.breakdown.mbti}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${compatibilityData.breakdown.mbti}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-[#E70F72] to-[#FF6B9D]"
                  />
                </div>
              </div>

              {/* PlacesDNA Layer - Crossd's Core Magic */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-4 border-2 border-purple-500/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/90 text-sm font-semibold">🌍 PlacesDNA Match</span>
                    <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-500/20 rounded-full">
                      Core
                    </span>
                  </div>
                  <span className="text-purple-400 font-bold text-lg">{compatibilityData.breakdown.places}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${compatibilityData.breakdown.places}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 shadow-lg shadow-purple-500/50"
                  />
                </div>
                <p className="text-white/70 text-xs">
                  {compatibilityData.breakdown.places >= 80 
                    ? 'You inhabit the same emotional landscapes'
                    : compatibilityData.breakdown.places >= 60
                    ? 'Strong place energy alignment'
                    : 'Complementary place patterns'}
                </p>
              </div>

              {/* Zone Overlap Layer */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">📍 Shared Zones</span>
                  <span className="text-[#E70F72] font-bold">{compatibilityData.breakdown.zones}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${compatibilityData.breakdown.zones}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-[#FFB800] to-[#F6C90E]"
                  />
                </div>
              </div>

              {/* Rhythm Alignment Layer */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">⏰ Time Rhythm</span>
                  <span className="text-[#E70F72] font-bold">{compatibilityData.breakdown.rhythm}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${compatibilityData.breakdown.rhythm}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#4169E1] to-[#2DD881]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Matching Signals */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#E70F72]" />
              Matching Signals
            </h3>
            <div className="space-y-3">
              {matchingSignals.map((signal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{signal.icon}</span>
                    <div className="flex-1">
                      <p 
                        className="font-semibold text-sm mb-1"
                        style={{ color: signal.color }}
                      >
                        {signal.label}
                      </p>
                      <p className="text-white/70 text-sm">{signal.reason}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* MBTI Pairing */}
          {isPremium && profile.mbti_type && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E70F72]" />
                MBTI Pairing Analysis
              </h3>
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0B0B0B] border border-[#E70F72]/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-4 py-2 bg-[#E70F72] rounded-lg">
                    <span className="text-black font-bold text-sm">{profile.mbti_type}</span>
                  </div>
                  <span className="text-white/40">×</span>
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-white/60 font-bold text-sm">Your Type</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {(() => {
                    const descriptions = {
                      'ENFJ': 'Natural chemistry with empathetic partners who value deep connection.',
                      'ENFP': 'Thrives with adventurous souls who match their spontaneous energy.',
                      'INFJ': 'Strong bond with thoughtful partners who appreciate depth.',
                      'INFP': 'Beautiful connection with creative spirits who value authenticity.',
                      'ENTJ': 'Complements ambitious partners who appreciate directness.',
                      'ENTP': 'Exciting match with curious minds who love intellectual sparring.',
                      'INTJ': 'Deep compatibility with independent thinkers who value growth.',
                      'INTP': 'Strong bond with logical partners who respect space and ideas.'
                    };
                    return descriptions[profile.mbti_type] || 'Unique compatibility based on complementary traits.';
                  })()}
                </p>
              </div>
            </div>
          )}

          {/* Tempo Harmony */}
          {tempoSignal && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E70F72]" />
                Relationship Tempo
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/70 text-sm leading-relaxed">
                  <span className="font-semibold" style={{ color: tempoSignal.color }}>
                    {tempoSignal.label}
                  </span>
                  {' — '}
                  {tempoSignal.reason.toLowerCase()}
                </p>
              </div>
            </div>
          )}

          {/* Suggested First Date */}
          {isPremium && environmentSignal && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E70F72]" />
                Suggested First Date
              </h3>
              <div className="bg-gradient-to-r from-[#E70F72]/10 to-transparent border border-[#E70F72]/20 rounded-xl p-4">
                <p className="text-white text-sm mb-2">
                  {(() => {
                    const suggestions = {
                      'env_romantic_atmosphere': 'Cozy wine bar with ambient lighting',
                      'env_cozy_core': 'Quiet cafe with good conversation',
                      'env_creative_spaces': 'Art gallery opening or creative workshop',
                      'env_city_buzz': 'Vibrant rooftop bar in the city',
                      'env_nature_drawn': 'Scenic walk followed by outdoor cafe',
                      'env_live_electric': 'Live music venue or concert',
                      'env_deep_intellectual': 'Bookshop cafe or cultural talk',
                      'env_active_energy': 'Active date like climbing or cycling'
                    };
                    return suggestions[environmentSignal.id] || 'A place that feels right for both of you';
                  })()}
                </p>
                <p className="text-white/50 text-xs">Based on your shared environment preferences</p>
              </div>
            </div>
          )}

          {!isPremium && (
            <div className="bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a] border border-[#E70F72]/30 rounded-2xl p-6 text-center">
              <Sparkles className="w-12 h-12 text-[#E70F72] mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Unlock More Insights</h3>
              <p className="text-white/60 text-sm mb-4">
                Get MBTI pairing analysis, first date suggestions, and detailed compatibility scores with Crossd+
              </p>
              <CrossdButton
                onClick={() => window.location.href = createPageUrl('CrossdPlus')}
                className="w-full"
              >
                Upgrade to Crossd+
              </CrossdButton>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}