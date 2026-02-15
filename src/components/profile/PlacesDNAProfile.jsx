import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Coffee, Heart, Sparkles, Mountain, Palette, Music, Users } from 'lucide-react';
import { calculateUserPlacesDNA, getArchetypeInfo } from '@/components/spark/placesDnaEngine';

export default function PlacesDNAProfile({ profile, moments = [] }) {
  if (!moments || moments.length === 0) return null;
  
  const dnaProfile = calculateUserPlacesDNA(moments);
  if (!dnaProfile) return null;

  // Get top 3 dominant archetypes
  const topArchetypes = dnaProfile.dominantArchetypes.slice(0, 3);
  
  // Generate insight based on MBTI + PlacesDNA
  const getPersonalityPlaceInsight = () => {
    const mbtiType = profile.mbti_type;
    const primaryArchetype = topArchetypes[0]?.archetype || topArchetypes[0];
    
    const insights = {
      'INFP': {
        'Romantic': 'Your dreamer soul gravitates toward intimate, emotionally-rich spaces.',
        'Calm & Cozy': 'You find energy in peaceful sanctuaries and reflective environments.',
        'Creative': 'Your imagination thrives in artistic, expressive spaces.',
        'default': 'You seek meaningful connections in thoughtful, authentic places.'
      },
      'ENFJ': {
        'Social & Buzzing': 'Your natural leadership shines in vibrant, people-centered spaces.',
        'Romantic': 'You create deep connections in warm, emotionally engaging places.',
        'default': 'You energize spaces with your presence and empathy.'
      },
      'INTJ': {
        'Deep & Intellectual': 'Your strategic mind seeks thought-provoking, stimulating environments.',
        'Calm & Cozy': 'You recharge in quiet spaces that fuel your vision.',
        'default': 'You gravitate toward intentional, purpose-driven places.'
      },
      'ENFP': {
        'Creative': 'Your enthusiastic spirit thrives in spontaneous, expressive spaces.',
        'Social & Buzzing': 'You light up vibrant, energetic environments.',
        'default': 'You bring joy and possibility to every space you enter.'
      }
    };
    
    const mbtiInsights = insights[mbtiType] || {};
    return mbtiInsights[primaryArchetype] || mbtiInsights.default || 'Your unique energy shapes the places you visit.';
  };

  const getArchetypeIcon = (archetype) => {
    const icons = {
      'Romantic': Heart,
      'Calm & Cozy': Coffee,
      'Creative': Palette,
      'Social & Buzzing': Users,
      'Live & Electric': Sparkles,
      'Nature & Grounded': Mountain,
      'Deep & Intellectual': Music,
      'Active & Energetic': Sparkles,
      'Intimate Local': Coffee,
      'Adventurous': Mountain
    };
    return icons[archetype] || MapPin;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3 ml-1">
        <MapPin className="w-4 h-4 text-[#E70F72]" />
        <h3 className="text-white/45 text-xs uppercase tracking-wider">PlacesDNA</h3>
      </div>
      
      {/* Insight Card */}
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#0B0B0B] to-[#1a1a1a] border border-[#E70F72]/30 rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl"
          >
            ✨
          </motion.div>
          <div className="flex-1">
            <p className="text-white/90 text-sm leading-relaxed italic">
              {getPersonalityPlaceInsight()}
            </p>
          </div>
        </div>
      </div>

      {/* Dominant Archetypes */}
      <div className="grid grid-cols-3 gap-2">
        {topArchetypes.map((item, index) => {
          const archetypeName = item.archetype || item;
          const info = getArchetypeInfo(archetypeName);
          const Icon = getArchetypeIcon(archetypeName);
          const percentage = Math.round((item.score || dnaProfile.archetypes[archetypeName] || 0) * 100);
          
          return (
            <motion.div
              key={archetypeName}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="relative overflow-hidden rounded-xl border border-white/10 p-3"
              style={{
                background: `linear-gradient(135deg, ${info.color}15, ${info.color}05)`,
                borderColor: `${info.color}30`
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 opacity-20 blur-xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${info.color}, transparent 70%)`
                }}
              />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: info.color }} />
                  <span className="text-lg">{info.emoji}</span>
                </div>
                <h4 className="text-white text-xs font-semibold mb-1">{info.label}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold" style={{ color: info.color }}>
                    {percentage}%
                  </span>
                  <span className="text-white/40 text-xs">energy</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* MBTI + PlacesDNA Connection */}
      {profile.mbti_type && topArchetypes[0] && (
        <div className="mt-4 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/60 text-xs">
            <span className="text-[#E70F72] font-semibold">{profile.mbti_type}</span>
            {' × '}
            <span className="font-semibold" style={{ color: getArchetypeInfo(topArchetypes[0].archetype || topArchetypes[0]).color }}>
              {topArchetypes[0].archetype || topArchetypes[0]}
            </span>
            {' '} vibes = Your unique energy signature
          </p>
        </div>
      )}
    </motion.div>
  );
}