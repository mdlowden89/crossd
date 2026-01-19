import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Map } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pink marker icon
const pinkIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function ActivityMap({ moments }) {
  const { center, bounds, pathCoordinates } = useMemo(() => {
    if (!moments || moments.length === 0) {
      return { 
        center: [51.505, -0.09], 
        bounds: null,
        pathCoordinates: [] 
      };
    }

    const coords = moments
      .filter(m => m.lat && m.lng)
      .map(m => [m.lat, m.lng]);

    if (coords.length === 0) {
      return { 
        center: [51.505, -0.09], 
        bounds: null,
        pathCoordinates: [] 
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

    return { 
      center: [avgLat, avgLng], 
      bounds,
      pathCoordinates 
    };
  }, [moments]);

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
          filter: brightness(0.2) invert(1) hue-rotate(290deg) saturate(3);
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
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Route line */}
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
        
        {/* Markers */}
        {moments.filter(m => m.lat && m.lng).map((moment) => (
          <React.Fragment key={moment.id}>
            <Circle
              center={[moment.lat, moment.lng]}
              radius={50}
              pathOptions={{
                color: '#E70F72',
                fillColor: '#E70F72',
                fillOpacity: 0.2,
                weight: 2
              }}
            />
            <Marker position={[moment.lat, moment.lng]} icon={pinkIcon}>
              <Popup>
                <div className="p-2">
                  <div className="font-semibold text-[#E70F72] mb-1">
                    {moment.venue_name || 'Logged Moment'}
                  </div>
                  {moment.note && (
                    <div className="text-white/80 text-sm mb-2">{moment.note}</div>
                  )}
                  {moment.mood_tags && moment.mood_tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
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
                  <div className="text-white/50 text-xs mt-2">
                    {new Date(moment.created_date).toLocaleDateString()}
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