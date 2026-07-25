import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Flame, Zap, Eye, MessageCircle, Clock, ChevronDown, ChevronUp, CheckCircle2, Sparkles
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';

async function activateBooster(profileId, boosterType, durationHours) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  const fieldMap = {
    priority_spark: { priority_spark_active_until: expiresAt.toISOString() },
    like_reveal: { like_reveal_active_until: expiresAt.toISOString() },
    spark_note: { spark_note_active_until: expiresAt.toISOString() },
    golden_hour: { golden_hour_active_until: expiresAt.toISOString() },
    glow: {
      glow_active_until: expiresAt.toISOString(),
      glow_cooldown_until: new Date(expiresAt.getTime() + 24 * 3600 * 1000).toISOString(),
      glow_stats: { profile_views: 0, likes_received: 0, matches: 0 },
    },
  };

  await base44.entities.Profile.update(profileId, fieldMap[boosterType]);

  const user = await base44.auth.me();
  await base44.entities.Purchase.create({
    user_id: user.id,
    provider: 'base44',
    product_type: 'glow_boost',
    status: 'completed',
    amount: 0,
    features_unlocked: [boosterType],
    expires_at: expiresAt.toISOString(),
  });
}

function BoosterRow({ icon: Icon, iconColor, title, description, badge, children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-black/40 rounded-xl border border-[#E70F72]/20 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{title}</span>
            {badge && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap">
                {badge}
              </span>
            )}
          </div>
          <div className="text-white/50 text-xs mt-0.5 leading-snug">{description}</div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AlaCarteBoosters({ profile, onProfileUpdated }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(null);
  const [glowSchedule, setGlowSchedule] = useState('now'); // 'now' | 'schedule' | 'golden_hour'

  const mutate = useMutation({
    mutationFn: ({ type, hours }) => activateBooster(profile.id, type, hours),
    onSuccess: (_, { type }) => {
      setSuccess(type);
      setTimeout(() => setSuccess(null), 3000);
      onProfileUpdated?.();
      queryClient.invalidateQueries(['my-profile']);
    },
  });

  const isActive = (field) => profile?.[field] && new Date(profile[field]) > new Date();

  const glowActive = isActive('glow_active_until');
  const glowTimeLeft = glowActive
    ? Math.max(0, new Date(profile.glow_active_until) - new Date())
    : 0;
  const glowHours = Math.floor(glowTimeLeft / (1000 * 60 * 60));
  const glowMins = Math.floor((glowTimeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const ActivateButton = ({ type, hours, label, activeField }) => {
    const active = isActive(activeField);
    const pending = mutate.isPending && mutate.variables?.type === type;
    const done = success === type;

    if (active) return (
      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" /> Active
      </div>
    );
    if (done) return (
      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" /> Activated!
      </div>
    );
    return (
      <CrossdButton
        size="sm"
        loading={pending}
        disabled={mutate.isPending}
        onClick={() => mutate.mutate({ type, hours })}
        className="text-xs"
      >
        {label}
      </CrossdButton>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl p-5 border border-[#E70F72]/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-[#E70F72]" />
        <h2 className="text-lg font-bold text-white">À La Carte Boosters</h2>
      </div>
      <p className="text-white/65 text-sm mb-4">
        Powerful one-time boosts — tap any to expand and activate.
      </p>

      <div className="space-y-3">

        {/* Glow Hours */}
        <BoosterRow
          icon={Flame}
          iconColor="text-orange-500"
          title="🔥 Glow Hours"
          description="Appear higher in discovery for one hour at a time — activate now or save for the perfect moment."
        >
          <p className="text-white/60 text-xs mb-4 leading-relaxed">
            Each Glow Hour boosts your profile for exactly 60 minutes, running continuously once activated. You can't pause or stack Glows — choose your moment wisely.
          </p>

          {glowActive ? (
            <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold mb-3">
              <Flame className="w-4 h-4" />
              Glow active — {glowHours}h {glowMins}m remaining
            </div>
          ) : (
            <>
              {/* Activation mode selector */}
              <div className="flex gap-2 mb-3">
                {[
                  { key: 'now', label: 'Glow Now' },
                  { key: 'schedule', label: 'Schedule' },
                  { key: 'golden_hour', label: '✨ Golden Hour' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setGlowSchedule(opt.key)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                      glowSchedule === opt.key
                        ? 'bg-[#E70F72]/20 border-[#E70F72]/60 text-white font-semibold'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {glowSchedule === 'golden_hour' && (
                <p className="text-amber-400/80 text-xs mb-3 leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Crossd will schedule your Glow Hour automatically during the period when relevant users in your area are most active.
                </p>
              )}
              {glowSchedule === 'schedule' && (
                <p className="text-white/50 text-xs mb-3">
                  Scheduling UI coming soon — for now, activate immediately or use Golden Hour.
                </p>
              )}
            </>
          )}

          {/* Purchase packs */}
          <div className="space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Purchase packs</p>

            <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5 border border-white/10">
              <div>
                <span className="text-white text-sm font-medium">3 Glow Hours</span>
                <span className="text-white/40 text-xs ml-2">~80p/hour</span>
              </div>
              <span className="text-[#E70F72] font-bold text-sm">£2.99</span>
            </div>

            <div className="flex items-center justify-between bg-amber-500/10 rounded-lg px-3 py-2.5 border border-amber-500/30 relative">
              <div className="absolute -top-2 right-3 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Best Value</div>
              <div>
                <span className="text-white text-sm font-medium">5 Glow Hours</span>
                <span className="text-white/40 text-xs ml-2">~80p/hour</span>
              </div>
              <span className="text-amber-400 font-bold text-sm">£3.99</span>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5 border border-white/10">
              <div>
                <span className="text-white text-sm font-medium">24-Hour Glow</span>
                <span className="text-white/40 text-xs ml-2">continuous boost</span>
              </div>
              <span className="text-[#E70F72] font-bold text-sm">£5.99</span>
            </div>
          </div>

          <p className="text-white/30 text-xs mt-2">
            Crossd+ members receive 3 free Glow Hours every month.
          </p>


        </BoosterRow>

        {/* Priority Spark Pack */}
        <BoosterRow
          icon={Zap}
          iconColor="text-[#E70F72]"
          title="⚡ Priority Spark Pack"
          description="5 Sparks placed higher in each recipient's discovery queue · £3.99"
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Each Priority Spark jumps to the front of the recipient's queue so your profile is seen before regular Likes. At roughly 80p per Spark, use them on people you really want to connect with.
          </p>
          <p className="text-white/30 text-xs mt-2">Crossd+ members receive 5 free Priority Sparks every month.</p>
        </BoosterRow>

        {/* Like Reveal */}
        <BoosterRow
          icon={Eye}
          iconColor="text-purple-400"
          title="👀 Like Reveal"
          description="Reveal up to 3 people who have already liked you · £2.99"
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            See exactly who has already expressed interest in your profile. Only shown when you have hidden Likes waiting — decide whether to Spark back and turn interest into a match.
          </p>
          <p className="text-white/30 text-xs mt-2">Crossd+ members receive 1 free Like Reveal every month.</p>
        </BoosterRow>

        {/* Spark Note */}
        <BoosterRow
          icon={MessageCircle}
          iconColor="text-blue-400"
          title="💌 Spark Note"
          description="1 personal message before matching · £1.49"
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Stand out by adding a short, personal note to your next Like. The recipient sees your message before deciding whether to match — a meaningful first impression for the profiles that really matter.
          </p>

        </BoosterRow>

        {/* FateSync Picks */}
        <BoosterRow
          icon={Sparkles}
          iconColor="text-[#E70F72]"
          title="FateSync Picks"
          description="5 compatibility-led profiles surfaced from your FateSync blueprint · £3.99"
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Five profiles surfaced using the attraction patterns and connection preferences in your FateSync blueprint. These still meet your normal age, gender, and safety preferences — curated discovery, not guaranteed matches.
          </p>

        </BoosterRow>

      </div>
    </motion.div>
  );
}