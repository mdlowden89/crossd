import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, MapPin, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

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

export default function LogMoment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Step 1: Location
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);

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

  const handleSearchInput = (value) => {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setPredictions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await base44.functions.invoke('searchPlaces', {
          input: value,
          lat: userLocation?.lat,
          lng: userLocation?.lng
        });
        setPredictions(response.data?.predictions || []);
        setSearchLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setSearchLoading(false);
      }
    }, 500);
  };

  const handleSelectPlace = async (prediction) => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getPlaceDetails', {
        placeId: prediction.place_id
      });
      setSelectedPlace({
        name: response.data.name,
        address: response.data.address,
        lat: response.data.lat,
        lng: response.data.lng,
        placeId: prediction.place_id
      });
      setSearchInput('');
      setPredictions([]);
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setLoading(false);
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

  return (
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

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Search for a place or address</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="e.g., Coffee shop in Purley..."
                  className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E70F72] transition-colors"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E70F72] animate-spin" />
                )}
              </div>

              {/* Predictions Dropdown */}
              {predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0B0B] border border-white/15 rounded-xl overflow-hidden shadow-lg z-20">
                  {predictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      onClick={() => handleSelectPlace(prediction)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <p className="font-medium text-white">{prediction.main_text}</p>
                      <p className="text-sm text-white/60">{prediction.secondary_text}</p>
                    </button>
                  ))}
                </div>
              )}
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
  );
}