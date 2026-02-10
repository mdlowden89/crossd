import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Eye, Heart, TrendingUp, Clock, 
  Crown, CheckCircle, Star, BarChart2, Calendar
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdProgressRing } from '@/components/ui/crossd-progress-ring';
import { format, formatDistanceToNow } from 'date-fns';

const GLOW_DURATION_HOURS = 24;
const GLOW_COOLDOWN_HOURS = 24;

export default function CrossdPlus() {
  const [myProfile, setMyProfile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const isPremium = myProfile?.crossd_plus;
  const isGlowing = myProfile?.glow_active_until && new Date(myProfile.glow_active_until) > new Date();
  const canGlow = myProfile?.glow_cooldown_until ? new Date(myProfile.glow_cooldown_until) < new Date() : true;

  // Calculate glow time remaining
  const glowTimeRemaining = isGlowing 
    ? Math.max(0, new Date(myProfile.glow_active_until) - new Date())
    : 0;
  const glowHoursRemaining = Math.floor(glowTimeRemaining / (1000 * 60 * 60));
  const glowMinutesRemaining = Math.floor((glowTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  // Cooldown time remaining
  const cooldownRemaining = !canGlow && myProfile?.glow_cooldown_until
    ? Math.max(0, new Date(myProfile.glow_cooldown_until) - new Date())
    : 0;

  // Activate Glow Mode
  const activateGlowMutation = useMutation({
    mutationFn: async () => {
      const glowEnd = new Date();
      glowEnd.setHours(glowEnd.getHours() + GLOW_DURATION_HOURS);
      
      const cooldownEnd = new Date(glowEnd);
      cooldownEnd.setHours(cooldownEnd.getHours() + GLOW_COOLDOWN_HOURS);

      await base44.entities.Profile.update(myProfile.id, {
        glow_active_until: glowEnd.toISOString(),
        glow_cooldown_until: cooldownEnd.toISOString(),
        glow_stats: {
          profile_views: 0,
          likes_received: 0,
          matches: 0
        }
      });
    },
    onSuccess: () => {
      loadProfile();
      queryClient.invalidateQueries(['my-profile']);
    }
  });

  // Subscribe to Crossd+
  const subscribeMutation = useMutation({
    mutationFn: async (plan) => {
      const expiresAt = new Date();
      if (plan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      await base44.entities.Profile.update(myProfile.id, {
        crossd_plus: true,
        crossd_plus_plan: 'subscription',
        crossd_plus_expires_at: expiresAt.toISOString()
      });

      await base44.entities.Purchase.create({
        user_id: myProfile.id,
        provider: 'base44',
        product_type: plan === 'monthly' ? 'crossd_plus_monthly' : 'crossd_plus_yearly',
        status: 'completed',
        expires_at: expiresAt.toISOString(),
        features_unlocked: ['glow_mode', 'recaps', 'badge']
      });
    },
    onSuccess: () => {
      loadProfile();
    }
  });

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Sparkles className="w-8 h-8 text-[#E70F72]" />
          <h1 className="text-3xl font-bold text-white">Crossd+</h1>
        </motion.div>
        <p className="text-white/65">Unlock premium features</p>
      </div>

      {isPremium ? (
        // Premium Dashboard
        <div className="space-y-6">
          {/* Status Badge */}
          <CrossdCard glow className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-[#E70F72]" />
              <span className="text-lg font-bold text-white">Premium Member</span>
            </div>
            {myProfile.crossd_plus_expires_at && (
              <p className="text-white/50 text-sm">
                Renews {format(new Date(myProfile.crossd_plus_expires_at), 'MMM d, yyyy')}
              </p>
            )}
          </CrossdCard>

          {/* Glow Mode Section */}
          <CrossdCard>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isGlowing ? 'bg-[#E70F72] animate-pulse' : 'bg-[#E70F72]/20'
              }`}>
                <Zap className={`w-7 h-7 ${isGlowing ? 'text-black' : 'text-[#E70F72]'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Glow Mode</h3>
                <p className="text-white/65 text-sm">
                  {isGlowing 
                    ? `Active for ${glowHoursRemaining}h ${glowMinutesRemaining}m`
                    : canGlow 
                      ? 'Boost your profile visibility'
                      : `Cooldown: ${formatDistanceToNow(new Date(myProfile.glow_cooldown_until))}`
                  }
                </p>
              </div>
            </div>

            {isGlowing ? (
              // Glow Stats
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="w-4 h-4 text-[#E70F72]" />
                    <span className="text-xl font-bold text-white">
                      {myProfile.glow_stats?.profile_views || 0}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">Views</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-4 h-4 text-[#E70F72]" />
                    <span className="text-xl font-bold text-white">
                      {myProfile.glow_stats?.likes_received || 0}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#E70F72]" />
                    <span className="text-xl font-bold text-white">
                      {myProfile.glow_stats?.matches || 0}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">Matches</p>
                </div>
              </div>
            ) : (
              <CrossdButton
                onClick={() => activateGlowMutation.mutate()}
                disabled={!canGlow || activateGlowMutation.isPending}
                loading={activateGlowMutation.isPending}
                className="w-full"
              >
                <Zap className="w-5 h-5 mr-2" />
                {canGlow ? 'Activate Glow Mode' : 'On Cooldown'}
              </CrossdButton>
            )}
          </CrossdCard>

          {/* Recaps Access */}
          <CrossdCard className="cursor-pointer hover:border-[#E70F72]/40" onClick={() => window.location.href = createPageUrl('Recaps')}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E70F72]/20 rounded-full flex items-center justify-center">
                <BarChart2 className="w-7 h-7 text-[#E70F72]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Your Recaps</h3>
                <p className="text-white/65 text-sm">View your dating stats</p>
              </div>
              <Star className="w-5 h-5 text-[#E70F72]" />
            </div>
          </CrossdCard>

          {/* Premium Features */}
          <div className="space-y-3">
            <h3 className="text-white/65 text-sm font-medium">Your Premium Features</h3>
            {[
              { icon: Zap, label: 'Glow Mode Boosts', desc: 'Stand out in discovery' },
              { icon: BarChart2, label: 'Weekly Recaps', desc: 'Shareable dating stats' },
              { icon: Crown, label: 'Crossd+ Badge', desc: 'Show your premium status' },
              { icon: Eye, label: 'See Who Likes You', desc: 'Coming soon' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4 py-2">
                <feature.icon className="w-5 h-5 text-[#E70F72]" />
                <div className="flex-1">
                  <p className="text-white">{feature.label}</p>
                  <p className="text-white/50 text-sm">{feature.desc}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Upgrade Paywall
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CrossdCard className="border-[#E70F72]/50 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-[#E70F72] flex items-center justify-center">
                <Star className="w-8 h-8 text-[#E70F72]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-white mb-2">Unlock Crossd+</h2>
            <p className="text-center text-white/65 text-sm mb-6">Choose a plan to get unlimited access and premium features!</p>

            {/* Features */}
            <div className="space-y-3 mb-8 py-6 border-t border-b border-white/10">
              {[
                { icon: Eye, label: 'See Who Likes You', desc: 'Instantly match with people who\'ve already shown interest.' },
                { icon: Heart, label: 'Unlimited Likes', desc: 'Swipe right as much as you want without daily limits.' },
                { icon: Sparkles, label: 'AI Spark Suggestions', desc: 'Get personalized place recommendations where you vibe thrives.' },
                { icon: TrendingUp, label: 'VIP Profile Boost', desc: 'Get your profile seen by more people, faster.' }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-3">
                  <feature.icon className="w-5 h-5 text-[#E70F72] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">{feature.label}</p>
                    <p className="text-white/50 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Plans */}
            <p className="text-white text-sm font-medium mb-4">Choose Your Plan:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* 1 Month */}
              <div className="border border-[#E70F72]/50 rounded-lg p-4 bg-black/40 text-center hover:border-[#E70F72] transition-colors cursor-pointer">
                <p className="text-white/65 text-xs mb-1">1 Month</p>
                <div className="text-white font-bold mb-1">
                  <span className="text-xl">£9.99</span>
                </div>
                <p className="text-white/50 text-xs mb-2">per month</p>
                <p className="text-[#E70F72] text-xs">Save £3.00</p>
              </div>

              {/* 3 Months */}
              <div className="border-2 border-[#E70F72] rounded-lg p-4 bg-[#E70F72]/10 text-center relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#E70F72] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  Most Popular
                </div>
                <p className="text-white/65 text-xs mb-1">3 Months</p>
                <div className="text-white font-bold mb-1">
                  <span className="text-xl">£29.99</span>
                </div>
                <p className="text-white/50 text-xs mb-2">3 billed every 3 months</p>
                <p className="text-[#E70F72] text-xs">Save £8.99</p>
              </div>

              {/* 12 Months */}
              <div className="col-span-2 border border-[#E70F72]/50 rounded-lg p-4 bg-black/40 text-center hover:border-[#E70F72] transition-colors cursor-pointer relative">
                <div className="absolute -top-2 left-4 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                  Best Value
                </div>
                <p className="text-white/65 text-xs mb-1">12 Months</p>
                <div className="text-white font-bold mb-1">
                  <span className="text-2xl">£89.99</span>
                  <span className="text-sm text-white/50 line-through ml-2">£165.88</span>
                </div>
                <p className="text-white/50 text-xs">Billed once yearly</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-3 rounded-full border border-white/20 text-white text-sm font-medium hover:border-[#E70F72]/50 transition-colors"
              >
                Maybe Later
              </button>
              <CrossdButton
                onClick={() => subscribeMutation.mutate('monthly')}
                loading={subscribeMutation.isPending}
                className="flex-1"
              >
                Upgrade to Crossd+
              </CrossdButton>
            </div>
            </CrossdCard>
            </motion.div>
            </div>
            )}
    </div>
  );
}