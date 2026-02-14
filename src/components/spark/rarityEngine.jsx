// PlacesDNA Rarity Engine
// Calculates how rare a user's archetype combination is

/**
 * Get rarity tier based on frequency
 * @param {number} frequency - 0 to 1
 * @returns {object} tier info
 */
export function getRarityTier(frequency) {
  if (frequency >= 0.12) {
    return {
      tier: 'common',
      label: 'Common',
      color: '#8B7355',
      emoji: '✨',
      hidden: true // Don't show for common
    };
  } else if (frequency >= 0.06) {
    return {
      tier: 'uncommon',
      label: 'Uncommon',
      color: '#4169E1',
      emoji: '💫'
    };
  } else if (frequency >= 0.02) {
    return {
      tier: 'rare',
      label: 'Rare',
      color: '#9B5DE5',
      emoji: '⚡'
    };
  } else {
    return {
      tier: 'ultra_rare',
      label: 'Ultra-Rare',
      color: '#FFB800',
      emoji: '🌟'
    };
  }
}

/**
 * Calculate archetype pair rarity
 * For MVP, use static estimates based on archetype popularity
 * In production, this would query aggregated city stats
 */
export function calculateArchetypeRarity(primaryArchetype, secondaryArchetype, city = 'London') {
  // Static rarity estimates (will be replaced with real data)
  const archetypeFrequencies = {
    // Common combos (12%+)
    'Social+Buzzing': 0.15,
    'Calm+Cozy': 0.14,
    'Creative+Artistic': 0.13,
    
    // Uncommon combos (6-12%)
    'Romantic+Intimate': 0.11,
    'Active+Energetic': 0.10,
    'Deep+Intellectual': 0.09,
    'Nature+Grounded': 0.08,
    'Live+Electric': 0.07,
    
    // Rare combos (2-6%)
    'Romantic+Creative': 0.05,
    'Deep+Calm': 0.04,
    'Creative+Nature': 0.04,
    'Social+Live': 0.03,
    'Active+Nature': 0.03,
    
    // Ultra-rare combos (<2%)
    'Romantic+Deep': 0.018,
    'Creative+Deep': 0.015,
    'Nature+Calm': 0.012,
    'Intimate+Creative': 0.010,
    'Romantic+Nature': 0.008
  };
  
  const pairKey = `${primaryArchetype}+${secondaryArchetype}`;
  const reversePairKey = `${secondaryArchetype}+${primaryArchetype}`;
  
  // Check both directions
  let frequency = archetypeFrequencies[pairKey] || archetypeFrequencies[reversePairKey];
  
  // Default to uncommon if not found
  if (!frequency) {
    frequency = 0.08;
  }
  
  const tier = getRarityTier(frequency);
  const rarity = 1 - frequency;
  
  return {
    frequency,
    rarity,
    percentage: (frequency * 100).toFixed(1),
    tier: tier.tier,
    label: tier.label,
    color: tier.color,
    emoji: tier.emoji,
    hidden: tier.hidden,
    city
  };
}

/**
 * Calculate zone rarity
 * How common is this zone's DNA in the city
 */
export function calculateZoneRarity(zone, city = 'London') {
  // For MVP, estimate based on primary archetype
  // In production, aggregate zone cluster data
  
  const zonePopularity = {
    'Social+Buzzing': 0.18,
    'Calm+Cozy': 0.16,
    'Creative+Artistic': 0.14,
    'Romantic+Intimate': 0.12,
    'Live+Electric': 0.10,
    'Active+Energetic': 0.09,
    'Deep+Intellectual': 0.08,
    'Nature+Grounded': 0.07,
    'Intimate+Local': 0.04,
    'Creative+Nature': 0.02
  };
  
  const pairKey = `${zone.primaryArchetype}+${zone.secondaryArchetype || zone.primaryArchetype}`;
  const frequency = zonePopularity[pairKey] || 0.10;
  
  const tier = getRarityTier(frequency);
  
  return {
    frequency,
    percentage: (frequency * 100).toFixed(1),
    tier: tier.tier,
    label: tier.label,
    color: tier.color,
    emoji: tier.emoji,
    hidden: tier.hidden
  };
}

/**
 * Calculate match rarity
 * How rare is this specific pairing
 */
export function calculateMatchRarity(myProfile, theirProfile, myMoments = [], theirMoments = []) {
  // Combination of:
  // 1. Archetype pair rarity
  // 2. Zone overlap rarity
  // 3. Rhythm alignment rarity
  
  // For MVP, focus on archetype pairing
  const myTopPair = `${myProfile.placesDna?.primary || 'Social'}+${myProfile.placesDna?.secondary || 'Buzzing'}`;
  const theirTopPair = `${theirProfile.placesDna?.primary || 'Calm'}+${theirProfile.placesDna?.secondary || 'Cozy'}`;
  
  const matchPairings = {
    // Ultra-rare pairings (<2%)
    'Romantic+Creative:Deep+Intellectual': 0.008,
    'Romantic+Intimate:Creative+Artistic': 0.012,
    'Creative+Nature:Deep+Calm': 0.015,
    
    // Rare pairings (2-6%)
    'Romantic+Creative:Calm+Cozy': 0.025,
    'Deep+Intellectual:Creative+Artistic': 0.032,
    'Social+Buzzing:Live+Electric': 0.045,
    'Active+Energetic:Nature+Grounded': 0.055,
    
    // Uncommon pairings (6-12%)
    'Romantic+Intimate:Calm+Cozy': 0.075,
    'Creative+Artistic:Deep+Intellectual': 0.088,
    'Social+Buzzing:Active+Energetic': 0.095,
    
    // Common pairings (12%+)
    'Social+Buzzing:Social+Buzzing': 0.18,
    'Calm+Cozy:Calm+Cozy': 0.16,
    'Creative+Artistic:Creative+Artistic': 0.14
  };
  
  const pairKey = `${myTopPair}:${theirTopPair}`;
  const reversePairKey = `${theirTopPair}:${myTopPair}`;
  
  let frequency = matchPairings[pairKey] || matchPairings[reversePairKey];
  
  if (!frequency) {
    frequency = 0.08; // Default uncommon
  }
  
  const tier = getRarityTier(frequency);
  
  return {
    frequency,
    percentage: (frequency * 100).toFixed(1),
    tier: tier.tier,
    label: tier.label,
    color: tier.color,
    emoji: tier.emoji,
    hidden: tier.hidden,
    description: getRarityDescription(tier.tier, 'match')
  };
}

/**
 * Get descriptive text for rarity
 */
function getRarityDescription(tier, type = 'profile') {
  const descriptions = {
    profile: {
      uncommon: "Your vibe is distinctive",
      rare: "Your combination stands out",
      ultra_rare: "Your profile is uniquely magnetic"
    },
    match: {
      uncommon: "A notable connection",
      rare: "Rare alignment detected",
      ultra_rare: "Lightning in a bottle"
    },
    zone: {
      uncommon: "Distinctive zone energy",
      rare: "Rare zone combination",
      ultra_rare: "One-of-a-kind hotspot"
    }
  };
  
  return descriptions[type]?.[tier] || '';
}

/**
 * Generate rarity insights for premium users
 */
export function generateRarityInsights(rarityData, isPremium) {
  if (!isPremium || rarityData.tier === 'common') {
    return null;
  }
  
  const insights = {
    uncommon: [
      `Top ${100 - rarityData.frequency * 100}% in ${rarityData.city}`,
      `${rarityData.percentage}% of users share this vibe`,
      "Your combination has a distinctive edge"
    ],
    rare: [
      `Top ${(rarityData.rarity * 100).toFixed(1)}% rarity in ${rarityData.city}`,
      `Only ${rarityData.percentage}% match your energy`,
      "This combination creates magnetic chemistry",
      "People with your vibe are highly sought after"
    ],
    ultra_rare: [
      `Ultra-rare: Top ${(rarityData.rarity * 100).toFixed(2)}% in ${rarityData.city}`,
      `Only ${rarityData.percentage}% of users share your DNA`,
      "Your combination is one-of-a-kind",
      "You create sparks that most people never encounter",
      "Matches with you are lightning in a bottle"
    ]
  };
  
  return insights[rarityData.tier] || [];
}