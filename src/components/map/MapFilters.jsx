import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';

export default function MapFilters({ filters, onFiltersChange, isPremium }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (category, value) => {
    onFiltersChange({
      ...filters,
      [category]: filters[category] === value ? null : value
    });
  };

  const toggleBoolean = (key) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== null && v !== false).length;

  return (
    <>
      {/* Filter Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 left-6 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full bg-black border border-[#E70F72]/50 hover:bg-[#E70F72]/20 transition-all"
      >
        <Filter className="w-5 h-5 text-[#E70F72]" />
        <span className="text-white text-sm font-medium">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-[#E70F72] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-6 right-6 md:left-6 md:right-auto md:w-96 z-[9999] bg-gradient-to-b from-[#0B0B0B] to-[#050505] border border-[#E70F72]/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Map Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Time Filter */}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Time Range
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['today', '7days', '30days', 'all'].map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleFilter('time', option)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          filters.time === option
                            ? 'bg-[#E70F72] text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {option === '7days' ? '7 Days' : option === '30days' ? '30 Days' : option === 'all' ? 'All' : 'Today'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Show
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['myMoments', 'matches', 'both'].map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleFilter('type', option)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          filters.type === option
                            ? 'bg-[#E70F72] text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {option === 'myMoments' ? 'My Moments' : option === 'matches' ? 'Matches' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibe Filter */}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Vibe
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'calm', label: 'Calm', emoji: '🕯️' },
                      { value: 'social', label: 'Social', emoji: '🎉' },
                      { value: 'romantic', label: 'Romantic', emoji: '💕' },
                      { value: 'creative', label: 'Creative', emoji: '🎨' },
                      { value: 'highEnergy', label: 'High Energy', emoji: '⚡' }
                    ].map((vibe) => (
                      <button
                        key={vibe.value}
                        onClick={() => toggleFilter('vibe', vibe.value)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                          filters.vibe === vibe.value
                            ? 'bg-[#E70F72] text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{vibe.emoji}</span>
                        <span>{vibe.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Match Moments Only */}
                <div>
                  <button
                    onClick={() => toggleBoolean('matchMomentsOnly')}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                      filters.matchMomentsOnly
                        ? 'bg-[#E70F72] text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span>Only moments that led to a match</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      filters.matchMomentsOnly ? 'border-white bg-white' : 'border-white/40'
                    }`}>
                      {filters.matchMomentsOnly && (
                        <svg className="w-3 h-3 text-[#E70F72]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>

                {/* Heatmap Intensity */}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    Heatmap Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => toggleFilter('intensity', intensity)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          filters.intensity === intensity
                            ? 'bg-[#E70F72] text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear All */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => onFiltersChange({
                      time: 'all',
                      type: 'myMoments',
                      vibe: null,
                      matchMomentsOnly: false,
                      intensity: 'medium'
                    })}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}