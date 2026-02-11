import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, MapPin, Clock, Sparkles } from 'lucide-react';

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

    const topZones = Object.values(zoneMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(zone => ({
        ...zone,
        frequency: Math.round((zone.count / moments.length) * 100),
        topVibes: [...new Set(zone.vibes)].slice(0, 2)
      }));

    // PlacesDNA - environment personality archetypes
    const vibeFreq = {};
    moments.forEach(m => {
      if (m.mood_tags) {
        m.mood_tags.forEach(vibe => {
          vibeFreq[vibe] = (vibeFreq[vibe] || 0) + 1;
        });
      }
    });

    // Define archetype combinations with emotional meanings
    const archetypes = [
      {
        vibes: ['Romantic', 'Calm', 'Cozy'],
        icon: '🕯️',
        title: 'Romantic + Calm',
        meaning: "You're drawn to places that invite presence, not performance."
      },
      {
        vibes: ['Creative', 'Intimate', 'Artistic'],
        icon: '🎨',
        title: 'Creative + Intimate',
        meaning: 'Sparks for you start with atmosphere, not noise.'
      },
      {
        vibes: ['Social', 'Energetic', 'Vibrant'],
        icon: '✨',
        title: 'Social + Vibrant',
        meaning: 'You thrive in places where energy flows and connections happen naturally.'
      },
      {
        vibes: ['Cultural', 'Curious', 'Intellectual'],
        icon: '📚',
        title: 'Cultural + Curious',
        meaning: 'You seek spaces that spark thought and invite exploration.'
      },
      {
        vibes: ['Adventurous', 'Spontaneous', 'Bold'],
        icon: '🌟',
        title: 'Adventurous + Spontaneous',
        meaning: 'You find magic in the unexpected and embrace the unknown.'
      },
      {
        vibes: ['Calm', 'Natural', 'Peaceful'],
        icon: '🌿',
        title: 'Natural + Peaceful',
        meaning: 'You connect best in environments that feel grounding and authentic.'
      }
    ];

    // Match user's vibes to archetypes
    const matchedArchetypes = archetypes
      .map(archetype => {
        const score = archetype.vibes.reduce((sum, vibe) => sum + (vibeFreq[vibe] || 0), 0);
        return { ...archetype, score };
      })
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const placesDNA = matchedArchetypes.length > 0 ? matchedArchetypes : [
      {
        icon: '✨',
        title: 'Social + Vibrant',
        meaning: 'You thrive in places where energy flows and connections happen naturally.'
      },
      {
        icon: '🎨',
        title: 'Creative + Intimate',
        meaning: 'Sparks for you start with atmosphere, not noise.'
      }
    ];

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

    // Spark Potential recommendation
    const recommendation = topZones[0] ? {
      zone: topZones[0].area,
      vibes: topZones[0].topVibes,
      time: peakTime?.hour
    } : null;

    return { topZones, placesDNA, peakTime, recommendation };
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
                    className="bg-gradient-to-r from-[#0B0B0B] to-[#050505] border border-[#E70F72]/20 rounded-2xl p-5 hover:border-[#E70F72]/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-2">{zone.area}</h4>
                        {zone.topVibes.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {zone.topVibes.map((vibe, i) => (
                              <span key={i} className="text-xs bg-[#E70F72]/20 text-[#E70F72] px-3 py-1 rounded-full font-medium">
                                {vibe}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-[#E70F72] text-2xl font-bold">{zone.frequency}%</div>
                        <div className="text-white/50 text-xs mt-1">{zone.count} visits</div>
                      </div>
                    </div>
                    
                    {/* Spark bar - frequency indicator */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.frequency}%` }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E70F72] to-[#ff1a8c] rounded-full"
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

          {/* Your PlacesDNA - Environment Personality */}
          {insights.placesDNA.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-2">Your Environment Personality</h3>
              <p className="text-white/50 text-sm mb-4">Your PlacesDNA</p>
              <div className="space-y-4">
                {insights.placesDNA.map((dna, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-gradient-to-r from-[#E70F72]/15 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl px-6 py-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{dna.icon}</span>
                      <h4 className="text-white font-bold text-lg">{dna.title}</h4>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      {dna.meaning}
                    </p>
                  </motion.div>
                ))}
              </div>
              <p className="text-white/50 text-sm mt-4 leading-relaxed">
                We use this to match you with people who feel sparks in similar environments.
              </p>
            </section>
          )}

          {/* Peak Times */}
          {insights.peakTime && (
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Your Peak Spark Time</h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-[#E70F72]/20 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-[#E70F72]" />
                  <p className="text-white font-bold">
                    {insights.peakTime.day} · {insights.peakTime.hour}
                  </p>
                </div>
                <p className="text-white/70 text-sm">
                  You tend to log moments when you're most open, social, and present.
                </p>
              </motion.div>
            </section>
          )}

          {/* Spark Potential */}
          {insights.recommendation && (
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Spark Potential</h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-[#0B0B0B] to-[#050505] border border-[#E70F72]/20 rounded-2xl p-6"
              >
                <p className="text-white/70 text-sm mb-2">Best time to find your vibe</p>
                <p className="text-white font-bold text-lg mb-4">
                  {insights.recommendation.time} in {insights.recommendation.zone}
                </p>
                <button className="w-full py-3 bg-[#E70F72] text-white font-semibold rounded-xl hover:bg-[#ff1a8c] transition-colors">
                  Plan a Moment
                </button>
              </motion.div>
            </section>
          )}

          {/* Compatibility Insights */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Compatibility Insights</h3>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6"
            >
              <p className="text-white/70 text-sm mb-2">Compatible energies in your zones</p>
              <div className="flex gap-2 mb-4">
                {['INFJ', 'ISFP', 'ENFP'].map(type => (
                  <span key={type} className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-semibold">
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-white/60 text-sm">
                Most active in creative and intimate environments, matching your vibe.
              </p>
            </motion.div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}