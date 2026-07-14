/**
 * Crossd Compatibility Engine
 * Full personality compatibility scoring using MBTI quiz percentages,
 * four compatibility dimensions, five archetype classifications, and
 * fluid 24-candidate place pool ranking.
 */

// ─── Five Match Archetypes ────────────────────────────────────────────────────
export const MATCH_ARCHETYPES = {
  BALANCED_SPARK: {
    id: 'BALANCED_SPARK',
    label: '✨ Balanced Spark',
    shortLabel: 'Balanced Spark',
    tagline: 'Different in the right ways.',
    crossdLine: 'You bring out different sides of each other.',
    description: 'You approach life differently enough to keep things exciting, but similarly enough to feel understood.',
  },
  NATURAL_CONNECTION: {
    id: 'NATURAL_CONNECTION',
    label: '💞 Natural Connection',
    shortLabel: 'Natural Connection',
    tagline: 'Someone who just gets your way of being.',
    crossdLine: 'You are likely to feel at home around each other.',
    description: 'Conversation comes naturally here. The challenge is making sure familiarity does not become predictability.',
  },
  CATALYST_CONNECTION: {
    id: 'CATALYST_CONNECTION',
    label: '🔥 Catalyst Connection',
    shortLabel: 'Catalyst Connection',
    tagline: 'Someone who takes you outside your usual world.',
    crossdLine: 'You could open up completely new worlds for each other.',
    description: 'You may fascinate each other immediately. This connection grows through curiosity, patience and learning each other\'s language.',
  },
  MIRROR_CONNECTION: {
    id: 'MIRROR_CONNECTION',
    label: '🪞 Mirror Connection',
    shortLabel: 'Mirror Connection',
    tagline: 'You are likely to recognise yourself in each other.',
    crossdLine: 'Just be careful not to avoid the same difficult conversations.',
    description: 'These pairings often feel validating and deeply understood but may amplify shared weaknesses.',
  },
  TRANSLATION_CONNECTION: {
    id: 'TRANSLATION_CONNECTION',
    label: '🌉 Translation Connection',
    shortLabel: 'Translation Connection',
    tagline: 'This connection may not run on autopilot.',
    crossdLine: 'Differences can become strengths when both people stay curious.',
    description: 'The pair has considerable differences without an immediate cognitive bridge. Communication requires more intention.',
  },
};

// ─── Match Archetype Classification Map ──────────────────────────────────────
const ARCHETYPE_MAP = {
  INTJ: {
    BALANCED_SPARK: ['ENFP','ENTP'],
    NATURAL_CONNECTION: ['INFJ','INTP'],
    CATALYST_CONNECTION: ['ESFP'],
    MIRROR_CONNECTION: ['INTJ'],
    TRANSLATION_CONNECTION: ['ESFJ','ESTP','ESTJ','ISFJ'],
  },
  INTP: {
    BALANCED_SPARK: ['ENTJ','ENFJ'],
    NATURAL_CONNECTION: ['ENTP','INTJ'],
    CATALYST_CONNECTION: ['ESFJ'],
    MIRROR_CONNECTION: ['INTP'],
    TRANSLATION_CONNECTION: ['ESFP','ESTP','ESTJ','ISFJ'],
  },
  ENTJ: {
    BALANCED_SPARK: ['INTP','INFP'],
    NATURAL_CONNECTION: ['INTJ','ENTP'],
    CATALYST_CONNECTION: ['ISFP'],
    MIRROR_CONNECTION: ['ENTJ'],
    TRANSLATION_CONNECTION: ['ISFJ','ESFJ','ESFP','ISFP'],
  },
  ENTP: {
    BALANCED_SPARK: ['INFJ','INTJ'],
    NATURAL_CONNECTION: ['ENFP','INTP'],
    CATALYST_CONNECTION: ['ISFJ'],
    MIRROR_CONNECTION: ['ENTP'],
    TRANSLATION_CONNECTION: ['ESFJ','ISFJ','ESTJ','ISFP'],
  },
  INFJ: {
    BALANCED_SPARK: ['ENTP','ENFP'],
    NATURAL_CONNECTION: ['INTJ','INFP'],
    CATALYST_CONNECTION: ['ESTP'],
    MIRROR_CONNECTION: ['INFJ'],
    TRANSLATION_CONNECTION: ['ESTJ','ESFJ','ESTP','ISTJ'],
  },
  INFP: {
    BALANCED_SPARK: ['ENFJ','ENTJ'],
    NATURAL_CONNECTION: ['INFJ','ENFP'],
    CATALYST_CONNECTION: ['ESTJ'],
    MIRROR_CONNECTION: ['INFP'],
    TRANSLATION_CONNECTION: ['ESTP','ESFP','ESTJ','ISTJ'],
  },
  ENFJ: {
    BALANCED_SPARK: ['INFP','INTP'],
    NATURAL_CONNECTION: ['INFJ','ENFP'],
    CATALYST_CONNECTION: ['ISTP'],
    MIRROR_CONNECTION: ['ENFJ'],
    TRANSLATION_CONNECTION: ['ISTP','ISTJ','ESTJ','ESTP'],
  },
  ENFP: {
    BALANCED_SPARK: ['INTJ','INFJ'],
    NATURAL_CONNECTION: ['ENTP','INFP'],
    CATALYST_CONNECTION: ['ISTJ'],
    MIRROR_CONNECTION: ['ENFP'],
    TRANSLATION_CONNECTION: ['ISTJ','ISFJ','ESTJ','ISTP'],
  },
  ISTJ: {
    BALANCED_SPARK: ['ESFP','ESTP'],
    NATURAL_CONNECTION: ['ISFJ','ESTJ'],
    CATALYST_CONNECTION: ['ENFP'],
    MIRROR_CONNECTION: ['ISTJ'],
    TRANSLATION_CONNECTION: ['ENFP','ENFJ','INFJ','INFP'],
  },
  ISFJ: {
    BALANCED_SPARK: ['ESTP','ESFP'],
    NATURAL_CONNECTION: ['ISTJ','ESFJ'],
    CATALYST_CONNECTION: ['ENTP'],
    MIRROR_CONNECTION: ['ISFJ'],
    TRANSLATION_CONNECTION: ['ENTP','ENTJ','INFJ','INFP'],
  },
  ESTJ: {
    BALANCED_SPARK: ['ISFP','ISTP'],
    NATURAL_CONNECTION: ['ISTJ','ESFJ'],
    CATALYST_CONNECTION: ['INFP'],
    MIRROR_CONNECTION: ['ESTJ'],
    TRANSLATION_CONNECTION: ['INFP','INFJ','ENFP','ENFJ'],
  },
  ESFJ: {
    BALANCED_SPARK: ['ISTP','ISFP'],
    NATURAL_CONNECTION: ['ISFJ','ESTJ'],
    CATALYST_CONNECTION: ['INTP'],
    MIRROR_CONNECTION: ['ESFJ'],
    TRANSLATION_CONNECTION: ['INTP','INTJ','ENTP','INFP'],
  },
  ISTP: {
    BALANCED_SPARK: ['ESFJ','ESTJ'],
    NATURAL_CONNECTION: ['ISFP','ESTP'],
    CATALYST_CONNECTION: ['ENFJ'],
    MIRROR_CONNECTION: ['ISTP'],
    TRANSLATION_CONNECTION: ['ENFJ','INFJ','ENFP','INFP'],
  },
  ISFP: {
    BALANCED_SPARK: ['ESTJ','ESFJ'],
    NATURAL_CONNECTION: ['ISTP','ESFP'],
    CATALYST_CONNECTION: ['ENTJ'],
    MIRROR_CONNECTION: ['ISFP'],
    TRANSLATION_CONNECTION: ['ENTJ','INTJ','ENTP','INTP'],
  },
  ESTP: {
    BALANCED_SPARK: ['ISFJ','ISTJ'],
    NATURAL_CONNECTION: ['ISTP','ESFP'],
    CATALYST_CONNECTION: ['INFJ'],
    MIRROR_CONNECTION: ['ESTP'],
    TRANSLATION_CONNECTION: ['INFJ','INFP','ENFJ','ENFP'],
  },
  ESFP: {
    BALANCED_SPARK: ['ISTJ','ISFJ'],
    NATURAL_CONNECTION: ['ISFP','ESTP'],
    CATALYST_CONNECTION: ['INTJ'],
    MIRROR_CONNECTION: ['ESFP'],
    TRANSLATION_CONNECTION: ['INTJ','INTP','ENTJ','ENTP'],
  },
};

// ─── Scoring bands ────────────────────────────────────────────────────────────
export const SCORE_BANDS = [
  { min: 86, label: 'Magnetic Fit', color: '#E70F72' },
  { min: 78, label: 'Strong Natural Fit', color: '#FF6B9D' },
  { min: 70, label: 'Promising Growth Match', color: '#9B5DE5' },
  { min: 62, label: 'Intriguing Contrast', color: '#4169E1' },
  { min: 50, label: 'Requires Translation', color: '#6B7280' },
];

export function getScoringBand(score) {
  return SCORE_BANDS.find(b => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

// ─── Get archetype for a pair ─────────────────────────────────────────────────
export function getMatchArchetype(typeA, typeB) {
  const map = ARCHETYPE_MAP[typeA];
  if (!map) return MATCH_ARCHETYPES.TRANSLATION_CONNECTION;
  for (const [archetypeKey, types] of Object.entries(map)) {
    if (types.includes(typeB)) return MATCH_ARCHETYPES[archetypeKey];
  }
  return MATCH_ARCHETYPES.TRANSLATION_CONNECTION;
}

// ─── Parse MBTI quiz scores into continuous dimensions ────────────────────────
/**
 * Returns { E, I, N, S, T, F, J, P } each 0–1 (the "pull" toward that pole).
 * quizResults is the stored mbti_quiz_results object from the profile.
 * Falls back to 0.65 (clear but not extreme) for missing dimensions.
 */
export function parseQuizDimensions(mbtiType, quizResults = {}) {
  const type = mbtiType || 'INFP';

  // Try to read from quiz results (stored as percentages 50–100 toward dominant pole)
  // Keys may be like { I: 72, N: 85, F: 60, P: 58 } or percentage per letter
  const get = (posLetter, negLetter) => {
    const posKey = posLetter.toLowerCase();
    const negKey = negLetter.toLowerCase();
    if (quizResults[posKey]) return quizResults[posKey] / 100;
    if (quizResults[negKey]) return 1 - (quizResults[negKey] / 100);
    if (quizResults[posLetter]) return quizResults[posLetter] / 100;
    if (quizResults[negLetter]) return 1 - (quizResults[negLetter] / 100);
    // Default: moderate lean toward the type letter
    return type.includes(posLetter) ? 0.65 : 0.35;
  };

  return {
    E: get('E', 'I'),
    I: get('I', 'E'),
    N: get('N', 'S'),
    S: get('S', 'N'),
    T: get('T', 'F'),
    F: get('F', 'T'),
    J: get('J', 'P'),
    P: get('P', 'J'),
  };
}

// ─── Four-dimension compatibility scores ──────────────────────────────────────
/**
 * Returns { mind, heart, rhythm, growth, total } all 0–100.
 * typeA/B = 4-letter strings. dimsA/B = parsed dimensions from parseQuizDimensions.
 */
export function calculateFourDimensionCompatibility(typeA, dimsA, typeB, dimsB) {
  // ── 🧠 Mind Match (30%) ──────────────────────────────────────────────────
  // N/S similarity is primary driver; shared intuitive worldview matters most
  const nsSimilarity = 1 - Math.abs(dimsA.N - dimsB.N); // 1 = same pole strength
  const nsBonus = (typeA.includes('N') === typeB.includes('N')) ? 0.2 : 0;
  const mind = Math.min(100, Math.round((nsSimilarity * 0.7 + nsBonus + 0.1) * 100));

  // ── 💗 Heart Match (25%) ─────────────────────────────────────────────────
  // T/F: similarity = ease, difference = balance (both have value)
  const tfDiff = Math.abs(dimsA.T - dimsB.T);
  const samePoleTF = typeA.includes('T') === typeB.includes('T');
  // Similarity gives ease, difference gives balance — sweet spot around 30–60% diff
  const tfEase = samePoleTF ? (1 - tfDiff * 0.4) : 0.75 - Math.max(0, tfDiff - 0.4) * 0.5;
  const heart = Math.min(100, Math.round(tfEase * 100));

  // ── ⚡ Rhythm Match (25%) ────────────────────────────────────────────────
  // E/I: mild complementarity is best; extreme same = echo chamber, extreme diff = friction
  const eiDiff = Math.abs(dimsA.E - dimsB.E);
  const eiScore = eiDiff < 0.15 ? 0.80 : eiDiff < 0.35 ? 0.95 : eiDiff < 0.55 ? 0.85 : 0.65;
  // J/P: mild complementarity creates balance; extreme differences create friction
  const jpDiff = Math.abs(dimsA.J - dimsB.J);
  const jpScore = jpDiff < 0.15 ? 0.80 : jpDiff < 0.35 ? 0.92 : jpDiff < 0.55 ? 0.80 : 0.60;
  const rhythm = Math.min(100, Math.round((eiScore * 0.5 + jpScore * 0.5) * 100));

  // ── 🌱 Growth Match (20%) ────────────────────────────────────────────────
  // Complementary cognitive functions → growth without exhaustion
  // Shadow types (same letters, flipped attitudes) = high growth but hard
  const archetype = getMatchArchetype(typeA, typeB);
  const growthBase = {
    BALANCED_SPARK: 85,
    NATURAL_CONNECTION: 72,
    CATALYST_CONNECTION: 88,
    MIRROR_CONNECTION: 65,
    TRANSLATION_CONNECTION: 70,
  }[archetype.id] || 70;
  // Moderate the growth score by how extreme the differences are
  const avgDiff = (eiDiff + jpDiff + tfDiff + Math.abs(dimsA.N - dimsB.N)) / 4;
  const growthModifier = avgDiff > 0.6 ? -8 : avgDiff > 0.4 ? -2 : avgDiff < 0.15 ? -5 : 0;
  const growth = Math.min(100, Math.max(50, growthBase + growthModifier));

  // ── Final weighted total ──────────────────────────────────────────────────
  const total = Math.round(
    mind   * 0.30 +
    heart  * 0.25 +
    rhythm * 0.25 +
    growth * 0.20
  );

  // Clamp to 50–94 (no MBTI pairing below 50, none perfectly certain above 94)
  const clampedTotal = Math.max(50, Math.min(94, total));

  return { mind, heart, rhythm, growth, total: clampedTotal };
}

// ─── Type descriptions for UI ─────────────────────────────────────────────────
export const TYPE_DESCRIPTIONS = {
  INTJ: { name: 'The Architect',    emoji: '🏛️', tagline: 'Strategic, private and intensely future-minded.' },
  INTP: { name: 'The Thinker',      emoji: '🧪', tagline: 'Curious, logical and endlessly analytical.' },
  ENTJ: { name: 'The Commander',    emoji: '👑', tagline: 'Bold, decisive and built to lead.' },
  ENTP: { name: 'The Visionary',    emoji: '💡', tagline: 'Inventive, playful and intellectually restless.' },
  INFJ: { name: 'The Advocate',     emoji: '🌟', tagline: 'Quiet, purposeful and deeply perceptive.' },
  INFP: { name: 'The Dreamer',      emoji: '🎨', tagline: 'Idealistic, empathetic and fiercely authentic.' },
  ENFJ: { name: 'The Connector',    emoji: '✨', tagline: 'Warm, inspiring and naturally people-focused.' },
  ENFP: { name: 'The Inspirer',     emoji: '🎉', tagline: 'Enthusiastic, imaginative and endlessly curious.' },
  ISTJ: { name: 'The Guardian',     emoji: '📋', tagline: 'Reliable, principled and deeply trustworthy.' },
  ISFJ: { name: 'The Protector',    emoji: '🛡️', tagline: 'Attentive, loyal and quietly devoted.' },
  ESTJ: { name: 'The Director',     emoji: '⚖️', tagline: 'Structured, direct and dependably competent.' },
  ESFJ: { name: 'The Host',         emoji: '🤗', tagline: 'Warm, sociable and naturally caring.' },
  ISTP: { name: 'The Maverick',     emoji: '🔧', tagline: 'Calm, adaptable and quietly brilliant.' },
  ISFP: { name: 'The Artist',       emoji: '🎨', tagline: 'Gentle, expressive and beautifully present.' },
  ESTP: { name: 'The Adventurer',   emoji: '🚀', tagline: 'Bold, direct and energised by the moment.' },
  ESFP: { name: 'The Entertainer',  emoji: '🌈', tagline: 'Spontaneous, warm and joyfully alive.' },
};

// ─── Primary balanced spark match (first listed = closer to user's quiz profile) ─
const PRIMARY_BALANCED_SPARK = {
  INTJ: 'ENTP', INTP: 'ENTJ', ENTJ: 'INTP', ENTP: 'INFJ',
  INFJ: 'ENTP', INFP: 'ENFJ', ENFJ: 'INFP', ENFP: 'INTJ',
  ISTJ: 'ESFP', ISFJ: 'ESTP', ESTJ: 'ISFP', ESFJ: 'ISTP',
  ISTP: 'ESFJ', ISFP: 'ESTJ', ESTP: 'ISFJ', ESFP: 'ISTJ',
};

/**
 * Get the primary compatible type for display, adjusted slightly by quiz scores.
 * If the user leans more Feeling, favour the Feeling-leaning Balanced Spark.
 */
export function getPrimaryCompatibleType(myType, myDims) {
  const map = ARCHETYPE_MAP[myType];
  if (!map) return null;
  const sparks = map.BALANCED_SPARK || [];
  if (sparks.length === 0) return null;
  if (sparks.length === 1) return sparks[0];

  // Decide between the two balanced sparks using quiz strength
  // Convention: first spark tends to share T/F, second tends to differ
  const [spark1, spark2] = sparks;
  const s1Info = TYPE_DESCRIPTIONS[spark1];
  const s2Info = TYPE_DESCRIPTIONS[spark2];

  // If user is strongly Feeling, push toward the emotionally warmer spark
  const fLean = myDims.F > 0.65;
  // If user is strongly Thinking, push toward the intellectually similar spark
  const tLean = myDims.T > 0.65;

  // Check which spark has matching T/F
  const spark1TMatch = (myType.includes('T') === spark1.includes('T'));
  if (fLean && !spark1TMatch) return spark1; // spark1 is the F-leaning one
  if (tLean && spark1TMatch) return spark1;
  return spark2;
}