import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Users, Calendar, Check, Lock, Shirt,
  Sparkles, Ticket, Heart, Info,
} from 'lucide-react';
import {
  getFranchiseMeta, isVenueRevealed, formatEventDate, formatEventTime, formatPrice,
} from '@/components/events/franchiseMeta';

export default function EventDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const justCheckedOut = urlParams.get('checkout') === 'success';

  const [confirming, setConfirming] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => base44.entities.Event.get(eventId),
    enabled: !!eventId,
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => { try { return await base44.auth.me(); } catch { return null; } },
  });
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      try {
        const u = await base44.auth.me();
        if (!u) return null;
        const list = await base44.entities.Profile.filter({ user_id: u.id });
        return list?.[0] || null;
      } catch { return null; }
    },
  });

  const { data: myRsvp } = useQuery({
    queryKey: ['my-rsvp', eventId],
    queryFn: async () => {
      try {
        const u = await base44.auth.me();
        if (!u) return null;
        const list = await base44.entities.EventRsvp.filter({ event_id: eventId, user_id: u.id });
        return list?.find((r) => r.status === 'attending') || null;
      } catch { return null; }
    },
    enabled: !!eventId,
  });

  const { data: count = 0 } = useQuery({
    queryKey: ['event-attendee-count', eventId],
    queryFn: async () => {
      const list = await base44.entities.EventRsvp.filter({ event_id: eventId, status: 'attending' });
      return list?.length || 0;
    },
    enabled: !!eventId,
  });

  const createRsvp = useMutation({
    mutationFn: async ({ paid, stripeSessionId }) => {
      const u = user || await base44.auth.me();
      const p = profile || (await base44.entities.Profile.filter({ user_id: u.id }))?.[0];
      return base44.entities.EventRsvp.create({
        event_id: eventId,
        user_id: u.id,
        profile_id: p?.id || null,
        status: 'attending',
        paid,
        ticket_count: ticketCount,
        stripe_session_id: stripeSessionId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rsvp', eventId]);
      queryClient.invalidateQueries(['event-attendee-count', eventId]);
      queryClient.invalidateQueries(['event-rsvp-counts']);
      queryClient.invalidateQueries(['my-event-rsvps']);
    },
  });

  const startCheckout = useMutation({
    mutationFn: async () => {
      if (window.self !== window.top) {
        alert('Checkout is only available from the published app, not inside the preview.');
        return;
      }
      const origin = window.location.origin;
      const res = await base44.functions.invoke('createEventCheckoutSession', {
        eventId,
        userId: user?.id,
        ticketCount,
        successUrl: `${origin}/EventDetail?id=${eventId}&checkout=success`,
        cancelUrl: `${origin}/EventDetail?id=${eventId}`,
        ...(user?.email ? { customerEmail: user.email } : {}),
      });
      if (res.data?.url) window.location.href = res.data.url;
      else throw new Error(res.data?.error || 'Failed to start checkout');
    },
  });

  // After a successful paid checkout return, record the RSVP once
  useEffect(() => {
    if (justCheckedOut && event && user && !myRsvp) {
      createRsvp.mutate({ paid: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justCheckedOut, event, user, myRsvp]);

  const meta = useMemo(() => (event ? getFranchiseMeta(event.franchise) : null), [event]);
  const soldOut = event ? count >= event.capacity : false;
  const isFree = event ? event.price_cents <= 0 : false;
  const ended = event ? new Date(event.ends_at).getTime() < Date.now() : false;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const venueRevealed = isVenueRevealed(event);

  const handleRsvp = () => {
    if (!user) { base44.auth.redirectToLogin('/EventDetail?id=' + eventId); return; }
    if (isFree) {
      createRsvp.mutate({ paid: false });
    } else {
      startCheckout.mutate();
    }
  };

  return (
    <div className="min-h-screen pb-32 max-w-md mx-auto">
      {/* Hero */}
      <div className="relative h-64 bg-neutral-900">
        {event.cover_image_url && <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
        <button
          onClick={() => navigate('/Events')}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider mb-2"
            style={{ backgroundColor: meta.accent, color: meta.color, border: `1px solid ${meta.color}66` }}
          >
            CROSSD {meta.short}
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">{event.title}</h1>
          <p className="text-sm text-white/70 mt-1">{event.tagline}</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Key facts */}
        <div className="grid grid-cols-2 gap-3">
          <Fact icon={Calendar} label="When" value={formatEventDate(event.starts_at)} sub={formatEventTime(event.starts_at)} />
          <Fact icon={MapPin} label="Where" value={event.city} sub={venueRevealed ? event.venue_name : (event.venue_area_hint || 'TBA')} />
          <Fact icon={Users} label="Capacity" value={`${event.capacity} singles`} sub={`${count} going`} />
          {event.age_min && event.age_max ? <Fact icon={Heart} label="Ages" value={`${event.age_min}–${event.age_max}`} /> : null}
        </div>

        {/* Venue reveal note for unknown */}
        {event.franchise === 'unknown' && !venueRevealed && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
            <Lock className="w-4 h-4 text-[#8B5CF6] mt-0.5 shrink-0" />
            <p className="text-xs text-white/70 leading-relaxed">
              This is a mystery event. The exact venue is revealed 4 hours before start — you'll only see the area until then.
            </p>
          </div>
        )}

        {/* Social experiment */}
        {event.social_experiment && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#E70F72]/15 to-transparent border border-[#E70F72]/30">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#E70F72]" />
              <span className="text-xs font-semibold text-[#E70F72] tracking-wide">CROSSD SOCIAL EXPERIMENT</span>
            </div>
            <p className="text-sm text-white/90 font-medium">{event.social_experiment}</p>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-white/90 mb-2">About this night</h2>
          <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{event.description || meta.desc}</p>
        </div>

        {/* Extra details */}
        <div className="space-y-2">
          {event.dress_code && <DetailRow icon={Shirt} label="Dress code" value={event.dress_code} />}
          {event.mood && <DetailRow icon={Sparkles} label="Mood" value={event.mood} />}
          {event.host_name && <DetailRow icon={Users} label="Hosted by" value={event.host_name} />}
        </div>

        {/* Design principles */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-semibold text-white/70">How Crossd Live works</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">
            No forced romantic interaction. We design circumstances that make conversation easy — then leave you to it.
            After the event, Afterglow opens: a second chance with anyone who stayed on your mind.
          </p>
        </div>

        {/* Afterglow link */}
        {ended && (
          <button
            onClick={() => navigate(`/Afterglow?event=${eventId}`)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/15 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
          >
            <Heart className="w-5 h-5 text-[#E70F72]" />
            <div>
              <p className="text-sm font-semibold text-white">Afterglow is open</p>
              <p className="text-xs text-white/50">See who you crossed paths with and send a spark.</p>
            </div>
          </button>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-white/10 px-4 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="max-w-md mx-auto flex items-center gap-3">
          {myRsvp ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981]">
              <Check className="w-5 h-5" />
              <span className="text-sm font-semibold">You're attending</span>
            </div>
          ) : soldOut ? (
            <div className="flex-1 text-center py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold">
              Sold out
            </div>
          ) : (
            <>
              <div className="text-left">
                <div className="text-lg font-bold" style={{ color: meta.color }}>{formatPrice(event.price_cents, event.currency)}</div>
                {!isFree && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setTicketCount((n) => Math.max(1, n - 1))} className="w-6 h-6 rounded-full bg-white/10 text-white text-sm">−</button>
                    <span className="text-xs text-white/60 w-4 text-center">{ticketCount}</span>
                    <button onClick={() => setTicketCount((n) => Math.min(4, n + 1))} className="w-6 h-6 rounded-full bg-white/10 text-white text-sm">+</button>
                  </div>
                )}
              </div>
              <button
                onClick={handleRsvp}
                disabled={createRsvp.isPending || startCheckout.isPending}
                className="flex-1 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: meta.color }}
              >
                {startCheckout.isPending ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : isFree ? (
                  <><Ticket className="w-4 h-4" /> RSVP free</>
                ) : (
                  <><Ticket className="w-4 h-4" /> Get tickets</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value, sub }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-1.5 text-white/40 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5">
      <Icon className="w-4 h-4 text-white/40" />
      <span className="text-xs text-white/40 w-24">{label}</span>
      <span className="text-sm text-white/80 ml-auto text-right">{value}</span>
    </div>
  );
}