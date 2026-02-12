import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SparkSignatureRow = ({ profile }) => {
  const [selectedSignal, setSelectedSignal] = useState(null);

  // Derive Spark Signals from profile data
  const getSparkSignals = () => {
    const signals = [];

    // 1. Social Energy (from MBTI E/I)
    if (profile.mbti_type) {
      const firstLetter = profile.mbti_type[0];
      if (firstLetter === 'E') {
        signals.push({
          icon: '🔥',
          label: 'Social Spark',
          color: '#FF6B3D',
          description: 'You thrive in social environments and energize people around you.',
          dimension: 'social'
        });
      } else {
        signals.push({
          icon: '🌊',
          label: 'Calm Presence',
          color: '#6A8F7A',
          description: 'You bring a grounded, reflective energy to connections.',
          dimension: 'social'
        });
      }
    }

    // 2. Creative vs Practical (from MBTI N/S and vibe tags)
    if (profile.mbti_type) {
      const secondLetter = profile.mbti_type[1];
      const hasCreativeVibes = profile.vibe_tags?.some(tag => 
        ['Creative', 'Artistic', 'Deep talk'].includes(tag)
      );
      
      if (secondLetter === 'N' || hasCreativeVibes) {
        signals.push({
          icon: '🎨',
          label: 'Creative Lean',
          color: '#9B5DE5',
          description: 'You see patterns, possibilities, and deeper meanings.',
          dimension: 'creative'
        });
      } else {
        signals.push({
          icon: '🌿',
          label: 'Grounded Thinker',
          color: '#2DD881',
          description: 'You value practical, real-world experiences.',
          dimension: 'creative'
        });
      }
    }

    // 3. Communication Style (from MBTI T/F and vibe tags)
    if (profile.mbti_type) {
      const thirdLetter = profile.mbti_type[2];
      const hasDeepVibes = profile.vibe_tags?.some(tag => 
        ['Deep talk', 'Intellectual', 'Calm'].includes(tag)
      );
      const hasPlayfulVibes = profile.vibe_tags?.some(tag => 
        ['Flirty', 'Spontaneous', 'Vibrant'].includes(tag)
      );

      if (hasDeepVibes) {
        signals.push({
          icon: '💬',
          label: 'Deep Talker',
          color: '#4169E1',
          description: 'You connect through meaningful conversations.',
          dimension: 'communication'
        });
      } else if (hasPlayfulVibes) {
        signals.push({
          icon: '😏',
          label: 'Playful Banter',
          color: '#FF6B9D',
          description: 'You bring lightness and fun to interactions.',
          dimension: 'communication'
        });
      } else if (thirdLetter === 'T') {
        signals.push({
          icon: '🎯',
          label: 'Direct Energy',
          color: '#FFB800',
          description: 'You value clarity and authenticity.',
          dimension: 'communication'
        });
      } else {
        signals.push({
          icon: '🌙',
          label: 'Slow Burn',
          color: '#8A63F6',
          description: 'You build connections with warmth and patience.',
          dimension: 'communication'
        });
      }
    }

    // 4. Energy Rhythm (placeholder - would use peak moment time)
    // For now, derive from vibe tags
    const hasNightVibes = profile.vibe_tags?.some(tag => 
      ['Spontaneous', 'Social', 'Vibrant', 'Energetic'].includes(tag)
    );
    const hasCalmVibes = profile.vibe_tags?.some(tag => 
      ['Calm', 'Cozy', 'Peaceful', 'Low-key'].includes(tag)
    );

    if (hasNightVibes) {
      signals.push({
        icon: '🌃',
        label: 'Night Energy',
        color: '#B026FF',
        description: 'Your energy peaks when the city lights up.',
        dimension: 'rhythm'
      });
    } else if (hasCalmVibes) {
      signals.push({
        icon: '🌅',
        label: 'Golden Hour Soul',
        color: '#FF9F40',
        description: 'You thrive in quieter, reflective moments.',
        dimension: 'rhythm'
      });
    } else {
      signals.push({
        icon: '☀️',
        label: 'Daytime Optimist',
        color: '#F6C90E',
        description: 'You bring bright, steady energy to your days.',
        dimension: 'rhythm'
      });
    }

    // 5. Environmental Comfort (from dominant vibe tag)
    if (profile.vibe_tags && profile.vibe_tags.length > 0) {
      const dominantVibe = profile.vibe_tags[0];
      
      if (['Cozy', 'Calm', 'Low-key'].includes(dominantVibe)) {
        signals.push({
          icon: '☕',
          label: 'Cozy Core',
          color: '#C49A6C',
          description: 'You feel most at home in warm, intimate spaces.',
          dimension: 'environment'
        });
      } else if (['Social', 'Energetic', 'Vibrant', 'Outgoing'].includes(dominantVibe)) {
        signals.push({
          icon: '🌆',
          label: 'City Pulse',
          color: '#FF6B3D',
          description: 'You thrive in buzzing, high-energy environments.',
          dimension: 'environment'
        });
      } else if (['Creative', 'Artistic'].includes(dominantVibe)) {
        signals.push({
          icon: '🎵',
          label: 'Live & Electric',
          color: '#F6C90E',
          description: 'You're drawn to sensory, expressive spaces.',
          dimension: 'environment'
        });
      } else if (['Peaceful', 'Natural'].includes(dominantVibe)) {
        signals.push({
          icon: '🌿',
          label: 'Nature Drawn',
          color: '#2DD881',
          description: 'You recharge in natural, grounded settings.',
          dimension: 'environment'
        });
      }
    }

    // 6. Relationship Tempo (from dating intentions and MBTI J/P)
    if (profile.dating_intentions) {
      if (profile.dating_intentions === 'Long-term relationship') {
        signals.push({
          icon: '❤️',
          label: 'Intentional',
          color: '#E74C78',
          description: 'You build connections with purpose and care.',
          dimension: 'tempo'
        });
      } else if (profile.dating_intentions === 'Short-term fun') {
        signals.push({
          icon: '⚡',
          label: 'Spontaneous',
          color: '#F6C90E',
          description: 'You embrace the moment and go with the flow.',
          dimension: 'tempo'
        });
      } else {
        signals.push({
          icon: '🌊',
          label: 'Flow State',
          color: '#4169E1',
          description: 'You let connections unfold naturally.',
          dimension: 'tempo'
        });
      }
    }

    // Return only 4 signals max
    return signals.slice(0, 4);
  };

  const sparkSignals = getSparkSignals();

  if (sparkSignals.length === 0) return null;

  return (
    <div className="relative">
      {/* Horizontal scrollable container */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sparkSignals.map((signal, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSignal(signal);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap flex-shrink-0"
            style={{
              backgroundColor: `${signal.color}15`,
              borderColor: `${signal.color}40`,
              boxShadow: `0 0 20px ${signal.color}20`
            }}
          >
            <span className="text-base">{signal.icon}</span>
            <span 
              className="text-sm font-medium"
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
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSignal(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997]"
            />
            
            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] w-[90%] max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="rounded-2xl p-5 border-2"
                style={{
                  backgroundColor: '#0B0B0B',
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
                <p className="text-white/80 text-sm leading-relaxed">
                  {selectedSignal.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSignal(null);
                  }}
                  className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
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
};

export default SparkSignatureRow;