/**
 * PlacesDNA Type Mapper - Deterministic Google Places API Integration
 * Maps Google Place types to PlacesDNA archetypes with multi-channel evidence
 */

// Generic types to ignore (not useful for categorization)
const GENERIC_TYPES = new Set([
  'point_of_interest',
  'establishment',
  'food',
  'store',
  'political',
  'finance',
  'health',
  'government',
  'locality',
  'premise'
]);

// DETERMINISTIC PRIMARY TYPE → ARCHETYPES MAPPING
export const PRIMARY_TYPE_MAP = {
  // 🏙 FOOD & DRINK
  'restaurant': { romantic: 0.65, intimate_local: 0.5, calm_cozy: 0.3 },
  'bar': { social_buzzing: 0.7, romantic: 0.45, live_electric: 0.4 },
  'cafe': { calm_cozy: 0.8, intimate_local: 0.55, deep_intellectual: 0.35 },
  'coffee_shop': { calm_cozy: 0.8, intimate_local: 0.55, deep_intellectual: 0.35 },
  'bakery': { calm_cozy: 0.7, intimate_local: 0.5 },
  'fast_food_restaurant': { social_buzzing: 0.4, active_energetic: 0.3 },
  'fine_dining_restaurant': { romantic: 0.85, intimate_local: 0.4 },
  'ice_cream_shop': { social_buzzing: 0.5, calm_cozy: 0.4 },
  'tea_house': { calm_cozy: 0.85, intimate_local: 0.5, deep_intellectual: 0.3 },
  'pub': { social_buzzing: 0.75, intimate_local: 0.45 },
  'wine_bar': { romantic: 0.85, intimate_local: 0.5, live_electric: 0.25 },
  'brewery': { social_buzzing: 0.7, intimate_local: 0.4 },
  'cocktail_bar': { romantic: 0.75, social_buzzing: 0.5, live_electric: 0.4 },
  'night_club': { nightlife: 0.95, social_buzzing: 0.65, live_electric: 0.6 },
  'karaoke': { social_buzzing: 0.8, live_electric: 0.6, nightlife: 0.4 },
  'live_music_bar': { live_electric: 0.9, nightlife: 0.5, social_buzzing: 0.5 },

  // 🎭 ARTS, CULTURE & CREATIVE
  'art_gallery': { creative: 0.9, deep_intellectual: 0.5, calm_cozy: 0.3 },
  'museum': { creative: 0.9, deep_intellectual: 0.5, calm_cozy: 0.3 },
  'performing_arts_theater': { creative: 0.85, live_electric: 0.6, deep_intellectual: 0.4 },
  'theater': { creative: 0.85, live_electric: 0.6, deep_intellectual: 0.4 },
  'movie_theater': { creative: 0.6, romantic: 0.4, calm_cozy: 0.3 },
  'concert_hall': { live_electric: 0.85, creative: 0.4, deep_intellectual: 0.3 },
  'opera_house': { creative: 0.8, romantic: 0.6, deep_intellectual: 0.5 },
  'cultural_center': { creative: 0.75, deep_intellectual: 0.5, social_buzzing: 0.3 },
  'library': { deep_intellectual: 0.95, calm_cozy: 0.5 },
  'book_store': { deep_intellectual: 0.75, creative: 0.5, calm_cozy: 0.4 },
  'record_store': { creative: 0.7, intimate_local: 0.5 },
  'comedy_club': { social_buzzing: 0.8, live_electric: 0.6 },

  // 🌿 OUTDOOR & NATURE
  'park': { nature_grounded: 0.95, calm_cozy: 0.35, active_energetic: 0.25 },
  'national_park': { nature_grounded: 0.95, active_energetic: 0.6 },
  'garden': { nature_grounded: 0.9, calm_cozy: 0.5 },
  'botanical_garden': { nature_grounded: 0.9, creative: 0.4, calm_cozy: 0.5 },
  'beach': { nature_grounded: 0.9, active_energetic: 0.4, calm_cozy: 0.3 },
  'campground': { nature_grounded: 0.85, active_energetic: 0.5 },
  'hiking_area': { nature_grounded: 0.95, active_energetic: 0.7 },
  'tourist_attraction': { social_buzzing: 0.5, creative: 0.4 },
  'marina': { nature_grounded: 0.6, calm_cozy: 0.4 },
  'plaza': { social_buzzing: 0.6, intimate_local: 0.4 },
  'square': { social_buzzing: 0.6, intimate_local: 0.4 },

  // 🏋️ FITNESS & ACTIVE
  'gym': { active_energetic: 0.95, social_buzzing: 0.2 },
  'fitness_center': { active_energetic: 0.95, social_buzzing: 0.2 },
  'yoga_studio': { calm_cozy: 0.7, active_energetic: 0.6, nature_grounded: 0.3 },
  'sports_club': { active_energetic: 0.85, social_buzzing: 0.4 },
  'stadium': { live_electric: 0.7, social_buzzing: 0.7, active_energetic: 0.4 },
  'sports_complex': { active_energetic: 0.9, social_buzzing: 0.4 },
  'swimming_pool': { active_energetic: 0.7, calm_cozy: 0.3 },
  'bowling_alley': { social_buzzing: 0.7, active_energetic: 0.4 },
  'climbing_gym': { active_energetic: 0.85, nature_grounded: 0.3 },

  // 🛍 SOCIAL & COMMERCIAL
  'shopping_mall': { social_buzzing: 0.7, active_energetic: 0.3 },
  'market': { social_buzzing: 0.65, intimate_local: 0.45, nature_grounded: 0.2 },
  'farmers_market': { intimate_local: 0.75, nature_grounded: 0.5, social_buzzing: 0.4 },

  // 🏢 WORK / SOCIAL HUBS
  'coworking_space': { deep_intellectual: 0.6, calm_cozy: 0.4, social_buzzing: 0.3 },
  'university': { deep_intellectual: 0.8, creative: 0.4, social_buzzing: 0.3 },
  'college': { deep_intellectual: 0.8, creative: 0.4, social_buzzing: 0.3 },

  // 🎉 EVENTS & ENTERTAINMENT
  'event_venue': { live_electric: 0.75, social_buzzing: 0.6 },
  'amusement_park': { active_energetic: 0.7, social_buzzing: 0.6 },
  'arcade': { social_buzzing: 0.7, nightlife: 0.3 },
  'casino': { nightlife: 0.7, live_electric: 0.5, social_buzzing: 0.5 },

  // 🏨 TRAVEL & HOSPITALITY
  'hotel': { romantic: 0.5, calm_cozy: 0.4 },
  'resort_hotel': { romantic: 0.6, calm_cozy: 0.5, nature_grounded: 0.3 },
  'spa': { calm_cozy: 0.9, romantic: 0.4 },
  'sauna': { calm_cozy: 0.8, nature_grounded: 0.3 },

  // 🏛 RELIGIOUS & COMMUNITY
  'church': { calm_cozy: 0.7, deep_intellectual: 0.4 },
  'mosque': { calm_cozy: 0.7, deep_intellectual: 0.4 },
  'synagogue': { calm_cozy: 0.7, deep_intellectual: 0.4 },
  'temple': { calm_cozy: 0.7, deep_intellectual: 0.4 },
  'community_center': { social_buzzing: 0.6, intimate_local: 0.5 }
};

// BOOLEAN AMENITIES → ARCHETYPE BOOST
export const AMENITY_BOOSTS = {
  'serves_cocktails': { romantic: 0.15, live_electric: 0.1 },
  'live_music': { live_electric: 0.2, nightlife: 0.15 },
  'outdoor_seating': { calm_cozy: 0.1, nature_grounded: 0.1, romantic: 0.05 },
  'good_for_groups': { social_buzzing: 0.15 },
  'reservable': { romantic: 0.1, intimate_local: 0.1 },
  'serves_coffee': { calm_cozy: 0.1, intimate_local: 0.05 },
  'serves_breakfast': { calm_cozy: 0.1, intimate_local: 0.05 },
  'serves_dinner': { romantic: 0.1, social_buzzing: 0.05 },
  'serves_wine': { romantic: 0.1, intimate_local: 0.05 },
  'serves_beer': { social_buzzing: 0.1 },
  'takeout': { intimate_local: 0.05, calm_cozy: 0.05 },
  'dine_in': { social_buzzing: 0.05, romantic: 0.05 },
  'good_for_children': { social_buzzing: 0.1 },
  'restroom': null, // Neutral
  'wifi': { deep_intellectual: 0.05, calm_cozy: 0.05 },
  'wheelchair_accessible': null // Neutral
};

// ATMOSPHERE KEYWORDS → ARCHETYPE MAPPING
export const ATMOSPHERE_KEYWORDS = {
  // Romantic
  'intimate': { romantic: 0.15, intimate_local: 0.1 },
  'cozy': { calm_cozy: 0.15, intimate_local: 0.1 },
  'candlelit': { romantic: 0.2 },
  'romantic': { romantic: 0.2 },
  'date': { romantic: 0.15 },
  'dim': { romantic: 0.1, intimate_local: 0.05 },
  'low-lit': { romantic: 0.1, intimate_local: 0.05 },
  
  // Calm & Cozy
  'quiet': { calm_cozy: 0.15, deep_intellectual: 0.1 },
  'peaceful': { calm_cozy: 0.15, nature_grounded: 0.1 },
  'relaxing': { calm_cozy: 0.15 },
  'tranquil': { calm_cozy: 0.15, nature_grounded: 0.1 },
  'serene': { calm_cozy: 0.15, nature_grounded: 0.1 },
  
  // Social & Buzzing
  'lively': { social_buzzing: 0.15, live_electric: 0.1 },
  'busy': { social_buzzing: 0.15 },
  'vibrant': { social_buzzing: 0.15, live_electric: 0.1 },
  'buzzing': { social_buzzing: 0.2 },
  'popular': { social_buzzing: 0.1 },
  'crowded': { social_buzzing: 0.1 },
  
  // Live & Electric
  'loud': { live_electric: 0.15, nightlife: 0.1 },
  'energetic': { live_electric: 0.15, active_energetic: 0.1 },
  'electric': { live_electric: 0.2 },
  'pumping': { live_electric: 0.15, nightlife: 0.1 },
  'dj': { live_electric: 0.15, nightlife: 0.1 },
  'dance': { live_electric: 0.15, nightlife: 0.1 },
  'club': { nightlife: 0.15, live_electric: 0.1 },
  
  // Creative
  'artistic': { creative: 0.15, deep_intellectual: 0.05 },
  'creative': { creative: 0.2 },
  'bohemian': { creative: 0.15, intimate_local: 0.1 },
  'eclectic': { creative: 0.15 },
  
  // Deep & Intellectual
  'thoughtful': { deep_intellectual: 0.15 },
  'intellectual': { deep_intellectual: 0.2 },
  'study': { deep_intellectual: 0.15, calm_cozy: 0.1 },
  'books': { deep_intellectual: 0.15, creative: 0.05 },
  'literature': { deep_intellectual: 0.15, creative: 0.05 },
  
  // Intimate & Local
  'local': { intimate_local: 0.2 },
  'neighborhood': { intimate_local: 0.15 },
  'hidden': { intimate_local: 0.15, romantic: 0.05 },
  'tucked': { intimate_local: 0.15 },
  'secret': { intimate_local: 0.15, romantic: 0.05 }
};

/**
 * Filter out generic types that don't help with categorization
 */
export function filterRelevantTypes(types = []) {
  if (!Array.isArray(types)) return [];
  return types.filter(type => !GENERIC_TYPES.has(type));
}

/**
 * Get archetype scores from Google Place data (deterministic)
 */
export function getArchetypeScoresFromPlace(placeData) {
  const scores = {
    romantic: 0,
    calm_cozy: 0,
    creative: 0,
    social_buzzing: 0,
    nature_grounded: 0,
    live_electric: 0,
    deep_intellectual: 0,
    active_energetic: 0,
    nightlife: 0,
    intimate_local: 0
  };

  // 1. PRIMARY TYPE (highest weight)
  if (placeData.primaryType) {
    const typeScores = PRIMARY_TYPE_MAP[placeData.primaryType];
    if (typeScores) {
      Object.entries(typeScores).forEach(([arch, score]) => {
        scores[arch] += score * 0.5; // 50% weight
      });
    }
  }

  // 2. FILTERED TYPES (secondary weight)
  const relevantTypes = filterRelevantTypes(placeData.types);
  relevantTypes.forEach(type => {
    const typeScores = PRIMARY_TYPE_MAP[type];
    if (typeScores) {
      Object.entries(typeScores).forEach(([arch, score]) => {
        scores[arch] += score * 0.2; // 20% weight, distributed
      });
    }
  });

  // 3. BOOLEAN AMENITIES
  if (placeData.amenities) {
    Object.entries(placeData.amenities).forEach(([amenity, value]) => {
      if (value === true && AMENITY_BOOSTS[amenity]) {
        Object.entries(AMENITY_BOOSTS[amenity]).forEach(([arch, boost]) => {
          scores[arch] += boost;
        });
      }
    });
  }

  // 4. ATMOSPHERE FROM EDITORIAL SUMMARY (keyword detection)
  const textFields = [
    placeData.editorialSummary?.text,
    placeData.editorialSummary?.overview,
    placeData.generativeSummary?.description?.text
  ].filter(Boolean).join(' ').toLowerCase();

  Object.entries(ATMOSPHERE_KEYWORDS).forEach(([keyword, archetypeBoosts]) => {
    if (textFields.includes(keyword)) {
      Object.entries(archetypeBoosts).forEach(([arch, boost]) => {
        scores[arch] += boost;
      });
    }
  });

  // 5. OPENING HOURS → TIME SIGNATURE
  if (placeData.regularOpeningHours?.periods) {
    const closingHours = placeData.regularOpeningHours.periods
      .map(p => p.close?.hour)
      .filter(h => h !== undefined);
    
    const avgClosingHour = closingHours.length > 0
      ? closingHours.reduce((a, b) => a + b, 0) / closingHours.length
      : null;

    if (avgClosingHour !== null) {
      if (avgClosingHour >= 23 || avgClosingHour <= 2) {
        // Closes late → nightlife boost
        scores.nightlife += 0.15;
        scores.live_electric += 0.1;
      } else if (avgClosingHour <= 18) {
        // Closes early → calm/daytime boost
        scores.calm_cozy += 0.1;
        scores.intimate_local += 0.05;
      }
    }
  }

  // Normalize scores to 0-1 range
  Object.keys(scores).forEach(arch => {
    scores[arch] = Math.min(1, Math.max(0, scores[arch]));
  });

  return scores;
}

/**
 * Get primary archetype from place data
 */
export function getPrimaryArchetype(placeData) {
  const scores = getArchetypeScoresFromPlace(placeData);
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return sorted[0][0];
}

/**
 * Get top N archetypes from place data
 */
export function getTopArchetypes(placeData, n = 2) {
  const scores = getArchetypeScoresFromPlace(placeData);
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .filter(([, score]) => score > 0.15) // Only meaningful scores
    .map(([archetype, score]) => ({ archetype, score }));
}