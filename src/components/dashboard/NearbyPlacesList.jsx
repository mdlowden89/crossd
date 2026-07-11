import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Navigation, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function NearbyPlacesList({ venue, profile, moments = [] }) {
  const [places, setPlaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Derive search locations: hangout areas first, then unique moment locations
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
    return locs.slice(0, 2); // search top 2 areas max
  }, [profile, moments]);

  async function fetchPlaces() {
    if (open) { setOpen(false); return; }
    if (places) { setOpen(true); return; }
    if (!searchLocations.length) return;

    setLoading(true);
    try {
      const loc = searchLocations[0];
      const res = await base44.functions.invoke('searchPlaces', {
        query: venue.label,
        lat: loc.lat,
        lng: loc.lng,
        radius: 5000,
      });
      const results = res.data?.results || res.data?.places || [];
      setPlaces(results.slice(0, 5));
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
    <div>
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
          {places.map((p, i) => {
            const name = p.name || p.displayName?.text;
            const address = p.formatted_address || p.vicinity || p.shortFormattedAddress || '';
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`;
            return (
              <div key={i} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white/4 border border-white/8">
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-xs font-medium truncate">{name}</p>
                  {address && <p className="text-white/35 text-[10px] truncate">{address}</p>}
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-[#E70F72] hover:text-[#E70F72]/70 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <Navigation className="w-3 h-3" />
                  Go
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}