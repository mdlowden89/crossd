import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Sparkles, ChevronRight, Check, Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const QUICK_AREAS = [
  'Shoreditch', 'South Bank', 'Soho', 'Notting Hill', 'Camden',
  'Hackney', 'Brixton', 'Islington', 'Clapham', 'Peckham',
  'Kings Cross', 'Marylebone', 'Canary Wharf', 'Greenwich',
];

const PEAK_TIMES = [
  { label: 'Morning', sub: '7–10am', icon: '🌅' },
  { label: 'Lunch', sub: '12–2pm', icon: '☀️' },
  { label: 'Afternoon', sub: '2–5pm', icon: '🕒' },
  { label: 'Evening', sub: '6–9pm', icon: '🌆' },
  { label: 'Night', sub: '9pm+', icon: '🌙' },
  { label: 'Weekends', sub: 'Sat–Sun', icon: '🎉' },
];

const ARCHETYPES = [
  { id: 'calm_cozy', emoji: '☕', label: 'Calm & Cosy', sub: 'Cafés, bookshops', desc: 'You unwind in quiet, unhurried spots — your crossings happen over flat whites, not first rounds.' },
  { id: 'social_buzzing', emoji: '🍻', label: 'Social Buzz', sub: 'Bars, pubs', desc: 'Your scene is loud tables and easy conversation — you show up where the energy is.' },
  { id: 'active_energetic', emoji: '🏃', label: 'Active', sub: 'Gym, parks, sport', desc: 'You move through the city — parks, pitches, and morning runs are your natural habitat.' },
  { id: 'creative', emoji: '🎨', label: 'Creative', sub: 'Galleries, studios', desc: 'Art spaces, makers\' markets, and concept stores are where you naturally gravitate.' },
  { id: 'romantic', emoji: '🕯️', label: 'Romantic', sub: 'Restaurants, wine bars', desc: 'You lean into atmosphere — candlelit dinners and slow evenings over good wine.' },
  { id: 'nightlife', emoji: '🎶', label: 'Nightlife', sub: 'Clubs, late venues', desc: 'Your best moments start after midnight — you\'re drawn to the late crowd and the bass.' },
  { id: 'nature_grounded', emoji: '🌿', label: 'Nature', sub: 'Parks, outdoors', desc: 'You recharge outside — green spaces, canal paths, and weekend escapes from the concrete.' },
  { id: 'deep_intellectual', emoji: '📚', label: 'Intellectual', sub: 'Libraries, talks', desc: 'Talks, debates, and bookshops — you go where ideas are being exchanged.' },
  { id: 'live_electric', emoji: '⚡', label: 'Live Events', sub: 'Gigs, concerts', desc: 'Venues and stages pull you in — you\'re at your best in a crowd all feeling the same thing.' },
  { id: 'intimate_local', emoji: '🏡', label: 'Local Gems', sub: 'Neighbourhood spots', desc: 'You\'ve found the hidden spots — the corner deli, the tiny wine bar no one else knows yet.' },
];

export default function CityPulseSetup({ profile, onSaved }) {
  const [step, setStep] = useState(0); // 0=zones, 1=times, 2=dna
  // zones = array of { name, place_id }
  const [zones, setZones] = useState([]);
  const [times, setTimes] = useState([]);
  const [dna, setDna] = useState([]);
  const [saving, setSaving] = useState(false);

  // Places search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSuggestions([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await base44.functions.invoke('searchPlaces', { input: searchQuery });
        setSuggestions(res.data?.predictions?.slice(0, 5) || []);
      } catch {
        setSuggestions([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const addZone = (name, place_id = '') => {
    if (zones.length >= 3) return;
    if (zones.find(z => z.name === name)) return;
    setZones(prev => [...prev, { name, place_id }]);
    setSearchQuery('');
    setSuggestions([]);
  };

  const removeZone = (name) => setZones(prev => prev.filter(z => z.name !== name));

  const toggleItem = (list, setList, val, max) => {
    setList(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : prev.length < max ? [...prev, val] : prev
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Profile.update(profile.id, {
      hangout_areas: zones.map(z => ({ name: z.name, place_id: z.place_id || '', description: '' })),
      vibe_tags: [...(profile.vibe_tags || []), ...dna.filter(d => !(profile.vibe_tags || []).includes(d))],
      // Store peak times as extra vibe tags prefixed with "peak_"
      ...(() => {
        const peakTags = times.map(t => `peak_${t.toLowerCase().replace(/[^a-z]/g, '_')}`);
        const existingVibes = profile.vibe_tags || [];
        const existingPeaks = existingVibes.filter(v => v.startsWith('peak_'));
        const otherVibes = existingVibes.filter(v => !v.startsWith('peak_'));
        return { vibe_tags: [...otherVibes, ...dna, ...peakTags] };
      })(),
    });
    setSaving(false);
    onSaved?.();
  };

  const canProceed = [zones.length > 0, times.length > 0, dna.length > 0][step];

  const isLast = step === 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-6 border border-[#E70F72]/40"
      style={{ background: 'linear-gradient(135deg, #0d0218 0%, #0B0B0B 100%)', boxShadow: '0 0 30px rgba(231,15,114,0.10)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          <span className="text-white font-bold text-lg">Your City Pulse</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-[#E70F72]' : i < step ? 'bg-[#E70F72]/50' : 'bg-white/15'}`} />
          ))}
        </div>
      </div>
      <p className="text-white/40 text-xs mb-5">Quick setup — takes 30 seconds, improves forever.</p>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="zones" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#E70F72]" />
              <span className="text-white font-semibold text-sm">Where do you usually hang out?</span>
            </div>
            <p className="text-white/40 text-xs mb-3">Search or pick up to 3 areas.</p>

            {/* Selected zones chips */}
            {zones.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {zones.map(z => (
                  <span key={z.name} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[#E70F72] text-white font-medium">
                    <MapPin className="w-3 h-3" />{z.name}
                    <button onClick={() => removeZone(z.name)} className="ml-0.5 hover:opacity-70"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input */}
            {zones.length < 3 && (
              <div className="relative mb-3">
                <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-3 py-2.5">
                  <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search any area, neighbourhood…"
                    className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none"
                  />
                  {searching && <div className="w-3 h-3 border-2 border-white/30 border-t-white/70 rounded-full animate-spin flex-shrink-0" />}
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/15 rounded-xl overflow-hidden z-10 shadow-xl">
                    {suggestions.map((s, i) => {
                      const mainText = s.structured_formatting?.main_text || s.description?.split(',')[0];
                      const secondaryText = s.structured_formatting?.secondary_text || s.description?.split(',').slice(1).join(',').trim();
                      return (
                        <button
                          key={i}
                          onClick={() => addZone(mainText, s.place_id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/8 transition-colors border-b border-white/5 last:border-0"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#E70F72] flex-shrink-0" />
                          <div>
                            <div className="text-white text-xs font-medium">{mainText}</div>
                            {secondaryText && <div className="text-white/40 text-[10px]">{secondaryText}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick picks */}
            <p className="text-white/30 text-[10px] mb-2 uppercase tracking-wide">Quick picks</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AREAS.filter(a => !zones.find(z => z.name === a)).map(area => (
                <button
                  key={area}
                  onClick={() => addZone(area)}
                  disabled={zones.length >= 3}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {area}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="times" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold text-sm">When are you usually out?</span>
            </div>
            <p className="text-white/40 text-xs mb-3">Pick all that apply.</p>
            <div className="grid grid-cols-3 gap-2">
              {PEAK_TIMES.map(t => {
                const sel = times.includes(t.label);
                return (
                  <button
                    key={t.label}
                    onClick={() => toggleItem(times, setTimes, t.label, 6)}
                    className={`flex flex-col items-center py-3 px-2 rounded-2xl border transition-all ${sel ? 'bg-amber-500/20 border-amber-400/60 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/25'}`}
                  >
                    <span className="text-lg mb-0.5">{t.icon}</span>
                    <span className="text-xs font-semibold">{t.label}</span>
                    <span className="text-[10px] text-white/40">{t.sub}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="dna" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">What's your PlacesDNA?</span>
            </div>
            <p className="text-white/40 text-xs mb-1">These archetypes describe <em>how</em> you move through the city — we use them to surface people who cross paths with you in the same kinds of places.</p>
            <p className="text-white/30 text-xs mb-3">Pick up to 3 that fit your scene.</p>
            <div className="grid grid-cols-2 gap-2">
              {ARCHETYPES.map(a => {
                const sel = dna.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleItem(dna, setDna, a.id, 3)}
                    className={`flex flex-col gap-1 px-3 py-2.5 rounded-2xl border text-left transition-all ${sel ? 'bg-purple-500/20 border-purple-400/60 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/25'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.emoji}</span>
                      <div>
                        <div className="text-xs font-semibold leading-none">{a.label}</div>
                        <div className="text-[10px] text-white/35 mt-0.5">{a.sub}</div>
                      </div>
                    </div>
                    {sel && (
                      <p className="text-[10px] text-purple-300/70 leading-relaxed mt-0.5">{a.desc}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setStep(s => s - 1)}
          className={`text-white/40 text-sm hover:text-white/70 transition-colors ${step === 0 ? 'invisible' : ''}`}
        >
          ← Back
        </button>
        <button
          disabled={!canProceed || saving}
          onClick={isLast ? handleSave : () => setStep(s => s + 1)}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all ${canProceed ? 'bg-[#E70F72] text-white hover:bg-[#E70F72]/90 active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
        >
          {saving ? 'Saving…' : isLast ? 'Save & unlock' : 'Next'}
          {!saving && !isLast && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}