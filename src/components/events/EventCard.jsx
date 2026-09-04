import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Users } from 'lucide-react';
import { getFranchiseMeta, formatEventDate, formatEventTime, formatPrice } from './franchiseMeta';

export default function EventCard({ event, spotsTaken = 0 }) {
  const navigate = useNavigate();
  const meta = getFranchiseMeta(event.franchise);
  const soldOut = spotsTaken >= event.capacity;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/EventDetail?id=${event.id}`)}
      className="w-full text-left rounded-2xl overflow-hidden border border-white/10 bg-black hover:border-white/20 transition-colors"
    >
      <div className="relative h-40 bg-neutral-900">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider text-white"
          style={{ backgroundColor: meta.accent, border: `1px solid ${meta.color}` }}
        >
          CROSSD {meta.short}
        </div>
        {event.social_experiment && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/50 text-white/90 border border-white/25">
            {event.social_experiment}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-bold tracking-wider text-white/70">{formatEventDate(event.starts_at)}</span>
          <span className="text-[11px] text-white/40">{formatEventTime(event.starts_at)}</span>
          <span className="ml-auto text-[11px] text-white/40">{event.city}</span>
        </div>
        <h3 className="text-base font-semibold text-white leading-tight">{event.title}</h3>
        <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{event.tagline}</p>

        <div className="flex items-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-[11px] text-white/50">
            <Users className="w-3 h-3" />
            {event.capacity} singles
          </span>
          {event.age_min && event.age_max ? (
            <span className="text-[11px] text-white/50">Ages {event.age_min}–{event.age_max}</span>
          ) : null}
          {event.franchise === 'unknown' && (
            <span className="flex items-center gap-1 text-[11px] text-white/40">
              <Lock className="w-3 h-3" /> {event.venue_area_hint || 'Location revealed 4h before'}
            </span>
          )}
          <span
            className={`ml-auto text-sm font-semibold ${soldOut ? 'text-white/40' : ''}`}
            style={!soldOut ? { color: meta.color } : {}}
          >
            {soldOut ? 'Sold out' : formatPrice(event.price_cents, event.currency)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}