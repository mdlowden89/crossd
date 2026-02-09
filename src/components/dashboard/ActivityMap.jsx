import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Map, Sparkles, Star, Flame, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color constants
const COLORS = {
  PINK: '#E70F72',     // brand glow / spark
  YELLOW: '#FFD84D',   // spark / expiring
  GREEN: '#2DD881',    // match
  PURPLE: '#8A63F6',   // re-sight
  GREY: '#5A5A5A',     // expired
  GOLD: '#FFB800',     // best-fit
  ORANGE: '#FF6B35',   // today's spot
};

// Place type icons
const PLACE_ICONS = {
  cafe: '☕',
  gallery: '🎨',
  park: '🌳',
  restaurant: '🍝',
  station: '🚇',
  default: '📍'
};

// Calculate marker state and styling
const getMarkerState = (moment, allMoments, profile) => {
  const now = new Date();
  const createdDate = new Date(moment.created_date);
  const ageDays = (now - createdDate) / (1000 * 60 * 60 * 24);
  
  // Time calculations
  const expiresAt = moment.expires_at ? new Date(moment.expires_at) : null;
  const isExpired = expiresAt && now > expiresAt;
  const hoursUntilExpiry = expiresAt ? (expiresAt - now) / (1000 * 60 * 60) : null;
  const isExpiringSoon = hoursUntilExpiry && hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  
  // Status checks
  const hasMatch = moment.status === 'matched';
  const isGlowActive = profile?.glow_active_until && new Date(profile.glow_active_until) > now;
  
  // Re-sight check: find other moments in similar location
  const nearbyMoments = allMoments.filter(m => 
    m.id !== moment.id &&
    m.geohash?.substring(0, 6) === moment.geohash?.substring(0, 6)
  );
  const isReSight = nearbyMoments.length > 0;
  const reSightCount = nearbyMoments.length + 1;
  
  // Today's spot check
  const isToday = createdDate.toDateString() === now.toDateString();
  
  // Recency opacity (newer = brighter)
  const recencyOpacity = Math.max(0.3, 1 - (ageDays / 30));
  
  // Determine primary color and style
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
    placeIcon: PLACE_ICONS[moment.place_type] || PLACE_ICONS.default
  };
};

// Create custom marker icon based on state
const createMarkerIcon = (state, moment) => {
  const { color, fillColor, glowIntensity, isExpired, hasMatch, isReSight, reSightCount, isToday, placeIcon } = state;
  
  const glowAnimation = !isExpired && state.isExpiringSoon
    ? 'animation: pulse 2s ease-in-out infinite;'
    : '';
  
  const matchBadge = hasMatch 
    ? `<div style="position: absolute; top: -8px; right: -8px; background: ${COLORS.GREEN}; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px;">🌟</div>`
    : '';
  
  const reSightBadge = isReSight
    ? `<div style="position: absolute; top: -10px; right: -10px; background: ${COLORS.PURPLE}; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid #000;">×${reSightCount}</div>`
    : '';
  
  const todayBadge = isToday
    ? `<div style="position: absolute; top: -12px; left: -12px; background: ${COLORS.ORANGE}; color: white; border-radius: 4px; padding: 2px 4px; font-size: 8px; font-weight: bold;">TODAY</div>`
    : '';
  
  const placeTypeIcon = `<div style="position: absolute; top: -6px; left: -6px; font-size: 12px;">${placeIcon}</div>`;
  
  return L.divIcon({
    className: 'custom-crossd-marker',
    html: `
      <style>
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 216, 77, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 216, 77, 0.6); }
        }
        @keyframes shimmer {
          0% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.1); }
          100% { transform: rotate(-45deg) scale(1); }
        }
      </style>
      <div style="position: relative; width: 26px; height: 26px;">
        ${placeTypeIcon}
        <div style="
          background: linear-gradient(135deg, ${fillColor}, ${color}); 
          width: 26px; 
          height: 26px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          border: 3px solid #fff; 
          box-shadow: 0 0 ${20 * glowIntensity}px rgba(231, 15, 114, ${glowIntensity});
          opacity: ${isExpired ? 0.4 : 1};
          ${glowAnimation}
          ${hasMatch ? 'animation: shimmer 1s ease-in-out;' : ''}
        "></div>
        ${matchBadge}
        ${reSightBadge}
        ${todayBadge}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26]
  });
};

export default function ActivityMap({ moments, profile }) {
  const { center, bounds, pathCoordinates, momentStates } = useMemo(() => {
    if (!moments || moments.length === 0) {
      return { 
        center: [51.505, -0.09], 
        bounds: null,
        pathCoordinates: [],
        momentStates: []
      };
    }

    const coords = moments
      .filter(m => m.lat && m.lng)
      .map(m => [m.lat, m.lng]);

    if (coords.length === 0) {
      return { 
        center: [51.505, -0.09], 
        bounds: null,
        pathCoordinates: [],
        momentStates: []
      };
    }

    // Calculate center
    const avgLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

    // Calculate bounds
    const lats = coords.map(c => c[0]);
    const lngs = coords.map(c => c[1]);
    const bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];

    // Sort by date for path
    const sortedMoments = [...moments]
      .filter(m => m.lat && m.lng)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    
    const pathCoordinates = sortedMoments.map(m => [m.lat, m.lng]);

    // Calculate states for all moments
    const momentStates = moments
      .filter(m => m.lat && m.lng)
      .map(m => ({
        moment: m,
        state: getMarkerState(m, moments, profile)
      }));

    return { 
      center: [avgLat, avgLng], 
      bounds,
      pathCoordinates,
      momentStates
    };
  }, [moments, profile]);

  if (!moments || moments.length === 0) {
    return (
      <div className="aspect-video bg-black/40 rounded-2xl flex items-center justify-center border border-white/5">
        <div className="text-center p-8">
          <Map className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/50">Start logging moments to see your journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden border border-[#E70F72]/20 shadow-[0_0_30px_rgba(231,15,114,0.15)]">
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #000000;
        }
        .leaflet-tile-pane {
          filter: brightness(0.6) sepia(1) hue-rotate(290deg) saturate(5) contrast(1.2);
        }
        .leaflet-popup-content-wrapper {
          background: #0B0B0B;
          color: white;
          border: 1px solid rgba(231, 15, 114, 0.3);
          border-radius: 12px;
        }
        .leaflet-popup-tip {
          background: #0B0B0B;
          border: 1px solid rgba(231, 15, 114, 0.3);
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(231, 15, 114, 0.3) !important;
        }
        .leaflet-control-zoom a {
          background: #0B0B0B !important;
          color: #E70F72 !important;
          border-bottom: 1px solid rgba(231, 15, 114, 0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a1a1a !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={13}
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        />
        
        {/* Route line with gradient effect based on recency */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: '#E70F72',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10'
            }}
          />
        )}
        
        {/* Markers with state-based styling */}
        {momentStates.map(({ moment, state }) => (
          <React.Fragment key={moment.id}>
            {/* Glow aura for active Glow Mode (Crossd+) */}
            {state.isGlowActive && !state.isExpired && (
              <Circle
                center={[moment.lat, moment.lng]}
                radius={150}
                pathOptions={{
                  color: COLORS.PINK,
                  fillColor: COLORS.PINK,
                  fillOpacity: 0.1,
                  weight: 2,
                  opacity: 0.3,
                  dashArray: '5, 10'
                }}
              />
            )}
            
            {/* Main circle radius */}
            <Circle
              center={[moment.lat, moment.lng]}
              radius={50}
              pathOptions={{
                color: state.color,
                fillColor: state.fillColor,
                fillOpacity: state.isExpired ? 0.1 : 0.2 * state.recencyOpacity,
                weight: state.isExpired ? 1 : 2,
                opacity: state.recencyOpacity
              }}
            />
            
            {/* Marker */}
            <Marker 
              position={[moment.lat, moment.lng]} 
              icon={createMarkerIcon(state, moment)}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{state.placeIcon}</span>
                      <div>
                        <div className="font-bold text-white text-base">
                          {moment.venue_name || 'Logged Moment'}
                        </div>
                        <div className="text-white/50 text-xs">
                          {new Date(moment.created_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {state.hasMatch && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                        🌟 Match
                      </span>
                    )}
                    {state.isReSight && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                        Re-Sight ×{state.reSightCount}
                      </span>
                    )}
                    {state.isExpiringSoon && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                        ⏰ {Math.round(state.hoursUntilExpiry)}h left
                      </span>
                    )}
                    {state.isExpired && (
                      <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
                        Expired
                      </span>
                    )}
                    {state.isToday && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        Today
                      </span>
                    )}
                    {state.isGlowActive && (
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full flex items-center gap-1">
                        ✨ Glow Active
                      </span>
                    )}
                  </div>
                  
                  {/* Note */}
                  {moment.note && (
                    <div className="text-white/80 text-sm mb-2 italic">
                      "{moment.note}"
                    </div>
                  )}
                  
                  {/* Mood tags */}
                  {moment.mood_tags && moment.mood_tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {moment.mood_tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-[#E70F72]/20 text-[#E70F72] px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Age indicator */}
                  <div className="text-white/40 text-xs pt-2 border-t border-white/10">
                    {state.ageDays < 1 
                      ? 'Today' 
                      : state.ageDays < 2 
                        ? 'Yesterday'
                        : `${Math.round(state.ageDays)} days ago`
                    }
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}