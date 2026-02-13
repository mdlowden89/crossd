/**
 * Generates a one-line "Spark Pattern" insight based on signals
 */

export function generateSparkPattern(profile, signals = []) {
  if (!signals || signals.length === 0) return null;

  // Extract dominant signals
  const socialSignal = signals.find(s => s.dimension === 'social');
  const environmentSignal = signals.find(s => s.dimension === 'environment');
  const rhythmSignal = signals.find(s => s.dimension === 'rhythm');
  const communicationSignal = signals.find(s => s.dimension === 'communication');
  const tempoSignal = signals.find(s => s.dimension === 'tempo');

  // Determine dominant characteristics
  const isNightEnergy = rhythmSignal?.id?.includes('night') || rhythmSignal?.id?.includes('late');
  const isEveningEnergy = rhythmSignal?.id?.includes('evening') || rhythmSignal?.id?.includes('golden');
  const isMorningEnergy = rhythmSignal?.id?.includes('morning') || rhythmSignal?.id?.includes('early');
  
  const isSocial = socialSignal?.id?.includes('social') || socialSignal?.id?.includes('electric') || socialSignal?.id?.includes('city');
  const isIntimate = socialSignal?.id?.includes('intimate') || socialSignal?.id?.includes('calm');
  
  const isRomantic = environmentSignal?.id?.includes('romantic');
  const isCreative = environmentSignal?.id?.includes('creative');
  const isCozy = environmentSignal?.id?.includes('cozy');
  const isNature = environmentSignal?.id?.includes('nature');
  const isCityBuzz = environmentSignal?.id?.includes('city');
  const isLiveMusic = environmentSignal?.id?.includes('live');
  
  const isDeepTalk = communicationSignal?.id?.includes('deep') || communicationSignal?.id?.includes('slow');
  const isBanter = communicationSignal?.id?.includes('banter') || communicationSignal?.id?.includes('playful');
  
  const isSpontaneous = tempoSignal?.id?.includes('spontaneous') || tempoSignal?.id?.includes('flow');
  const isIntentional = tempoSignal?.id?.includes('intentional') || tempoSignal?.id?.includes('steady');

  // Pattern Templates
  
  // Romantic + Creative + Evening/Night + Deep
  if (isRomantic && (isCreative || isDeepTalk) && (isNightEnergy || isEveningEnergy)) {
    return `${profile.display_name} sparks most in spontaneous city nights and low-lit conversations.`;
  }
  
  if (isRomantic && isLiveMusic && (isNightEnergy || isEveningEnergy)) {
    return `You'll likely meet ${profile.display_name} where music meets meaning.`;
  }
  
  if (isRomantic && isEveningEnergy) {
    return `Most magnetic at golden hour, where romance and culture collide.`;
  }
  
  // Calm/Cozy + Nature + Morning + Slow
  if ((isCozy || isIntimate) && (isNature || isMorningEnergy) && (isDeepTalk || isIntentional)) {
    return `${profile.display_name} sparks in quiet corners and slow Sunday light.`;
  }
  
  if (isCozy && isMorningEnergy) {
    return `You'll likely meet ${profile.display_name} where coffee meets conversation.`;
  }
  
  if (isIntimate && isIntentional) {
    return `Most magnetic in calm spaces that build naturally.`;
  }
  
  // Social/Buzzing + Night + Fast/Spontaneous
  if (isSocial && isNightEnergy && (isSpontaneous || isBanter)) {
    return `${profile.display_name} sparks where the lights are loud and the chemistry is instant.`;
  }
  
  if ((isCityBuzz || isSocial) && isLiveMusic) {
    return `You'll likely meet ${profile.display_name} where music meets momentum.`;
  }
  
  if (isSocial && isNightEnergy) {
    return `Most magnetic after 9pm, when the city wakes up.`;
  }
  
  // Deep/Intellectual + Intentional + Evening
  if (isDeepTalk && isIntentional && !isNightEnergy) {
    return `${profile.display_name} sparks in thoughtful rooms and meaningful exchanges.`;
  }
  
  if (isDeepTalk && (isCreative || isIntentional)) {
    return `You'll likely meet ${profile.display_name} where ideas meet intimacy.`;
  }
  
  if (isDeepTalk) {
    return `Most magnetic when conversation goes beneath the surface.`;
  }
  
  // Active/Energetic + Spontaneous + Weekend
  if (isSpontaneous && (isSocial || rhythmSignal?.id?.includes('weekend'))) {
    return `${profile.display_name} sparks in motion — movement, laughter, and unscripted plans.`;
  }
  
  if (isSpontaneous) {
    return `You'll likely meet ${profile.display_name} where energy meets spontaneity.`;
  }
  
  if (isSpontaneous && (isNightEnergy || isEveningEnergy)) {
    return `Most magnetic when the plan didn't exist an hour ago.`;
  }
  
  // Default fallbacks based on strongest signal
  const strongestSignal = signals[0];
  
  if (strongestSignal.dimension === 'social') {
    if (isSocial) {
      return `${profile.display_name} sparks in vibrant spaces with genuine connection.`;
    } else {
      return `${profile.display_name} sparks in intimate moments that feel effortless.`;
    }
  }
  
  if (strongestSignal.dimension === 'environment') {
    return `You'll likely meet ${profile.display_name} in spaces that feel alive with possibility.`;
  }
  
  if (strongestSignal.dimension === 'rhythm') {
    if (isNightEnergy) {
      return `Most magnetic when the city comes alive after dark.`;
    } else {
      return `Most magnetic in the gentle rhythm of daylight hours.`;
    }
  }
  
  return `${profile.display_name} sparks where authenticity meets intention.`;
}

export function generateCompatibilityTease(profile, signals = []) {
  if (!signals || signals.length === 0 || !profile.mbti_type) return null;

  const socialSignal = signals.find(s => s.dimension === 'social');
  const environmentSignal = signals.find(s => s.dimension === 'environment');
  const rhythmSignal = signals.find(s => s.dimension === 'rhythm');
  const communicationSignal = signals.find(s => s.dimension === 'communication');
  const tempoSignal = signals.find(s => s.dimension === 'tempo');

  // Extract characteristics
  const isSocial = socialSignal?.id?.includes('social') || socialSignal?.id?.includes('electric');
  const isIntimate = socialSignal?.id?.includes('intimate') || socialSignal?.id?.includes('calm');
  
  const isRomantic = environmentSignal?.id?.includes('romantic');
  const isCreative = environmentSignal?.id?.includes('creative');
  const isCozy = environmentSignal?.id?.includes('cozy');
  const isNature = environmentSignal?.id?.includes('nature');
  const isCityBuzz = environmentSignal?.id?.includes('city');
  
  const isNightEnergy = rhythmSignal?.id?.includes('night') || rhythmSignal?.id?.includes('late');
  const isEveningEnergy = rhythmSignal?.id?.includes('evening');
  
  const isDeepTalk = communicationSignal?.id?.includes('deep') || communicationSignal?.id?.includes('slow');
  const isBanter = communicationSignal?.id?.includes('banter') || communicationSignal?.id?.includes('playful');
  
  const isSpontaneous = tempoSignal?.id?.includes('spontaneous') || tempoSignal?.id?.includes('flow');
  const isIntentional = tempoSignal?.id?.includes('intentional') || tempoSignal?.id?.includes('steady');

  // MBTI complement suggestions
  const mbtiType = profile.mbti_type;
  const E_I = mbtiType[0];
  const N_S = mbtiType[1];
  const F_T = mbtiType[2];
  
  let types = [];
  
  // Build compatibility description
  if (isRomantic && (isCreative || isDeepTalk)) {
    types.push('Romantic');
    types.push('Curious');
  } else if (isRomantic) {
    types.push('Romantic');
    types.push('Warm');
  }
  
  if (isCreative || N_S === 'N') {
    types.push('Creative');
  }
  
  if (isDeepTalk) {
    types.push('Thoughtful');
  }
  
  if (isSpontaneous) {
    types.push('Spontaneous');
  } else if (isIntentional) {
    types.push('Intentional');
  }
  
  if (isCozy || isIntimate) {
    types.push('Calm');
  }
  
  if (isSocial) {
    types.push('Social');
  }
  
  if (isNature) {
    types.push('Grounded');
  }
  
  // Add time qualifier if strong
  let timeQualifier = '';
  if (isNightEnergy) {
    timeQualifier = ' night energy';
  } else if (isEveningEnergy) {
    timeQualifier = ' evening vibes';
  }

  // Pick top 2-3 types
  const uniqueTypes = [...new Set(types)].slice(0, 3);
  
  if (uniqueTypes.length === 0) {
    return {
      text: `Strong match for ${E_I === 'E' ? 'outgoing' : 'thoughtful'} ${F_T === 'F' ? 'feelers' : 'thinkers'}`,
      compatibility: 85
    };
  }
  
  const typeString = uniqueTypes.join(' + ');
  
  return {
    text: `Strong match for ${typeString}${timeQualifier} types`,
    compatibility: Math.min(95, 75 + signals.length * 3)
  };
}