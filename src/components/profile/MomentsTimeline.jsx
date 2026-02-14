import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Generates a creative moment title based on archetype, time, and venue type
 */
function generateMomentTitle(moment, archetype) {
  const venueTypes = moment.venue_types || [];
  const timeOfDay = getTimeOfDay(moment.created_date);
  
  // Mapping based on archetype + venue type + time
  const titleMappings = {
    creative: {
      'art_gallery': ['Gallery Night', 'Art Drift', 'Gallery Soul'],
      'museum': ['Museum Mood', 'Cultural Escape', 'Exhibit Energy'],
      'movie_theater': ['Cinema Mood', 'Film Night', 'Screen Time'],
      'book_store': ['Bookstore Drift', 'Literary Escape', 'Book Browse'],
      'library': ['Library Quiet', 'Reading Retreat', 'Study Vibe'],
      default: ['Creative Space', 'Art & Culture', 'Gallery Vibe']
    },
    romantic: {
      'restaurant': ['Candlelit Dinner', 'Dinner Date Energy', 'Restaurant Glow'],
      'bar': ['Wine Bar', 'Cocktail Mood', 'Bar Charm'],
      'cafe': ['Café Romance', 'Coffee Connection', 'Cozy Café'],
      'park': ['Late Walk Energy', 'Park Stroll', 'Evening Walk'],
      'night_club': ['Rooftop Glow', 'Night View', 'City Lights'],
      default: timeOfDay === 'night' ? ['Evening Glow', 'Night Energy', 'After Dark'] : ['Romantic Spot', 'Date Vibe']
    },
    nature_grounded: {
      'park': ['Park Walk', 'Green Reset', 'Nature Escape'],
      'hiking_area': ['Morning Trail', 'Hiking Energy', 'Mountain Air'],
      'beach': ['Waterfront Reset', 'Beach Calm', 'Shore Walk'],
      'lake': ['Lake Moment', 'Water Serenity', 'Calm Waters'],
      default: timeOfDay === 'morning' ? ['Morning Trail', 'Sunrise Walk'] : ['Green Escape', 'Nature Reset']
    },
    social_buzzing: {
      'restaurant': ['Busy Café', 'Brunch Buzz', 'Social Meal'],
      'bar': ['City Buzz', 'After Work Spark', 'Happy Hour'],
      'cafe': ['Coffee Social', 'Café Crowd', 'Busy Spot'],
      'shopping_mall': ['Crowd Energy', 'City Shopping', 'Urban Wander'],
      default: ['Social Scene', 'City Energy', 'People Watching']
    },
    nightlife: {
      'night_club': ['Dancefloor Energy', 'Club Night', 'Neon Lights'],
      'bar': ['Late Bar', 'Midnight Mission', 'Night Out'],
      'restaurant': ['Late Dinner', 'Midnight Meal', 'After Hours'],
      'music_venue': ['Live Show', 'Concert Night', 'Music Energy'],
      default: ['Neon Night', 'Late Night Energy', 'City After Dark']
    },
    cozy_intimate: {
      'cafe': ['Coffee Calm', 'Quiet Café', 'Cozy Corner'],
      'restaurant': ['Intimate Dinner', 'Small Table', 'Quiet Meal'],
      'bar': ['Low-Key Bar', 'Chill Drinks', 'Calm Cocktails'],
      'bookstore': ['Book & Coffee', 'Reading Nook', 'Bookshop Vibe'],
      default: ['Quiet Spot', 'Intimate Space', 'Low-Key Moment']
    }
  };

  const archetypeMap = titleMappings[archetype] || titleMappings.creative;
  
  // Find matching venue type
  for (const venueType of venueTypes) {
    const normalizedType = venueType.toLowerCase().replace(/_/g, '_');
    if (archetypeMap[normalizedType]) {
      const options = archetypeMap[normalizedType];
      return options[Math.floor(Math.random() * options.length)];
    }
  }
  
  // Fallback
  return archetypeMap.default[0];
}

/**
 * Get time of day category
 */
function getTimeOfDay(dateString) {
  const hour = new Date(dateString).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get relative time label
 */
function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 3) return 'recently';
  if (diffDays <= 7) return 'this week';
  if (diffDays <= 14) return 'last week';
  return 'in the last 14 days';
}

/**
 * Determine archetype from moment data
 */
function determineArchetype(moment) {
  const venueTypes = moment.venue_types || [];
  const moodTags = moment.mood_tags || [];
  const timeOfDay = getTimeOfDay(moment.created_date);
  
  // Check venue types for archetype hints
  if (venueTypes.some(t => ['art_gallery', 'museum', 'book_store', 'library'].includes(t))) {
    return 'creative';
  }
  if (venueTypes.some(t => ['night_club', 'bar'].includes(t)) && timeOfDay === 'night') {
    return 'nightlife';
  }
  if (venueTypes.some(t => ['park', 'hiking_area', 'beach', 'lake'].includes(t))) {
    return 'nature_grounded';
  }
  if (venueTypes.some(t => ['restaurant', 'cafe'].includes(t))) {
    if (moodTags.some(m => ['romantic', 'cozy', 'calm'].includes(m.toLowerCase()))) {
      return 'romantic';
    }
    if (moodTags.some(m => ['social', 'buzzing', 'vibrant'].includes(m.toLowerCase()))) {
      return 'social_buzzing';
    }
    return 'cozy_intimate';
  }
  
  // Check mood tags
  if (moodTags.some(m => ['creative', 'artistic'].includes(m.toLowerCase()))) return 'creative';
  if (moodTags.some(m => ['romantic', 'intimate'].includes(m.toLowerCase()))) return 'romantic';
  if (moodTags.some(m => ['social', 'energetic'].includes(m.toLowerCase()))) return 'social_buzzing';
  if (moodTags.some(m => ['calm', 'peaceful', 'quiet'].includes(m.toLowerCase()))) return 'cozy_intimate';
  
  return 'social_buzzing'; // Default
}

/**
 * Get archetype display name
 */
function getArchetypeLabel(archetype) {
  const labels = {
    creative: 'Creative',
    romantic: 'Romantic',
    nature_grounded: 'Grounded',
    social_buzzing: 'Social',
    nightlife: 'Nightlife',
    cozy_intimate: 'Cozy'
  };
  return labels[archetype] || 'Social';
}

/**
 * Get archetype color
 */
function getArchetypeColor(archetype) {
  const colors = {
    creative: '#9B5DE5',      // purple
    romantic: '#E74C78',      // pink
    nature_grounded: '#2DD881', // green
    social_buzzing: '#FFB800',  // yellow
    nightlife: '#4169E1',     // neon blue
    cozy_intimate: '#C49A6C'  // warm beige
  };
  return colors[archetype] || '#E70F72';
}

/**
 * Get energy chips based on time and mood
 */
function getEnergyChips(moment, archetype) {
  const timeOfDay = getTimeOfDay(moment.created_date);
  const moodTags = moment.mood_tags || [];
  
  const chips = [];
  
  // Time-based chips
  if (timeOfDay === 'night' || timeOfDay === 'evening') {
    chips.push({ icon: '🌃', label: timeOfDay === 'night' ? 'Night Energy' : 'Golden Hour Soul' });
  } else if (timeOfDay === 'morning') {
    chips.push({ icon: '🌅', label: 'Morning Glow' });
  }
  
  // Mood-based chips
  if (moodTags.some(m => ['thoughtful', 'deep', 'meaningful'].includes(m.toLowerCase()))) {
    chips.push({ icon: '💬', label: 'Deep Talker' });
  } else if (moodTags.some(m => ['spontaneous', 'energetic', 'fun'].includes(m.toLowerCase()))) {
    chips.push({ icon: '⚡', label: 'Spontaneous' });
  } else if (moodTags.some(m => ['calm', 'peaceful', 'quiet'].includes(m.toLowerCase()))) {
    chips.push({ icon: '🕊️', label: 'Calm Vibe' });
  }
  
  return chips.slice(0, 2);
}

export default function MomentsTimeline({ moments = [] }) {
  const [photoUrls, setPhotoUrls] = useState({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const urls = {};
      for (const moment of moments.slice(0, 5)) {
        if (moment.venue_name) {
          try {
            const response = await base44.functions.invoke('getPlacePhoto', {
              venue_name: moment.venue_name,
              lat: moment.lat,
              lng: moment.lng
            });
            if (response.data?.photo_url) {
              urls[moment.id] = response.data.photo_url;
            }
          } catch (error) {
            console.error('Failed to fetch photo for moment:', moment.id, error);
          }
        }
      }
      setPhotoUrls(urls);
    };

    if (moments.length > 0) {
      fetchPhotos();
    }
  }, [moments]);

  if (!moments || moments.length === 0) {
    return null;
  }

  // Take only the most recent 3-5 moments
  const recentMoments = moments.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="mb-6"
    >
      <div className="mb-3 ml-1">
        <h3 className="text-white/45 text-xs uppercase tracking-wider">Moment Timeline</h3>
        <p className="text-white/30 text-xs mt-0.5">A glimpse of their recent vibe</p>
      </div>

      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10" />

        <div className="space-y-4">
          {recentMoments.map((moment, index) => {
            const archetype = determineArchetype(moment);
            const title = generateMomentTitle(moment, archetype);
            const label = getArchetypeLabel(archetype);
            const color = getArchetypeColor(archetype);
            const relativeTime = getRelativeTime(moment.created_date);
            const energyChips = getEnergyChips(moment, archetype);

            return (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="relative pl-11"
              >
                {/* Glowing node */}
                <div
                  className="absolute left-2.5 top-2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 12px ${color}80, 0 0 24px ${color}40`
                  }}
                />

                {/* Card */}
                <div
                  className="bg-white/5 border rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                  style={{ borderColor: `${color}30` }}
                >
                  {/* Place Photo */}
                  {photoUrls[moment.id] && (
                    <div className="relative h-32 w-full overflow-hidden">
                      <img 
                        src={photoUrls[moment.id]} 
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${color}20`,
                              color: color,
                              border: `1px solid ${color}40`
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-white/60 text-xs italic mb-2">
                      {(() => {
                        const descriptions = {
                          creative: 'Drawn to culture + meaning.',
                          romantic: 'Warm lights, low volume, real conversation.',
                          nature_grounded: 'Quiet reset energy.',
                          social_buzzing: 'Energy + connection.',
                          nightlife: 'Late night, big energy.',
                          cozy_intimate: 'Small moments, deep connection.'
                        };
                        return descriptions[archetype] || 'Good vibes.';
                      })()}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/40 text-xs">{relativeTime}</span>
                      {energyChips.map((chip, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-white/5 rounded-full border border-white/10 flex items-center gap-1"
                        >
                          <span>{chip.icon}</span>
                          <span className="text-white/60">{chip.label}</span>
                        </span>
                      ))}
                    </div>

                    {/* Optional: Blurred zone indicator */}
                    {moment.venue_name && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-white/30" />
                        <span className="text-white/30 text-xs">
                          {moment.venue_name.length > 25 
                            ? `${moment.venue_name.substring(0, 25)}...` 
                            : moment.venue_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}