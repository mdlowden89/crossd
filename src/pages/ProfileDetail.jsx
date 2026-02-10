import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Heart, X, MapPin, Briefcase, BadgeCheck, 
  Sparkles, Flag, Ban, ChevronRight 
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdModal } from '@/components/ui/crossd-modal';

export default function ProfileDetail() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
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

  return (
    <div className="min-h-screen bg-black">
      {/* Photo Gallery */}
      <div className="relative overflow-hidden">
        <motion.div 
          className="aspect-[3/4] max-h-[70vh] relative"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {photos.length > 0 ? (
            <motion.img
              key={currentPhotoIndex}
              src={photos[currentPhotoIndex]?.url}
              alt={profile.display_name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
              <span className="text-white/40">No photos</span>
            </div>
          )}
          
          {/* Animated gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E70F72]/10 via-transparent to-transparent mix-blend-overlay" />
        </motion.div>

        {/* Photo Indicators - redesigned */}
        {photos.length > 1 && (
          <div className="absolute top-6 left-6 right-6 flex gap-1.5 z-20">
            {photos.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                whileHover={{ scale: 1.2 }}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  index === currentPhotoIndex 
                    ? 'bg-white shadow-lg shadow-white/50' 
                    : 'bg-white/25 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        )}

        {/* Back Button - glassmorphic */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="absolute top-16 left-6 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 z-20"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </motion.button>

        {/* Glow badge if active */}
        {isGlowing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-16 right-6 z-20"
          >
            <div className="px-4 py-2 bg-[#E70F72]/90 backdrop-blur-xl rounded-full border border-[#E70F72] shadow-lg shadow-[#E70F72]/50 flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-white text-xs font-semibold">GLOW MODE</span>
            </div>
          </motion.div>
        )}

        {/* Photo Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
              disabled={currentPhotoIndex === 0}
            />
            <button
              onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
              className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
              disabled={currentPhotoIndex === photos.length - 1}
            />
          </>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-32 -mt-16 relative">
        {/* Name & Verification */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-white">
              {profile.display_name}, {age || '?'}
            </h1>
            {profile.verification_status === 'verified' && (
              <BadgeCheck className="w-8 h-8 text-[#E70F72]" />
            )}
            {isGlowing && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="w-6 h-6 text-[#E70F72]" />
              </motion.div>
            )}
          </div>
          {(profile.job_title || profile.city) && (
            <div className="flex items-center gap-2 text-white/70 text-base">
              {profile.job_title && <span>{profile.job_title}</span>}
              {profile.job_title && profile.city && <span>•</span>}
              {profile.city && <span>{profile.city}</span>}
            </div>
          )}
        </motion.div>

        {/* Quick Info Icons Row */}
        {(profile.smoking || profile.drinking || profile.ethnicity || profile.children || profile.family_plans) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar"
          >
            {profile.smoking && (
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl">🚬</span>
                </div>
                <span className="text-white/50 text-xs text-center">{profile.smoking}</span>
              </div>
            )}
            {profile.drinking && (
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl">🍷</span>
                </div>
                <span className="text-white/50 text-xs text-center">{profile.drinking}</span>
              </div>
            )}
            {profile.ethnicity && profile.ethnicity !== 'Prefer Not to Say' && (
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <span className="text-white/50 text-xs text-center">{profile.ethnicity}</span>
              </div>
            )}
            {profile.children && (
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl">👶</span>
                </div>
                <span className="text-white/50 text-xs text-center">{profile.children}</span>
              </div>
            )}
            {profile.family_plans && (
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl">👨‍👩‍👧</span>
                </div>
                <span className="text-white/50 text-xs text-center">{profile.family_plans}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* About Section */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-white font-bold text-xl mb-3">About {profile.display_name}</h2>
            <p className="text-white/80 text-base leading-relaxed">{profile.bio}</p>
          </motion.div>
        )}

        {/* Photo Grid */}
        {photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            {photos.slice(1, 7).map((photo, index) => (
              <div key={index} className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={photo.url} alt={`Photo ${index + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </motion.div>
        )}

        {/* Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="space-y-6 mb-6">
            {profile.prompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a] border border-white/10 rounded-3xl p-6 hover:border-[#E70F72]/30 transition-colors"
              >
                <h3 className="text-[#E70F72] font-bold text-sm mb-3 uppercase tracking-wide">
                  {prompt.question}
                </h3>
                <p className="text-white text-lg leading-relaxed">{prompt.answer}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        {(profile.mbti_type || profile.height || profile.zodiac_sign || profile.relationship_type || profile.dating_intentions) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            {profile.dating_intentions && (
              <div className="bg-gradient-to-r from-[#E70F72]/15 to-transparent border border-[#E70F72]/30 rounded-2xl p-4">
                <p className="text-[#E70F72] text-xs font-bold mb-1 uppercase">Looking For</p>
                <p className="text-white font-medium">{profile.dating_intentions}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {profile.mbti_type && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">MBTI</p>
                  <p className="text-white font-medium">{profile.mbti_type}</p>
                </div>
              )}
              {profile.height && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Height</p>
                  <p className="text-white font-medium">{profile.height} cm</p>
                </div>
              )}
              {profile.zodiac_sign && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Zodiac</p>
                  <p className="text-white font-medium">{profile.zodiac_sign}</p>
                </div>
              )}
              {profile.relationship_type && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Relationship</p>
                  <p className="text-white font-medium">{profile.relationship_type}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Vibe Tags */}
        {profile.vibe_tags && profile.vibe_tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mb-6"
          >
            <h3 className="text-white/70 text-sm mb-3">My Vibes</h3>
            <div className="flex flex-wrap gap-2">
              {profile.vibe_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-white/5 text-white/90 text-sm border border-white/10"
                >
                  {tag}
                </span>
              ))}
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

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-black via-black to-transparent pt-8">
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