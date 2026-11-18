import React from 'react';
import { Marker, Circle } from '@react-google-maps/api';
import { COLORS } from './mapStyle';

const CIRCLE_PATH = 'M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0';

// One logged moment on the map: glow aura, radius circle and pin
export default function MomentMarker({ moment, state, isSelected, onSelect }) {
  const position = { lat: moment.lat, lng: moment.lng };

  // Path is centred on 0,0 so the pin sits exactly on the location
  const icon = {
    path: CIRCLE_PATH,
    fillColor: state.color,
    fillOpacity: state.isExpired ? 0.4 : 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    strokeOpacity: 1,
    scale: 1,
    anchor: new window.google.maps.Point(0, 0),
  };

  return (
    <>
      {state.isGlowActive && !state.isExpired && (
        <Circle
          center={position}
          radius={200}
          options={{
            strokeColor: COLORS.PINK,
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: COLORS.PINK,
            fillOpacity: 0.12,
          }}
        />
      )}

      <Circle
        center={position}
        radius={60}
        options={{
          strokeColor: state.color,
          strokeOpacity: state.recencyOpacity * 0.8,
          strokeWeight: state.isExpired ? 2 : 3,
          fillColor: state.fillColor,
          fillOpacity: state.isExpired ? 0.1 : 0.25 * state.recencyOpacity,
        }}
      />

      <Marker position={position} icon={icon} zIndex={isSelected ? 1000 : 1} onClick={() => onSelect(moment.id)} />
    </>
  );
}