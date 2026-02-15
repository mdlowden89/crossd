import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ActivityMap({ moments, profile }) {
  const center = useMemo(() => {
    // Default to London
    return [51.505, -0.09];
  }, []);

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
      `}</style>
      <MapContainer
        center={center}
        zoom={13}
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
      </MapContainer>
    </div>
  );
}