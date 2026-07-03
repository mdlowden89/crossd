import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, X, MapPin, Loader2, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const libraries = ['places'];

function StopCard({ stop, index, onRemove, onTimeChange, isFirst, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-[#0B0B0B] border border-white/10 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className="w-7 h-7 rounded-full bg-[#E70F72] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {index + 1}
          </div>
          {!isLast && <div className="w-0.5 h-4 bg-white/10" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{stop.name}</p>
          <p className="text-white/40 text-xs truncate mt-0.5">{stop.address}</p>
          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <label className="text-white/40 text-xs block mb-1">Arrived</label>
              <input
                type="time"
                value={stop.arrived_at || ''}
                onChange={(e) => onTimeChange(index, 'arrived_at', e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E70F72]"
              />
            </div>
            <div className="flex-1">
              <label className="text-white/40 text-xs block mb-1">Left</label>
              <input
                type="time"
                value={stop.left_at || ''}
                onChange={(e) => onTimeChange(index, 'left_at', e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E70F72]"
              />
            </div>
          </div>
        </div>
        <button onClick={() => onRemove(index)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-4 h-4 text-white/40" />
        </button>
      </div>
    </motion.div>
  );
}

function PlaceSearchBox({ onPlaceSelected, apiKey }) {
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);

  const onLoad = (ref) => { searchBoxRef.current = ref; };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      onPlaceSelected({
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        place_id: place.place_id
      });
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a place..."
        className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E70F72] transition-colors"
      />
    </StandaloneSearchBox>
  );
}

export default function LogDailyPath() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(null);
  const [stops, setStops] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    base44.functions.invoke('getGoogleApiKey').then(r => setApiKey(r.data.apiKey));

    // Load existing path for today if any
    const loadExisting = async () => {
      const user = await base44.auth.me();
      const paths = await base44.entities.DailyPath.filter({ user_id: user.id, date: today });
      if (paths.length > 0 && paths[0].stops) {
        setStops(paths[0].stops.map(s => ({ ...s, address: s.address || '' })));
      }
    };
    loadExisting();
  }, []);

  const addStop = (place) => {
    setStops(prev => [...prev, {
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      place_id: place.place_id,
      arrived_at: '',
      left_at: ''
    }]);
  };

  const removeStop = (index) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const updateTime = (index, field, value) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    if (stops.length === 0) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();

      const existing = await base44.entities.DailyPath.filter({ user_id: user.id, date: today });
      if (existing.length > 0) {
        await base44.entities.DailyPath.update(existing[0].id, { stops, crossings_checked: false });
      } else {
        await base44.entities.DailyPath.create({ user_id: user.id, date: today, stops, crossings_checked: false });
      }

      setSaved(true);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Where did you go today?</h1>
              <p className="text-white/40 text-xs">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          {/* Explainer */}
          <div className="bg-[#E70F72]/10 border border-[#E70F72]/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-white/80 text-sm leading-relaxed">
              <span className="text-[#E70F72] font-semibold">Path matching</span> — add the places you visited today and we'll check if your route crossed someone else's. No real-time tracking, just your recall.
            </p>
          </div>

          {/* Stops list */}
          {stops.length > 0 && (
            <div className="space-y-3 mb-5">
              <AnimatePresence>
                {stops.map((stop, i) => (
                  <StopCard
                    key={stop.place_id + i}
                    stop={stop}
                    index={i}
                    onRemove={removeStop}
                    onTimeChange={updateTime}
                    isFirst={i === 0}
                    isLast={i === stops.length - 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Search box */}
          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add a stop
            </label>
            <PlaceSearchBox onPlaceSelected={addStop} apiKey={apiKey} />
          </div>

          {/* Empty state */}
          {stops.length === 0 && (
            <div className="text-center py-10 text-white/30">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Add the places you visited today</p>
              <p className="text-xs mt-1">e.g. coffee shop, gym, office, park</p>
            </div>
          )}

          {/* Tip */}
          {stops.length > 0 && (
            <p className="text-white/35 text-xs text-center mb-6 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Adding approximate times improves crossing accuracy
            </p>
          )}

          {/* Save */}
          {stops.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full bg-[#E70F72] text-white font-semibold py-3.5 rounded-full hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saved ? (
                <><CheckCircle className="w-5 h-5" /> Path saved — checking crossings</>
              ) : saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Save my path'
              )}
            </button>
          )}
        </div>
      </div>
    </LoadScript>
  );
}