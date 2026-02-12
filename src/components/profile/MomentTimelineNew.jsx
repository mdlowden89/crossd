import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Generate moment title based on venue types and archetype
function generateMomentTitle(venueTypes = [], archetype = 'Grounded') {
  const typeMap = {
    'art_gallery': { Creative: 'Gallery Night', Romantic: 'Art & Ambiance', Grounded: 'Culture Walk', Social: 'Creative Buzz' },
    'museum': { Creative: 'Museum Drift', Romantic: 'Culture Date', Grounded: 'Learning Walk', Social: 'Group Visit' },
    'cafe': { Romantic: 'Café Glow', Creative: 'Coffee & Create', Grounded: 'Morning Reset', Social: 'Café Hangout' },
    'restaurant': { Romantic: 'Dinner Energy', Creative: 'Culinary Art', Grounded: 'Comfort Meal', Social: 'Group Dinner' },
    'bar': { Social: 'Bar Buzz', Romantic: 'Wine Bar', Nightlife: 'Late Night', Creative: 'Creative Cocktails' },
    'night_club': { Nightlife: 'Dancefloor Energy', Social: 'City Buzz', Romantic: 'Night Pulse', Creative: 'Electric Scene' },
    'park': { Grounded: 'Park Walk', Romantic: 'Nature Glow', Social: 'Group Adventure', Creative: 'Nature Inspiration' },
    'music_venue': { Creative: 'Live Music Night', Social: 'Crowd Energy', Nightlife: 'Neon Night', Romantic: 'Intimate Gig' },
    'concert_hall': { Creative: 'Sonic Journey', Social: 'Live Energy', Romantic: 'Evening Symphony', Grounded: 'Acoustic Bliss' },
    'waterfront': { Romantic: 'Waterfront Glow', Grounded: 'Water Reset', Creative: 'Scenic Inspiration', Social: 'Waterside Buzz' },
  };

  const primaryType = venueTypes[0] || 'cafe';
  const titles = typeMap[primaryType] || {};
  return titles[archetype] || 'Evening Out';
}

// Map archetype to color and icon
function getArchetypeStyle(archetype) {
  const styles = {
    Creative: { color: '#9B5DE5', icon: '🎭', label: 'Creative' },
    Romantic: { color: '#E74C78', icon: '💞', label: 'Romantic' },
    Grounded: { color: '#6A8F7A', icon: '🌿', label: 'Grounded' },
    Social: { color: '#FFB800', icon: '🌆', label: 'Social' },
    Nightlife: { color: '#8A63F6', icon: '🌃', label: 'Night Energy' },
    'NatureGrounded': { color: '#2DD881', icon: '🌲', label: 'Nature' },
    'SocialBuzzing': { color: '#FF6B3D', icon: '⚡', label: 'Buzzing' },
  };
  return styles[archetype] || styles.Grounded;
}

// Calculate time window label
function getTimeWindowLabel(createdDate) {
  const now = new Date();
  const momentDate = new Date(createdDate);
  const diffMs = now - momentDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'recently';
  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 3) return 'recently';
  if (diffDays <= 7) return 'this week';
  if (diffDays <= 14) return 'last week';
  return 'in the last 14 days';
}

// Infer archetype from moment data (simplified version)
function inferArchetypeFromMoment(moment) {
  const types = moment.venue_types || [];
  if (types.includes('art_gallery') || types.includes('museum')) return 'Creative';
  if (types.includes('bar') && types.includes('night_club')) return 'Nightlife';
  if (types.includes('park') || types.includes('waterfront')) return 'Grounded';
  if (types.includes('restaurant') || types.includes('cafe')) return 'Romantic';
  if (types.includes('music_venue') || types.includes('concert_hall')) return 'Creative';
  return 'Grounded';
}

export default function MomentTimeline({ moments = [], sparkSignals = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Show max 5 moments
  const displayMoments = moments.slice(0, 5);

  if (displayMoments.length === 0) return null;

  // Get primary archetype from spark signals
  const primaryArchetype = sparkSignals.find(s => s.dimension === 'environment')?.label || 'Grounded';

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-white">Moment Timeline</div>
        <div className="text-xs text-white/40">A glimpse of their recent vibe</div>
      </div>

      {/* Timeline Container */}
      <div className="relative space-y-3">
        {/* Vertical Timeline Rail */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        {/* Moment Cards */}
        {displayMoments.map((moment, idx) => {
          const archetype = inferArchetypeFromMoment(moment);
          const style = getArchetypeStyle(archetype);
          const title = generateMomentTitle(moment.venue_types, archetype);
          const timeLabel = getTimeWindowLabel(moment.created_date);
          const isExpanded = expandedIndex === idx;

          // Get matching spark signal for this moment's archetype
          const matchingSignal = sparkSignals.find(s => 
            (s.dimension === 'environment' && archetype.includes(s.label)) ||
            (s.icon === style.icon)
          );

          return (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline Node */}
              <div
                className="absolute left-0 top-2 w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300"
                style={{
                  borderColor: style.color,
                  background: `${style.color}15`,
                  boxShadow: isExpanded ? `0 0 20px ${style.color}60` : `0 0 10px ${style.color}30`
                }}
              >
                <span className="text-lg">{style.icon}</span>
              </div>

              {/* Card */}
              <motion.div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="cursor-pointer rounded-xl p-3.5 border transition-all duration-300"
                style={{
                  borderColor: `${style.color}40`,
                  background: `linear-gradient(135deg, ${style.color}08, ${style.color}03)`,
                  boxShadow: isExpanded ? `0 8px 24px ${style.color}20` : `0 4px 12px ${style.color}10`
                }}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">{title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-white/70">
                        {style.icon} {style.label}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 text-white/40 transition-transform"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </div>

                {/* Time Window */}
                <div className="text-xs text-white/50 mb-2">{timeLabel}</div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/10 space-y-2"
                  >
                    {/* Matching Spark Signal */}
                    {matchingSignal && (
                      <div className="text-xs text-white/70">
                        <div className="font-medium text-white mb-1">Matching Energy:</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{matchingSignal.icon}</span>
                          <span>{matchingSignal.label}</span>
                        </div>
                      </div>
                    )}

                    {/* Venue Type Info */}
                    {moment.venue_types && moment.venue_types.length > 0 && (
                      <div className="text-xs text-white/70">
                        <div className="font-medium text-white mb-1">Type:</div>
                        <div className="capitalize">{moment.venue_types.join(', ')}</div>
                      </div>
                    )}

                    {/* Note if exists */}
                    {moment.note && (
                      <div className="text-xs text-white/70 italic">
                        "{moment.note}"
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="text-xs text-white/40 pt-2">
        "A person moving through life" · {displayMoments.length} recent moments
      </div>
    </div>
  );
}