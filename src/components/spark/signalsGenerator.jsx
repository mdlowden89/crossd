/**
 * Spark Signals Generation System
 * Generates 4-6 dynamic personality signals from MBTI, vibe tags, places, time, and intent
 */

const clamp01 = (n) => Math.max(0, Math.min(1, n));

function mbtiTypeToTraits(type) {
  if (!type) return null;
  const E = type[0] === 'E' ? 0.65 : 0.35;
  const S = type[1] === 'S' ? 0.65 : 0.35;
  const T = type[2] === 'T' ? 0.65 : 0.35;
  const J = type[3] === 'J' ? 0.65 : 0.35;
  return { E, S, T, J };
}

function normalizeTag(tag) {
  return tag.trim().toLowerCase();
}

const VIBE_TAG_MAP = {
  social: { social: { boost: 0.30, hint: 'You enjoy social settings' } },
  extrovert: { social: { boost: 0.35, hint: 'You lean outward socially' } },
  'low-key': { social: { boost: -0.15, hint: 'You prefer calmer energy' } },
  introvert: { social: { boost: -0.25, hint: 'You prefer quieter connection' } },
  party: { social: { boost: 0.25, hint: 'You like high-energy scenes' } },
  'small circles': { social: { boost: -0.10, hint: 'You prefer 1:1 or small groups' } },
  'art lover': { creative: { boost: 0.30, hint: 'You lean creative' } },
  creative: { creative: { boost: 0.25, hint: 'You are drawn to creativity' } },
  bookish: { creative: { boost: 0.10, hint: 'You like ideas + meaning' } },
  'deep talk': { communication: { boost: 0.40, hint: 'You like deep conversation' } },
  thoughtful: { communication: { boost: 0.15, hint: 'You prefer depth over noise' } },
  witty: { communication: { boost: 0.20, hint: 'You like playful back-and-forth' } },
  banter: { communication: { boost: 0.25, hint: 'You like playful banter' } },
  direct: { communication: { boost: -0.10, hint: 'You prefer clarity + directness' } },
  'night owl': { rhythm: { boost: 0.40, hint: 'You are active later' } },
  'early bird': { rhythm: { boost: 0.30, hint: 'You are active earlier' } },
  romantic: { environment: { boost: 0.25, hint: 'You lean romantic' } },
  foodie: { environment: { boost: 0.15, hint: 'You like experience-driven spots' } },
  'live music': { environment: { boost: 0.25, hint: 'You like live energy' } },
  sporty: { environment: { boost: 0.25, hint: 'You like active environments' } },
  outdoorsy: { environment: { boost: 0.25, hint: 'You like nature settings' } },
  spontaneous: { tempo: { boost: 0.35, hint: 'You prefer spontaneity' } },
  adventurous: { tempo: { boost: 0.25, hint: 'You lean adventurous' } },
  intentional: { tempo: { boost: -0.15, hint: 'You prefer clarity + intention' } },
};

function computeDimBoosts(vibeTags) {
  const boosts = {
    social: 0,
    creative: 0,
    communication: 0,
    rhythm: 0,
    environment: 0,
    tempo: 0,
  };

  for (const raw of vibeTags) {
    const t = normalizeTag(raw);
    const m = VIBE_TAG_MAP[t];
    if (!m) continue;

    Object.keys(m).forEach((dim) => {
      const c = m[dim];
      if (!c) return;
      boosts[dim] += c.boost;
    });
  }

  Object.keys(boosts).forEach((d) => {
    boosts[d] = Math.max(-0.5, Math.min(0.75, boosts[d]));
  });

  return { boosts };
}

function inferRhythm(peakTime) {
  if (!peakTime) return null;

  const label = peakTime.label ?? (() => {
    const h = peakTime.hour;
    if (typeof h !== 'number') return null;
    if (h >= 5 && h <= 7) return 'early';
    if (h >= 8 && h <= 10) return 'morning';
    if (h >= 11 && h <= 16) return 'day';
    if (h >= 17 && h <= 21) return 'evening';
    if (h >= 22 && h <= 23) return 'night';
    if (h >= 0 && h <= 2) return 'late';
    return 'night';
  })();

  if (!label) return null;

  const map = {
    early:   { id: 'rhythm_early_ritual', label: 'Early Ritual', icon: '☕', base: 0.78, reason: 'Your moments cluster early in the day', color: '#F6C90E' },
    morning: { id: 'rhythm_morning_glow', label: 'Morning Glow', icon: '🌅', base: 0.75, reason: 'Your moments cluster in the morning', color: '#FFB800' },
    day:     { id: 'rhythm_daytime_energy', label: 'Daytime Energy', icon: '☀️', base: 0.70, reason: 'You show up most in the daytime', color: '#FFD700' },
    evening: { id: 'rhythm_golden_hour_soul', label: 'Golden Hour', icon: '🌇', base: 0.78, reason: 'Your peak energy is evenings', color: '#FF8C42' },
    night:   { id: 'rhythm_night_energy', label: 'Night Energy', icon: '🌃', base: 0.82, reason: 'Your moments peak at night', color: '#8A63F6' },
    late:    { id: 'rhythm_late_thinker', label: 'Late Thinker', icon: '🌙', base: 0.86, reason: 'You're active late into the night', color: '#9B5DE5' },
    weekend: { id: 'rhythm_weekend_pulse', label: 'Weekend Pulse', icon: '🎉', base: 0.75, reason: 'Your moments spike on weekends', color: '#FF6B9D' },
    weekday: { id: 'rhythm_structured_rhythm', label: 'Structured Rhythm', icon: '🗂', base: 0.72, reason: 'Your moments are strongest on weekdays', color: '#6A8F7A' },
  };

  return map[label] ?? null;
}

function pickSocialSignal(traits, boosts, vibeTags) {
  const E = traits.E;
  const tagParty = vibeTags.includes('party');
  const tagLowKey = vibeTags.includes('low-key') || vibeTags.includes('introvert') || vibeTags.includes('small circles');

  const Eeff = clamp01(E + boosts * 0.35);

  if (Eeff >= 0.78 && tagParty) {
    return {
      id: 'social_electric_presence',
      label: 'Electric Presence',
      icon: '🌪',
      dimension: 'social',
      strength: clamp01(0.70 + (Eeff - 0.5)),
      reason: 'You thrive in high-energy social settings',
      color: '#FF6B3D'
    };
  }

  if (Eeff >= 0.68) {
    return {
      id: 'social_city_pulse',
      label: 'City Pulse',
      icon: '🌆',
      dimension: 'social',
      strength: clamp01(0.62 + (Eeff - 0.5)),
      reason: 'You come alive in lively city energy',
      color: '#FF6B9D'
    };
  }

  if (Eeff >= 0.62) {
    return {
      id: 'social_social_spark',
      label: 'Social Spark',
      icon: '🔥',
      dimension: 'social',
      strength: clamp01(0.58 + (Eeff - 0.5)),
      reason: 'You lean social and outward in how you connect',
      color: '#FF6B9D'
    };
  }

  if (Eeff >= 0.50 && !tagLowKey) {
    return {
      id: 'social_warm_connector',
      label: 'Warm Connector',
      icon: '🌅',
      dimension: 'social',
      strength: clamp01(0.55 + Math.abs(Eeff - 0.5)),
      reason: 'You connect easily without needing chaos',
      color: '#FFB800'
    };
  }

  if (Eeff <= 0.35 && tagLowKey) {
    return {
      id: 'social_intimate_energy',
      label: 'Intimate Energy',
      icon: '☕',
      dimension: 'social',
      strength: clamp01(0.58 + (0.5 - Eeff)),
      reason: 'You thrive in 1:1 and calmer social spaces',
      color: '#C49A6C'
    };
  }

  return {
    id: 'social_calm_presence',
    label: 'Calm Presence',
    icon: '🌊',
    dimension: 'social',
    strength: clamp01(0.56 + (0.5 - Eeff)),
    reason: 'You give off grounded, low-pressure energy',
    color: '#4169E1'
  };
}

function pickCreativeSignal(traits, boosts, vibeTags) {
  const N = 1 - traits.S;
  const tagArt = vibeTags.includes('art lover') || vibeTags.includes('creative');
  const Neff = clamp01(N + boosts * 0.35);

  if (Neff >= 0.78 || (tagArt && Neff >= 0.68)) {
    return {
      id: 'creative_vision_driven',
      label: 'Vision-Driven',
      icon: '💡',
      dimension: 'creative',
      strength: clamp01(0.62 + (Neff - 0.5)),
      reason: 'You lean toward ideas, atmosphere, and possibility',
      color: '#9B5DE5'
    };
  }

  if (Neff >= 0.62) {
    return {
      id: 'creative_expressive_core',
      label: 'Expressive Core',
      icon: '🎭',
      dimension: 'creative',
      strength: clamp01(0.60 + (Neff - 0.5)),
      reason: 'You are drawn to expressive, creative environments',
      color: '#9B5DE5'
    };
  }

  if (Neff >= 0.52 && Neff <= 0.65) {
    return {
      id: 'creative_grounded_creative',
      label: 'Grounded Creative',
      icon: '🌿',
      dimension: 'creative',
      strength: clamp01(0.55 + Math.abs(Neff - 0.5)),
      reason: 'Imaginative, but rooted in the real world',
      color: '#6A8F7A'
    };
  }

  const Seff = clamp01(1 - Neff);
  if (Seff >= 0.70) {
    return {
      id: 'creative_practical_builder',
      label: 'Practical Builder',
      icon: '🧱',
      dimension: 'creative',
      strength: clamp01(0.60 + (Seff - 0.5)),
      reason: 'You lean toward tangible, real-world execution',
      color: '#8B7355'
    };
  }

  return {
    id: 'creative_real_world_focus',
    label: 'Real-World Focus',
    icon: '🌍',
    dimension: 'creative',
    strength: clamp01(0.56 + (Seff - 0.5)),
    reason: 'You prefer what's concrete over theoretical',
    color: '#6A8F7A'
  };
}

function pickCommunicationSignal(traits, boosts, vibeTags) {
  const F = 1 - traits.T;
  const tagBanter = vibeTags.includes('banter') || vibeTags.includes('witty');
  const tagDeep = vibeTags.includes('deep talk') || vibeTags.includes('thoughtful');

  const Feff = clamp01(F + boosts * 0.35 + (tagDeep ? 0.08 : 0) - (tagBanter ? 0.05 : 0));
  const Teff = clamp01(1 - Feff);

  if (tagBanter && Teff >= 0.50) {
    return {
      id: 'comm_playful_banter',
      label: 'Playful Banter',
      icon: '😏',
      dimension: 'communication',
      strength: clamp01(0.62 + (Teff - 0.5)),
      reason: 'You connect through quick wit and playful back-and-forth',
      color: '#FFB800'
    };
  }

  if (Feff >= 0.72) {
    return {
      id: 'comm_slow_burn',
      label: 'Slow Burn',
      icon: '🌙',
      dimension: 'communication',
      strength: clamp01(0.60 + (Feff - 0.5)),
      reason: 'You open gradually, but go deep when it's right',
      color: '#8A63F6'
    };
  }

  if (Feff >= 0.62) {
    return {
      id: 'comm_deep_talker',
      label: 'Deep Talker',
      icon: '💬',
      dimension: 'communication',
      strength: clamp01(0.58 + (Feff - 0.5)),
      reason: 'You connect through feelings, depth, and meaning',
      color: '#4169E1'
    };
  }

  if (Teff >= 0.70) {
    return {
      id: 'comm_direct_energy',
      label: 'Direct Energy',
      icon: '🎯',
      dimension: 'communication',
      strength: clamp01(0.60 + (Teff - 0.5)),
      reason: 'You connect through clarity, logic, and directness',
      color: '#FF6B35'
    };
  }

  return {
    id: 'comm_balanced_communicator',
    label: 'Balanced Communicator',
    icon: '🌿',
    dimension: 'communication',
    strength: clamp01(0.56 + Math.abs(Feff - 0.5)),
    reason: 'You balance warmth with clarity in how you communicate',
    color: '#6A8F7A'
  };
}

function pickEnvironmentSignal(profile, boosts) {
  const vibeTags = (profile.vibe_tags || []).map(normalizeTag);
  
  const romantic = vibeTags.includes('romantic');
  const cozy = vibeTags.includes('cozy') || vibeTags.includes('calm');
  const creative = vibeTags.includes('creative') || vibeTags.includes('art lover');
  const social = vibeTags.includes('social') || vibeTags.includes('vibrant');
  const nature = vibeTags.includes('natural') || vibeTags.includes('outdoorsy');
  const liveMusic = vibeTags.includes('live music') || vibeTags.includes('energetic');
  const intellectual = vibeTags.includes('deep talk') || vibeTags.includes('intellectual');
  const active = vibeTags.includes('active') || vibeTags.includes('sporty');

  const strength = clamp01(0.58 + boosts * 0.25);

  if (romantic) {
    return {
      id: 'env_romantic_atmosphere',
      label: 'Romantic Atmosphere',
      icon: '💞',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward warm, intimate spaces',
      color: '#E74C78'
    };
  }

  if (cozy) {
    return {
      id: 'env_cozy_core',
      label: 'Cozy Core',
      icon: '☕',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward calm, low-pressure places',
      color: '#C49A6C'
    };
  }

  if (creative) {
    return {
      id: 'env_creative_spaces',
      label: 'Creative Spaces',
      icon: '🎭',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward expressive, cultural environments',
      color: '#9B5DE5'
    };
  }

  if (social) {
    return {
      id: 'env_city_buzz',
      label: 'City Buzz',
      icon: '🌆',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward lively social areas',
      color: '#FFB800'
    };
  }

  if (nature) {
    return {
      id: 'env_nature_drawn',
      label: 'Nature Drawn',
      icon: '🌿',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward outdoors and grounded energy',
      color: '#2DD881'
    };
  }

  if (liveMusic) {
    return {
      id: 'env_live_electric',
      label: 'Live & Electric',
      icon: '🎵',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward music and sensory energy',
      color: '#F6C90E'
    };
  }

  if (intellectual) {
    return {
      id: 'env_deep_intellectual',
      label: 'Deep & Intellectual',
      icon: '🧠',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward conversation-heavy places',
      color: '#4169E1'
    };
  }

  if (active) {
    return {
      id: 'env_active_energy',
      label: 'Active Energy',
      icon: '🏃',
      dimension: 'environment',
      strength,
      reason: 'You gravitate toward movement and high-activity',
      color: '#FF4081'
    };
  }

  return null;
}

function pickTempoSignal(traits, intent, boosts, vibeTags) {
  const P = 1 - traits.J;
  const tagSpont = vibeTags.includes('spontaneous') || vibeTags.includes('adventurous');
  const tagIntent = vibeTags.includes('intentional');

  let Pnudge = 0;
  if (intent === 'Long-term relationship') Pnudge -= 0.08;
  if (intent === 'Short-term fun') Pnudge += 0.08;

  const Peff = clamp01(P + boosts * 0.30 + Pnudge + (tagSpont ? 0.06 : 0) - (tagIntent ? 0.05 : 0));
  const Jeff = clamp01(1 - Peff);

  if (Jeff >= 0.72 && intent === 'Long-term relationship') {
    return {
      id: 'tempo_steady_builder',
      label: 'Steady Builder',
      icon: '🏛',
      dimension: 'tempo',
      strength: clamp01(0.62 + (Jeff - 0.5)),
      reason: 'You prefer clarity, intention, and steady progression',
      color: '#8B7355'
    };
  }

  if (Jeff >= 0.62) {
    return {
      id: 'tempo_intentional',
      label: 'Intentional',
      icon: '❤️',
      dimension: 'tempo',
      strength: clamp01(0.58 + (Jeff - 0.5)),
      reason: 'You move with purpose and prefer clear direction',
      color: '#E74C78'
    };
  }

  if (Peff >= 0.72 && tagSpont) {
    return {
      id: 'tempo_spontaneous',
      label: 'Spontaneous',
      icon: '⚡',
      dimension: 'tempo',
      strength: clamp01(0.62 + (Peff - 0.5)),
      reason: 'You follow chemistry and like things to feel alive',
      color: '#FF6B35'
    };
  }

  if (Peff >= 0.60) {
    return {
      id: 'tempo_flow_state',
      label: 'Flow State',
      icon: '🌊',
      dimension: 'tempo',
      strength: clamp01(0.58 + (Peff - 0.5)),
      reason: 'You are flexible and let connection unfold naturally',
      color: '#4169E1'
    };
  }

  return {
    id: 'tempo_steady_flow',
    label: 'Steady Flow',
    icon: '🌿',
    dimension: 'tempo',
    strength: clamp01(0.56 + Math.abs(Peff - 0.5)),
    reason: 'You are balanced - intentional, but not rigid',
    color: '#6A8F7A'
  };
}

/**
 * Main function: Generate 4-6 Spark Signals from profile data
 */
export function buildSparkSignals(profile, moments = []) {
  const traits = mbtiTypeToTraits(profile.mbti_type);
  if (!traits) return [];

  const vibeTags = (profile.vibe_tags || []).map(normalizeTag);
  const { boosts } = computeDimBoosts(vibeTags);

  // Infer peak time from moments
  const peakTime = (() => {
    if (!moments || moments.length === 0) return null;
    const hours = moments.map(m => new Date(m.created_date).getHours());
    const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
    return { hour: avgHour };
  })();

  const signals = [];

  // 1. Social
  signals.push(pickSocialSignal(traits, boosts.social, vibeTags));

  // 2. Environment
  const env = pickEnvironmentSignal(profile, boosts.environment);
  if (env) signals.push(env);

  // 3. Communication
  signals.push(pickCommunicationSignal(traits, boosts.communication, vibeTags));

  // 4. Rhythm
  const rhythm = inferRhythm(peakTime);
  if (rhythm) {
    signals.push({
      id: rhythm.id,
      label: rhythm.label,
      icon: rhythm.icon,
      dimension: 'rhythm',
      strength: clamp01(rhythm.base + Math.max(0, boosts.rhythm) * 0.25),
      reason: rhythm.reason,
      color: rhythm.color
    });
  }

  // 5. Creative (optional, based on strength)
  const creative = pickCreativeSignal(traits, boosts.creative, vibeTags);
  if (creative.strength > 0.60 || signals.length < 4) {
    signals.push(creative);
  }

  // 6. Tempo (optional, based on strength)
  const tempo = pickTempoSignal(traits, profile.dating_intentions, boosts.tempo, vibeTags);
  if (tempo.strength > 0.60 || signals.length < 4) {
    signals.push(tempo);
  }

  // Sort by strength and return top 4-6
  return signals
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 6);
}