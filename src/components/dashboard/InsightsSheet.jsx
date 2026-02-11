import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, MapPin, Clock, Sparkles } from 'lucide-react';

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
            lat: m.lat,
            lng: m.lng
          };
        }
        zoneMap[zone].count++;
        if (m.mood_tags) {
          zoneMap[zone].vibes.push(...m.mood_tags);
        }
      }
    });



    // PlacesDNA Archetypes - map vibes to primary DNA types with colors
    const dnaMapping = {
      'Romantic': { name: 'Romantic', color: '#E74C78', icon: '❤️' },
      'Cozy': { name: 'Romantic', color: '#E74C78', icon: '❤️' },
      'Intimate': { name: 'Romantic', color: '#E74C78', icon: '❤️' },
      'Social': { name: 'Social', color: '#FF6B3D', icon: '🎉' },
      'Energetic': { name: 'Social', color: '#FF6B3D', icon: '🎉' },
      'Vibrant': { name: 'Social', color: '#FF6B3D', icon: '🎉' },
      'Creative': { name: 'Creative', color: '#9B5DE5', icon: '🎨' },
      'Artistic': { name: 'Creative', color: '#9B5DE5', icon: '🎨' },
      'Calm': { name: 'Low-Key', color: '#6A8F7A', icon: '🌿' },
      'Peaceful': { name: 'Low-Key', color: '#6A8F7A', icon: '🌿' },
      'Quiet': { name: 'Low-Key', color: '#6A8F7A', icon: '🌿' },
      'Loud': { name: 'High-Energy', color: '#F6C90E', icon: '⚡' },
      'Intense': { name: 'High-Energy', color: '#F6C90E', icon: '⚡' },
      'Adventurous': { name: 'Adventurous', color: '#1CA7A6', icon: '🧭' },
      'Spontaneous': { name: 'Adventurous', color: '#1CA7A6', icon: '🧭' },
      'Bold': { name: 'Adventurous', color: '#1CA7A6', icon: '🧭' },
      'Cultural': { name: 'Intellectual', color: '#4169E1', icon: '🧠' },
      'Intellectual': { name: 'Intellectual', color: '#4169E1', icon: '🧠' },
      'Curious': { name: 'Intellectual', color: '#4169E1', icon: '🧠' },
      'Natural': { name: 'Wellness', color: '#4FC3F7', icon: '🧘' },
      'Mindful': { name: 'Wellness', color: '#4FC3F7', icon: '🧘' }
    };

    // Assign DNA to each zone
    const topZones = Object.values(zoneMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(zone => {
        const dnaTypes = {};
        zone.vibes.forEach(vibe => {
          const dna = dnaMapping[vibe];
          if (dna) {
            dnaTypes[dna.name] = (dnaTypes[dna.name] || 0) + 1;
          }
        });
        
        const primaryDNA = Object.entries(dnaTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([name]) => {
            const dnaInfo = Object.values(dnaMapping).find(d => d.name === name);
            return dnaInfo;
          })
          .filter(Boolean);

        return {
          ...zone,
          frequency: Math.round((zone.count / moments.length) * 100),
          topVibes: [...new Set(zone.vibes)].slice(0, 2),
          dna: primaryDNA.length > 0 ? primaryDNA : [{ name: 'Social', color: '#FF6B3D', icon: '🎉' }]
        };
      });

    // Calculate overall PlacesDNA for personality summary
    const vibeFreq = {};
    moments.forEach(m => {
      if (m.mood_tags) {
        m.mood_tags.forEach(vibe => {
          vibeFreq[vibe] = (vibeFreq[vibe] || 0) + 1;
        });
      }
    });

    const dnaFreq = {};
    Object.entries(vibeFreq).forEach(([vibe, count]) => {
      const dna = dnaMapping[vibe];
      if (dna) {
        dnaFreq[dna.name] = (dnaFreq[dna.name] || 0) + count;
      }
    });

    const placesDNA = Object.entries(dnaFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name, count]) => {
        const dnaInfo = Object.values(dnaMapping).find(d => d.name === name);
        return {
          ...dnaInfo,
          percentage: Math.round((count / moments.length) * 100)
        };
      });

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
      mood: placesDNA[0]?.title.toLowerCase().includes('calm') || placesDNA[0]?.title.toLowerCase().includes('intimate')
        ? 'unplanned, relaxed, and present'
        : 'spontaneous, social, and open to connection'
    } : null;

    // Compatible MBTI types based on user's type (if available)
    const compatibleTypes = profile?.mbti_type 
      ? getCompatibleTypes(profile.mbti_type)
      : ['INFJ', 'ISFP', 'ENFP'];

    return { topZones, placesDNA, peakTime, recommendation, compatibleTypes };
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
        <div className="sticky top-0 bg-black border-b border-[#E70F72]/20 pt-6 px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Insights</h2>
              <p className="text-white/50 text-sm mt-1">Patterns from where and how you show up.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white/50" />
            </button>
          </div>
          {/* Spark gradient line */}
          <div className="h-1 bg-gradient-to-r from-[#E70F72] to-transparent rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8 pb-20">
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

          {/* Compatibility Overlay */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">Compatibility Overlay</h3>
            <p className="text-white/50 text-sm mb-4">Who you're compatible with — and where they go</p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6"
            >
              <div className="mb-4">
                <p className="text-white/70 text-sm mb-3">Compatible energies frequent your zones</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {insights.compatibleTypes.map(type => (
                    <span key={type} className="text-sm bg-green-500/20 text-green-300 px-3 py-2 rounded-full font-semibold">
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Most active in {insights.topZones[0]?.topVibes[0] || 'creative'} + {insights.topZones[0]?.topVibes[1]?.toLowerCase() || 'intimate'} areas.
                </p>
              </div>
              
              {insights.peakTime && (
                <div className="pt-4 border-t border-green-500/20">
                  <p className="text-white/70 text-sm mb-2">People you're most compatible with tend to show up here on</p>
                  <p className="text-white font-semibold">
                    {insights.peakTime.day} evenings & weekend afternoons
                  </p>
                </div>
              )}
            </motion.div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}