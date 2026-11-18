import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, Polyline, InfoWindow } from '@react-google-maps/api';
import { DARK_MAP_STYLE, getMarkerState } from './mapStyle';
import MomentMarker from './MomentMarker';
import MomentInfoContent from './MomentInfoContent';

const DEFAULT_CENTER = { lat: 51.505, lng: -0.09 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLE,
  backgroundColor: '#000000',
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

const ROUTE_OPTIONS = {
  strokeOpacity: 0,
  icons: [
    {
      icon: { path: 'M 0,-1 0,1', strokeColor: '#E70F72', strokeOpacity: 0.85, scale: 3 },
      offset: '0',
      repeat: '22px',
    },
  ],
};

const INFO_OPTIONS = { maxWidth: 300 };

// Google Maps activity map — assumes the Maps script is loaded
export default function GoogleActivityMap({ moments, profile }) {
  const [map, setMap] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { momentStates, route } = useMemo(() => {
    const withCoords = (moments || []).filter(m => m.lat && m.lng);
    const sorted = [...withCoords].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    return {
      momentStates: withCoords.map(m => ({ moment: m, state: getMarkerState(m, moments, profile) })),
      route: sorted.map(m => ({ lat: m.lat, lng: m.lng })),
    };
  }, [moments, profile]);

  // Keep every logged moment in view
  useEffect(() => {
    if (!map || !window.google || momentStates.length === 0) return;

    if (momentStates.length === 1) {
      map.setCenter({ lat: momentStates[0].moment.lat, lng: momentStates[0].moment.lng });
      map.setZoom(15);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    momentStates.forEach(({ moment }) => bounds.extend({ lat: moment.lat, lng: moment.lng }));
    map.fitBounds(bounds, 60);
  }, [map, momentStates]);

  const selected = momentStates.find(({ moment }) => moment.id === selectedId);

  return (
    <GoogleMap
      mapContainerStyle={CONTAINER_STYLE}
      center={DEFAULT_CENTER}
      zoom={13}
      options={MAP_OPTIONS}
      onLoad={setMap}
      onUnmount={() => setMap(null)}
      onClick={() => setSelectedId(null)}
    >
      {route.length > 1 && <Polyline path={route} options={ROUTE_OPTIONS} />}

      {momentStates.map(({ moment, state }) => (
        <MomentMarker
          key={moment.id}
          moment={moment}
          state={state}
          isSelected={moment.id === selectedId}
          onSelect={setSelectedId}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.moment.lat, lng: selected.moment.lng }}
          options={INFO_OPTIONS}
          onCloseClick={() => setSelectedId(null)}
        >
          <MomentInfoContent moment={selected.moment} state={selected.state} />
        </InfoWindow>
      )}
    </GoogleMap>
  );
}