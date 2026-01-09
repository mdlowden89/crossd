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
      <div className="relative">
        <div className="aspect-[3/4] max-h-[70vh]">
          {photos.length > 0 ? (
            <img
              src={photos[currentPhotoIndex]?.url}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white/40">No photos</span>
            </div>
          )}
        </div>

        {/* Photo Indicators */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center mt-4"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Photo Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
              className="absolute left-0 top-0 bottom-0 w-1/3"
            />
            <button
              onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
              className="absolute right-0 top-0 bottom-0 w-1/3"
            />
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-32 -mt-16 relative">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-white">
            {profile.display_name}{age ? `, ${age}` : ''}
          </h1>
          {profile.verification_status === 'verified' && (
            <BadgeCheck className="w-7 h-7 text-[#E70F72]" />
          )}
          {isGlowing && (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Sparkles className="w-6 h-6 text-[#E70F72]" />
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4 text-white/70 mb-6">
          {profile.job_title && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{profile.job_title}</span>
            </div>
          )}
          {profile.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.city}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-white/80 mb-6">{profile.bio}</p>
        )}

        {/* Vibe Tags */}
        {profile.vibe_tags && profile.vibe_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.vibe_tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-[#E70F72]/10 text-[#E70F72] text-sm border border-[#E70F72]/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* MBTI */}
        {profile.mbti_type && (
          <CrossdCard className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white/65">Personality Type</span>
              <span className="text-[#E70F72] font-bold text-xl">{profile.mbti_type}</span>
            </div>
          </CrossdCard>
        )}

        {/* Prompts */}
        {profile.prompts && profile.prompts.map((prompt, index) => (
          <CrossdCard key={index} className="mb-4">
            <p className="text-[#E70F72] text-sm font-medium mb-2">{prompt.question}</p>
            <p className="text-white text-lg">{prompt.answer}</p>
          </CrossdCard>
        ))}

        {/* Safety Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-white/45 hover:text-white/65 transition-colors"
          >
            <Flag className="w-4 h-4" />
            Report
          </button>
          <button
            onClick={handleBlock}
            className="flex items-center gap-2 text-white/45 hover:text-white/65 transition-colors"
          >
            <Ban className="w-4 h-4" />
            Block
          </button>
        </div>
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