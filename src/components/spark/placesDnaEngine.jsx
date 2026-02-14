/**
 * PlacesDNA Engine
 * Behavioral compatibility system based on environmental psychology
 */

export const ARCHETYPES = {
  ROMANTIC: 'romantic',
  CALM_COZY: 'calm_cozy',
  CREATIVE: 'creative',
  SOCIAL_BUZZING: 'social_buzzing',
  NATURE_GROUNDED: 'nature_grounded',
  LIVE_ELECTRIC: 'live_electric',
  DEEP_INTELLECTUAL: 'deep_intellectual',
  ACTIVE_ENERGETIC: 'active_energetic',
  NIGHTLIFE: 'nightlife',
  INTIMATE_LOCAL: 'intimate_local'
};

/**
 * Calculate archetype scores for a place based on aggregated user behavior
 */
export function calculatePlaceDNA(moments = []) {
  if (!moments || moments.length === 0) {
    return null;
  }

  const archetypes = {};
  Object.values(ARCHETYPES).forEach(arch => archetypes[arch] = 0);

  // Aggregate signals from all moments at this place
  moments.forEach(moment => {
    const moodTags = moment.mood_tags || [];
    const venueTypes = moment.venue_types || [];
    const timeOfDay = getTimeOfDay(moment.created_date);

    // Map mood tags to archetypes
    moodTags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      
      if (['romantic', 'intimate', 'cozy'].includes(tagLower)) {
        archetypes[ARCHETYPES.ROMANTIC] += 0.3;
      }
      if (['calm', 'peaceful', 'quiet'].includes(tagLower)) {
        archetypes[ARCHETYPES.CALM_COZY] += 0.3;
      }
      if (['creative', 'artistic', 'inspired'].includes(tagLower)) {
        archetypes[ARCHETYPES.CREATIVE] += 0.3;
      }
      if (['social', 'buzzing', 'vibrant', 'energetic'].includes(tagLower)) {
        archetypes[ARCHETYPES.SOCIAL_BUZZING] += 0.3;
      }
      if (['thoughtful', 'deep', 'meaningful'].includes(tagLower)) {
        archetypes[ARCHETYPES.DEEP_INTELLECTUAL] += 0.3;
      }
      if (['active', 'energetic', 'dynamic'].includes(tagLower)) {
        archetypes[ARCHETYPES.ACTIVE_ENERGETIC] += 0.3;
      }
    });

    // Map venue types to archetypes
    venueTypes.forEach(type => {
      if (['restaurant', 'bar', 'cafe'].includes(type)) {
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
          archetypes[ARCHETYPES.ROMANTIC] += 0.2;
        } else {
          archetypes[ARCHETYPES.INTIMATE_LOCAL] += 0.2;
        }
      }
      if (['art_gallery', 'museum', 'book_store', 'library'].includes(type)) {
        archetypes[ARCHETYPES.CREATIVE] += 0.4;
        archetypes[ARCHETYPES.DEEP_INTELLECTUAL] += 0.3;
      }
      if (['park', 'hiking_area', 'beach', 'lake'].includes(type)) {
        archetypes[ARCHETYPES.NATURE_GROUNDED] += 0.4;
      }
      if (['night_club', 'music_venue'].includes(type)) {
        archetypes[ARCHETYPES.NIGHTLIFE] += 0.4;
        archetypes[ARCHETYPES.LIVE_ELECTRIC] += 0.3;
      }
      if (['shopping_mall', 'market'].includes(type)) {
        archetypes[ARCHETYPES.SOCIAL_BUZZING] += 0.3;
      }
    });

    // Time pattern matching
    if (timeOfDay === 'night') {
      archetypes[ARCHETYPES.NIGHTLIFE] += 0.2;
    }
    if (timeOfDay === 'morning') {
      archetypes[ARCHETYPES.NATURE_GROUNDED] += 0.1;
    }
  });

  // Normalize to 0..1 range
  const maxScore = Math.max(...Object.values(archetypes));
  if (maxScore > 0) {
    Object.keys(archetypes).forEach(arch => {
      archetypes[arch] = Math.min(1, archetypes[arch] / moments.length);
    });
  }

  return {
    archetypes,
    momentCount: moments.length,
    dominantArchetypes: getDominantArchetypes(archetypes, 3)
  };
}

/**
 * Calculate user's PlacesDNA profile from their logged moments
 */
export function calculateUserPlacesDNA(moments = []) {
  if (!moments || moments.length === 0) {
    return null;
  }

  const archetypes = {};
  Object.values(ARCHETYPES).forEach(arch => archetypes[arch] = 0);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  moments.forEach(moment => {
    const momentDate = new Date(moment.created_date);
    const daysSince = Math.floor((now - momentDate) / (24 * 60 * 60 * 1000));
    
    // Recency weight (exponential decay)
    const recencyWeight = Math.exp(-daysSince / 30); // Decays over ~30 days
    
    const moodTags = moment.mood_tags || [];
    const venueTypes = moment.venue_types || [];
    const timeOfDay = getTimeOfDay(moment.created_date);

    // Aggregate with recency weighting
    moodTags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      
      if (['romantic', 'intimate', 'cozy'].includes(tagLower)) {
        archetypes[ARCHETYPES.ROMANTIC] += 0.3 * recencyWeight;
      }
      if (['calm', 'peaceful', 'quiet'].includes(tagLower)) {
        archetypes[ARCHETYPES.CALM_COZY] += 0.3 * recencyWeight;
      }
      if (['creative', 'artistic', 'inspired'].includes(tagLower)) {
        archetypes[ARCHETYPES.CREATIVE] += 0.3 * recencyWeight;
      }
      if (['social', 'buzzing', 'vibrant'].includes(tagLower)) {
        archetypes[ARCHETYPES.SOCIAL_BUZZING] += 0.3 * recencyWeight;
      }
      if (['thoughtful', 'deep', 'meaningful'].includes(tagLower)) {
        archetypes[ARCHETYPES.DEEP_INTELLECTUAL] += 0.3 * recencyWeight;
      }
    });

    venueTypes.forEach(type => {
      if (['restaurant', 'bar', 'cafe'].includes(type)) {
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
          archetypes[ARCHETYPES.ROMANTIC] += 0.25 * recencyWeight;
        } else {
          archetypes[ARCHETYPES.CALM_COZY] += 0.2 * recencyWeight;
        }
      }
      if (['art_gallery', 'museum', 'book_store'].includes(type)) {
        archetypes[ARCHETYPES.CREATIVE] += 0.4 * recencyWeight;
      }
      if (['park', 'hiking_area', 'beach'].includes(type)) {
        archetypes[ARCHETYPES.NATURE_GROUNDED] += 0.4 * recencyWeight;
      }
      if (['night_club', 'music_venue'].includes(type)) {
        archetypes[ARCHETYPES.NIGHTLIFE] += 0.4 * recencyWeight;
      }
    });
  });

  // Normalize
  const totalWeight = moments.reduce((sum, moment) => {
    const daysSince = Math.floor((now - new Date(moment.created_date)) / (24 * 60 * 60 * 1000));
    return sum + Math.exp(-daysSince / 30);
  }, 0);

  if (totalWeight > 0) {
    Object.keys(archetypes).forEach(arch => {
      archetypes[arch] = Math.min(1, archetypes[arch] / totalWeight);
    });
  }

  return {
    archetypes,
    dominantArchetypes: getDominantArchetypes(archetypes, 3),
    rhythmProfile: calculateRhythmProfile(moments)
  };
}

/**
 * Calculate rhythm profile (time distribution)
 */
function calculateRhythmProfile(moments) {
  const rhythm = { morning: 0, day: 0, evening: 0, night: 0 };
  
  moments.forEach(moment => {
    const timeOfDay = getTimeOfDay(moment.created_date);
    if (timeOfDay === 'morning') rhythm.morning++;
    else if (timeOfDay === 'afternoon') rhythm.day++;
    else if (timeOfDay === 'evening') rhythm.evening++;
    else rhythm.night++;
  });

  const total = moments.length;
  return {
    morning: rhythm.morning / total,
    day: rhythm.day / total,
    evening: rhythm.evening / total,
    night: rhythm.night / total
  };
}

/**
 * Get top N dominant archetypes
 */
function getDominantArchetypes(archetypes, n = 3) {
  return Object.entries(archetypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .filter(([, score]) => score > 0.15)
    .map(([archetype, score]) => ({ archetype, score }));
}

/**
 * Cosine similarity between two archetype vectors
 */
export function cosineSimilarity(archA, archB) {
  if (!archA || !archB) return 0;

  const keys = Object.keys(archA);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  keys.forEach(key => {
    const a = archA[key] || 0;
    const b = archB[key] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  });

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Get archetype display info
 */
export function getArchetypeInfo(archetype) {
  const info = {
    [ARCHETYPES.ROMANTIC]: { label: 'Romantic', emoji: '💕', color: '#E74C78' },
    [ARCHETYPES.CALM_COZY]: { label: 'Calm & Cozy', emoji: '🕯️', color: '#C49A6C' },
    [ARCHETYPES.CREATIVE]: { label: 'Creative', emoji: '🎨', color: '#9B5DE5' },
    [ARCHETYPES.SOCIAL_BUZZING]: { label: 'Social & Buzzing', emoji: '🎉', color: '#FFB800' },
    [ARCHETYPES.NATURE_GROUNDED]: { label: 'Nature Grounded', emoji: '🌿', color: '#2DD881' },
    [ARCHETYPES.LIVE_ELECTRIC]: { label: 'Live & Electric', emoji: '⚡', color: '#F6C90E' },
    [ARCHETYPES.DEEP_INTELLECTUAL]: { label: 'Deep & Intellectual', emoji: '💭', color: '#4169E1' },
    [ARCHETYPES.ACTIVE_ENERGETIC]: { label: 'Active & Energetic', emoji: '🏃', color: '#FF4081' },
    [ARCHETYPES.NIGHTLIFE]: { label: 'Nightlife', emoji: '🌃', color: '#8A63F6' },
    [ARCHETYPES.INTIMATE_LOCAL]: { label: 'Intimate & Local', emoji: '🤫', color: '#8B7355' }
  };
  return info[archetype] || { label: archetype, emoji: '✨', color: '#E70F72' };
}

/**
 * Helper: Get time of day
 */
function getTimeOfDay(dateString) {
  const hour = new Date(dateString).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}