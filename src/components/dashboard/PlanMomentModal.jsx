import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Bookmark, Search, Trash2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TABS = [
  { value: 'favourite', label: 'Places I love', icon: Heart },
  { value: 'want_to_visit', label: 'Want to visit', icon: Bookmark },
];

export default function PlanMomentModal({ onClose, userId }) {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favourite');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const places = await base44.entities.SavedPlace.filter({ user_id: userId });
      setSavedPlaces(places);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddFromSearch = async () => {
    if (!search.trim() || saving) return;
    setSaving(true);
    try {
      await base44.entities.SavedPlace.create({
        name: search.trim(),
        user_id: userId,
        status: activeTab,
      });
      setSearch('');
      await loadPlaces();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SavedPlace.delete(id);
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddFromSearch();
  };

  const filtered = savedPlaces.filter(p => p.status === activeTab);
  const counts = {
    favourite: savedPlaces.filter(p => p.status === 'favourite').length,
    want_to_visit: savedPlaces.filter(p => p.status === 'want_to_visit').length,
  };

  const emptyText = activeTab === 'favourite'
    ? 'Add 3\u20135 places you go regularly. Caf\u00e9s, gyms, bookshops \u2014 anywhere that feels like you.'
    : 'Save spots you\u2019re curious about \u2014 places you\u2019d love to try.';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full bg-[#0A0A0A] rounded-t-3xl max-h-[88vh] flex flex-col"
        style={{ boxShadow: '0 -4px 40px rgba(231,15,114,0.15)' }}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex-shrink-0 border-b border-white/8">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E70F72]" />
              <h2 className="text-xl font-bold text-white">Build your Places DNA</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-white/50 text-sm ml-7">Tell us the places you love &mdash; we&apos;ll match you with people who share your world.</p>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex gap-2 bg-white/5 rounded-full p-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                    isActive ? 'bg-[#E70F72] text-white' : 'text-white/50 hover:text-white/75'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
                    {counts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 bg-white/6 border border-white/12 rounded-full px-4 py-3">
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search a café, park, gym you love..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/35 focus:outline-none"
            />
            {search.trim() && (
              <button
                onClick={handleAddFromSearch}
                disabled={saving}
                className="text-[#E70F72] text-xs font-bold hover:text-[#ff1a8c] transition-colors disabled:opacity-40"
              >
                {saving ? '...' : 'Add'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-white/30 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#E70F72]/40 flex items-center justify-center mb-5">
                <Heart className="w-7 h-7 text-[#E70F72]/60" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-[260px]">{emptyText}</p>
            </div>
          ) : (
            <div className="px-4 space-y-2 pb-4">
              {filtered.map(place => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeTab === 'favourite' ? 'bg-[#E70F72]/20' : 'bg-white/10'
                  }`}>
                    {activeTab === 'favourite'
                      ? <Heart className="w-4 h-4 text-[#E70F72]" />
                      : <Bookmark className="w-4 h-4 text-white/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{place.name}</p>
                    {place.address && <p className="text-white/40 text-xs truncate">{place.address}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(place.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-white/25 hover:text-red-400 transition-colors" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Done button */}
        <div className="px-4 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-full bg-[#E70F72] text-black font-bold text-base hover:bg-[#ff1a8c] transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}