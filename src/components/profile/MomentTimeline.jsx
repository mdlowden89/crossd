import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';

// Generate moment title based on archetype and venue type
const generateMomentTitle = (venueTypes, archetype, timeOfDay) => {
  const titles = {
    creative: {
      art_gallery: 'Gallery Night',
      museum: 'Museum Wander',
      cafe: 'Creative Café',
      bookstore: 'Bookstore Drift',
      default: 'Creative Space'
    },
    romantic: {
      restaurant: 'Candlelit Dinner',
      bar: 'Wine Bar',
      wine_bar: 'Wine Bar',
      park: 'Late Walk Energy',
      default: 'Romantic Moment'
    },
    nature_grounded: {
      park: timeOfDay === 'morning' ? 'Morning Trail' : 'Park Walk',
      beach: 'Waterfront Reset',
      campground: 'Nature Escape',
      default: 'Green Escape'
    },
    social_buzzing: {
      restaurant: 'City Buzz',
      bar: 'After Work Spark',
      cafe: 'Busy Café',
      default: 'Social Energy'
    },
    spontaneous_nightlife: {
      night_club: 'Dancefloor Energy',
      bar: 'Late Bar',
      default: 'Neon Night'
    },
    calm_cozy: {
      cafe: 'Coffee Reset',
      library: 'Quiet Corner',
      bookstore: 'Reading Nook',
      default: 'Cozy Moment'
    },
    live_electric: {
      concert_hall: 'Live Show',
      music_venue: 'Concert Night',
      night_club: 'Music Energy',
      default: 'Live Energy'
    },
    deep_intellectual: {
      library: 'Deep Read',
      university: 'Campus Wander',
      museum: 'Thoughtful Browse',
      default: 'Intellectual Space'
    },
    active_energetic: {
      gym: 'Workout Session',
      stadium: 'Game Day',
      park: 'Active Morning',
      default: 'High Energy'
    }
  };

  const archetypeKey = archetype.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '');
  const venueTitles = titles[archetypeKey] || titles.social_buzzing;
  
  for (const type of venueTypes || []) {
    if (venueTitles[type]) return venueTitles[type];
  }
  
  return venueTitles.default;
};

// Get time window label
const getTimeWindow = (createdDate) => {
  const now = new Date();
  const momentDate = new Date(createdDate);
  const daysDiff = Math.floor((now - momentDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'today';
  if (daysDiff === 1) return 'yesterday';
  if (daysDiff <= 3) return 'recently';
  if (daysDiff <= 7) return 'this week';
  if (daysDiff <= 14) return 'last week';
  if (daysDiff <= 30) return 'in the last 14 days';
  return 'recently';
};

// Get energy signatures based on time and archetype
const getEnergySignatures = (moment, archetype) => {
  const hour = new Date(moment.created_date).getHours();
  const signatures = [];
  
  // Time-based
  if (hour >= 22 || hour < 6) signatures.push('🌃 Night Energy');
  else if (hour >= 17 && hour < 22) signatures.push('🌇 Golden Hour Soul');
  else if (hour >= 6 && hour < 12) signatures.push('🌅 Morning Glow');
  
  // Archetype-based
  if (archetype.toLowerCase().includes('deep') || archetype.toLowerCase().includes('intellectual')) {
    signatures.push('💬 Deep Talker');
  }
  if (archetype.toLowerCase().includes('spontaneous') || archetype.toLowerCase().includes('energetic')) {
    signatures.push('⚡ Spontaneous');
  }
  if (archetype.toLowerCase().includes('romantic')) {
    signatures.push('💞 Romantic');
  }
  if (archetype.toLowerCase().includes('creative')) {
    signatures.push('🎨 Creative Soul');
  }
  if (archetype.toLowerCase().includes('calm') || archetype.toLowerCase().includes('cozy')) {
    signatures.push('🍃 Calm Energy');
  }
  
  return signatures.slice(0, 2);
};

// Archetype colors
const archetypeColors = {
  'Romantic': '#E74C78',
  'Calm & Cozy': '#C49A6C',
  'Creative': '#9B5DE5',
  'Social & Buzzing': '#FF6B3D',
  'Nature & Grounded': '#6A8F7A',
  'Live & Electric': '#F6C90E',
  'Deep & Intellectual': '#4169E1',
  'Active & Energetic': '#FF4081',
  'Spontaneous & Nightlife': '#B026FF',
  'Intimate Local': '#8B7355'
};

export default function MomentTimeline({ moments = [], profile }) {
  if (!moments || moments.length === 0) return null;
  
  // Take last 3-5 moments
  const recentMoments = moments.slice(0, 5);
  
  return (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg mb-1">Moment Timeline</h3>
        <p className="text-white/50 text-sm">A glimpse of their recent vibe</p>
      </div>
      
      <div className="relative">
        {/* Timeline rail */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E70F72]/50 via-[#E70F72]/30 to-transparent" />
        
        <div className="space-y-4">
          {recentMoments.map((moment, idx) => {
            // Determine archetype from venue types (simplified)
            const archetype = (() => {
              const types = moment.venue_types || [];
              if (types.includes('art_gallery') || types.includes('museum')) return 'Creative';
              if (types.includes('restaurant') || types.includes('wine_bar')) return 'Romantic';
              if (types.includes('park') || types.includes('beach')) return 'Nature & Grounded';
              if (types.includes('night_club')) return 'Spontaneous & Nightlife';
              if (types.includes('cafe') || types.includes('coffee_shop')) return 'Calm & Cozy';
              if (types.includes('concert_hall') || types.includes('music_venue')) return 'Live & Electric';
              if (types.includes('gym') || types.includes('stadium')) return 'Active & Energetic';
              if (types.includes('library') || types.includes('university')) return 'Deep & Intellectual';
              return 'Social & Buzzing';
            })();
            
            const color = archetypeColors[archetype] || '#E70F72';
            const hour = new Date(moment.created_date).getHours();
            const timeOfDay = hour >= 17 ? 'evening' : hour >= 12 ? 'afternoon' : 'morning';
            const title = generateMomentTitle(moment.venue_types, archetype, timeOfDay);
            const timeWindow = getTimeWindow(moment.created_date);
            const signatures = getEnergySignatures(moment, archetype);
            
            return (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  className="absolute left-2 top-4 w-5 h-5 rounded-full border-2 border-black"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 12px ${color}80`
                  }}
                />
                
                {/* Moment card */}
                <div 
                  className="bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm rounded-xl p-4 border"
                  style={{ 
                    borderColor: `${color}40`,
                    boxShadow: `0 0 20px ${color}15`
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{title}</h4>
                      <span 
                        className="inline-block text-xs px-2 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${color}25`,
                          color: color,
                          border: `1px solid ${color}40`
                        }}
                      >
                        {archetype}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white/60 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeWindow}
                      </p>
                    </div>
                  </div>
                  
                  {/* Energy signatures */}
                  {signatures.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {signatures.map((sig, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/20"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Optional blurred location hint */}
                  {moment.venue_name && (
                    <div className="mt-3 flex items-center gap-1 text-white/40 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>Near {moment.venue_name.split(',')[0] || 'their favorite spot'}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <p className="text-white/40 text-xs mt-4 italic">
        This is how they move through life
      </p>
    </div>
  );
}