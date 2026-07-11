import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Navigation, Loader2, ChevronUp, Star, X } from 'lucide-react';

function PlacePhotoModal({ place, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden bg-[#0B0B0B] border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {place.photo_url ? (
          <img
            src={place.photo_url}
            alt={place.name}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-white/5 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white/20" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">{place.name}</h3>
              {place.address && <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{place.address}</p>}
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white/70 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          {place.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">{place.rating}</span>
            </div>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#E70F72] text-white text-sm font-semibold hover:bg-[#E70F72]/80 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}

export default function NearbyPlacesList({ venue, profile, moments = [] }) {
  const [places, setPlaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const searchLocations = React.useMemo(() => {
    const locs = [];
    if (profile?.hangout_areas?.length) {
      profile.hangout_areas.forEach(a => {
        if (a.lat && a.lng) locs.push({ name: a.name, lat: a.lat, lng: a.lng });
      });
    }
    if (!locs.length && moments.length) {
      const seen = new Set();
      moments.forEach(m => {
        const key = `${Math.round(m.lat * 100)},${Math.round(m.lng * 100)}`;
        if (!seen.has(key) && m.lat && m.lng) {
          seen.add(key);
          locs.push({ name: m.venue_name || 'Your area', lat: m.lat, lng: m.lng });
        }
      });
    }
    return locs.slice(0, 2);
  }, [profile, moments]);

  async function fetchPlaces() {
    if (open) { setOpen(false); return; }
    if (places) { setOpen(true); return; }
    if (!searchLocations.length) return;

    setLoading(true);
    try {
      const loc = searchLocations[0];
      const res = await base44.functions.invoke('findNearbyPlaces', {
        query: venue.label,
        lat: loc.lat,
        lng: loc.lng,
        radius: 5000,
      });
      setPlaces(res.data?.places || []);
      setOpen(true);
    } catch {
      setPlaces([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  if (!searchLocations.length) return null;

  return (
    <>
      <button
        onClick={fetchPlaces}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#E70F72]/10 border border-[#E70F72]/25 text-[#E70F72] text-xs font-semibold hover:bg-[#E70F72]/20 transition-colors"
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : open
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <MapPin className="w-3.5 h-3.5" />
        }
        {loading ? 'Finding nearby places…' : open ? 'Hide places' : 'Find nearby places'}
      </button>

      {open && places && (
        <div className="mt-2 space-y-1.5">
          {places.length === 0 && (
            <p className="text-white/35 text-xs text-center py-2">No places found nearby.</p>
          )}
          {places.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelectedPlace(p)}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg bg-white/4 border border-white/8 hover:border-[#E70F72]/30 hover:bg-white/7 transition-all text-left"
            >
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white/85 text-xs font-medium truncate">{p.name}</p>
                {p.address && <p className="text-white/35 text-[10px] truncate">{p.address}</p>}
                {p.rating && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-[10px]">{p.rating}</span>
                  </div>
                )}
              </div>
              <Navigation className="w-3.5 h-3.5 text-[#E70F72] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selectedPlace && (
        <PlacePhotoModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
    </>
  );
}