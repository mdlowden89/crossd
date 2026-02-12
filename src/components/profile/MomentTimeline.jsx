import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

const MOMENT_TITLE_MAP = {
  // Creative
  'art_gallery': 'Gallery Night',
  'museum': 'Cultural Drift',
  'movie_theater': 'Cinema Mood',
  'book_store': 'Bookstore Drift',
  'library': 'Quiet Discovery',
  
  // Romantic
  'restaurant': 'Candlelit Dinner',
  'bar': 'Wine Bar',
  'wine_bar': 'Wine Bar',
  'cafe': 'Cozy Café',
  
  // Nature & Grounded
  'park': 'Park Walk',
  'hiking_area': 'Morning Trail',
  'beach': 'Waterfront Reset',
  'botanical_garden': 'Green Escape',
  
  // Social & Buzzing
  'shopping_mall': 'City Buzz',
  'night_club': 'Crowd Energy',
  'tourist_attraction': 'Busy Café',
  
  // Nightlife
  'night_club': 'Neon Night',
  'bar': 'Late Bar',
};

const ARCHETYPE_COLORS = {
  'Creative': '#9B5DE5',
  'Romantic': '#E74C78',
  'NatureGrounded': '#2DD881',
  'SocialBuzzing': '#FFB800',
  'Nightlife': '#4169E1',
  'IntimateLocal': '#C49A6C',
};

function generateMomentTitle(moment) {
  const types = moment.venue_types || [];
  for (const type of types) {
    if (MOMENT_TITLE_MAP[type]) {
      return MOMENT_TITLE_MAP[type];
    }
  }
  return moment.venue_name || 'Recent Moment';
}

function categorizeArchetype(moment) {
  const types = moment.venue_types || [];
  
  if (types.some(t => ['art_gallery', 'museum', 'movie_theater', 'book_store', 'library'].includes(t))) {
    return 'Creative';
  }
  if (types.some(t => ['restaurant', 'wine_bar', 'cafe'].includes(t))) {
    return 'Romantic';
  }
  if (types.some(t => ['park', 'hiking_area', 'beach', 'botanical_garden'].includes(t))) {
    return 'NatureGrounded';
  }
  if (types.some(t => ['night_club', 'bar'].includes(t))) {
    return 'Nightlife';
  }
  if (types.some(t => ['shopping_mall', 'tourist_attraction'].includes(t))) {
    return 'SocialBuzzing';
  }
  
  return 'IntimateLocal';
}

function getTimeWindowLabel(moment) {
  const now = new Date();
  const momentDate = new Date(moment.created_date);
  const diffDays = Math.floor((now - momentDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 3) return 'recently';
  if (diffDays <= 7) return 'this week';
  if (diffDays <= 14) return 'last week';
  return 'recently';
}

function getVibeDescription(archetype) {
  const descriptions = {
    'Creative': 'Drawn to culture + meaning.',
    'Romantic': 'Warm lights, low volume, real conversation.',
    'NatureGrounded': 'Quiet reset energy.',
    'SocialBuzzing': 'High-energy environments.',
    'Nightlife': 'Late-night electric vibes.',
    'IntimateLocal': 'Close-knit, familiar spaces.',
  };
  return descriptions[archetype] || 'Living in the moment.';
}

export default function MomentTimeline({ moments = [], sparkSignals = [] }) {
  if (!moments || moments.length === 0) return null;

  // Take top 3-5 most recent, diverse moments
  const diverseMoments = moments
    .slice(0, 10)
    .reduce((acc, moment) => {
      const archetype = categorizeArchetype(moment);
      if (!acc.find(m => categorizeArchetype(m) === archetype) || acc.length < 3) {
        acc.push(moment);
      }
      return acc;
    }, [])
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white text-lg font-bold mb-1">🌌 Moment Timeline</h3>
        <p className="text-white/50 text-sm">A glimpse of their recent vibe.</p>
      </div>

      {/* Timeline Rail */}
      <div className="relative pl-6">
        {/* Vertical Rail */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        {/* Moment Cards */}
        <div className="space-y-5">
          {diverseMoments.map((moment, index) => {
            const archetype = categorizeArchetype(moment);
            const color = ARCHETYPE_COLORS[archetype] || '#E70F72';
            const title = generateMomentTitle(moment);
            const timeWindow = getTimeWindowLabel(moment);
            const description = getVibeDescription(archetype);
            
            // Match spark signals to this moment type
            const relevantSignals = sparkSignals.filter(signal => {
              if (archetype === 'Creative' && signal.dimension === 'creative') return true;
              if (archetype === 'Romantic' && signal.label.includes('Romantic')) return true;
              if (archetype === 'NatureGrounded' && signal.label.includes('Nature')) return true;
              if (archetype === 'SocialBuzzing' && signal.dimension === 'social') return true;
              if (archetype === 'Nightlife' && signal.label.includes('Night')) return true;
              return false;
            }).slice(0, 2);

            return (
              <motion.div
                key={moment.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative"
              >
                {/* Glowing Node */}
                <div 
                  className="absolute -left-6 top-3 w-4 h-4 rounded-full border-2 border-black"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`
                  }}
                />

                {/* Card */}
                <div 
                  className="bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a] border rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: `${color}40`,
                    boxShadow: `0 0 30px ${color}20`
                  }}
                >
                  {/* Title & Archetype */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">
                        {title}
                      </h4>
                      <span 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color }}
                      >
                        {archetype.replace('NatureGrounded', 'Nature & Grounded').replace('SocialBuzzing', 'Social & Buzzing')}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/60 text-sm mb-3 italic">"{description}"</p>

                  {/* Time Window & Signals */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                      <Calendar className="w-3 h-3 text-white/50" />
                      <span className="text-white/60 text-xs">{timeWindow}</span>
                    </div>
                    
                    {relevantSignals.map((signal, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                        style={{
                          borderColor: `${signal.color}40`,
                          background: `${signal.color}10`
                        }}
                      >
                        <span className="text-xs">{signal.icon}</span>
                        <span 
                          className="text-xs font-medium"
                          style={{ color: signal.color }}
                        >
                          {signal.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PlacesDNA Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 px-4 py-3 bg-gradient-to-r from-[#E70F72]/10 to-transparent border border-[#E70F72]/20 rounded-xl"
      >
        <p className="text-white/60 text-sm">
          <span className="text-[#E70F72] font-semibold">PlacesDNA in motion</span>
          {' · '}
          {(() => {
            const archetypes = diverseMoments.map(m => categorizeArchetype(m));
            const uniqueArchetypes = [...new Set(archetypes)];
            return `${uniqueArchetypes.length} vibe types in recent moments`;
          })()}
        </p>
      </motion.div>
    </motion.div>
  );
}