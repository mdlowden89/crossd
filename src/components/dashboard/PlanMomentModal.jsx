import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Heart, CheckCircle, Star, Plus, Trash2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_OPTIONS = [
  { value: 'want_to_visit', label: 'Want to Visit', emoji: '🗺️', color: '#E70F72' },
  { value: 'been_here', label: 'Been Here', emoji: '✅', color: '#22c55e' },
  { value: 'favourite', label: 'Favourite', emoji: '⭐', color: '#f59e0b' },
];

const VIBE_OPTIONS = ['Romantic', 'Cozy', 'Social', 'Creative', 'Energetic', 'Low-key', 'Spontaneous', 'Calm', 'Deep talk'];

export default function PlanMomentModal({ onClose, userId }) {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [filterStatus, setFilterStatus] = useState('all');

  // Add form state
  const [form, setForm] = useState({
    name: '',
    address: '',
    status: 'want_to_visit',
    notes: '',
    vibe_tags: [],
  });
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

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.SavedPlace.create({
        ...form,
        user_id: userId,
      });
      setForm({ name: '', address: '', status: 'want_to_visit', notes: '', vibe_tags: [] });
      await loadPlaces();
      setView('list');
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SavedPlace.delete(id);
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.SavedPlace.update(id, { status });
    setSavedPlaces(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const toggleVibe = (vibe) => {
    setForm(prev => ({
      ...prev,
      vibe_tags: prev.vibe_tags.includes(vibe)
        ? prev.vibe_tags.filter(v => v !== vibe)
        : [...prev.vibe_tags, vibe]
    }));
  };

  const filtered = filterStatus === 'all' ? savedPlaces : savedPlaces.filter(p => p.status === filterStatus);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full bg-[#0A0A0A] rounded-t-3xl border-t border-[#E70F72]/30 max-h-[88vh] flex flex-col"
        style={{ boxShadow: '0 -4px 30px rgba(231,15,114,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">My Places</h2>
            <p className="text-white/50 text-sm mt-0.5">Places you've been, love, or want to explore</p>
          </div>
          <div className="flex items-center gap-2">
            {view === 'list' && (
              <button
                onClick={() => setView('add')}
                className="flex items-center gap-1.5 bg-[#E70F72] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#ff1a8c] transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-4 space-y-4">
                {/* Status filter */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === 'all' ? 'bg-[#E70F72] text-white' : 'bg-white/8 text-white/50'}`}
                  >
                    All ({savedPlaces.length})
                  </button>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFilterStatus(s.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s.value ? 'text-white' : 'bg-white/8 text-white/50'}`}
                      style={filterStatus === s.value ? { backgroundColor: s.color } : {}}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="text-center py-12 text-white/40">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No places yet. Add somewhere you love!</p>
                    <button
                      onClick={() => setView('add')}
                      className="mt-4 px-5 py-2.5 bg-[#E70F72] text-white text-sm font-semibold rounded-xl hover:bg-[#ff1a8c] transition-colors"
                    >
                      Add a Place
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pb-8">
                    {filtered.map(place => {
                      const statusInfo = STATUS_OPTIONS.find(s => s.value === place.status);
                      return (
                        <motion.div
                          key={place.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-base">{statusInfo?.emoji}</span>
                                <h4 className="text-white font-semibold truncate">{place.name}</h4>
                              </div>
                              {place.address && (
                                <p className="text-white/45 text-xs mb-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />{place.address}
                                </p>
                              )}
                              {place.notes && (
                                <p className="text-white/60 text-xs italic mb-2">"{place.notes}"</p>
                              )}
                              {place.vibe_tags?.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                  {place.vibe_tags.map(v => (
                                    <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-[#E70F72]/15 text-[#E70F72] border border-[#E70F72]/25">{v}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDelete(place.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-white/30 hover:text-red-400 transition-colors" />
                            </button>
                          </div>

                          {/* Status switcher */}
                          <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/8">
                            {STATUS_OPTIONS.map(s => (
                              <button
                                key={s.value}
                                onClick={() => handleStatusChange(place.id, s.value)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${place.status === s.value ? 'text-white' : 'bg-white/5 text-white/40 hover:text-white/60'}`}
                                style={place.status === s.value ? { backgroundColor: `${s.color}30`, color: s.color, border: `1px solid ${s.color}50` } : {}}
                              >
                                {s.emoji} {s.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-6 py-4 space-y-5 pb-10">
                <button onClick={() => setView('list')} className="text-white/50 text-sm flex items-center gap-1 hover:text-white transition-colors">
                  ← Back to My Places
                </button>

                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">Place Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sketch London, Hyde Park..."
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white/8 border border-white/15 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E70F72]/60"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">Address / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Soho, London"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full bg-white/8 border border-white/15 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E70F72]/60"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Status</label>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setForm(p => ({ ...p, status: s.value }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border`}
                        style={form.status === s.value
                          ? { backgroundColor: `${s.color}25`, color: s.color, borderColor: `${s.color}50` }
                          : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.1)' }
                        }
                      >
                        {s.emoji}<br />{s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Vibe</label>
                  <div className="flex gap-2 flex-wrap">
                    {VIBE_OPTIONS.map(v => (
                      <button
                        key={v}
                        onClick={() => toggleVibe(v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          form.vibe_tags.includes(v)
                            ? 'bg-[#E70F72]/20 text-[#E70F72] border-[#E70F72]/40'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">Notes</label>
                  <textarea
                    placeholder="What makes this place special?"
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/8 border border-white/15 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E70F72]/60 resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="w-full py-3.5 bg-[#E70F72] text-white font-semibold rounded-xl hover:bg-[#ff1a8c] transition-colors disabled:opacity-40"
                >
                  {saving ? 'Saving...' : 'Save Place'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}