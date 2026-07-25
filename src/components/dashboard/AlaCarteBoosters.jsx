import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Flame, Zap, Eye, MessageCircle, Clock, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';

// Helper: activate a booster by writing to the Profile entity
async function activateBooster(profileId, boosterType, durationHours) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  const fieldMap = {
    priority_spark: { priority_spark_active_until: expiresAt.toISOString() },
    like_reveal: { like_reveal_active_until: expiresAt.toISOString() },
    spark_note: { spark_note_active_until: expiresAt.toISOString() },
    golden_hour: { golden_hour_active_until: expiresAt.toISOString() },
    glow: { glow_active_until: expiresAt.toISOString(), glow_cooldown_until: new Date(expiresAt.getTime() + 24 * 3600 * 1000).toISOString(), glow_stats: { profile_views: 0, likes_received: 0, matches: 0 } },
  };

  await base44.entities.Profile.update(profileId, fieldMap[boosterType]);

  // Also log a purchase record
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

function BoosterRow({ icon: Icon, iconColor, title, description, children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-black/40 rounded-xl border border-[#E70F72]/20 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{title}</div>
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

  const ActivateButton = ({ type, hours, label, activeField }) => {
    const active = isActive(activeField);
    const pending = mutate.isPending && mutate.variables?.type === type;
    const done = success === type;

    if (active) {
      return (
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Active
        </div>
      );
    }
    if (done) {
      return (
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Activated!
        </div>
      );
    }
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

        {/* Glow Mode */}
        <BoosterRow
          icon={Flame}
          iconColor="text-orange-500"
          title="Glow Mode"
          description="Boost your profile visibility — appear higher in discovery for 24 hours."
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            While Glow Mode is active your profile is surfaced more often in the discovery feed, giving you a higher chance of being seen by compatible people nearby.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">24h visibility boost</span>
            <ActivateButton type="glow" hours={24} label="Activate · Free" activeField="glow_active_until" />
          </div>
        </BoosterRow>

        {/* Priority Spark Pack */}
        <BoosterRow
          icon={Zap}
          iconColor="text-[#E70F72]"
          title="⚡ Priority Spark Pack"
          description="5 Sparks that place you higher in each person's discovery queue."
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Each Priority Spark you send jumps to the front of the recipient's queue, so your profile is seen before regular Likes. Use them on people you really want to connect with.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">5 priority sends · 72h window</span>
            <ActivateButton type="priority_spark" hours={72} label="Activate · Free" activeField="priority_spark_active_until" />
          </div>
        </BoosterRow>

        {/* Like Reveal */}
        <BoosterRow
          icon={Eye}
          iconColor="text-purple-400"
          title="👀 Like Reveal"
          description="Reveal up to 3 people who have already liked you."
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            See exactly who has already expressed interest in your profile. Decide whether to Spark back and turn a hidden Like into a mutual match.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">Reveal up to 3 likes · 48h window</span>
            <ActivateButton type="like_reveal" hours={48} label="Activate · Free" activeField="like_reveal_active_until" />
          </div>
        </BoosterRow>

        {/* Spark Note */}
        <BoosterRow
          icon={MessageCircle}
          iconColor="text-blue-400"
          title="💌 Spark Note"
          description="Attach a personal message to one Like so they stop and take a closer look."
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Stand out from the crowd by adding a short, personal note to your next Like. The recipient sees your message before deciding whether to match — giving you a meaningful first impression.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">One note attachment · 24h window</span>
            <ActivateButton type="spark_note" hours={24} label="Activate · Free" activeField="spark_note_active_until" />
          </div>
        </BoosterRow>

        {/* Golden Hour */}
        <BoosterRow
          icon={Clock}
          iconColor="text-amber-400"
          title="⏰ Golden Hour"
          description="Schedule a concentrated profile boost for your local feed's peak hour."
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Your profile gets pushed to the top of local discovery during the hour when activity in your area is highest. Choose 1 hour for a laser-focused spike, or 24 hours for sustained presence all day.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <span className="text-white/60 text-xs">1-hour boost</span>
              <ActivateButton type="golden_hour" hours={1} label="1h" activeField="golden_hour_active_until" />
            </div>
            <div className="flex-1 flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <span className="text-white/60 text-xs">24-hour boost</span>
              <ActivateButton type="golden_hour" hours={24} label="24h" activeField="golden_hour_active_until" />
            </div>
          </div>
        </BoosterRow>

        {/* FateSync Pack */}
        <BoosterRow
          icon={Zap}
          iconColor="text-[#E70F72]"
          title="FateSync Pack"
          description="5 priority matches surfaced from your compatibility blueprint."
        >
          <p className="text-white/60 text-xs mb-3 leading-relaxed">
            Uses your PlacesDNA and MBTI compatibility data to surface 5 people most likely to connect with you, and promotes your profile to them directly.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">5 curated matches · 72h window</span>
            <ActivateButton type="priority_spark" hours={72} label="Activate · Free" activeField="priority_spark_active_until" />
          </div>
        </BoosterRow>

      </div>
    </motion.div>
  );
}