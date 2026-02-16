/**
 * PlacesDNA Engine V1 - Locked Weighting Model
 * Multi-channel evidence-based archetype scoring
 * Now integrated with Google Places API data
 */

import { getArchetypeScoresFromPlace, filterRelevantTypes } from './placeTypeMapper';

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

// LOCKED WEIGHTS V1
const WEIGHTS = {
  category: 0.28,
  vibeTags: 0.26,
  signals: 0.20,
  time: 0.16,
  consistency: 0.10
};

// CATEGORY PRIOR MAPPING
const CATEGORY_MAP = {
  cafe: { calm_cozy: 0.8, intimate_local: 0.55, deep_intellectual: 0.35 },
  restaurant: { romantic: 0.65, intimate_local: 0.5, calm_cozy: 0.3 },
  bar: { social_buzzing: 0.7, romantic: 0.45, live_electric: 0.4 },
  wine_bar: { romantic: 0.85, intimate_local: 0.5, live_electric: 0.25 },
  night_club: { nightlife: 0.95, social_buzzing: 0.65, live_electric: 0.6 },
  art_gallery: { creative: 0.9, deep_intellectual: 0.5, calm_cozy: 0.3 },
  museum: { creative: 0.9, deep_intellectual: 0.5, calm_cozy: 0.3 },
  park: { nature_grounded: 0.95, calm_cozy: 0.35, active_energetic: 0.25 },
  beach: { nature_grounded: 0.9, active_energetic: 0.4, calm_cozy: 0.3 },
  gym: { active_energetic: 0.95, social_buzzing: 0.2 },
  music_venue: { live_electric: 0.95, nightlife: 0.55, social_buzzing: 0.55 },
  concert_hall: { live_electric: 0.85, creative: 0.4, deep_intellectual: 0.3 },
  movie_theater: { creative: 0.6, romantic: 0.4, calm_cozy: 0.3 },
  library: { deep_intellectual: 0.95, calm_cozy: 0.5 },
  bookstore: { deep_intellectual: 0.75, creative: 0.5, calm_cozy: 0.4 },
  shopping_mall: { social_buzzing: 0.7, active_energetic: 0.3 },
  market: { social_buzzing: 0.65, intimate_local: 0.45, nature_grounded: 0.2 },
  spa: { calm_cozy: 0.9, romantic: 0.4 },
  hiking_area: { nature_grounded: 0.95, active_energetic: 0.7 },
  sports_complex: { active_energetic: 0.9, social_buzzing: 0.4 },
  coworking_space: { deep_intellectual: 0.6, calm_cozy: 0.4, social_buzzing: 0.3 }
};

// VIBE TAG TO ARCHETYPE WEIGHTS
const TAG_WEIGHTS = {
  romantic: { romantic: 0.9, intimate_local: 0.2 },
  intimate: { romantic: 0.7, intimate_local: 0.6, calm_cozy: 0.3 },
  cozy: { calm_cozy: 0.8, intimate_local: 0.4 },
  calm: { calm_cozy: 0.8, nature_grounded: 0.3 },
  peaceful: { calm_cozy: 0.75, nature_grounded: 0.4, deep_intellectual: 0.2 },
  quiet: { calm_cozy: 0.7, intimate_local: 0.3, deep_intellectual: 0.2 },
  creative: { creative: 0.9, deep_intellectual: 0.2 },
  artistic: { creative: 0.85, deep_intellectual: 0.25 },
  inspired: { creative: 0.7, deep_intellectual: 0.3 },
  social: { social_buzzing: 0.9, live_electric: 0.2 },
  buzzing: { social_buzzing: 0.85, live_electric: 0.4 },
  vibrant: { social_buzzing: 0.75, live_electric: 0.5, nightlife: 0.3 },
  energetic: { active_energetic: 0.8, social_buzzing: 0.4, live_electric: 0.3 },
  thoughtful: { deep_intellectual: 0.85, calm_cozy: 0.3 },
  deep: { deep_intellectual: 0.9, romantic: 0.2 },
  meaningful: { deep_intellectual: 0.75, romantic: 0.3, creative: 0.2 },
  active: { active_energetic: 0.9, social_buzzing: 0.2 },
  natural: { nature_grounded: 0.85, calm_cozy: 0.3 },
  spontaneous: { live_electric: 0.7, social_buzzing: 0.5, nightlife: 0.3 },
  adventurous: { active_energetic: 0.75, nature_grounded: 0.5, social_buzzing: 0.3 },
  flirty: { romantic: 0.7, social_buzzing: 0.4 },
  local: { intimate_local: 0.9, calm_cozy: 0.3 }
};

// SIGNAL TO ARCHETYPE MAPPING
const SIGNAL_MAP = {
  'env_romantic_atmosphere': { romantic: 0.9, intimate_local: 0.2 },
  'env_cozy_core': { calm_cozy: 0.85, intimate_local: 0.3 },
  'env_creative_spaces': { creative: 0.8, deep_intellectual: 0.2 },
  'env_city_buzz': { social_buzzing: 0.8, live_electric: 0.4 },
  'env_nature_drawn': { nature_grounded: 0.9, calm_cozy: 0.2 },
  'env_live_electric': { live_electric: 0.85, nightlife: 0.4, social_buzzing: 0.3 },
  'env_deep_intellectual': { deep_intellectual: 0.7, calm_cozy: 0.2 },
  'env_active_energy': { active_energetic: 0.85, social_buzzing: 0.3 },
  'rhythm_night_energy': { nightlife: 0.7, live_electric: 0.4, social_buzzing: 0.3 },
  'rhythm_early_bird': { active_energetic: 0.6, nature_grounded: 0.4 },
  'social_intimate_circles': { intimate_local: 0.7, calm_cozy: 0.3, romantic: 0.2 },
  'social_social_butterfly': { social_buzzing: 0.8, live_electric: 0.3 },
  'comm_deep_talker': { deep_intellectual: 0.7, romantic: 0.3, calm_cozy: 0.2 },
  'comm_light_banter': { social_buzzing: 0.6, live_electric: 0.3 }
};

// TIME SIGNATURE WEIGHTS
const TIME_SIGNATURES = {
  nightlife: { night: 0.7, late: 1.0 },
  romantic: { evening: 0.8, night: 0.35 },
  calm_cozy: { morning: 0.65, day: 0.55, evening: 0.25 },
  creative: { evening: 0.55, day: 0.4, night: 0.2 },
  active_energetic: { morning: 0.6, day: 0.5 },
  social_buzzing: { day: 0.5, evening: 0.6, night: 0.4 },
  live_electric: { evening: 0.7, night: 0.6, late: 0.5 },
  deep_intellectual: { day: 0.5, evening: 0.45, morning: 0.3 },
  nature_grounded: { morning: 0.7, day: 0.6, evening: 0.2 },
  intimate_local: { evening: 0.5, day: 0.4, night: 0.3 }
};

/**
 * Calculate archetype scores for a place using multi-channel evidence model
 * Now supports Google Places data for deterministic categorization
 */
export function calculatePlaceDNA(moments = [], primaryCategory = null, placeData = null) {
  if (!moments || moments.length === 0) {
    return null;
  }

  const archetypes = {};
  Object.values(ARCHETYPES).forEach(arch => archetypes[arch] = 0);

  // If we have Google Places data, use deterministic scoring
  if (placeData) {
    const placeScores = getArchetypeScoresFromPlace(placeData);
    Object.entries(placeScores).forEach(([arch, score]) => {
      archetypes[arch] = score;
    });
  } else {
    // Fallback to legacy multi-channel evidence model
    const prelimScores = {};
    Object.values(ARCHETYPES).forEach(arch => {
      const C = calculateCategoryPrior(primaryCategory, arch);
      const V = calculateVibeScore(moments, arch);
      const S = calculateSignalScore(moments, arch);
      const T = calculateTimeSignature(moments, arch);
      
      prelimScores[arch] = clamp(
        WEIGHTS.category * C +
        WEIGHTS.vibeTags * V +
        WEIGHTS.signals * S +
        WEIGHTS.time * T,
        0, 1
      );
    });

    // Calculate consistency bonus
    const K = calculateConsistency(prelimScores);

    // Final scores with consistency
    Object.values(ARCHETYPES).forEach(arch => {
      archetypes[arch] = clamp(
        prelimScores[arch] + WEIGHTS.consistency * K * prelimScores[arch],
        0, 1
      );
    });
  }

  const sorted = Object.entries(archetypes)
    .sort(([, a], [, b]) => b - a);

  const top2 = sorted.slice(0, 2).map(([arch]) => arch);
  const confidence = sorted.length >= 3 
    ? getConfidenceLevel(sorted[0][1] - sorted[2][1])
    : 'High';

  return {
    archetypes,
    momentCount: moments.length,
    topArchetypes: top2,
    confidence,
    dominantArchetypes: getDominantArchetypes(archetypes, 3)
  };
}

/**
 * 1. Category Prior C(p, a)
 */
function calculateCategoryPrior(category, archetype) {
  if (!category) return 0;
  const catKey = category.toLowerCase().replace(/_/g, '_');
  return CATEGORY_MAP[catKey]?.[archetype] || 0;
}

/**
 * 2. Vibe Tags V(p, a)
 */
function calculateVibeScore(moments, archetype) {
  if (moments.length === 0) return 0;

  const now = new Date();
  let weightedSum = 0;
  let totalWeight = 0;

  moments.forEach(moment => {
    const w = getMomentWeight(moment, now);
    const moodTags = moment.mood_tags || [];
    
    let tagScore = 0;
    moodTags.forEach(tag => {
      const tagKey = tag.toLowerCase();
      tagScore += TAG_WEIGHTS[tagKey]?.[archetype] || 0;
    });

    weightedSum += w * clamp(tagScore, 0, 1);
    totalWeight += w;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * 3. Signals Distribution S(p, a)
 */
function calculateSignalScore(moments, archetype) {
  if (moments.length === 0) return 0;

  const now = new Date();
  let weightedSum = 0;
  let totalWeight = 0;

  moments.forEach(moment => {
    const w = getMomentWeight(moment, now);
    // Extract user signals from moment metadata if available
    const userSignals = moment.user_signals || [];
    
    let signalScore = 0;
    userSignals.forEach(signal => {
      signalScore += SIGNAL_MAP[signal.id]?.[archetype] || 0;
    });

    weightedSum += w * clamp(signalScore, 0, 1);
    totalWeight += w;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * 4. Time Signature T(p, a)
 */
function calculateTimeSignature(moments, archetype) {
  if (moments.length === 0) return 0;

  const now = new Date();
  const timeDist = { morning: 0, day: 0, evening: 0, night: 0, late: 0 };
  let totalWeight = 0;

  moments.forEach(moment => {
    const w = getMomentWeight(moment, now);
    const bucket = getTimeBucket(moment.created_date);
    timeDist[bucket] += w;
    totalWeight += w;
  });

  // Normalize distribution
  Object.keys(timeDist).forEach(bucket => {
    timeDist[bucket] = totalWeight > 0 ? timeDist[bucket] / totalWeight : 0;
  });

  // Apply archetype-specific time weights
  const timeWeights = TIME_SIGNATURES[archetype] || {};
  let score = 0;
  Object.entries(timeWeights).forEach(([bucket, weight]) => {
    score += timeDist[bucket] * weight;
  });

  return clamp(score, 0, 1);
}

/**
 * 5. Consistency K(p)
 */
function calculateConsistency(scores) {
  const values = Object.values(scores);
  const sum = values.reduce((a, b) => a + b, 0);
  
  if (sum === 0) return 0;

  // Normalize to probability distribution
  const probs = values.map(v => v / sum);
  
  // Calculate entropy
  let entropy = 0;
  probs.forEach(p => {
    if (p > 0) {
      entropy -= p * Math.log(p);
    }
  });

  const maxEntropy = Math.log(Object.keys(ARCHETYPES).length);
  return 1 - (entropy / maxEntropy);
}

/**
 * Moment weight: recency + intensity + dwell
 */
function getMomentWeight(moment, now) {
  const daysSince = Math.floor((now - new Date(moment.created_date)) / (24 * 60 * 60 * 1000));
  const recency = Math.exp(-daysSince / 45); // 45-day decay
  const intensity = 0.6; // Default intensity
  const dwell = 0.5; // Default dwell
  
  return 0.55 * recency + 0.25 * intensity + 0.20 * dwell;
}

/**
 * Get confidence level from score gap
 */
function getConfidenceLevel(gap) {
  if (gap > 0.3) return 'High';
  if (gap > 0.15) return 'Medium';
  return 'Low';
}

/**
 * Get time bucket with late-night support
 */
function getTimeBucket(dateString) {
  const hour = new Date(dateString).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 2) return 'night';
  return 'late'; // 2-5 AM
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

    // Filter out generic types before processing
    const relevantTypes = filterRelevantTypes(venueTypes);
    
    relevantTypes.forEach(type => {
      if (['restaurant', 'bar', 'cafe', 'coffee_shop'].includes(type)) {
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
          archetypes[ARCHETYPES.ROMANTIC] += 0.25 * recencyWeight;
        } else {
          archetypes[ARCHETYPES.CALM_COZY] += 0.2 * recencyWeight;
        }
      }
      if (['art_gallery', 'museum', 'book_store'].includes(type)) {
        archetypes[ARCHETYPES.CREATIVE] += 0.4 * recencyWeight;
      }
      if (['park', 'hiking_area', 'beach', 'garden', 'botanical_garden'].includes(type)) {
        archetypes[ARCHETYPES.NATURE_GROUNDED] += 0.4 * recencyWeight;
      }
      if (['night_club', 'music_venue', 'live_music_bar', 'karaoke'].includes(type)) {
        archetypes[ARCHETYPES.NIGHTLIFE] += 0.4 * recencyWeight;
      }
      if (['gym', 'fitness_center', 'yoga_studio', 'sports_complex'].includes(type)) {
        archetypes[ARCHETYPES.ACTIVE_ENERGETIC] += 0.4 * recencyWeight;
      }
      if (['wine_bar', 'cocktail_bar'].includes(type)) {
        archetypes[ARCHETYPES.ROMANTIC] += 0.35 * recencyWeight;
        archetypes[ARCHETYPES.INTIMATE_LOCAL] += 0.25 * recencyWeight;
      }
      if (['library', 'book_store', 'university', 'coworking_space'].includes(type)) {
        archetypes[ARCHETYPES.DEEP_INTELLECTUAL] += 0.35 * recencyWeight;
      }
      if (['concert_hall', 'performing_arts_theater', 'stadium'].includes(type)) {
        archetypes[ARCHETYPES.LIVE_ELECTRIC] += 0.4 * recencyWeight;
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