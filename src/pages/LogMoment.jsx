import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, MapPin, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { LoadScript, StandaloneSearchBox, GoogleMap, Marker } from '@react-google-maps/api';

const geohash = (lat, lng, precision = 7) => {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;
  let bits = 0, bit = 0, ch = 0, hash = '';

  while (hash.length < precision) {
    if (bits % 2 === 0) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) {
        ch |= (1 << (4 - bit));
        minLng = mid;
      } else maxLng = mid;
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        ch |= (1 << (4 - bit));
        minLat = mid;
      } else maxLat = mid;
    }
    bits++;
    bit++;
    if (bit === 5) {
      hash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
};

const libraries = ['places'];

export default function LogMoment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Step 1: Location
  const [selectedPlace, setSelectedPlace] = useState(null);
  const searchBoxRef = useRef(null);
  const [apiKey, setApiKey] = useState(null);

  // Step 2: Details
  const [ethnicity, setEthnicity] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [momentDescription, setMomentDescription] = useState('');
  const [interactionTypes, setInteractionTypes] = useState({
    eyeContact: false,
    smile: false,
    chat: false
  });

  useEffect(() => {
    // Get API key from environment
    const fetchApiKey = async () => {
      try {
        const key = await base44.functions.invoke('getGoogleApiKey');
        setApiKey(key.data.apiKey);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };
    fetchApiKey();

    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => console.log('Location access denied')
    );
  }, []);

  const onLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      setSelectedPlace({
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id
      });
    }
  };

  const handleContinue = () => {
    if (selectedPlace) {
      setStep(2);
    }
  };

  const handleSaveMoment = async () => {
    if (!selectedPlace || !momentDescription) return;

    try {
      setLoading(true);
      const user = await base44.auth.me();
      const timeBucket = new Date().toISOString().slice(0, 13) + ':00:00Z';

      await base44.entities.Moment.create({
        user_id: user.id,
        venue_name: selectedPlace.name,
        venue_id: selectedPlace.placeId,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        geohash: geohash(selectedPlace.lat, selectedPlace.lng),
        tile_key: `${Math.floor(selectedPlace.lat / 10)}_${Math.floor(selectedPlace.lng / 10)}`,
        time_bucket: timeBucket,
        privacy_level: 'approximate',
        note: otherDetails || null,
        mood_tags: Object.keys(interactionTypes)
          .filter(key => interactionTypes[key])
          .map(key => ({
            'eyeContact': 'Eye Contact',
            'smile': 'Smile',
            'chat': 'Chat'
          }[key]))
      });

      navigate(createPageUrl('Moments'));
    } catch (error) {
      console.error('Error saving moment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step === 1 ? navigate(createPageUrl('Moments')) : setStep(1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">
              {step === 1 ? 'Log a Moment' : 'Describe the Moment'}
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 py-6">
          {step === 1 ? (
            // Step 1: Location Selection
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Set Your Location</h2>
                <p className="text-white/60">Step 1 of 2</p>
              </div>

              {/* Search Input with Google Places Autocomplete */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Search for a place or address</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10 pointer-events-none" />
                  <StandaloneSearchBox
                    onLoad={onLoad}
                    onPlacesChanged={onPlacesChanged}
                    bounds={userLocation ? new window.google.maps.LatLngBounds(
                      new window.google.maps.LatLng(userLocation.lat - 0.1, userLocation.lng - 0.1),
                      new window.google.maps.LatLng(userLocation.lat + 0.1, userLocation.lng + 0.1)
                    ) : undefined}
                  >
                    <input
                      type="text"
                      placeholder="e.g., Coffee shop in Purley..."
                      className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E70F72] transition-colors"
                    />
                  </StandaloneSearchBox>
                </div>
              </div>

              {/* Map */}
              <div className="mb-6 rounded-xl overflow-hidden border border-white/15">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '300px' }}
                  center={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : (userLocation || { lat: 51.5074, lng: -0.1278 })}
                  zoom={selectedPlace ? 16 : 12}
                  options={{
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#0B0B0B" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
                      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
                    ],
                    disableDefaultUI: true,
                    zoomControl: true
                  }}
                >
                  {selectedPlace && (
                    <Marker
                      position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#E70F72',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3
                      }}
                    />
                  )}
                </GoogleMap>
              </div>

            {/* Selected Place */}
            {selectedPlace && (
              <div className="bg-[#0B0B0B] border border-[#E70F72]/50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E70F72] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">{selectedPlace.name}</h3>
                    <p className="text-sm text-white/60">{selectedPlace.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="mt-3 text-sm text-[#E70F72] hover:text-[#E70F72]/80 transition-colors"
                >
                  Change location
                </button>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedPlace || loading}
              className="w-full bg-[#E70F72] text-black font-semibold py-3 rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue'}
            </button>
          </motion.div>
        ) : (
          // Step 2: Moment Details
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Describe the Moment</h2>
              <p className="text-white/60">Step 2 of 2</p>
            </div>

            {/* Ethnicity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Their Ethnicity</label>
              <select
                value={ethnicity}
                onChange={(e) => setEthnicity(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E70F72] transition-colors"
              >
                <option value="">Prefer not to describe</option>
                <option value="white">White/Caucasian</option>
                <option value="black">Black/African Descent</option>
                <option value="east_asian">East Asian</option>
                <option value="hispanic">Hispanic/Latino</option>
                <option value="middle_eastern">Middle Eastern</option>
                <option value="south_asian">South Asian</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Other Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Other details about them (Optional)</label>
              <input
                type="text"
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                placeholder="e.g., Wearing a blue hat, reading a book, had a small dog..."
                className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E70F72] transition-colors"
              />
            </div>

            {/* Interaction Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">What was the moment like?</label>
              <div className="space-y-3">
                {[
                  { key: 'eyeContact', label: 'Eye Contact' },
                  { key: 'smile', label: 'Brief Smile' },
                  { key: 'chat', label: 'Brief Chat' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer p-3 bg-[#0B0B0B] border border-white/15 rounded-lg hover:border-[#E70F72]/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={interactionTypes[key]}
                      onChange={(e) => setInteractionTypes({
                        ...interactionTypes,
                        [key]: e.target.checked
                      })}
                      className="w-5 h-5 accent-[#E70F72]"
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Describe the experience or atmosphere</label>
              <textarea
                value={momentDescription}
                onChange={(e) => setMomentDescription(e.target.value)}
                placeholder="e.g., Cozy vibe in the cafe, I was enjoying my coffee. They caught my eye by the window."
                maxLength={300}
                className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E70F72] transition-colors h-32 resize-none"
              />
              <p className="text-sm text-white/50 mt-2">{momentDescription.length} / 300</p>
            </div>

            {!momentDescription && (
              <p className="text-sm text-red-500 mb-4">Description is required.</p>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveMoment}
              disabled={!momentDescription || loading}
              className="w-full bg-[#E70F72] text-black font-semibold py-3 rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Moment'}
            </button>
          </motion.div>
        )}
        </div>
      </div>
    </LoadScript>
  );
}