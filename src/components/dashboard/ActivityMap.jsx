import React, { useEffect, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { base44 } from '@/api/base44Client';
import GoogleActivityMap from './map/GoogleActivityMap';

const MAP_STYLES = `
  .crossd-activity-map .gm-style-iw.gm-style-iw-c {
    background: #0b0b0b !important;
    border: 1px solid rgba(231, 15, 114, 0.5) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
    padding: 0 !important;
    max-height: none !important;
  }
  .crossd-activity-map .gm-style-iw-d {
    overflow: hidden !important;
    background: #0b0b0b !important;
  }
  .crossd-activity-map .gm-style-iw-tc::after {
    background: #0b0b0b !important;
  }
  .crossd-activity-map .gm-ui-hover-effect {
    filter: invert(1);
    opacity: 0.8 !important;
    top: 2px !important;
    right: 2px !important;
  }
`;

function MapPlaceholder({ label, spinner }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
      {spinner && <div className="w-6 h-6 border-2 border-[#E70F72]/30 border-t-[#E70F72] rounded-full animate-spin" />}
      <span className="text-white/40 text-sm">{label}</span>
    </div>
  );
}

export default function ActivityMap({ moments, profile }) {
  const [apiKey, setApiKey] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke('getGoogleApiKey')
      .then((res) => setApiKey(res.data?.apiKey || null))
      .catch(() => setLoadFailed(true));
  }, []);

  return (
    <div className="crossd-activity-map relative w-full h-full overflow-hidden rounded-none border-0 bg-black">
      <style>{MAP_STYLES}</style>

      {loadFailed && <MapPlaceholder label="Map unavailable" />}
      {!loadFailed && !apiKey && <MapPlaceholder label="Loading map…" spinner />}

      {!loadFailed && apiKey && (
        <LoadScript
          googleMapsApiKey={apiKey}
          loadingElement={<MapPlaceholder label="Loading map…" spinner />}
        >
          <GoogleActivityMap moments={moments} profile={profile} />
        </LoadScript>
      )}
    </div>
  );
}