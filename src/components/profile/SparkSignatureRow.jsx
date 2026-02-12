import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Users, Sparkles, Moon, Sun, Sunrise, Coffee, 
  Trees, Building2, Music, Heart, Zap, Waves, Box,
  MessageCircle, Target, Palette, Brain, Mountain
} from 'lucide-react';

// Generate spark signals based on profile data
const generateSparkSignals = (profile, moments = []) => {
  const signals = [];
  
  // 1. Social Energy (from MBTI E/I)
  if (profile.mbti_type) {
    const isExtrovert = profile.mbti_type.startsWith('E');
    signals.push({
      dimension: 'social',
      icon: isExtrovert ? Flame : Waves,
      label: isExtrovert ? 'Social Spark' : 'Calm Presence',
      description: isExtrovert 
        ? 'You thrive in social environments and energize people around you.'
        : 'You bring a calming, reflective energy to connections.',
      color: '#FF6B9D'
    });
  }
  
  // 2. Creative vs Practical (from MBTI N/S + vibe tags)
  if (profile.mbti_type) {
    const isIntuitive = profile.mbti_type[1] === 'N';
    const hasCreativeVibes = profile.vibe_tags?.some(v => 
      ['Creative', 'Artistic', 'Deep talk', 'Intellectual'].includes(v)
    );
    
    if (isIntuitive || hasCreativeVibes) {
      signals.push({
        dimension: 'creative',
        icon: Palette,
        label: 'Creative Lean',
        description: 'You see patterns, ideas, and possibilities everywhere.',
        color: '#9B5DE5'
      });
    } else {
      signals.push({
        dimension: 'practical',
        icon: Mountain,
        label: 'Grounded Thinker',
        description: 'You appreciate tangible experiences and practical connections.',
        color: '#6A8F7A'
      });
    }
  }
  
  // 3. Communication Style (from MBTI T/F + vibe tags)
  if (profile.mbti_type) {
    const isFeeling = profile.mbti_type[2] === 'F';
    const hasDeepVibes = profile.vibe_tags?.some(v => 
      ['Deep talk', 'Romantic', 'Calm'].includes(v)
    );
    const hasPlayfulVibes = profile.vibe_tags?.some(v => 
      ['Flirty', 'Spontaneous', 'Social'].includes(v)
    );
    
    if (hasDeepVibes) {
      signals.push({
        dimension: 'communication',
        icon: MessageCircle,
        label: 'Deep Talker',
        description: 'You connect through meaningful conversations and emotional depth.',
        color: '#4169E1'
      });
    } else if (hasPlayfulVibes) {
      signals.push({
        dimension: 'communication',
        icon: Sparkles,
        label: 'Playful Banter',
        description: 'You keep things light, fun, and spontaneous.',
        color: '#FFB800'
      });
    } else if (!isFeeling) {
      signals.push({
        dimension: 'communication',
        icon: Target,
        label: 'Direct Energy',
        description: 'You value clear, honest, and authentic communication.',
        color: '#FF6B35'
      });
    }
  }
  
  // 4. Energy Rhythm (from moments peak time)
  if (moments && moments.length > 0) {
    const hours = moments.map(m => new Date(m.created_date).getHours());
    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
    
    if (avgHour >= 20 || avgHour < 4) {
      signals.push({
        dimension: 'rhythm',
        icon: Moon,
        label: 'Night Energy',
        description: 'Your best moments happen when the city lights up.',
        color: '#8A63F6'
      });
    } else if (avgHour >= 4 && avgHour < 11) {
      signals.push({
        dimension: 'rhythm',
        icon: Sunrise,
        label: 'Morning Soul',
        description: 'You find magic in early starts and fresh beginnings.',
        color: '#F6C90E'
      });
    } else if (avgHour >= 16 && avgHour < 20) {
      signals.push({
        dimension: 'rhythm',
        icon: Sun,
        label: 'Golden Hour',
        description: 'You thrive in those perfect late afternoon moments.',
        color: '#FFB800'
      });
    }
  }
  
  // 5. Environmental Comfort (from vibe tags + place types)
  const cozyVibes = profile.vibe_tags?.some(v => ['Cozy', 'Calm', 'Low-key'].includes(v));
  const cityVibes = profile.vibe_tags?.some(v => ['Social', 'Vibrant', 'Energetic'].includes(v));
  const natureVibes = profile.vibe_tags?.some(v => ['Natural', 'Peaceful'].includes(v));
  
  if (cozyVibes) {
    signals.push({
      dimension: 'environment',
      icon: Coffee,
      label: 'Cozy Core',
      description: 'You find comfort in intimate spaces and warm atmospheres.',
      color: '#C49A6C'
    });
  } else if (cityVibes) {
    signals.push({
      dimension: 'environment',
      icon: Building2,
      label: 'City Pulse',
      description: 'You thrive in the energy and movement of urban life.',
      color: '#FF4081'
    });
  } else if (natureVibes) {
    signals.push({
      dimension: 'environment',
      icon: Trees,
      label: 'Nature Drawn',
      description: 'You recharge in natural spaces and open environments.',
      color: '#2DD881'
    });
  }
  
  // 6. Relationship Tempo (from intent + MBTI J/P)
  if (profile.dating_intentions) {
    const isJudging = profile.mbti_type?.[3] === 'J';
    const isSpontaneous = profile.vibe_tags?.includes('Spontaneous');
    
    if (profile.dating_intentions === 'Long-term relationship') {
      signals.push({
        dimension: 'tempo',
        icon: Heart,
        label: 'Intentional',
        description: 'You value depth, consistency, and meaningful connection.',
        color: '#E74C78'
      });
    } else if (isSpontaneous || !isJudging) {
      signals.push({
        dimension: 'tempo',
        icon: Zap,
        label: 'Spontaneous',
        description: 'You let connections flow naturally and embrace the unexpected.',
        color: '#FF6B35'
      });
    }
  }
  
  // Return max 4 signals for clean display
  return signals.slice(0, 4);
};

export default function SparkSignatureRow({ profile, moments = [] }) {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const signals = generateSparkSignals(profile, moments);
  
  if (signals.length === 0) return null;
  
  return (
    <div className="relative mb-6">
      {/* Signals Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {signals.map((signal, idx) => {
          const Icon = signal.icon;
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedSignal(signal)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all"
              style={{
                borderColor: `${signal.color}40`,
                background: `linear-gradient(135deg, ${signal.color}10, ${signal.color}05)`,
                boxShadow: `0 0 20px ${signal.color}20`
              }}
            >
              <Icon 
                className="w-4 h-4" 
                style={{ color: signal.color }}
              />
              <span 
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: signal.color }}
              >
                {signal.label}
              </span>
            </motion.button>
          );
        })}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
            >
              <div 
                className="bg-[#0B0B0B] border-2 rounded-2xl p-6 shadow-2xl"
                style={{
                  borderColor: `${selectedSignal.color}60`,
                  boxShadow: `0 0 40px ${selectedSignal.color}30`
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {React.createElement(selectedSignal.icon, {
                    className: "w-8 h-8",
                    style: { color: selectedSignal.color }
                  })}
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: selectedSignal.color }}
                  >
                    {selectedSignal.label}
                  </h3>
                </div>
                <p className="text-white/80 text-base leading-relaxed">
                  {selectedSignal.description}
                </p>
                <button
                  onClick={() => setSelectedSignal(null)}
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