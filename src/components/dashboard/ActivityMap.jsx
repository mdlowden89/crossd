import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LiveSparkLayer from '@/components/map/LiveSparkLayer';

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
  const { color, fillColor, glowIntensity, isExpired, hasMatch, isReSight, reSightCount, isToday } = state;
  
  const glowAnimation = !isExpired && state.isExpiringSoon
    ? 'animation: pulse 2s ease-in-out infinite;'
    : '';
  
  const matchBadge = hasMatch 
    ? `<div style="position: absolute; top: -4px; right: -4px; background: ${COLORS.GREEN}; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">✓</div>`
    : '';
  
  const reSightBadge = isReSight
    ? `<div style="position: absolute; top: -6px; right: -6px; background: ${COLORS.PURPLE}; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${reSightCount}</div>`
    : '';
  
  return L.divIcon({
    className: 'custom-crossd-marker',
    html: `
      <style>
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(231, 15, 114, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(231, 15, 114, 0), 0 2px 8px rgba(0, 0, 0, 0.3); }
        }
      </style>
      <div style="position: relative; width: 24px; height: 24px; cursor: pointer;">
        <div style="
          background: ${color}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 3px solid #fff; 
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          opacity: ${isExpired ? 0.4 : 1};
          ${glowAnimation}
          transition: transform 0.2s ease;
        "></div>
        ${matchBadge}
        ${reSightBadge}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
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

  return (
    <div className="w-full h-full overflow-hidden rounded-none border-0">
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #000000;
        }
        .leaflet-tile-pane {
          filter: brightness(0.7) sepia(1) hue-rotate(290deg) saturate(4) contrast(1.1);
        }
        .leaflet-popup-content-wrapper {
          background: rgba(11, 11, 11, 0.98);
          color: white;
          border: 2px solid rgba(231, 15, 114, 0.5);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          max-width: 280px !important;
        }
        .leaflet-popup-tip {
          background: rgba(11, 11, 11, 0.98);
          border: 2px solid rgba(231, 15, 114, 0.5);
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-control-zoom {
          border: 2px solid rgba(231, 15, 114, 0.5) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        }
        .leaflet-control-zoom a {
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-size: 24px !important;
          background: #0B0B0B !important;
          color: #E70F72 !important;
          border-bottom: 1px solid rgba(231, 15, 114, 0.3) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a1a1a !important;
          color: #ff1a8c !important;
        }
        .custom-crossd-marker:hover div > div {
          transform: scale(1.15) !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={13}
        bounds={bounds}
        boundsOptions={{ padding: [60, 60] }}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
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
              weight: 4,
              opacity: 0.8,
              dashArray: '12, 8',
              lineCap: 'round',
              lineJoin: 'round'
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
                radius={200}
                pathOptions={{
                  color: COLORS.PINK,
                  fillColor: COLORS.PINK,
                  fillOpacity: 0.15,
                  weight: 3,
                  opacity: 0.4,
                  dashArray: '8, 12'
                }}
              />
            )}
            
            {/* Main circle radius */}
            <Circle
              center={[moment.lat, moment.lng]}
              radius={60}
              pathOptions={{
                color: state.color,
                fillColor: state.fillColor,
                fillOpacity: state.isExpired ? 0.1 : 0.25 * state.recencyOpacity,
                weight: state.isExpired ? 2 : 3,
                opacity: state.recencyOpacity * 0.8
              }}
            />
            
            {/* Marker */}
            <Marker 
              position={[moment.lat, moment.lng]} 
              icon={createMarkerIcon(state, moment)}
            >
              <Popup maxWidth={280} minWidth={240}>
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{state.placeIcon}</span>
                      <div>
                        <div className="font-bold text-white text-lg leading-tight">
                          {moment.venue_name || 'Logged Moment'}
                        </div>
                        <div className="text-white/60 text-sm mt-1">
                          {new Date(moment.created_date).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {state.hasMatch && (
                      <span className="text-sm font-semibold bg-green-500/30 text-green-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-400/30">
                        🌟 Match
                      </span>
                    )}
                    {state.isReSight && (
                      <span className="text-sm font-semibold bg-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full border border-purple-400/30">
                        Re-Sight ×{state.reSightCount}
                      </span>
                    )}
                    {state.isExpiringSoon && (
                      <span className="text-sm font-semibold bg-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-yellow-400/30">
                        ⏰ {Math.round(state.hoursUntilExpiry)}h left
                      </span>
                    )}
                    {state.isExpired && (
                      <span className="text-sm font-semibold bg-gray-500/30 text-gray-400 px-3 py-1.5 rounded-full border border-gray-400/30">
                        Expired
                      </span>
                    )}
                    {state.isToday && (
                      <span className="text-sm font-semibold bg-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full border border-orange-400/30">
                        Today
                      </span>
                    )}
                    {state.isGlowActive && (
                      <span className="text-sm font-semibold bg-pink-500/30 text-pink-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-pink-400/30">
                        ✨ Glow Active
                      </span>
                    )}
                  </div>
                  
                  {/* Note */}
                  {moment.note && (
                    <div className="text-white/90 text-base mb-3 italic leading-relaxed px-2 py-2 bg-white/5 rounded-lg border border-white/10">
                      "{moment.note}"
                    </div>
                  )}
                  
                  {/* Mood tags */}
                  {moment.mood_tags && moment.mood_tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {moment.mood_tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-sm font-medium bg-[#E70F72]/25 text-[#E70F72] px-3 py-1 rounded-full border border-[#E70F72]/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Age indicator */}
                  <div className="text-white/50 text-sm pt-3 border-t border-white/10 font-medium">
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