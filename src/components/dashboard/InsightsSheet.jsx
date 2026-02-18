import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, MapPin, Clock, Sparkles, Users, TrendingUp, Star } from 'lucide-react';
import { calculateUserPlacesDNA } from '@/components/spark/placesDnaEngine';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';

// Get compatible MBTI types based on user's type
const getCompatibleTypes = (mbtiType) => {
  const compatibility = {
    'INTJ': ['ENTP', 'ENFP', 'ENTJ'],
    'INTP': ['ENTJ', 'ENTP', 'INFJ'],
    'ENTJ': ['INTP', 'INTJ', 'ENFP'],
    'ENTP': ['INFJ', 'INTJ', 'ENFJ'],
    'INFJ': ['ENTP', 'ENFP', 'INFP'],
    'INFP': ['ENFJ', 'ENTJ', 'INFJ'],
    'ENFJ': ['INFP', 'ENFP', 'INFJ'],
    'ENFP': ['INTJ', 'INFJ', 'ENFJ'],
    'ISTJ': ['ESTP', 'ESFP', 'ESTJ'],
    'ISFJ': ['ESFP', 'ESTP', 'ISFP'],
    'ESTJ': ['ISTP', 'ISTJ', 'ESFJ'],
    'ESFJ': ['ISFP', 'ISTP', 'ESTJ'],
    'ISTP': ['ESTJ', 'ESFJ', 'ESTP'],
    'ISFP': ['ESFJ', 'ENFJ', 'ESTJ'],
    'ESTP': ['ISFJ', 'ISTJ', 'ESFP'],
    'ESFP': ['ISTJ', 'ISFJ', 'ESTP']
  };
  return compatibility[mbtiType] || ['INFJ', 'ISFP', 'ENFP'];
};

export default function InsightsSheet({ moments, profile, onClose }) {
  const [activeTab, setActiveTab] = useState('this_week');
  // Calculate insights data
  const insights = useMemo(() => {
    if (!moments || moments.length === 0) {
      return {
        topZones: [],
        placesDNA: [],
        peakTime: null,
        recommendation: null
      };
    }

    // Top Zones - cluster moments by geohash prefix (area)
    const zoneMap = {};
    moments.forEach(m => {
      if (m.geohash) {
        const zone = m.geohash.substring(0, 4); // Rough area
        if (!zoneMap[zone]) {
          zoneMap[zone] = {
            area: m.venue_name?.split(',')[0] || m.geohash,
            count: 0,
            vibes: [],
            moments: [],
            lat: m.lat,
            lng: m.lng
          };
        }
        zoneMap[zone].count++;
        zoneMap[zone].moments.push(m);
        if (m.mood_tags) {
          zoneMap[zone].vibes.push(...m.mood_tags);
        }
      }
    });



    // Define 10 PlacesDNA Archetypes
    const ARCHETYPES = {
      romantic: { name: 'Romantic', color: '#E74C78', icon: '💞', desc: 'Intimate, warm, connection-focused' },
      calm_cozy: { name: 'Calm & Cozy', color: '#C49A6C', icon: '☕', desc: 'Relaxed, low-pressure, reflective' },
      creative: { name: 'Creative', color: '#9B5DE5', icon: '🎨', desc: 'Expressive, artsy, stimulating' },
      social_buzzing: { name: 'Social & Buzzing', color: '#FF6B3D', icon: '🌆', desc: 'High-energy, group dynamic' },
      nature_grounded: { name: 'Nature & Grounded', color: '#6A8F7A', icon: '🌿', desc: 'Outdoors, mindful, slow' },
      live_electric: { name: 'Live & Electric', color: '#F6C90E', icon: '🎵', desc: 'Music, movement, sensory' },
      deep_intellectual: { name: 'Deep & Intellectual', color: '#4169E1', icon: '🧠', desc: 'Conversation-heavy' },
      active_energetic: { name: 'Active & Energetic', color: '#FF4081', icon: '🏃', desc: 'Physical, dynamic' },
      spontaneous_nightlife: { name: 'Spontaneous & Nightlife', color: '#B026FF', icon: '🍸', desc: 'Impulsive, late-night' },
      intimate_local: { name: 'Intimate Local', color: '#8B7355', icon: '🏡', desc: 'Familiar, neighborhood-feel' }
    };

    // Category → Archetype mapping (can assign multiple archetypes with weights)
    const CATEGORY_TO_ARCHETYPES = {
      cafe: [{ archetype: 'calm_cozy', weight: 0.7 }, { archetype: 'creative', weight: 0.3 }],
      coffee_shop: [{ archetype: 'calm_cozy', weight: 0.7 }, { archetype: 'creative', weight: 0.3 }],
      book_store: [{ archetype: 'calm_cozy', weight: 0.5 }, { archetype: 'deep_intellectual', weight: 0.5 }],
      library: [{ archetype: 'calm_cozy', weight: 0.4 }, { archetype: 'deep_intellectual', weight: 0.6 }],
      art_gallery: [{ archetype: 'creative', weight: 1.0 }],
      museum: [{ archetype: 'creative', weight: 0.6 }, { archetype: 'deep_intellectual', weight: 0.4 }],
      park: [{ archetype: 'nature_grounded', weight: 1.0 }],
      campground: [{ archetype: 'nature_grounded', weight: 1.0 }],
      natural_feature: [{ archetype: 'nature_grounded', weight: 1.0 }],
      beach: [{ archetype: 'nature_grounded', weight: 0.7 }, { archetype: 'social_buzzing', weight: 0.3 }],
      night_club: [{ archetype: 'spontaneous_nightlife', weight: 0.7 }, { archetype: 'live_electric', weight: 0.3 }],
      bar: [{ archetype: 'social_buzzing', weight: 0.5 }, { archetype: 'spontaneous_nightlife', weight: 0.5 }],
      pub: [{ archetype: 'intimate_local', weight: 0.6 }, { archetype: 'social_buzzing', weight: 0.4 }],
      restaurant: [{ archetype: 'romantic', weight: 0.6 }, { archetype: 'social_buzzing', weight: 0.4 }],
      movie_theater: [{ archetype: 'romantic', weight: 0.4 }, { archetype: 'social_buzzing', weight: 0.4 }, { archetype: 'creative', weight: 0.2 }],
      concert_hall: [{ archetype: 'live_electric', weight: 1.0 }],
      music_venue: [{ archetype: 'live_electric', weight: 1.0 }],
      gym: [{ archetype: 'active_energetic', weight: 1.0 }],
      stadium: [{ archetype: 'active_energetic', weight: 0.6 }, { archetype: 'social_buzzing', weight: 0.4 }],
      amusement_park: [{ archetype: 'social_buzzing', weight: 0.6 }, { archetype: 'active_energetic', weight: 0.4 }],
      university: [{ archetype: 'deep_intellectual', weight: 1.0 }],
      school: [{ archetype: 'deep_intellectual', weight: 1.0 }],
      bakery: [{ archetype: 'calm_cozy', weight: 0.5 }, { archetype: 'intimate_local', weight: 0.5 }],
      yoga_studio: [{ archetype: 'nature_grounded', weight: 0.7 }, { archetype: 'calm_cozy', weight: 0.3 }],
      spa: [{ archetype: 'romantic', weight: 0.5 }, { archetype: 'calm_cozy', weight: 0.5 }],
      wine_bar: [{ archetype: 'romantic', weight: 0.7 }, { archetype: 'intimate_local', weight: 0.3 }],
      rooftop_bar: [{ archetype: 'spontaneous_nightlife', weight: 0.6 }, { archetype: 'romantic', weight: 0.4 }]
    };

    // Vibe tags → Archetype mapping
    const VIBE_TAG_TO_ARCHETYPES = {
      'Romantic': [{ archetype: 'romantic', weight: 1.0 }],
      'Flirty': [{ archetype: 'romantic', weight: 0.8 }, { archetype: 'spontaneous_nightlife', weight: 0.2 }],
      'Cozy': [{ archetype: 'calm_cozy', weight: 0.8 }, { archetype: 'intimate_local', weight: 0.2 }],
      'Calm': [{ archetype: 'calm_cozy', weight: 0.7 }, { archetype: 'nature_grounded', weight: 0.3 }],
      'Creative': [{ archetype: 'creative', weight: 1.0 }],
      'Artistic': [{ archetype: 'creative', weight: 1.0 }],
      'Social': [{ archetype: 'social_buzzing', weight: 1.0 }],
      'Energetic': [{ archetype: 'social_buzzing', weight: 0.5 }, { archetype: 'active_energetic', weight: 0.5 }],
      'Vibrant': [{ archetype: 'social_buzzing', weight: 0.7 }, { archetype: 'live_electric', weight: 0.3 }],
      'Peaceful': [{ archetype: 'nature_grounded', weight: 0.8 }, { archetype: 'calm_cozy', weight: 0.2 }],
      'Natural': [{ archetype: 'nature_grounded', weight: 1.0 }],
      'Loud': [{ archetype: 'live_electric', weight: 0.6 }, { archetype: 'spontaneous_nightlife', weight: 0.4 }],
      'Deep talk': [{ archetype: 'deep_intellectual', weight: 0.7 }, { archetype: 'romantic', weight: 0.3 }],
      'Intellectual': [{ archetype: 'deep_intellectual', weight: 1.0 }],
      'Active': [{ archetype: 'active_energetic', weight: 1.0 }],
      'Spontaneous': [{ archetype: 'spontaneous_nightlife', weight: 0.6 }, { archetype: 'social_buzzing', weight: 0.4 }],
      'Low-key': [{ archetype: 'intimate_local', weight: 0.6 }, { archetype: 'calm_cozy', weight: 0.4 }]
    };

    // Time-based modifiers (hour of day affects archetype)
    const getTimeModifier = (hour) => {
      if (hour >= 22 || hour < 2) return { spontaneous_nightlife: 1.4, romantic: 1.2 };
      if (hour >= 18 && hour < 22) return { romantic: 1.3, social_buzzing: 1.2, intimate_local: 1.1 };
      if (hour >= 12 && hour < 17) return { calm_cozy: 1.2, social_buzzing: 1.1 };
      if (hour >= 9 && hour < 12) return { calm_cozy: 1.3, intimate_local: 1.2 };
      return {};
    };

    // Calculate archetype scores for a moment
    const calculateArchetypeScores = (moment) => {
      const scores = {};
      
      // Initialize all archetypes to 0
      Object.keys(ARCHETYPES).forEach(key => scores[key] = 0);
      
      // 1. Base layer: Category mapping (40% weight)
      if (moment.venue_types && moment.venue_types.length > 0) {
        moment.venue_types.forEach(type => {
          const mappings = CATEGORY_TO_ARCHETYPES[type];
          if (mappings) {
            mappings.forEach(({ archetype, weight }) => {
              scores[archetype] += weight * 0.4;
            });
          }
        });
      }
      
      // 2. Vibe tags (25% weight)
      if (moment.mood_tags && moment.mood_tags.length > 0) {
        moment.mood_tags.forEach(tag => {
          const mappings = VIBE_TAG_TO_ARCHETYPES[tag];
          if (mappings) {
            mappings.forEach(({ archetype, weight }) => {
              scores[archetype] += weight * 0.25;
            });
          }
        });
      }
      
      // 3. Time context (15% weight)
      const hour = new Date(moment.created_date).getHours();
      const timeModifiers = getTimeModifier(hour);
      Object.entries(timeModifiers).forEach(([archetype, multiplier]) => {
        scores[archetype] *= multiplier;
      });
      
      return scores;
    };

    // Get top archetypes from scores
    const getTopArchetypes = (scores, count = 2) => {
      return Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([key, score]) => ({
          ...ARCHETYPES[key],
          score: score
        }));
    };

    // Assign DNA to each zone based on weighted scoring
    const topZones = Object.values(zoneMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(zone => {
        // Aggregate archetype scores across all moments in this zone
        const aggregatedScores = {};
        Object.keys(ARCHETYPES).forEach(key => aggregatedScores[key] = 0);
        
        zone.moments.forEach(moment => {
          const scores = calculateArchetypeScores(moment);
          Object.entries(scores).forEach(([archetype, score]) => {
            aggregatedScores[archetype] += score;
          });
        });
        
        // Normalize by number of moments
        Object.keys(aggregatedScores).forEach(key => {
          aggregatedScores[key] /= zone.moments.length;
        });
        
        const primaryDNA = getTopArchetypes(aggregatedScores, 2);

        return {
          ...zone,
          frequency: Math.round((zone.count / moments.length) * 100),
          topVibes: [...new Set(zone.vibes)].slice(0, 2),
          dna: primaryDNA.length > 0 ? primaryDNA : [ARCHETYPES.social_buzzing]
        };
      });

    // Calculate overall PlacesDNA for personality summary
    const overallScores = {};
    Object.keys(ARCHETYPES).forEach(key => overallScores[key] = 0);
    
    moments.forEach(m => {
      const scores = calculateArchetypeScores(m);
      Object.entries(scores).forEach(([archetype, score]) => {
        overallScores[archetype] += score;
      });
    });
    
    // Normalize
    Object.keys(overallScores).forEach(key => {
      overallScores[key] /= moments.length;
    });
    
    const placesDNA = getTopArchetypes(overallScores, 2).map(dna => ({
      ...dna,
      percentage: Math.round((dna.score / Math.max(...Object.values(overallScores))) * 100)
    }));

    // Peak Times - hourly distribution
    const hourMap = {};
    const dayMap = {};
    moments.forEach(m => {
      const date = new Date(m.created_date);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      hourMap[hour] = (hourMap[hour] || 0) + 1;
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
    const peakDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    const peakTime = peakHour && peakDay ? {
      day: peakDay[0],
      hour: `${peakHour[0]}:00`,
      count: peakHour[1]
    } : null;

    // Spark Potential recommendation with enhanced formatting
    const recommendation = topZones[0] && peakTime ? {
      zone: topZones[0].area,
      vibes: topZones[0].topVibes,
      time: peakTime?.hour,
      dayPart: (() => {
        const hour = parseInt(peakTime.hour);
        if (hour >= 5 && hour < 12) return `${peakTime.day} morning`;
        if (hour >= 12 && hour < 17) return `${peakTime.day} afternoon`;
        if (hour >= 17 && hour < 21) return `${peakTime.day} evening`;
        return `${peakTime.day} night`;
      })(),
      placeType: topZones[0].topVibes.length > 0 
        ? `${topZones[0].topVibes[0].toLowerCase()}, ${topZones[0].topVibes[1]?.toLowerCase() || 'social'} spots`
        : 'your favorite spots',
      mood: placesDNA[0]?.name.toLowerCase().includes('calm') || placesDNA[0]?.name.toLowerCase().includes('intimate')
        ? 'unplanned, relaxed, and present'
        : 'spontaneous, social, and open to connection'
    } : null;

    // Compatible MBTI types based on user's type (if available)
    const compatibleTypes = profile?.mbti_type 
      ? getCompatibleTypes(profile.mbti_type)
      : ['INFJ', 'ISFP', 'ENFP'];

    // HIGH POTENTIAL OVERLAP ZONES - zones with frequent activity + matching PlacesDNA
    const overlapZones = topZones.map(zone => {
      const zoneScore = zone.dna[0]?.score || 0;
      const frequencyScore = zone.frequency / 100;
      const potentialScore = (zoneScore * 0.6 + frequencyScore * 0.4) * 100;
      
      return {
        ...zone,
        overlapPotential: Math.round(potentialScore),
        reason: zoneScore > 0.7 ? 'Strong DNA match + high frequency' : 'Regular activity pattern'
      };
    }).filter(z => z.overlapPotential > 40).slice(0, 3);

    // SPARK WINDOWS - best times based on activity patterns
    const sparkWindows = [];
    const hourlyActivity = {};
    
    moments.forEach(m => {
      const hour = new Date(m.created_date).getHours();
      const dayOfWeek = new Date(m.created_date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const key = `${isWeekend ? 'weekend' : 'weekday'}-${hour}`;
      
      if (!hourlyActivity[key]) {
        hourlyActivity[key] = { count: 0, hour, isWeekend };
      }
      hourlyActivity[key].count++;
    });

    const sortedWindows = Object.entries(hourlyActivity)
      .map(([key, data]) => ({
        time: data.hour,
        dayType: data.isWeekend ? 'Weekend' : 'Weekday',
        count: data.count,
        label: (() => {
          const h = data.hour;
          if (h >= 6 && h < 12) return `${data.isWeekend ? 'Weekend' : 'Weekday'} Mornings (${h}:00-${h+2}:00)`;
          if (h >= 12 && h < 17) return `${data.isWeekend ? 'Weekend' : 'Weekday'} Afternoons (${h}:00-${h+2}:00)`;
          if (h >= 17 && h < 22) return `${data.isWeekend ? 'Weekend' : 'Weekday'} Evenings (${h}:00-${h+2}:00)`;
          return `${data.isWeekend ? 'Weekend' : 'Weekday'} Late Nights (${h}:00-${(h+2)%24}:00)`;
        })()
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    sparkWindows.push(...sortedWindows);

    // SIMILAR PlacesDNA USERS (anonymized) - for non-matches
    const userDNA = calculateUserPlacesDNA(moments);
    const similarDNACount = Math.floor(moments.length * 0.3) + Math.floor(Math.random() * 5); // Simulated
    
    const anonymizedActivity = {
      count: similarDNACount,
      topArchetypes: userDNA?.dominantArchetypes?.slice(0, 2) || [],
      message: `${similarDNACount} people with similar PlacesDNA are active in your zones`
    };

    return { 
      topZones, 
      placesDNA, 
      peakTime, 
      recommendation, 
      compatibleTypes,
      overlapZones,
      sparkWindows,
      anonymizedActivity
    };
  }, [moments]);

  const isPremium = profile?.crossd_plus;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[9998]"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black rounded-t-3xl border-t border-[#E70F72]/30 overflow-y-auto max-h-[85vh]"
        style={{ boxShadow: '0 -4px 20px rgba(231, 15, 114, 0.1)' }}
      >
        {/* Handle + Header */}
        <div className="sticky top-0 bg-black border-b border-[#E70F72]/20 pt-6 px-6 pb-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white">City Pulse</h2>
              <p className="text-white/50 text-sm mt-1">Weekly recap of your vibe + spark potential.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6 text-white/50" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mb-0">
            {[{ id: 'this_week', label: 'This Week' }, { id: 'trends', label: 'Trends', premium: true }].map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.premium || isPremium ? setActiveTab(tab.id) : setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#E70F72]/15 text-[#E70F72] border-b-2 border-[#E70F72]'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {tab.label}
                {tab.premium && <Star className="w-3 h-3 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-20 space-y-8">
          {activeTab === 'trends' && (
            <TrendsTab insights={insights} profile={profile} isPremium={isPremium} />
          )}
          {activeTab === 'this_week' && (
          <React.Fragment>
          {/* Your Vibe Hotspots */}
          {insights.topZones.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">Your Vibe Hotspots</h3>
              <p className="text-white/50 text-sm mb-4">Where you're drawn to most often</p>
              <div className="space-y-3">
                {insights.topZones.map((zone, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[#0B0B0B] to-[#050505] border rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer"
                    style={{ 
                      borderColor: `${zone.dna[0]?.color}40`,
                      boxShadow: `0 0 20px ${zone.dna[0]?.color}15`
                    }}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {/* DNA Icon Badge */}
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ 
                          backgroundColor: `${zone.dna[0]?.color}20`,
                          border: `2px solid ${zone.dna[0]?.color}60`
                        }}
                      >
                        {zone.dna[0]?.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-2">{zone.area}</h4>
                        
                        {/* DNA Type Pills */}
                        <div className="flex gap-2 flex-wrap mb-2">
                          {zone.dna.map((dna, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{ 
                                backgroundColor: `${dna.color}25`,
                                color: dna.color,
                                border: `1px solid ${dna.color}40`
                              }}
                            >
                              {dna.icon} {dna.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right ml-2">
                        <div className="text-2xl font-bold" style={{ color: zone.dna[0]?.color }}>
                          {zone.frequency}%
                        </div>
                        <div className="text-white/50 text-xs mt-1">{zone.count} visits</div>
                      </div>
                    </div>
                    
                    {/* DNA-colored progress bar */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.frequency}%` }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ 
                          background: `linear-gradient(90deg, ${zone.dna[0]?.color}, ${zone.dna[1]?.color || zone.dna[0]?.color})`
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-4 italic flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Tap a zone to see it on the map
              </p>
            </section>
          )}

          {/* Your PlacesDNA - Overall Personality Summary */}
          {insights.placesDNA.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">Your PlacesDNA</h3>
              <p className="text-white/50 text-sm mb-4">Your dominant environmental energies</p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#0B0B0B] to-[#050505] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  {insights.placesDNA.map((dna, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold"
                      style={{ 
                        backgroundColor: `${dna.color}20`,
                        color: dna.color,
                        border: `2px solid ${dna.color}50`
                      }}
                    >
                      <span className="text-xl">{dna.icon}</span>
                      <span>{dna.name}</span>
                      <span className="text-sm opacity-70">{dna.percentage}%</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-white/60 text-sm leading-relaxed">
                  We use this to match you with people who feel sparks in similar environments.
                </p>
              </motion.div>
            </section>
          )}

          {/* Peak Times - When your energy is strongest */}
          {insights.peakTime && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">When Your Energy is Strongest</h3>
              <p className="text-white/50 text-sm mb-4">Your peak spark time</p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-[#E70F72]/20 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E70F72]/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#E70F72]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">
                      {insights.peakTime.day} · {insights.peakTime.hour}
                    </p>
                    <p className="text-white/50 text-xs mt-1">Your most active window</p>
                  </div>
                </div>
                
                {/* Time visualization bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>12am</span>
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                    <span>12am</span>
                  </div>
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="absolute inset-y-0 bg-[#E70F72] rounded-full"
                      style={{
                        left: `${(parseInt(insights.peakTime.hour) / 24) * 100}%`,
                        width: '20%'
                      }}
                    />
                  </div>
                </div>
                
                <p className="text-white/70 text-sm leading-relaxed">
                  You tend to log moments when you're most open, social, and present.
                </p>
              </motion.div>
            </section>
          )}

          {/* Spark Potential - How to use this */}
          {insights.recommendation && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">How to Use This</h3>
              <p className="text-white/50 text-sm mb-4">Your spark potential</p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-[#E70F72]/15 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl p-6"
              >
                <div className="mb-6">
                  <p className="text-white/60 text-sm mb-2">Best time to find your vibe</p>
                  <p className="text-white font-bold text-xl leading-relaxed">
                    {insights.recommendation.dayPart} in {insights.recommendation.placeType}
                  </p>
                </div>
                
                <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                  <p className="text-white/70 text-sm leading-relaxed italic">
                    Your sparks happen most often when you're {insights.recommendation.mood}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-[#E70F72] text-white font-semibold rounded-xl hover:bg-[#ff1a8c] transition-colors">
                    Plan a Moment
                  </button>
                  <button className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                    Log a Moment
                  </button>
                </div>
              </motion.div>
            </section>
          )}

          {/* High Potential Overlap Zones */}
          {insights.overlapZones && insights.overlapZones.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">High Potential Overlap Zones</h3>
              <p className="text-white/50 text-sm mb-4">Where you're most likely to cross paths with compatible matches</p>
              
              <div className="space-y-3">
                {insights.overlapZones.map((zone, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-semibold">{zone.area}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-400">{zone.overlapPotential}%</div>
                        <div className="text-xs text-white/50">overlap</div>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs">{zone.reason}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Spark Windows */}
          {insights.sparkWindows && insights.sparkWindows.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">Spark Windows</h3>
              <p className="text-white/50 text-sm mb-4">Best times for crossing paths based on your activity</p>
              
              <div className="space-y-3">
                {insights.sparkWindows.map((window, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    className="bg-gradient-to-r from-[#E70F72]/10 to-orange-500/10 border border-[#E70F72]/30 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E70F72]/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#E70F72]" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{window.label}</p>
                          <p className="text-white/50 text-xs">{window.count} moments logged</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-[#E70F72]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Similar PlacesDNA Users (Anonymized) */}
          {insights.anonymizedActivity && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">People with Similar PlacesDNA</h3>
              <p className="text-white/50 text-sm mb-4">Anonymized activity in your zones</p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-2xl">{insights.anonymizedActivity.count}</p>
                    <p className="text-white/60 text-sm">active users nearby</p>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm mb-3">{insights.anonymizedActivity.message}</p>
                
                {insights.anonymizedActivity.topArchetypes.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {insights.anonymizedActivity.topArchetypes.map((arch, i) => (
                      <span 
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
                      >
                        {arch.archetype}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </section>
          )}

          {/* Crossd+ Compatibility Heat Layer */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Compatibility Heat Layer</h3>
                    <p className="text-white/60 text-xs">MBTI + PlacesDNA overlap visualization</p>
                  </div>
                </div>
                {!isPremium && <Lock className="w-5 h-5 text-amber-400" />}
              </div>
              {isPremium ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-lg p-3 border border-amber-500/20">
                    <p className="text-amber-400 font-bold text-sm">High Heat</p>
                    <p className="text-white/50 text-xs mt-1">85%+ compatible users active here</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                    <p className="text-orange-400 font-bold text-sm">Medium Heat</p>
                    <p className="text-white/50 text-xs mt-1">60–84% compatible users</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-white/60 text-sm mb-4">
                    Unlock the compatibility heat layer to see where users with matching MBTI types and PlacesDNA are most active.
                  </p>
                  <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all">
                    Unlock with Crossd+
                  </button>
                </>
              )}
            </motion.div>
          </section>
          </>)}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TrendsTab({ insights, profile, isPremium }) {
  const compatibleTypes = profile?.mbti_type
    ? getCompatibleTypes(profile.mbti_type)
    : ['INFJ', 'ISFP', 'ENFP'];

  const topZone = insights.topZones?.[0]?.area || 'your area';
  const peakWindow = insights.sparkWindows?.[0]?.label || 'weekend evenings';
  const topArch = insights.placesDNA?.[0];

  if (!isPremium) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="bg-gradient-to-br from-[#E70F72]/10 to-purple-500/10 border border-[#E70F72]/30 rounded-2xl p-6 text-center">
          <Lock className="w-10 h-10 text-[#E70F72] mx-auto mb-3" />
          <h3 className="text-white font-bold text-xl mb-2">Trends — Crossd+</h3>
          <p className="text-white/60 text-sm mb-5">See where people like you are peaking, which MBTI types cluster in your zones, and your best spark hours.</p>
          <div className="space-y-3 mb-5 text-left">
            {[
              { icon: '🔥', text: 'People like you are peaking in: ' + topZone },
              { icon: '🧠', text: 'Compatible MBTI types cluster in your vibe zones' },
              { icon: '⚡', text: 'Best "spark hours" for your PlacesDNA' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 blur-[2px] select-none">
                <span className="text-xl">{item.icon}</span>
                <p className="text-white/80 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 bg-[#E70F72] text-white font-semibold rounded-xl hover:bg-[#ff1a8c] transition-all">
            Upgrade to Crossd+
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-gradient-to-r from-[#E70F72]/10 to-purple-500/10 border border-[#E70F72]/30 rounded-2xl p-5">
        <p className="text-white/50 text-xs mb-1">🔥 Trending this week</p>
        <p className="text-white font-bold text-lg">People like you are peaking in: <span className="text-[#E70F72]">{topZone}</span></p>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5">
        <p className="text-white/50 text-xs mb-2">🧠 Compatible MBTI types in your zones</p>
        <div className="flex gap-2 flex-wrap">
          {compatibleTypes.map(type => (
            <span key={type} className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full font-semibold">{type}</span>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5">
        <p className="text-white/50 text-xs mb-1">⚡ Best spark hours for your vibe</p>
        <p className="text-white font-bold text-lg">{peakWindow}</p>
        {topArch && (
          <p className="text-white/60 text-sm mt-1">Based on your <span style={{ color: topArch.color }}>{topArch.icon} {topArch.name}</span> DNA</p>
        )}
      </div>

      <button className="w-full py-3 bg-[#E70F72] text-white font-semibold rounded-xl hover:bg-[#ff1a8c] transition-all">
        Log a Moment Now
      </button>
    </motion.div>
  );
}