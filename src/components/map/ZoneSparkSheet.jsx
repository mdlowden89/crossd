import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Flame, Sparkles, Clock, Users } from 'lucide-react';

const ARCHETYPE_INFO = {
  romantic:         { label: 'Romantic',           emoji: '💞', color: '#E74C78' },
  calm_cozy:        { label: 'Calm & Cozy',         emoji: '☕', color: '#C49A6C' },
  creative:         { label: 'Creative',            emoji: '🎨', color: '#9B5DE5' },
  social_buzzing:   { label: 'Social & Buzzing',    emoji: '🌆', color: '#FF6B3D' },
  nature_grounded:  { label: 'Nature & Grounded',   emoji: '🌿', color: '#6A8F7A' },
  live_electric:    { label: 'Live & Electric',     emoji: '🎵', color: '#F6C90E' },
  deep_intellectual:{ label: 'Deep & Intellectual', emoji: '🧠', color: '#4169E1' },
  active_energetic: { label: 'Active & Energetic',  emoji: '🏃', color: '#FF4081' },
  nightlife:        { label: 'Nightlife',           emoji: '🍸', color: '#B026FF' },
  intimate_local:   { label: 'Intimate Local',      emoji: '🏡', color: '#8B7355' },
};

const STATE_CONFIG = {
  calm:    { label: 'Quiet',   color: '#8A8A8A', icon: '🌙' },
  active:  { label: 'Active',  color: '#E70F72', icon: '✨' },
  peaking: { label: 'Peaking', color: '#FF6B3D', icon: '🔥' },
};

export default function ZoneSparkSheet({ zone, isPremium, onClose }) {
  if (!zone) return null;

  const stateInfo = STATE_CONFIG[zone.state] || STATE_CONFIG.calm;
  const energyPct = Math.round((zone.energy || 0) * 100);
  const primaryArch = zone.dominant_archetypes?.[0];
  const primaryColor = ARCHETYPE_INFO[primaryArch]?.color || '#E70F72';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-black rounded-t-3xl border-t border-white/10 overflow-hidden"
      style={{ boxShadow: `0 -8px 40px ${primaryColor}22` }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${primaryColor}22`, border: `1.5px solid ${primaryColor}55` }}
            >
              {ARCHETYPE_INFO[primaryArch]?.emoji || '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {stateInfo.icon} {stateInfo.label} Zone
                </span>
              </div>
              <p className="text-white/50 text-xs mt-0.5">
                {zone.dominant_archetypes?.slice(0, 2).map(a => ARCHETYPE_INFO[a]?.label).filter(Boolean).join(' · ') || 'Mixed vibe'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5 pb-8">
        {/* Energy bar */}
        <div>
          <div className="flex justify-between text-xs text-white/50 mb-2">
            <span>Zone Energy</span>
            <span style={{ color: primaryColor }}>{energyPct}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energyPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}88)` }}
            />
          </div>
        </div>

        {/* Archetypes */}
        <div>
          <p className="text-white/40 text-xs mb-2">Dominant vibe</p>
          <div className="flex gap-2 flex-wrap">
            {(zone.dominant_archetypes || []).slice(0, 3).map(arch => {
              const info = ARCHETYPE_INFO[arch];
              if (!info) return null;
              return (
                <span
                  key={arch}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: `${info.color}20`, color: info.color, border: `1px solid ${info.color}44` }}
                >
                  {info.emoji} {info.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Peak times */}
        {zone.peak_buckets?.length > 0 && (
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
            <Clock className="w-4 h-4 text-white/40 flex-shrink-0" />
            <div>
              <p className="text-white/40 text-xs">Peak times</p>
              <p className="text-white text-sm font-medium capitalize">
                {zone.peak_buckets.join(' · ')}
              </p>
            </div>
          </div>
        )}

        {/* Premium gated section */}
        {isPremium ? (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-[#E70F72]/10 to-purple-500/10 border border-[#E70F72]/30 rounded-xl p-4">
              <p className="text-white/50 text-xs mb-1">Compatibility density</p>
              <p className="text-white font-bold text-2xl">
                {Math.round(30 + (zone.energy || 0) * 60)}%
                <span className="text-white/50 font-normal text-sm ml-1">aligned with your spark</span>
              </p>
            </div>
            {zone.compatible_type_distribution && Object.keys(zone.compatible_type_distribution).length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-white/50 text-xs mb-2">Compatible types active here</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(zone.compatible_type_distribution).slice(0, 4).map(type => (
                    <span key={type} className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-semibold">{type}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-white/50 text-xs mb-1">Best spark window</p>
              <p className="text-white font-semibold capitalize">
                {zone.peak_buckets?.[0] ? `${zone.peak_buckets[0]}s` : 'Evenings'} are your highest alignment window
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#E70F72]/10 to-purple-500/10 border border-[#E70F72]/30 rounded-2xl p-5 text-center">
            <Lock className="w-8 h-8 text-[#E70F72] mx-auto mb-2" />
            <p className="text-white font-semibold mb-1">See what this zone means for you</p>
            <p className="text-white/50 text-sm mb-4">
              Unlock compatibility density, MBTI types active here, and best spark windows.
            </p>
            <div className="space-y-2 mb-4 text-left">
              {[
                { icon: '🔥', text: `${Math.round(30 + (zone.energy || 0) * 60)}% alignment score` },
                { icon: '🧠', text: 'Compatible personality types' },
                { icon: '⚡', text: 'Your best time to be here' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 blur-[1.5px] select-none">
                  <span>{item.icon}</span>
                  <p className="text-white/70 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-[#E70F72] text-white font-semibold rounded-xl hover:bg-[#ff1a8c] transition-all">
              Unlock with Crossd+
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}