// Shared colours, icons and Google Maps styling for the activity map
export const COLORS = {
  PINK: '#E70F72',     // brand glow / spark
  YELLOW: '#FFD84D',   // spark / expiring
  GREEN: '#2DD881',    // match
  PURPLE: '#8A63F6',   // re-sight
  GREY: '#5A5A5A',     // expired
  ORANGE: '#FF6B35',   // today's spot
};

export const PLACE_ICONS = {
  cafe: '☕',
  gallery: '🎨',
  park: '🌳',
  restaurant: '🍝',
  station: '🚇',
  default: '📍',
};

// Neutral dark map style — no colour cast, brand colour comes from the markers
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e0e0e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9b9b9b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0e0e' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c4c4c4' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#707070' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#101a12' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6e6e6e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#323232' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07131d' }] },
];

// Marker state derived from a logged moment
export const getMarkerState = (moment, allMoments, profile) => {
  const now = new Date();
  const createdDate = new Date(moment.created_date);
  const ageDays = (now - createdDate) / (1000 * 60 * 60 * 24);

  const expiresAt = moment.expires_at ? new Date(moment.expires_at) : null;
  const isExpired = Boolean(expiresAt && now > expiresAt);
  const hoursUntilExpiry = expiresAt ? (expiresAt - now) / (1000 * 60 * 60) : null;
  const isExpiringSoon = Boolean(hoursUntilExpiry && hoursUntilExpiry < 24 && hoursUntilExpiry > 0);

  const hasMatch = moment.status === 'matched';
  const isGlowActive = Boolean(profile?.glow_active_until && new Date(profile.glow_active_until) > now);

  const nearbyMoments = (allMoments || []).filter(m =>
    m.id !== moment.id &&
    m.geohash?.substring(0, 6) === moment.geohash?.substring(0, 6)
  );
  const isReSight = nearbyMoments.length > 0;
  const reSightCount = nearbyMoments.length + 1;

  const isToday = createdDate.toDateString() === now.toDateString();
  const recencyOpacity = Math.max(0.3, 1 - (ageDays / 30));

  let color = COLORS.PINK;
  let fillColor = COLORS.YELLOW;
  let glowIntensity = 0.5;

  if (isExpired) {
    color = COLORS.GREY;
    fillColor = COLORS.GREY;
    glowIntensity = 0.1;
  } else if (hasMatch) {
    color = COLORS.GREEN;
    fillColor = COLORS.GREEN;
    glowIntensity = 0.7;
  } else if (isReSight) {
    color = COLORS.PURPLE;
    fillColor = COLORS.PURPLE;
    glowIntensity = 0.6;
  } else if (isExpiringSoon) {
    color = COLORS.YELLOW;
    fillColor = COLORS.YELLOW;
    glowIntensity = 0.8;
  }

  return {
    color,
    fillColor,
    glowIntensity,
    recencyOpacity,
    isExpired,
    isExpiringSoon,
    hasMatch,
    isReSight,
    reSightCount,
    isToday,
    isGlowActive,
    ageDays,
    hoursUntilExpiry,
    placeIcon: PLACE_ICONS[moment.place_type] || PLACE_ICONS.default,
  };
};