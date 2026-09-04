import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, Check, Clock } from 'lucide-react';
import { getFranchiseMeta, formatEventDate } from '@/components/events/franchiseMeta';

export default function Afterglow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const initialEvent = urlParams.get('event');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => { try { return await base44.auth.me(); } catch { return null; } },
  });
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const u = await base44.auth.me();
      if (!u) return null;
      const list = await base44.entities.Profile.filter({ user_id: u.id });
      return list?.[0] || null;
    },
  });

  // Events I attended
  const { data: myRsvps = [] } = useQuery({
    queryKey: ['my-event-rsvps'],
    queryFn: async () => {
      try {
        const u = await base44.auth.me();
        if (!u) return [];
        return await base44.entities.EventRsvp.filter({ user_id: u.id, status: 'attending' });
      } catch { return []; }
    },
  });

  // Load full event records for rsvp'd events
  const eventIds = myRsvps.map((r) => r.event_id);
  const { data: events = [] } = useQuery({
    queryKey: ['my-events', eventIds.join(',')],
    queryFn: async () => {
      if (!eventIds.length) return [];
      const results = await Promise.all(eventIds.map((id) => base44.entities.Event.get(id).catch(() => null)));
      return results.filter(Boolean);
    },
    enabled: eventIds.length > 0,
  });

  // Only events where afterglow is open (ended, within afterglow window)
  const openEvents = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => {
      const ends = new Date(e.ends_at || e.starts_at).getTime();
      const closes = ends + (e.afterglow_closes_hours || 48) * 60 * 60 * 1000;
      return ends < now && now < closes;
    });
  }, [events]);

  const [selectedId, setSelectedId] = useState(initialEvent);
  const selected = openEvents.find((e) => e.id === selectedId) || openEvents[0] || null;

  const sendSpark = useMutation({
    mutationFn: async ({ toUserId }) => {
      const u = await base44.auth.me();
      return base44.entities.EventSpark.create({
        event_id: selected.id,
        from_user_id: u.id,
        to_user_id: toUserId,
        status: 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['afterglow-sparks', selected?.id]);
      queryClient.invalidateQueries(['afterglow-incoming', selected?.id]);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Heart className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/60 text-sm">Sign in to use Afterglow.</p>
        <button onClick={() => base44.auth.redirectToLogin('/Afterglow')} className="mt-4 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold">Sign in</button>
      </div>
    );
  }

  if (openEvents.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <button onClick={() => navigate('/Events')} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Sparkles className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/60 text-sm">Afterglow opens after events you attend.</p>
        <p className="text-white/30 text-xs mt-1">Go to a Crossd Live night, then check back here.</p>
        <button onClick={() => navigate('/Events')} className="mt-4 px-5 py-2.5 rounded-xl bg-[#E70F72] text-white text-sm font-semibold">Browse events</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <button onClick={() => navigate('/Events')} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#E70F72]" /> Afterglow
          </h1>
          <p className="text-[11px] text-white/40">The morning after — your second chance</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Event selector */}
        {openEvents.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1">
            {openEvents.map((e) => {
              const meta = getFranchiseMeta(e.franchise);
              const active = (selected?.id) === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors"
                  style={active
                    ? { backgroundColor: meta.color, color: '#fff', borderColor: meta.color }
                    : { backgroundColor: 'transparent', color: meta.color, borderColor: `${meta.color}55` }}
                >
                  {meta.short} · {formatEventDate(e.starts_at)}
                </button>
              );
            })}
          </div>
        )}

        {selected && <AfterglowEvent event={selected} profile={profile} />}
      </div>
    </div>
  );
}

function AfterglowEvent({ event, profile }) {
  const queryClient = useQueryClient();
  const meta = getFranchiseMeta(event.franchise);
  const closesAt = new Date(new Date(event.ends_at || event.starts_at).getTime() + (event.afterglow_closes_hours || 48) * 3600 * 1000);
  const hoursLeft = Math.max(0, Math.ceil((closesAt.getTime() - Date.now()) / 3600000));

  // Attendees of this event
  const { data: attendeeRsvps = [] } = useQuery({
    queryKey: ['event-attendees', event.id],
    queryFn: async () => base44.entities.EventRsvp.filter({ event_id: event.id, status: 'attending' }),
  });

  // Profiles for attendees
  const attendeeUserIds = attendeeRsvps.map((r) => r.user_id).filter(Boolean);
  const { data: profiles = [] } = useQuery({
    queryKey: ['attendee-profiles', attendeeUserIds.join(',')],
    queryFn: async () => {
      if (!attendeeUserIds.length) return [];
      const all = await base44.entities.Profile.list();
      return (all || []).filter((p) => attendeeUserIds.includes(p.user_id));
    },
    enabled: attendeeUserIds.length > 0,
  });

  // Sparks I sent for this event
  const { data: sentSparks = [] } = useQuery({
    queryKey: ['afterglow-sparks', event.id],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.EventSpark.filter({ event_id: event.id, from_user_id: u.id });
    },
  });
  const sentIds = new Set(sentSparks.map((s) => s.to_user_id));

  // Incoming sparks for this event
  const { data: incomingSparks = [] } = useQuery({
    queryKey: ['afterglow-incoming', event.id],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.EventSpark.filter({ event_id: event.id, to_user_id: u.id });
    },
  });

  const myUserId = profile?.user_id;

  // Filter attendees by my preferences + exclude self
  const eligible = useMemo(() => {
    return profiles.filter((p) => {
      if (p.user_id === myUserId) return false;
      if (!profile) return true;
      // gender interest filter
      const myInt = profile.interested_in;
      if (myInt && p.gender) {
        if (myInt === 'men' && p.gender !== 'man') return false;
        if (myInt === 'women' && p.gender !== 'woman') return false;
        if (myInt === 'men_and_women' && p.gender !== 'man' && p.gender !== 'woman') return false;
      }
      // age filter
      if (profile.age_min && p.birthdate) {
        const age = calcAge(p.birthdate);
        if (age != null && (age < profile.age_min || age > (profile.age_max || 99))) return false;
      }
      return true;
    });
  }, [profiles, profile, myUserId]);

  const mutualIds = new Set(incomingSparks.map((s) => s.from_user_id));
  const mutualCount = eligible.filter((p) => sentIds.has(p.user_id) && mutualIds.has(p.user_id)).length;

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.accent, color: meta.color }}>
            CROSSD {meta.short}
          </span>
          <span className="text-[11px] text-white/40">{formatEventDate(event.starts_at)}</span>
        </div>
        <h2 className="text-lg font-bold text-white">{event.title}</h2>
        <div className="flex items-center gap-1.5 text-[11px] text-white/40 mt-1">
          <Clock className="w-3 h-3" /> Afterglow closes in {hoursLeft}h
        </div>
      </div>

      {mutualCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-[#E70F72]/15 border border-[#E70F72]/40 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E70F72]" />
          <p className="text-sm text-white/90 font-medium">{mutualCount} mutual spark{mutualCount > 1 ? 's' : ''} from this night 🎉</p>
        </div>
      )}

      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        People you crossed paths with
      </h3>

      {eligible.length === 0 ? (
        <p className="text-sm text-white/40 py-6 text-center">No one from this night matches your preferences yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {eligible.map((p) => {
            const sent = sentIds.has(p.user_id);
            const isMutual = sent && mutualIds.has(p.user_id);
            const photo = p.photos?.find((ph) => ph.is_primary)?.url || p.photos?.[0]?.url;
            return (
              <div key={p.id} className="rounded-xl overflow-hidden border border-white/10 bg-black">
                <div className="aspect-square bg-neutral-900 relative">
                  {photo ? <img src={photo.url || photo} alt="" className="w-full h-full object-cover" /> : null}
                  {isMutual && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#E70F72] text-white text-[9px] font-semibold">MATCH</div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-white truncate">{p.display_name}</p>
                  <p className="text-[11px] text-white/40 mb-2">{p.bio ? p.bio.slice(0, 40) : 'Was there too'}</p>
                  <button
                    disabled={sent}
                    onClick={async () => {
                      if (!myUserId) return;
                      await base44.entities.EventSpark.create({
                        event_id: event.id,
                        from_user_id: myUserId,
                        to_user_id: p.user_id,
                        status: 'active',
                      });
                      queryClient.invalidateQueries(['afterglow-sparks', event.id]);
                      queryClient.invalidateQueries(['afterglow-incoming', event.id]);
                    }}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      sent
                        ? 'bg-white/5 text-white/40 border border-white/10'
                        : 'bg-[#E70F72] text-white'
                    }`}
                  >
                    {sent ? <><Check className="w-3 h-3" /> Spark sent</> : <><Heart className="w-3 h-3" /> Spark</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-white/30 mt-5 leading-relaxed text-center px-4">
        Afterglow is the only digital dating mechanic at a Crossd Live event. A spark only matters if it's mutual — no notifications are sent until then.
      </p>
    </div>
  );
}

function calcAge(birthdate) {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}