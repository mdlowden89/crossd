import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Heart, X, MapPin, Briefcase, BadgeCheck, 
  Sparkles, Flag, Ban, ChevronRight, Ruler, Users, Baby, 
  HeartHandshake, Wine, Star, Wind, Church
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-3 mb-4"
        >
          <h1 className="text-4xl font-bold text-white leading-none">
            {profile.display_name}
            <span className="text-white/50 font-normal">{age ? `, ${age}` : ''}</span>
          </h1>
          {profile.verification_status === 'verified' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <BadgeCheck className="w-7 h-7 text-[#E70F72] mb-1" />
            </motion.div>
          )}
          {isGlowing && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-1"
            >
              <Sparkles className="w-6 h-6 text-[#E70F72]" />
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          {profile.job_title && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <Briefcase className="w-3.5 h-3.5 text-[#E70F72]" />
              <span className="text-white/80 text-sm">{profile.job_title}</span>
            </div>
          )}
          {profile.city && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-[#E70F72]" />
              <span className="text-white/80 text-sm">{profile.city}</span>
            </div>
          )}
          {profile.ethnicity && profile.ethnicity !== 'Prefer Not to Say' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-white/80 text-sm">{profile.ethnicity}</span>
            </div>
          )}
          {profile.children && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-white/80 text-sm">{profile.children}</span>
            </div>
          )}
          {profile.family_plans && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-white/80 text-sm">{profile.family_plans}</span>
            </div>
          )}
          {profile.drinking && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-white/80 text-sm">Drinks {profile.drinking.toLowerCase()}</span>
            </div>
          )}
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CrossdCard className="mb-6 bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a]">
              <p className="text-white/90 text-base leading-relaxed">{profile.bio}</p>
            </CrossdCard>
          </motion.div>
        )}

        {/* Additional Photos (2-3) - After Bio */}
        {photos.length > 1 && photos.slice(1, 3).length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {photos.slice(1, 3).map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + index * 0.1 }}
                className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10"
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}

        {/* MBTI + Vibe Tags Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          {profile.mbti_type && (
            <div className="mb-4">
              <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Personality</p>
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#E70F72]/15 to-[#E70F72]/5 border border-[#E70F72]/30 rounded-2xl">
                <div className="w-10 h-10 bg-[#E70F72] rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-sm">{profile.mbti_type}</span>
                </div>
                <span className="text-white/65 text-sm">The {profile.mbti_type} Personality</span>
              </div>
            </div>
          )}

          {profile.vibe_tags && profile.vibe_tags.length > 0 && (
            <div>
              <p className="text-white/45 text-xs uppercase tracking-wider mb-2 ml-1">Vibes</p>
              <div className="flex flex-wrap gap-2">
                {profile.vibe_tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="px-4 py-2 rounded-xl bg-white/5 text-white/90 text-sm border border-white/15 hover:border-[#E70F72]/40 transition-colors"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Lifestyle Info Grid */}
        {(profile.height || profile.ethnicity || profile.religion || profile.children || profile.family_plans || profile.drinking || profile.smoking || profile.zodiac_sign) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-6"
          >
            <p className="text-white/45 text-xs uppercase tracking-wider mb-3 ml-1">Lifestyle & Background</p>
            <div className="grid grid-cols-2 gap-3">
              {profile.height && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Height</p>
                  </div>
                  <p className="text-white font-medium">{Math.round(profile.height / 30.48 / 12)}'{Math.round((profile.height / 30.48) % 12)}"</p>
                </div>
              )}
              {profile.ethnicity && profile.ethnicity !== 'Prefer Not to Say' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Ethnicity</p>
                  </div>
                  <p className="text-white font-medium">{profile.ethnicity.replace('White/Caucasian', 'White').replace('Black/African Descent', 'Black')}</p>
                </div>
              )}
              {profile.religion && profile.religion !== 'Prefer Not to Say' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Church className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Religion</p>
                  </div>
                  <p className="text-white font-medium">{profile.religion}</p>
                </div>
              )}
              {profile.children && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Baby className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Children</p>
                  </div>
                  <p className="text-white font-medium">{profile.children.replace("Don't have children", "Don't have kids")}</p>
                </div>
              )}
              {profile.family_plans && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartHandshake className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Family Plans</p>
                  </div>
                  <p className="text-white font-medium">{profile.family_plans}</p>
                </div>
              )}
              {profile.drinking && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Wine className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Drinking</p>
                  </div>
                  <p className="text-white font-medium">{profile.drinking}</p>
                </div>
              )}
              {profile.smoking && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Smoking</p>
                  </div>
                  <p className="text-white font-medium">{profile.smoking}</p>
                </div>
              )}
              {profile.zodiac_sign && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/50 text-xs">Zodiac</p>
                  </div>
                  <p className="text-white font-medium">{profile.zodiac_sign}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Additional Photos (4-5) - After About */}
        {photos.length > 3 && photos.slice(3, 5).length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {photos.slice(3, 5).map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10"
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="mb-6">
            <p className="text-white/45 text-xs uppercase tracking-wider mb-3 ml-1">Prompts</p>
            <div className="space-y-3">
              {profile.prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-[#0B0B0B] via-[#1a1a1a] to-[#0B0B0B] border border-white/10 rounded-2xl p-5 hover:border-[#E70F72]/50 transition-all duration-300 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-full bg-gradient-to-b from-[#E70F72] via-[#E70F72]/50 to-transparent rounded-full self-stretch min-h-[60px]" />
                      <div className="flex-1">
                        <p className="text-[#E70F72] text-xs font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                          {prompt.question}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-white/90 text-base leading-relaxed">{prompt.answer}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Photos (6+) - After Prompts */}
        {photos.length > 5 && photos.slice(5).length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {photos.slice(5).map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10"
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Relationship Info */}
        {(profile.relationship_type || profile.dating_intentions || profile.family_plans) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
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