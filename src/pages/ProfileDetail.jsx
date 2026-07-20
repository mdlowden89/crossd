import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Heart, X, MapPin, Briefcase, BadgeCheck, 
  Sparkles, Flag, Ban, ChevronRight, Ruler, Users, Baby, 
  HeartHandshake, Wine, Star, Wind, Church
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdModal } from '@/components/ui/crossd-modal';
import SparkSignatureRow from '@/components/profile/SparkSignatureRow';
import CompatibilityBreakdown from '@/components/profile/CompatibilityBreakdown';
import MomentsTimeline from '@/components/profile/MomentsTimeline';
import PlacesDNAProfile from '@/components/profile/PlacesDNAProfile';
import { buildSparkSignals } from '@/components/spark/signalsGenerator';
import { generateSparkPattern, generateCompatibilityTease } from '@/components/spark/sparkPatternGenerator';
import { calculateArchetypeRarity } from '@/components/spark/rarityEngine';
import RarityBadge from '@/components/profile/RarityBadge';
import RarityCard from '@/components/profile/RarityCard';

export default function ProfileDetail() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [showRarityCard, setShowRarityCard] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => base44.entities.Profile.filter({ id: profileId }).then(p => p[0]),
    enabled: !!profileId
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });
      return profiles[0];
    }
  });

  const { data: moments = [] } = useQuery({
    queryKey: ['profile-moments', profileId],
    queryFn: async () => {
      if (!profile) return [];
      const allMoments = await base44.entities.Moment.filter({ user_id: profile.id });
      // Sort by most recent and take top 5
      return allMoments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
    },
    enabled: !!profile
  });

  const handleLike = async () => {
    if (!myProfile || !profile) return;

    await base44.entities.Like.create({
      from_user_id: myProfile.id,
      to_user_id: profile.id,
      source: 'discovery',
      status: 'active'
    });

    window.history.back();
  };

  const handlePass = () => {
    window.history.back();
  };

  const handleBlock = async () => {
    if (!myProfile || !profile) return;

    await base44.entities.Block.create({
      blocker_id: myProfile.id,
      blocked_id: profile.id
    });

    window.location.href = createPageUrl('Explore');
  };

  const handleReport = async () => {
    if (!myProfile || !profile || !reportReason) return;

    await base44.entities.Report.create({
      reporter_id: myProfile.id,
      reported_user_id: profile.id,
      reason: reportReason,
      details: reportDetails
    });

    setShowReportModal(false);
    window.location.href = createPageUrl('Explore');
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photos = profile.photos || [];
  const age = profile.birthdate
    ? Math.floor((new Date() - new Date(profile.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  const isGlowing = profile.glow_active_until && new Date(profile.glow_active_until) > new Date();
  
  // Generate Spark Pattern and Compatibility
  const signals = buildSparkSignals(profile, []);
  const sparkPattern = generateSparkPattern(profile, signals);
  const compatibilityTease = generateCompatibilityTease(profile, signals);
  
  // Calculate rarity
  const primaryArchetype = signals.find(s => s.dimension === 'environment')?.type || 'Social';
  const secondaryArchetype = signals.find(s => s.dimension === 'creative')?.type || 'Buzzing';
  const archetypeRarity = calculateArchetypeRarity(primaryArchetype, secondaryArchetype, profile.city || 'London');

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Photo + Back Button */}
      <div className="relative">
        {photos.length > 0 ? (
          <motion.img
            src={photos[0]?.url}
            alt={profile.display_name}
            className="w-full aspect-[3/4] max-h-[75vh] object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full aspect-[3/4] max-h-[75vh] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
            <span className="text-white/40">No photos</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="absolute top-6 left-6 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 z-20"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </motion.button>

        {/* Glow badge */}
        {isGlowing && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-6 right-6 z-20">
            <div className="px-4 py-2 bg-[#E70F72]/90 backdrop-blur-xl rounded-full border border-[#E70F72] shadow-lg shadow-[#E70F72]/50 flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-white text-xs font-semibold">GLOW MODE</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-5 sm:px-6 pb-32 -mt-16 relative">
        {/* Animated Aura Background */}
        {profile.mbti_type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${(() => {
                // Dominant vibe color based on MBTI or first vibe tag
                const mbtiColors = {
                  'ENFJ': '#E74C78', // Romantic
                  'ENFP': '#FF6B3D', // Social & Buzzing
                  'INFJ': '#C49A6C', // Calm & Cozy
                  'INFP': '#9B5DE5', // Creative
                  'ENTJ': '#F6C90E', // Live & Electric
                  'ENTP': '#6A8F7A', // Nature & Grounded
                  'INTJ': '#4169E1', // Deep & Intellectual
                  'INTP': '#4169E1', // Deep & Intellectual
                  'ESFJ': '#E74C78', // Romantic
                  'ESFP': '#FF6B3D', // Social & Buzzing
                  'ISFJ': '#C49A6C', // Calm & Cozy
                  'ISFP': '#9B5DE5', // Creative
                  'ESTJ': '#F6C90E', // Live & Electric
                  'ESTP': '#FF4081', // Active & Energetic
                  'ISTJ': '#8B7355', // Intimate Local
                  'ISTP': '#FF4081'  // Active & Energetic
                };
                return mbtiColors[profile.mbti_type] || '#E70F72';
              })()} 20%, transparent 70%)`,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            />
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-2 mb-3 relative z-10"
        >
          <h1 className="text-4xl font-bold text-white leading-none">
            {profile.display_name}
            <span className="text-white/50 font-normal">{age ? `, ${age}` : ''}</span>
          </h1>
          {profile.top_contributor && (
            <div className="flex flex-col items-center mb-1">
              <span className="text-2xl">✨</span>
              <span className="text-[10px] text-yellow-400/80 font-semibold uppercase tracking-wide leading-none">Top Contributor</span>
            </div>
          )}
          {profile.verification_status === 'verified' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <BadgeCheck className="w-6 h-6 text-[#E70F72] mb-1" />
            </motion.div>
          )}
          {isGlowing && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-1"
            >
              <Sparkles className="w-5 h-5 text-[#E70F72]" />
            </motion.div>
          )}
        </motion.div>
        
        {/* Rarity Badge */}
        {archetypeRarity && !archetypeRarity.hidden && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowRarityCard(true)}
            className="cursor-pointer mb-4"
          >
            <RarityBadge rarity={archetypeRarity} showPercentage={myProfile?.crossd_plus} />
          </motion.div>
        )}

        {/* Intent Chips */}
        {(profile.dating_intentions || profile.relationship_type) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-2 mb-5"
          >
            {profile.dating_intentions && (
              <div className="px-3 py-1.5 bg-[#E70F72]/10 border border-[#E70F72]/30 rounded-full">
                <span className="text-[#E70F72] text-xs font-medium">{profile.dating_intentions}</span>
              </div>
            )}
            {profile.relationship_type && (
              <div className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-full">
                <span className="text-white/70 text-xs font-medium">{profile.relationship_type}</span>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-7 relative z-10"
        >
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span>{profile.city || 'London'}</span>
            {profile.verification_status === 'verified' && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-[#E70F72] font-medium">Verified</span>
              </>
            )}
          </div>

          {profile.mbti_type && (
            <div className="mt-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-white font-semibold text-base">
                  {profile.mbti_type} · The {(() => {
                    const mbtiNames = {
                      'ENFJ': 'Protagonist',
                      'ENFP': 'Campaigner',
                      'INFJ': 'Advocate',
                      'INFP': 'Mediator',
                      'ENTJ': 'Commander',
                      'ENTP': 'Debater',
                      'INTJ': 'Architect',
                      'INTP': 'Logician',
                      'ESFJ': 'Consul',
                      'ESFP': 'Entertainer',
                      'ISFJ': 'Defender',
                      'ISFP': 'Adventurer',
                      'ESTJ': 'Executive',
                      'ESTP': 'Entrepreneur',
                      'ISTJ': 'Logistician',
                      'ISTP': 'Virtuoso'
                    };
                    return mbtiNames[profile.mbti_type] || 'Personality';
                  })()}
                </span>
              </div>
              <p className="text-white/60 text-sm mt-1.5 leading-relaxed">
                {(() => {
                  const mbtiDescs = {
                    'ENFJ': 'High-energy connector with a love for discovery.',
                    'ENFP': 'Enthusiastic and creative free spirit.',
                    'INFJ': 'Quiet and mystical, yet inspiring.',
                    'INFP': 'Poetic, kind, and altruistic.',
                    'ENTJ': 'Bold, imaginative, and strong-willed.',
                    'ENTP': 'Smart and curious thinker.',
                    'INTJ': 'Imaginative and strategic thinker.',
                    'INTP': 'Innovative inventor with endless curiosity.',
                    'ESFJ': 'Caring and social helper.',
                    'ESFP': 'Spontaneous and energetic entertainer.',
                    'ISFJ': 'Warm and dedicated protector.',
                    'ISFP': 'Flexible and charming artist.',
                    'ESTJ': 'Excellent administrator and manager.',
                    'ESTP': 'Smart and energetic perceiver.',
                    'ISTJ': 'Practical and fact-minded individual.',
                    'ISTP': 'Bold and practical experimenter.'
                  };
                  return mbtiDescs[profile.mbti_type] || 'Unique personality with strong values.';
                })()}
              </p>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-2 mb-7"
        >
          {(() => {
            const badges = [
              profile.job_title && { icon: Briefcase, text: profile.job_title },
              profile.ethnicity && profile.ethnicity !== 'Prefer Not to Say' && { 
                icon: Users, 
                text: profile.ethnicity.replace('White/Caucasian', 'White').replace('Black/African Descent', 'Black') 
              },
              profile.religion && profile.religion !== 'Prefer Not to Say' && { icon: Church, text: profile.religion },
              profile.zodiac_sign && { icon: Star, text: profile.zodiac_sign },
              profile.children && { 
                icon: Baby, 
                text: profile.children.replace("Don't have children", "Don't have kids") 
              },
              profile.family_plans && { icon: HeartHandshake, text: profile.family_plans },
              profile.drinking && { icon: Wine, text: `Drinks ${profile.drinking.toLowerCase()}` },
              profile.smoking && { icon: Wind, text: `Smokes ${profile.smoking.toLowerCase()}` },
              profile.height && { 
                icon: Ruler, 
                text: `${profile.height}cm` 
              }
            ].filter(Boolean).slice(0, 4);

            return badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <Icon className="w-3.5 h-3.5 text-[#E70F72]" />
                  <span className="text-white/80 text-sm">{badge.text}</span>
                </div>
              );
            });
          })()}
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">About</p>
            <CrossdCard className="mb-7 bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a]">
              <p className="text-white/90 text-base leading-relaxed">{profile.bio}</p>
            </CrossdCard>
          </motion.div>
        )}

        {/* Photos 2–3 pair */}
        {photos[1] && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 mb-7">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
              <img src={photos[1].url} alt="" className="w-full h-full object-cover" />
            </div>
            {photos[2] && (
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                <img src={photos[2].url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>
        )}

        {/* Spark Signature Row */}
        <div className="mb-3">
          <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Spark Signals</p>
          <p className="text-white/30 text-xs ml-1 mb-3 leading-relaxed">Spark Signals reveal the real-world clues behind someone's vibe — personality, places, moments, and connection style — so you can see what kind of spark they naturally bring.</p>
        </div>
        <SparkSignatureRow profile={profile} moments={[]} />

        {/* Spark Pattern Insight */}
        {sparkPattern && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}           className="mb-7 mt-4">
            <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Spark Pattern</p>
            <p className="text-white/30 text-xs ml-1 mb-3">A snapshot of how they show up socially and what energises them</p>
            <div className="relative group">
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-[#E70F72]/10 via-[#E70F72]/20 to-[#E70F72]/10 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0B0B0B] border border-[#E70F72]/30 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🪄</span>
                  <div className="flex-1">
                    <p className="text-white/90 text-base italic leading-relaxed">{sparkPattern}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Compatibility Tease */}
        {compatibilityTease && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
            <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Your Compatibility</p>
            <p className="text-white/30 text-xs ml-1 mb-3">Based on personality, vibe, and shared energy patterns</p>
            <button onClick={() => setShowCompatibilityModal(true)} className="w-full bg-gradient-to-r from-[#E70F72]/10 via-[#E70F72]/5 to-transparent border border-[#E70F72]/20 rounded-xl p-4 hover:border-[#E70F72]/40 transition-all cursor-pointer group text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💞</span>
                  <div>
                    <p className="text-white font-medium text-sm">{compatibilityTease.text}</p>
                    <p className="text-white/50 text-xs mt-0.5 group-hover:text-[#E70F72] transition-colors">Tap to learn why</p>
                  </div>
                </div>
                {profile.crossd_plus && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E70F72]/20 rounded-full border border-[#E70F72]/40">
                    <span className="text-white text-xs font-bold">{compatibilityTease.compatibility}%</span>
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        )}



        {/* MBTI + Vibe Tags */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          {profile.mbti_type && (
            <div className="mb-4">
              <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Personality</p>
              <div className="bg-gradient-to-r from-[#E70F72]/15 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#E70F72] rounded-xl flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{profile.mbti_type}</span>
                  </div>
                  <span className="text-white font-semibold text-base">The {(() => {
                    const mbtiNames = { 'ENFJ': 'Protagonist', 'ENFP': 'Campaigner', 'INFJ': 'Advocate', 'INFP': 'Mediator', 'ENTJ': 'Commander', 'ENTP': 'Debater', 'INTJ': 'Architect', 'INTP': 'Logician', 'ESFJ': 'Consul', 'ESFP': 'Entertainer', 'ISFJ': 'Defender', 'ISFP': 'Adventurer', 'ESTJ': 'Executive', 'ESTP': 'Entrepreneur', 'ISTJ': 'Logistician', 'ISTP': 'Virtuoso' };
                    return mbtiNames[profile.mbti_type] || 'Personality';
                  })()}</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {(() => {
                    const mbtiDescs = { 'ENFJ': 'High-energy connector with a love for discovery.', 'ENFP': 'Enthusiastic and creative free spirit.', 'INFJ': 'Quiet and mystical, yet inspiring.', 'INFP': 'Poetic, kind, and altruistic.', 'ENTJ': 'Bold, imaginative, and strong-willed.', 'ENTP': 'Smart and curious thinker.', 'INTJ': 'Imaginative and strategic thinker.', 'INTP': 'Innovative inventor with endless curiosity.', 'ESFJ': 'Caring and social helper.', 'ESFP': 'Spontaneous and energetic entertainer.', 'ISFJ': 'Warm and dedicated protector.', 'ISFP': 'Flexible and charming artist.', 'ESTJ': 'Excellent administrator and manager.', 'ESTP': 'Smart and energetic perceiver.', 'ISTJ': 'Practical and fact-minded individual.', 'ISTP': 'Bold and practical experimenter.' };
                    return mbtiDescs[profile.mbti_type] || 'Unique personality with strong values.';
                  })()}
                </p>
              </div>
            </div>
          )}
          {profile.vibe_tags && profile.vibe_tags.length > 0 && (
            <div>
              <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Vibes</p>
              <div className="flex flex-wrap gap-2">
                {profile.vibe_tags.map((tag, index) => {
                  const vibeEmojis = { 'Romantic': '💕', 'Flirty': '😏', 'Cozy': '🕯️', 'Calm': '🌊', 'Creative': '🎨', 'Artistic': '🖼️', 'Social': '🎉', 'Energetic': '⚡', 'Vibrant': '🌟', 'Peaceful': '🕊️', 'Natural': '🌿', 'Spontaneous': '🎲', 'Adventurous': '🧗', 'Deep talk': '💭', 'Intellectual': '📚', 'Active': '🏃', 'Low-key': '🤫', 'Outgoing': '🎊', 'adventurous': '🧗', 'foodie': '🍽️', 'art lover': '🎨', 'spontaneous': '🎲' };
                  const emoji = vibeEmojis[tag] || '✨';
                  return (
                    <motion.span key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.05 }} className="px-4 py-2 rounded-xl bg-white/5 text-white/90 text-sm border border-white/15 hover:border-[#E70F72]/40 transition-colors">
                      {emoji} {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Photos 4–5 pair */}
        {photos[3] && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 mb-7">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
              <img src={photos[3].url} alt="" className="w-full h-full object-cover" />
            </div>
            {photos[4] && (
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                <img src={photos[4].url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>
        )}

        {/* Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
            <p className="text-white/45 text-xs uppercase tracking-wider mb-3 ml-1">Prompts</p>
            <div className="space-y-3">
              {profile.prompts.map((prompt, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.05 }} className="bg-gradient-to-br from-[#1a1a1a] via-[#0B0B0B] to-[#1a1a1a] border border-[#E70F72]/30 rounded-2xl p-5 shadow-lg hover:shadow-[#E70F72]/10 transition-shadow">
                  <p className="text-[#E70F72] text-sm font-bold mb-2">{prompt.question}</p>
                  <p className="text-white text-base leading-relaxed">{prompt.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}



        {/* PlacesDNA Profile */}
        <PlacesDNAProfile profile={profile} moments={moments} />

        {/* Moments Timeline */}
        <MomentsTimeline moments={moments} />

        {/* Lifestyle Info Grid */}
        {(profile.height || profile.ethnicity || profile.religion || profile.children || profile.family_plans || profile.drinking || profile.smoking || profile.zodiac_sign) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-6">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3 ml-1">Lifestyle & Background</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                profile.height && { icon: Ruler, label: 'HEIGHT', value: `${profile.height}cm` },
                profile.ethnicity && profile.ethnicity !== 'Prefer Not to Say' && { icon: Users, label: 'ETHNICITY', value: profile.ethnicity.replace('White/Caucasian', 'White').replace('Black/African Descent', 'Black') },
                profile.religion && profile.religion !== 'Prefer Not to Say' && { icon: Church, label: 'RELIGION', value: profile.religion },
                profile.children && { icon: Baby, label: 'CHILDREN', value: profile.children.replace("Don't have children", "Don't have kids") },
                profile.family_plans && { icon: HeartHandshake, label: 'FAMILY PLANS', value: profile.family_plans },
                profile.drinking && { icon: Wine, label: 'DRINKING', value: profile.drinking },
                profile.smoking && { icon: Wind, label: 'SMOKING', value: profile.smoking },
                profile.zodiac_sign && { icon: Star, label: 'ZODIAC', value: profile.zodiac_sign },
              ].filter(Boolean).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-black border border-[#E70F72]/25 rounded-2xl p-4" style={{ boxShadow: 'inset 0 0 20px rgba(231,15,114,0.04)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-white/40" />
                      <p className="text-white/40 text-xs font-semibold tracking-wider">{item.label}</p>
                    </div>
                    <p className="text-white font-bold text-base">{item.value || '—'}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Relationship Info */}
        {(profile.relationship_type || profile.dating_intentions || profile.family_plans) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
            <p className="text-white/45 text-xs uppercase tracking-wider mb-3 ml-1">Looking For</p>
            <div className="space-y-3">
              {profile.dating_intentions && (
                <div className="bg-gradient-to-r from-[#E70F72]/10 to-transparent border border-[#E70F72]/20 rounded-xl p-4">
                  <p className="text-[#E70F72] text-xs mb-1.5 font-semibold">Dating Intentions</p>
                  <p className="text-white font-medium">{profile.dating_intentions}</p>
                </div>
              )}
              {profile.relationship_type && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1.5">Relationship Type</p>
                  <p className="text-white font-medium">{profile.relationship_type}</p>
                </div>
              )}
              {profile.family_plans && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1.5">Family Plans</p>
                  <p className="text-white font-medium">{profile.family_plans}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Safety Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 mt-8 pt-6 border-t border-white/5"
        >
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <Flag className="w-4 h-4" />
            Report
          </button>
          <button
            onClick={handleBlock}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <Ban className="w-4 h-4" />
            Block
          </button>
        </motion.div>
      </div>

      {/* Mobile Fixed Action Buttons */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-black via-black to-transparent pt-8">
        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePass}
            className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center"
          >
            <X className="w-7 h-7 text-white/60" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-[#E70F72] flex items-center justify-center shadow-[0_0_30px_rgba(231,15,114,0.4)]"
          >
            <Heart className="w-8 h-8 text-black" fill="black" />
          </motion.button>
        </div>
      </div>

      {/* Rarity Card Modal */}
      <AnimatePresence>
        {showRarityCard && (
          <RarityCard
            rarity={archetypeRarity}
            isPremium={myProfile?.crossd_plus || false}
            onClose={() => setShowRarityCard(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Compatibility Breakdown Modal */}
      <CompatibilityBreakdown
        isOpen={showCompatibilityModal}
        onClose={() => setShowCompatibilityModal(false)}
        profile={profile}
        myProfile={myProfile}
        signals={signals}
        myMoments={[]}
        theirMoments={moments}
        compatibility={compatibilityTease?.compatibility}
        isPremium={myProfile?.crossd_plus || false}
      />

      {/* Report Modal */}
      <CrossdModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report User"
      >
        <div className="space-y-4">
          <p className="text-white/65 text-sm">Why are you reporting this profile?</p>
          
          {['inappropriate_content', 'harassment', 'spam', 'fake_profile', 'underage', 'other'].map(reason => (
            <button
              key={reason}
              onClick={() => setReportReason(reason)}
              className={`w-full p-3 rounded-xl border text-left transition-colors ${
                reportReason === reason
                  ? 'border-[#E70F72] bg-[#E70F72]/10 text-white'
                  : 'border-white/15 text-white/65 hover:border-white/30'
              }`}
            >
              {reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}

          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Additional details (optional)"
            className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl p-3 text-white placeholder:text-white/40 resize-none h-24"
          />

          <CrossdButton
            onClick={handleReport}
            className="w-full"
            disabled={!reportReason}
          >
            Submit Report
          </CrossdButton>
        </div>
      </CrossdModal>
    </div>
  );
}