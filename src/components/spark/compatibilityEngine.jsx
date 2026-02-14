/**
 * Multi-Layer Compatibility Engine
 * Combines MBTI + PlacesDNA + Zone Overlap + Rhythm Alignment
 */

import { cosineSimilarity, calculateUserPlacesDNA } from './placesDnaEngine';

/**
 * MBTI Compatibility Matrix (16x16)
 */
const MBTI_COMPATIBILITY = {
  'ENFJ': { 'INFP': 95, 'ENFP': 92, 'INFJ': 90, 'ENFJ': 88, 'INTP': 85, 'ENTP': 83, 'INTJ': 80, 'ENTJ': 78 },
  'ENFP': { 'INFJ': 95, 'INTJ': 92, 'ENFJ': 90, 'ENFP': 88, 'INTP': 85, 'ENTP': 83, 'INFP': 82, 'ENTJ': 80 },
  'INFJ': { 'ENFP': 95, 'ENTP': 92, 'INFP': 90, 'ENFJ': 88, 'INTJ': 85, 'INFJ': 83, 'INTP': 80, 'ENTJ': 78 },
  'INFP': { 'ENFJ': 95, 'ENTJ': 92, 'INFJ': 90, 'ENFP': 88, 'INTJ': 85, 'INFP': 83, 'INTP': 80, 'ENTP': 78 },
  'ENTJ': { 'INTP': 95, 'INFP': 92, 'INTJ': 90, 'ENTP': 88, 'ENFJ': 85, 'ENTJ': 83, 'INFJ': 80, 'ENFP': 78 },
  'ENTP': { 'INFJ': 95, 'INTJ': 92, 'INTP': 90, 'ENFP': 88, 'ENTP': 85, 'ENTJ': 83, 'INFP': 80, 'ENFJ': 78 },
  'INTJ': { 'ENFP': 95, 'ENTP': 92, 'INFP': 90, 'INTJ': 88, 'ENTJ': 85, 'INFJ': 83, 'INTP': 80, 'ENFJ': 78 },
  'INTP': { 'ENTJ': 95, 'ENFJ': 92, 'ENTP': 90, 'INTJ': 88, 'INFJ': 85, 'INTP': 83, 'ENFP': 80, 'INFP': 78 },
  'ESFJ': { 'ISFP': 95, 'ESFP': 92, 'ISFJ': 90, 'ESTP': 88, 'ESFJ': 85, 'ISTP': 83, 'ISTJ': 80, 'ESTJ': 78 },
  'ESFP': { 'ISFJ': 95, 'ISTJ': 92, 'ESFJ': 90, 'ISFP': 88, 'ESTP': 85, 'ESFP': 83, 'ISTP': 80, 'ESTJ': 78 },
  'ISFJ': { 'ESFP': 95, 'ESTP': 92, 'ISFP': 90, 'ESFJ': 88, 'ISTJ': 85, 'ISFJ': 83, 'ISTP': 80, 'ESTJ': 78 },
  'ISFP': { 'ESFJ': 95, 'ESTJ': 92, 'ISFJ': 90, 'ESFP': 88, 'ISTJ': 85, 'ISFP': 83, 'ESTP': 80, 'ISTP': 78 },
  'ESTJ': { 'ISTP': 95, 'ISFP': 92, 'ISTJ': 90, 'ESTP': 88, 'ESFJ': 85, 'ESTJ': 83, 'ISFJ': 80, 'ESFP': 78 },
  'ESTP': { 'ISFJ': 95, 'ISTJ': 92, 'ISTP': 90, 'ESFP': 88, 'ESTP': 85, 'ESTJ': 83, 'ISFP': 80, 'ESFJ': 78 },
  'ISTJ': { 'ESFP': 95, 'ESTP': 92, 'ISFP': 90, 'ISTJ': 88, 'ESTJ': 85, 'ISFJ': 83, 'ISTP': 80, 'ESFJ': 78 },
  'ISTP': { 'ESTJ': 95, 'ESFJ': 92, 'ESTP': 90, 'ISTJ': 88, 'ISTP': 85, 'ISFJ': 83, 'ESFP': 80, 'ISFP': 78 }
};

/**
 * Get MBTI base compatibility score (0-100)
 */
export function getMBTIScore(typeA, typeB) {
  if (!typeA || !typeB) return 70; // Default middle score
  
  const scoreA = MBTI_COMPATIBILITY[typeA]?.[typeB];
  const scoreB = MBTI_COMPATIBILITY[typeB]?.[typeA];
  
  if (scoreA) return scoreA;
  if (scoreB) return scoreB;
  
  // Fallback: calculate basic compatibility
  let score = 70;
  
  // Same type bonus
  if (typeA === typeB) score += 10;
  
  // E/I balance (opposites attract)
  if (typeA[0] !== typeB[0]) score += 5;
  
  // N/S compatibility (same is better for long-term)
  if (typeA[1] === typeB[1]) score += 5;
  
  // F/T balance
  if (typeA[2] !== typeB[2]) score += 3;
  
  // P/J balance
  if (typeA[3] !== typeB[3]) score += 2;
  
  return Math.min(100, score);
}

/**
 * Calculate PlacesDNA alignment score (0-100)
 */
export function getPlacesDNAScore(momentsA, momentsB) {
  const profileA = calculateUserPlacesDNA(momentsA);
  const profileB = calculateUserPlacesDNA(momentsB);
  
  if (!profileA || !profileB) return 50; // Default if no data
  
  const similarity = cosineSimilarity(profileA.archetypes, profileB.archetypes);
  return Math.round(similarity * 100);
}

/**
 * Calculate zone overlap score (0-100)
 * Based on shared location proximity
 */
export function getZoneOverlapScore(momentsA, momentsB) {
  if (!momentsA?.length || !momentsB?.length) return 0;
  
  // Create location clusters (simplified geohash matching)
  const zonesA = new Set(momentsA.map(m => m.geohash?.substring(0, 5)).filter(Boolean));
  const zonesB = new Set(momentsB.map(m => m.geohash?.substring(0, 5)).filter(Boolean));
  
  if (zonesA.size === 0 || zonesB.size === 0) return 0;
  
  // Calculate Jaccard similarity
  const intersection = new Set([...zonesA].filter(x => zonesB.has(x)));
  const union = new Set([...zonesA, ...zonesB]);
  
  const overlap = intersection.size / union.size;
  return Math.round(overlap * 100);
}

/**
 * Calculate rhythm alignment score (0-100)
 * Based on time-of-day patterns
 */
export function getRhythmAlignmentScore(momentsA, momentsB) {
  if (!momentsA?.length || !momentsB?.length) return 50;
  
  const profileA = calculateUserPlacesDNA(momentsA);
  const profileB = calculateUserPlacesDNA(momentsB);
  
  if (!profileA?.rhythmProfile || !profileB?.rhythmProfile) return 50;
  
  const rhythmA = profileA.rhythmProfile;
  const rhythmB = profileB.rhythmProfile;
  
  // Cosine similarity for rhythm vectors
  const dotProduct = 
    rhythmA.morning * rhythmB.morning +
    rhythmA.day * rhythmB.day +
    rhythmA.evening * rhythmB.evening +
    rhythmA.night * rhythmB.night;
  
  const magA = Math.sqrt(
    rhythmA.morning ** 2 + rhythmA.day ** 2 + 
    rhythmA.evening ** 2 + rhythmA.night ** 2
  );
  const magB = Math.sqrt(
    rhythmB.morning ** 2 + rhythmB.day ** 2 + 
    rhythmB.evening ** 2 + rhythmB.night ** 2
  );
  
  const similarity = magA * magB === 0 ? 0 : dotProduct / (magA * magB);
  return Math.round(similarity * 100);
}

/**
 * Multi-layer compatibility calculation
 */
export function calculateCompatibility(profileA, profileB, momentsA = [], momentsB = []) {
  // Layer 1: MBTI Base Score (40% weight)
  const mbtiScore = getMBTIScore(profileA.mbti_type, profileB.mbti_type);
  
  // Layer 2: PlacesDNA Alignment (30% weight)
  const placesScore = getPlacesDNAScore(momentsA, momentsB);
  
  // Layer 3: Zone Overlap (20% weight)
  const zoneScore = getZoneOverlapScore(momentsA, momentsB);
  
  // Layer 4: Rhythm Alignment (10% weight)
  const rhythmScore = getRhythmAlignmentScore(momentsA, momentsB);
  
  // Weighted combination
  const finalScore = Math.round(
    mbtiScore * 0.4 +
    placesScore * 0.3 +
    zoneScore * 0.2 +
    rhythmScore * 0.1
  );
  
  return {
    total: finalScore,
    breakdown: {
      mbti: mbtiScore,
      places: placesScore,
      zones: zoneScore,
      rhythm: rhythmScore
    }
  };
}

/**
 * Generate compatibility label based on pattern
 */
export function getCompatibilityLabel(compatibility) {
  const { breakdown } = compatibility;
  
  const mbtiHigh = breakdown.mbti >= 85;
  const placesHigh = breakdown.places >= 70;
  const zonesHigh = breakdown.zones >= 60;
  
  if (mbtiHigh && placesHigh && zonesHigh) {
    return { label: '🔥 Lifestyle Mirror', description: 'Same wavelength, same world' };
  }
  
  if (mbtiHigh && !placesHigh) {
    return { label: '⚡ Chemistry + Contrast', description: 'Strong connection, fresh perspectives' };
  }
  
  if (!mbtiHigh && placesHigh) {
    return { label: '💫 Mind Opposites, Same World', description: 'Different minds, shared spaces' };
  }
  
  if (placesHigh && zonesHigh) {
    return { label: '🌍 World Aligned', description: 'You navigate the same landscapes' };
  }
  
  if (mbtiHigh) {
    return { label: '💞 Personality Match', description: 'Natural mental connection' };
  }
  
  if (compatibility.total >= 75) {
    return { label: '✨ Strong Connection', description: 'Multiple points of alignment' };
  }
  
  return { label: '💫 Promising Spark', description: 'Interesting compatibility potential' };
}