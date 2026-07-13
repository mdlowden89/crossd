import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Search, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const libraries = ['places'];

function StopCard({ stop, index, onRemove, onTimeChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-[#0d0008] border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#E70F72]/30 flex items-center justify-center">
            <span className="text-[#E70F72] text-xs font-bold">{index + 1}</span>
          </div>
          <span className="text-white/40 text-xs uppercase tracking-wider">Stop</span>
        </div>
        <button onClick={() => onRemove(index)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4 text-white/30" />
        </button>
      </div>
      <p className="text-white font-bold text-base mb-0.5">{stop.name}</p>
      <p className="text-white/35 text-xs mb-4">{stop.address}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/40 text-xs block mb-1.5">Around what time?</label>
          <input
            type="time"
            value={stop.arrived_at || ''}
            onChange={(e) => onTimeChange(index, 'arrived_at', e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E70F72] transition-colors"
          />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1.5">How long? (min)</label>
          <input
            type="number"
            placeholder="60"
            value={stop.duration_min || ''}
            onChange={(e) => onTimeChange(index, 'duration_min', e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E70F72] transition-colors"
          />
        </div>
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
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search a place you visited..."
          className="w-full bg-[#0d0008] border border-white/12 rounded-2xl pl-10 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E70F72] transition-colors text-sm"
        />
      </div>
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
      duration_min: ''
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
      setTimeout(() => navigate(-1), 2000);
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
        <div className="px-4 pt-5 pb-4 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="absolute left-4 w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">👣</span>
            <h1 className="text-white font-bold text-lg">Your day</h1>
          </div>
        </div>

        <div className="px-4 space-y-4 pb-10 max-w-lg mx-auto">

          {/* Intro card */}
          <div className="rounded-2xl border border-[#E70F72]/25 p-5" style={{ background: '#0d0008' }}>
            <h2 className="text-white font-bold text-xl mb-2">Where did you go today?</h2>
            <p className="text-white/45 text-sm leading-relaxed">
              Add the places you visited. If anyone thinks they crossed paths with you along the way, we'll ping you so you can log the moment.
            </p>
          </div>

          {/* Add a stop */}
          <div className="rounded-2xl border border-white/8 p-5" style={{ background: '#0d0008' }}>
            <p className="text-white font-semibold mb-3">Add a stop</p>
            <PlaceSearchBox onPlaceSelected={addStop} apiKey={apiKey} />

            {/* Stops list */}
            {stops.length > 0 ? (
              <div className="mt-4 space-y-3">
                <AnimatePresence>
                  {stops.map((stop, i) => (
                    <StopCard
                      key={stop.place_id + i}
                      stop={stop}
                      index={i}
                      onRemove={removeStop}
                      onTimeChange={updateTime}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-white/10 py-6 text-center">
                <p className="text-white/25 text-sm">Add at least one stop to save today's path.</p>
              </div>
            )}

            {saved && (
              <p className="text-green-400 text-sm font-medium mt-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Saved. We'll notify you if a match comes up.
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={stops.length === 0 || saving || saved}
              className="w-full mt-4 py-4 rounded-full font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: stops.length > 0 ? '#E70F72' : '#3a0020', color: 'white' }}
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Path saved!</>
              ) : saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : stops.length > 0 ? (
                'Update today\'s path'
              ) : (
                'Save today\'s path'
              )}
            </button>
          </div>

        </div>
      </div>
    </LoadScript>
  );
}