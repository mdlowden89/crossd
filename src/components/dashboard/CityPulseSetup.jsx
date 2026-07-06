import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Sparkles, ChevronRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AREA_OPTIONS = [
  'City Centre', 'Shoreditch / East', 'South Bank', 'Soho / West End',
  'Notting Hill', 'Camden', 'Hackney', 'Brixton', 'Greenwich', 'Canary Wharf',
  'Islington', 'Clapham', 'Peckham', 'Kings Cross', 'Marylebone',
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
  { id: 'calm_cozy', emoji: '☕', label: 'Calm & Cosy', sub: 'Cafés, bookshops' },
  { id: 'social_buzzing', emoji: '🍻', label: 'Social Buzz', sub: 'Bars, pubs' },
  { id: 'active_energetic', emoji: '🏃', label: 'Active', sub: 'Gym, parks, sport' },
  { id: 'creative', emoji: '🎨', label: 'Creative', sub: 'Galleries, studios' },
  { id: 'romantic', emoji: '🕯️', label: 'Romantic', sub: 'Restaurants, wine bars' },
  { id: 'nightlife', emoji: '🎶', label: 'Nightlife', sub: 'Clubs, late venues' },
  { id: 'nature_grounded', emoji: '🌿', label: 'Nature', sub: 'Parks, outdoors' },
  { id: 'deep_intellectual', emoji: '📚', label: 'Intellectual', sub: 'Libraries, talks' },
  { id: 'live_electric', emoji: '⚡', label: 'Live Events', sub: 'Gigs, concerts' },
  { id: 'intimate_local', emoji: '🏡', label: 'Local Gems', sub: 'Neighbourhood spots' },
];

export default function CityPulseSetup({ profile, onSaved }) {
  const [step, setStep] = useState(0); // 0=zones, 1=times, 2=dna
  const [zones, setZones] = useState([]);
  const [times, setTimes] = useState([]);
  const [dna, setDna] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleItem = (list, setList, val, max) => {
    setList(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : prev.length < max ? [...prev, val] : prev
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Profile.update(profile.id, {
      hangout_areas: zones.map(name => ({ name, place_id: '', description: '' })),
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
            <p className="text-white/40 text-xs mb-3">Pick up to 3 areas.</p>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map(area => {
                const sel = zones.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleItem(zones, setZones, area, 3)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${sel ? 'bg-[#E70F72] border-[#E70F72] text-white' : 'bg-white/5 border-white/15 text-white/60 hover:border-white/30'}`}
                  >
                    {sel && <Check className="w-3 h-3 inline mr-1" />}{area}
                  </button>
                );
              })}
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
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">What's your vibe?</span>
            </div>
            <p className="text-white/40 text-xs mb-3">Pick up to 3 that fit your scene.</p>
            <div className="grid grid-cols-2 gap-2">
              {ARCHETYPES.map(a => {
                const sel = dna.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleItem(dna, setDna, a.id, 3)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-left transition-all ${sel ? 'bg-purple-500/20 border-purple-400/60 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/25'}`}
                  >
                    <span className="text-base">{a.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold leading-none">{a.label}</div>
                      <div className="text-[10px] text-white/35 mt-0.5">{a.sub}</div>
                    </div>
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