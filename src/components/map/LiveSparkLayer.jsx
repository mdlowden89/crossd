import React, { useMemo } from 'react';
import { Circle } from 'react-leaflet';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

// Archetype colors
const ARCHETYPE_COLORS = {
  romantic: '#E74C78',
  calm_cozy: '#C49A6C',
  creative: '#9B5DE5',
  social_buzzing: '#FF6B3D',
  nature_grounded: '#6A8F7A',
  live_electric: '#F6C90E',
  deep_intellectual: '#4169E1',
  active_energetic: '#FF4081',
  nightlife: '#B026FF',
  intimate_local: '#8B7355',
};

const STATE_LABELS = {
  calm: null,
  active: '✨ Active',
  peaking: '🔥 Peaking',
};

function getZoneColor(dominantArchetypes) {
  const first = dominantArchetypes?.[0];
  return ARCHETYPE_COLORS[first] || '#E70F72';
}

function createZoneLabelIcon(label, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${color}22;
        border: 1px solid ${color}88;
        color: ${color};
        padding: 3px 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        backdrop-filter: blur(4px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">${label}</div>
    `,
    iconAnchor: [0, 0],
  });
}

export default function LiveSparkLayer({ historicZones, liveZones, onZoneClick }) {
  const blended = useMemo(() => {
    const liveMap = {};
    for (const lz of (liveZones || [])) {
      liveMap[lz.zone_id] = lz;
    }

    return (historicZones || [])
      .map(hz => {
        const lz = liveMap[hz.zone_id] || {};
        const historicScore = hz.historic_score || 0;
        const liveScore = lz.live_score || 0;
        const energy = Math.min(1, historicScore * 0.65 + liveScore * 0.35);
        const state = lz.state || (energy > 0.65 ? 'peaking' : energy > 0.3 ? 'active' : 'calm');

        return {
          ...hz,
          liveScore,
          energy,
          state,
          activity_band: lz.activity_band || 'low',
          label: STATE_LABELS[state],
        };
      })
      .filter(z => z.energy >= 0.15);
  }, [historicZones, liveZones]);

  return (
    <>
      {blended.map(zone => {
        const color = getZoneColor(zone.dominant_archetypes);
        const radius = 180 + zone.energy * 320; // 180m to 500m
        const fillOpacity = 0.08 + zone.energy * 0.22;
        const strokeOpacity = 0.3 + zone.energy * 0.5;
        const isPeaking = zone.state === 'peaking';

        return (
          <React.Fragment key={zone.zone_id}>
            {/* Outer aura (soft glow) */}
            <Circle
              center={[zone.centroid_lat, zone.centroid_lng]}
              radius={radius * 1.6}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: fillOpacity * 0.4,
                weight: 0,
                opacity: 0,
              }}
              eventHandlers={{ click: () => onZoneClick(zone) }}
            />

            {/* Main zone blob */}
            <Circle
              center={[zone.centroid_lat, zone.centroid_lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: fillOpacity,
                weight: isPeaking ? 2 : 1,
                opacity: strokeOpacity,
                dashArray: isPeaking ? null : '6 4',
              }}
              eventHandlers={{ click: () => onZoneClick(zone) }}
            />

            {/* Peaking pulse ring */}
            {isPeaking && (
              <Circle
                center={[zone.centroid_lat, zone.centroid_lng]}
                radius={radius * 1.25}
                pathOptions={{
                  color: color,
                  fillColor: 'transparent',
                  fillOpacity: 0,
                  weight: 2,
                  opacity: 0.5,
                  dashArray: '4 8',
                }}
                eventHandlers={{ click: () => onZoneClick(zone) }}
              />
            )}

            {/* State label */}
            {zone.label && (
              <Marker
                position={[zone.centroid_lat, zone.centroid_lng]}
                icon={createZoneLabelIcon(zone.label, color)}
                eventHandlers={{ click: () => onZoneClick(zone) }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}