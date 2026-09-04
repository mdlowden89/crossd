import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import UnknownHero from '@/components/events/UnknownHero';
import { FRANCHISES, FRANCHISE_ORDER, getFranchiseMeta } from '@/components/events/franchiseMeta';

export default function Events() {
  const [cityFilter, setCityFilter] = useState('all');
  const [franchiseFilter, setFranchiseFilter] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const list = await base44.entities.Event.filter({ status: 'scheduled' });
      return list || [];
    },
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ['my-event-rsvps'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return await base44.entities.EventRsvp.filter({ user_id: user.id, status: 'attending' });
      } catch { return []; }
    },
  });

  const { data: counts = {} } = useQuery({
    queryKey: ['event-rsvp-counts'],
    queryFn: async () => {
      const all = await base44.entities.EventRsvp.filter({ status: 'attending' });
      const map = {};
      (all || []).forEach((r) => { map[r.event_id] = (map[r.event_id] || 0) + 1; });
      return map;
    },
  });

  const cities = useMemo(() => {
    const set = new Set(events.map((e) => e.city).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => cityFilter === 'all' || e.city === cityFilter)
      .filter((e) => franchiseFilter === 'all' || e.franchise === franchiseFilter)
      .filter((e) => new Date(e.starts_at).getTime() > Date.now())
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  }, [events, cityFilter, franchiseFilter]);

  const myEventIds = new Set(rsvps.map((r) => r.event_id));

  return (
    <div className="min-h-screen px-4 pt-6 pb-10 max-w-md mx-auto">
      {/* Header */}
      {franchiseFilter === 'unknown' ? (
        <UnknownHero />
      ) : (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#E70F72] mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-widest">CROSSD LIVE</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">Singles events that don't feel like singles events.</h1>
          <p className="text-sm text-white/50 mt-2 leading-relaxed">
            Come do something genuinely worth doing. Everyone there happens to be single.
          </p>
        </div>
      )}

      {/* City filter */}
      {cities.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-3">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
                cityFilter === c
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/60 border-white/15'
              }`}
            >
              {c === 'all' ? <><MapPin className="w-3 h-3" /> All cities</> : c}
            </button>
          ))}
        </div>
      )}

      {/* Franchise filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-5">
        <button
          onClick={() => setFranchiseFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
            franchiseFilter === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/15'
          }`}
        >
          All formats
        </button>
        {FRANCHISE_ORDER.map((key) => {
          const meta = getFranchiseMeta(key);
          const active = franchiseFilter === key;
          return (
            <button
              key={key}
              onClick={() => setFranchiseFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors"
              style={active
                ? { backgroundColor: meta.color, color: '#fff', borderColor: meta.color }
                : { backgroundColor: 'transparent', color: meta.color, borderColor: `${meta.color}55` }}
            >
              {meta.short}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-64 rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No upcoming events match your filters.</p>
          <p className="text-white/30 text-xs mt-1">New Crossd Live nights are added regularly.</p>
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              spotsTaken={counts[e.id] || 0}
            />
          ))}
        </motion.div>
      )}

      {/* Footer note */}
      <p className="text-center text-[11px] text-white/30 mt-8 leading-relaxed px-6">
        Crossd Live events are exclusively for singles. You won't be asked to interview anyone — just show up and enjoy the night.
      </p>
    </div>
  );
}