// 16x16 MBTI Compatibility Matrix
// Scores represent spark-based compatibility (0-100) based on emotional, cognitive, and lifestyle harmony

export const MBTI_COMPATIBILITY_MATRIX = {
  INFJ: { INFJ: 75, INFP: 85, INTJ: 80, INTP: 82, ENFJ: 90, ENFP: 88, ENTJ: 78, ENTP: 86, ISFJ: 82, ISFP: 79, ISTJ: 70, ISTP: 68, ESFJ: 85, ESFP: 76, ESTJ: 66, ESTP: 70 },
  INFP: { INFJ: 85, INFP: 75, INTJ: 83, INTP: 84, ENFJ: 88, ENFP: 87, ENTJ: 81, ENTP: 85, ISFJ: 80, ISFP: 78, ISTJ: 68, ISTP: 67, ESFJ: 83, ESFP: 80, ESTJ: 65, ESTP: 70 },
  INTJ: { INFJ: 80, INFP: 83, INTJ: 75, INTP: 86, ENFJ: 78, ENFP: 84, ENTJ: 88, ENTP: 82, ISFJ: 72, ISFP: 71, ISTJ: 80, ISTP: 75, ESFJ: 70, ESFP: 68, ESTJ: 85, ESTP: 72 },
  INTP: { INFJ: 82, INFP: 84, INTJ: 86, INTP: 75, ENFJ: 83, ENFP: 85, ENTJ: 80, ENTP: 89, ISFJ: 70, ISFP: 70, ISTJ: 78, ISTP: 76, ESFJ: 72, ESFP: 71, ESTJ: 82, ESTP: 80 },
  ENFJ: { INFJ: 90, INFP: 88, INTJ: 78, INTP: 83, ENFJ: 75, ENFP: 87, ENTJ: 80, ENTP: 84, ISFJ: 88, ISFP: 85, ISTJ: 75, ISTP: 73, ESFJ: 90, ESFP: 85, ESTJ: 72, ESTP: 78 },
  ENFP: { INFJ: 88, INFP: 87, INTJ: 84, INTP: 85, ENFJ: 87, ENFP: 75, ENTJ: 86, ENTP: 88, ISFJ: 82, ISFP: 85, ISTJ: 72, ISTP: 70, ESFJ: 87, ESFP: 90, ESTJ: 70, ESTP: 77 },
  ENTJ: { INFJ: 78, INFP: 81, INTJ: 88, INTP: 80, ENFJ: 80, ENFP: 86, ENTJ: 75, ENTP: 83, ISFJ: 70, ISFP: 72, ISTJ: 85, ISTP: 79, ESFJ: 74, ESFP: 76, ESTJ: 89, ESTP: 84 },
  ENTP: { INFJ: 86, INFP: 85, INTJ: 82, INTP: 89, ENFJ: 84, ENFP: 88, ENTJ: 83, ENTP: 75, ISFJ: 73, ISFP: 74, ISTJ: 76, ISTP: 80, ESFJ: 78, ESFP: 79, ESTJ: 82, ESTP: 86 },
  ISFJ: { INFJ: 82, INFP: 80, INTJ: 72, INTP: 70, ENFJ: 88, ENFP: 82, ENTJ: 70, ENTP: 73, ISFJ: 75, ISFP: 84, ISTJ: 85, ISTP: 79, ESFJ: 88, ESFP: 85, ESTJ: 80, ESTP: 76 },
  ISFP: { INFJ: 79, INFP: 78, INTJ: 71, INTP: 70, ENFJ: 85, ENFP: 85, ENTJ: 72, ENTP: 74, ISFJ: 84, ISFP: 75, ISTJ: 80, ISTP: 77, ESFJ: 85, ESFP: 86, ESTJ: 78, ESTP: 80 },
  ISTJ: { INFJ: 70, INFP: 68, INTJ: 80, INTP: 78, ENFJ: 75, ENFP: 72, ENTJ: 85, ENTP: 76, ISFJ: 85, ISFP: 80, ISTJ: 75, ISTP: 74, ESFJ: 82, ESFP: 78, ESTJ: 88, ESTP: 82 },
  ISTP: { INFJ: 68, INFP: 67, INTJ: 75, INTP: 76, ENFJ: 73, ENFP: 70, ENTJ: 79, ENTP: 80, ISFJ: 79, ISFP: 77, ISTJ: 74, ISTP: 75, ESFJ: 78, ESFP: 79, ESTJ: 82, ESTP: 75 },
  ESFJ: { INFJ: 85, INFP: 83, INTJ: 70, INTP: 72, ENFJ: 90, ENFP: 87, ENTJ: 74, ENTP: 78, ISFJ: 88, ISFP: 85, ISTJ: 82, ISTP: 78, ESFJ: 75, ESFP: 88, ESTJ: 80, ESTP: 83 },
  ESFP: { INFJ: 76, INFP: 80, INTJ: 68, INTP: 71, ENFJ: 85, ENFP: 90, ENTJ: 76, ENTP: 79, ISFJ: 85, ISFP: 86, ISTJ: 78, ISTP: 79, ESFJ: 88, ESFP: 75, ESTJ: 76, ESTP: 82 },
  ESTJ: { INFJ: 66, INFP: 65, INTJ: 85, INTP: 82, ENFJ: 72, ENFP: 70, ENTJ: 89, ENTP: 82, ISFJ: 80, ISFP: 78, ISTJ: 88, ISTP: 82, ESFJ: 80, ESFP: 76, ESTJ: 75, ESTP: 84 },
  ESTP: { INFJ: 70, INFP: 70, INTJ: 72, INTP: 80, ENFJ: 78, ENFP: 77, ENTJ: 84, ENTP: 86, ISFJ: 76, ISFP: 80, ISTJ: 82, ISTP: 75, ESFJ: 83, ESFP: 82, ESTJ: 84, ESTP: 75 }
};

// Spark labels for different compatibility levels
export const getCompatibilityLabel = (score) => {
  if (score >= 85) return { label: '🔥 Soulmate Spark', tier: 'exceptional' };
  if (score >= 75) return { label: '💫 Deep Connection', tier: 'strong' };
  if (score >= 70) return { label: '✨ Good Match', tier: 'good' };
  return { label: '🤝 Potential', tier: 'moderate' };
};

// Calculate detailed compatibility between two MBTI types
export function calculateCompatibility(typeA, typeB) {
  if (!typeA || !typeB || !MBTI_COMPATIBILITY_MATRIX[typeA] || !MBTI_COMPATIBILITY_MATRIX[typeB]) {
    return { score: 0, label: '🤷 Unknown', tier: 'unknown', breakdown: null };
  }

  const baseScore = MBTI_COMPATIBILITY_MATRIX[typeA][typeB];
  
  // Calculate trait harmony bonuses
  const traitsA = typeA.split('');
  const traitsB = typeB.split('');
  
  let traitHarmony = 0;
  let oppositeCount = 0;
  
  // E/I, S/N, T/F, J/P comparisons
  for (let i = 0; i < 4; i++) {
    if (traitsA[i] !== traitsB[i]) {
      traitHarmony += 6.25; // +6.25 for each opposite trait
      oppositeCount++;
    }
  }
  
  // Lifestyle sync bonus (J/P alignment)
  const jpBonus = traitsA[3] === traitsB[3] ? 10 : 5;
  
  // Emotional fit bonus (F/T comparison)
  let emotionalFit = 0;
  if (traitsA[2] === 'F' && traitsB[2] === 'F') emotionalFit = 10; // Both feelers
  else if (traitsA[2] !== traitsB[2]) emotionalFit = 7; // F-T pairing
  else emotionalFit = 5; // Both thinkers
  
  // Final score calculation
  const finalScore = Math.min(100, Math.round(
    (baseScore * 0.4) + 
    traitHarmony + 
    (jpBonus * 0.2) + 
    (emotionalFit * 0.15)
  ));
  
  const { label, tier } = getCompatibilityLabel(finalScore);
  
  return {
    score: finalScore,
    label,
    tier,
    breakdown: {
      baseScore,
      traitHarmony,
      jpBonus,
      emotionalFit,
      oppositeCount
    }
  };
}

// Get relationship insights based on compatibility
export function getRelationshipInsight(typeA, typeB, score) {
  const insights = {
    exceptional: [
      "You two are cosmic mirrors - your differences complement each other perfectly.",
      "This pairing creates magical chemistry and deep understanding.",
      "Your energies create a perfect balance - mind meets heart."
    ],
    strong: [
      "You'll pull each other out of comfort zones in the best way.",
      "Great potential for growth and mutual understanding.",
      "Your differences create spark while your similarities create comfort."
    ],
    good: [
      "Interesting dynamic with potential for great connection.",
      "You bring different strengths that could balance well.",
      "With effort and communication, this could be something special."
    ],
    moderate: [
      "An intriguing pairing that requires understanding and patience.",
      "Different worldviews that could either clash or complement.",
      "Success depends on mutual respect and willingness to bridge differences."
    ]
  };
  
  const { tier } = getCompatibilityLabel(score);
  const tierInsights = insights[tier] || insights.moderate;
  return tierInsights[Math.floor(Math.random() * tierInsights.length)];
}