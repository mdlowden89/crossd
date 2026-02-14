import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

// Archetype icons and colors
const archetypeConfig = {
  'Creative': { icon: '🎨', color: '#9B5DE5', name: 'Creative' },
  'Romantic': { icon: '💞', color: '#E74C78', name: 'Romantic' },
  'Nature & Grounded': { icon: '🌿', color: '#6A8F7A', name: 'Grounded' },
  'Spontaneous & Nightlife': { icon: '💃', color: '#B026FF', name: 'Nightlife' },
  'Calm & Cozy': { icon: '☕', color: '#C49A6C', name: 'Calm' },
  'Live & Electric': { icon: '🎵', color: '#F6C90E', name: 'Live Music' },
  'Deep & Intellectual': { icon: '📚', color: '#4169E1', name: 'Thoughtful' },
  'Active & Energetic': { icon: '⚡', color: '#FF4081', name: 'Active' },
  'Social & Buzzing': { icon: '🌆', color: '#FF6B3D', name: 'City Buzz' }
};

// Generate moment title based on venue
const generateMomentTitle = (venueTypes, timeOfDay) => {
  const types = venueTypes || [];
  
  if (types.includes('art_gallery') || types.includes('museum')) return 'Gallery Night';
  if (types.includes('restaurant') && timeOfDay === 'evening') return 'Candlelit Dinner';
  if (types.includes('restaurant')) return 'City Lunch';
  if (types.includes('bar') && timeOfDay === 'evening') return 'Rooftop Drinks';
  if (types.includes('bar')) return 'After Work Drinks';
  if (types.includes('wine_bar')) return 'Wine Bar';
  if (types.includes('park') && timeOfDay === 'morning') return 'Morning Run';
  if (types.includes('park')) return 'Park Walk';
  if (types.includes('night_club')) return 'Late Club Night';
  if (types.includes('cafe') || types.includes('coffee_shop')) return 'Coffee Reset';
  if (types.includes('concert_hall') || types.includes('music_venue')) return 'Live Jazz Bar';
  if (types.includes('library')) return 'Library Hours';
  if (types.includes('gym')) return 'Gym Session';
  
  return 'Moment Out';
};

// Get time window
const getTimeWindow = (createdDate) => {
  const now = new Date();
  const momentDate = new Date(createdDate);
  const daysDiff = Math.floor((now - momentDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'today';
  if (daysDiff === 1) return 'yesterday';
  if (daysDiff <= 3) return 'recently';
  if (daysDiff <= 7) return 'last weekend';
  if (daysDiff <= 14) return 'last week';
  return 'a while ago';
};

// Get energy signature
const getEnergySignature = (moment) => {
  const hour = new Date(moment.created_date).getHours();
  
  if (hour >= 22 || hour < 6) return '🌃 Night Energy';
  if (hour >= 17 && hour < 22) return '🌇 Golden Hour Soul';
  if (hour >= 6 && hour < 12) return '🌅 Morning Glow';
  return '☀️ Afternoon Vibe';
};

export default function MomentTimeline({ moments = [], profile }) {
  if (!moments || moments.length === 0) return null;
  
  const recentMoments = moments.slice(0, 5);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-6"
    >
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg mb-1">Moment Timeline</h3>
        <p className="text-white/50 text-sm">A glimpse of their recent vibe</p>
      </div>
      
      <div className="relative">
        {/* Glowing Rail */}
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: '100%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#E70F72]/60 via-[#E70F72]/40 to-transparent"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(231, 15, 114, 0.4))'
          }}
        />
        
        <div className="space-y-4">
          {recentMoments.map((moment, idx) => {
            // Determine archetype
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
            
            const config = archetypeConfig[archetype];
            const hour = new Date(moment.created_date).getHours();
            const timeOfDay = hour >= 17 ? 'evening' : hour >= 12 ? 'afternoon' : 'morning';
            const title = generateMomentTitle(moment.venue_types, timeOfDay);
            const timeWindow = getTimeWindow(moment.created_date);
            const energy = getEnergySignature(moment);
            
            return (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                className="relative pl-10"
              >
                {/* Glowing Node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.4 + idx * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="absolute left-0 top-5 w-[20px] h-[20px] rounded-full border-[3px] border-black"
                  style={{ 
                    backgroundColor: config.color,
                    boxShadow: `0 0 16px ${config.color}90, 0 0 8px ${config.color}60`
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      backgroundColor: config.color,
                      filter: 'blur(4px)'
                    }}
                  />
                </motion.div>
                
                {/* Moment Card */}
                <div className="bg-gradient-to-r from-white/[0.03] to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-3">
                    {/* Archetype Icon */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: `${config.color}20`,
                        border: `1.5px solid ${config.color}40`
                      }}
                    >
                      <span className="text-lg">{config.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Moment Title */}
                      <h4 className="text-white font-semibold text-[15px] mb-2 leading-tight">
                        {title}
                      </h4>
                      
                      {/* Archetype Tag */}
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${config.color}15`,
                            color: config.color,
                            border: `1px solid ${config.color}30`,
                            boxShadow: `0 0 12px ${config.color}15`
                          }}
                        >
                          {config.icon} {config.name}
                        </span>
                      </div>
                      
                      {/* Time Window + Energy */}
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeWindow}
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="italic">{energy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <p className="text-white/40 text-xs mt-4 italic ml-10">
        This is how they move through life
      </p>
    </motion.div>
  );
}