import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Heart, Lock, Clock, Zap, MessageCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const FREE_DAILY_LIKE_LIMIT = 10;

function getDailyLikeCount() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = JSON.parse(localStorage.getItem('crossd_likes') || '{}');
  if (stored.date !== today) return 0;
  return stored.count || 0;
}

function incrementDailyLikeCount() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = JSON.parse(localStorage.getItem('crossd_likes') || '{}');
  const count = stored.date === today ? (stored.count || 0) + 1 : 1;
  localStorage.setItem('crossd_likes', JSON.stringify({ date: today, count }));
  return count;
}
import ProfileCard from '@/components/explore/ProfileCard';
import MatchConfirmation from '@/components/explore/MatchConfirmation';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';

export default function Explore() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [seenIds, setSeenIds] = useState(new Set());
  const [passHistory, setPassHistory] = useState([]);
  const [dailyLikeCount, setDailyLikeCount] = useState(getDailyLikeCount());
  const [sparkNote, setSparkNote] = useState('');
  const [showSparkNoteModal, setShowSparkNoteModal] = useState(false);
  const [pendingLikeProfileId, setPendingLikeProfileId] = useState(null);
  const queryClient = useQueryClient();

  const isPremium = myProfile?.crossd_plus;
  const likesRemaining = isPremium ? Infinity : FREE_DAILY_LIKE_LIMIT - dailyLikeCount;
  const isLikeLimitReached = !isPremium && dailyLikeCount >= FREE_DAILY_LIKE_LIMIT;
  const isGoldenHourActive = myProfile?.golden_hour_active_until && new Date(myProfile.golden_hour_active_until) > new Date();
  const isSparkNoteActive = myProfile?.spark_note_active_until && new Date(myProfile.spark_note_active_until) > new Date();
  const isPrioritySparkActive = myProfile?.priority_spark_active_until && new Date(myProfile.priority_spark_active_until) > new Date();

  // Load current user's profile
  useEffect(() => {
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) {
      setMyProfile(profiles[0]);
      
      // Update last active
      await base44.entities.Profile.update(profiles[0].id, {
        last_active_at: new Date().toISOString()
      });
    }
  };

  // Check mutual interest
  const checkMutualInterest = (myProfile, otherProfile) => {
    if (!myProfile || !otherProfile) return false;
    
    const mapGender = (gender) => {
      if (gender === 'man') return 'men';
      if (gender === 'woman') return 'women';
      return null;
    };

    const myMappedGender = mapGender(myProfile.gender);
    const otherMappedGender = mapGender(otherProfile.gender);

    const iAmInterestedInThem = 
      myProfile.interested_in === 'everyone' ||
      myProfile.interested_in === otherMappedGender ||
      (myProfile.interested_in === 'men_and_women' && (otherMappedGender === 'men' || otherMappedGender === 'women'));

    const theyAreInterestedInMe =
      otherProfile.interested_in === 'everyone' ||
      otherProfile.interested_in === myMappedGender ||
      (otherProfile.interested_in === 'men_and_women' && (myMappedGender === 'men' || myMappedGender === 'women'));

    // For non-binary/prefer_not_to_say, only match if other person has 'everyone'
    if (!myMappedGender && otherProfile.interested_in !== 'everyone') return false;
    if (!otherMappedGender && myProfile.interested_in !== 'everyone') return false;

    return iAmInterestedInThem && theyAreInterestedInMe;
  };

  // Fetch discovery profiles
  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['discover-profiles', myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];

      // Get blocked users
      const blocks = await base44.entities.Block.filter({ blocker_id: myProfile.id });
      const blockedByMe = await base44.entities.Block.filter({ blocked_id: myProfile.id });
      const blockedIds = new Set([
        ...blocks.map(b => b.blocked_id),
        ...blockedByMe.map(b => b.blocker_id)
      ]);

      // Get users I've already liked
      const myLikes = await base44.entities.Like.filter({ from_user_id: myProfile.id });
      const likedIds = new Set(myLikes.map(l => l.to_user_id));

      // Get all discoverable profiles
      const allProfiles = await base44.entities.Profile.filter({
        discoverable: true,
        status: 'active',
        onboarding_complete: true
      });

      // Filter profiles
      const filteredProfiles = allProfiles.filter(p => {
        if (p.id === myProfile.id) return false;
        if (blockedIds.has(p.id)) return false;
        if (likedIds.has(p.id)) return false;
        if (seenIds.has(p.id)) return false;
        if (!checkMutualInterest(myProfile, p)) return false;
        
        // If user has verified_only_mode enabled, only show verified
        if (myProfile.verified_only_mode && p.verification_status !== 'verified') return false;
        
        return true;
      });
      
      // Sort by compatibility - priority sparks, golden hour, and glow float to top
      const { calculateCompatibility } = await import('@/components/spark/compatibilityEngine');
      const now = new Date();

      const profilesWithCompatibility = filteredProfiles.map(p => ({
        profile: p,
        compatibility: calculateCompatibility(myProfile, p, [], []).total,
        // Boost score for profiles running priority spark or glow
        boostScore: (p.priority_spark_active_until && new Date(p.priority_spark_active_until) > now ? 40 : 0)
                  + (p.glow_active_until && new Date(p.glow_active_until) > now ? 20 : 0),
      }));

      // Sort by (compatibility + boost) descending
      profilesWithCompatibility.sort((a, b) =>
        (b.compatibility + b.boostScore) - (a.compatibility + a.boostScore)
      );

      // If MY golden hour is active, shuffle slightly to surface more variety at top
      const myGoldenHourActive = myProfile.golden_hour_active_until && new Date(myProfile.golden_hour_active_until) > now;
      if (myGoldenHourActive) {
        // Move top-10 into a golden pool and re-sort by compatibility only (removes noise)
        profilesWithCompatibility.sort((a, b) => b.compatibility - a.compatibility);
      }

      return profilesWithCompatibility.map(p => p.profile);
    },
    enabled: !!myProfile
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ profileId, note }) => {
      // Create like (with optional spark note)
      await base44.entities.Like.create({
        from_user_id: myProfile.id,
        to_user_id: profileId,
        source: 'discovery',
        status: 'active',
        ...(note ? { liked_content: { type: 'profile', comment: note } } : {})
      });

      // Check if they also liked us (mutual match)
      const theirLikes = await base44.entities.Like.filter({
        from_user_id: profileId,
        to_user_id: myProfile.id,
        status: 'active'
      });

      if (theirLikes.length > 0) {
        // Create match
        await base44.entities.Match.create({
          user_1_id: myProfile.id < profileId ? myProfile.id : profileId,
          user_2_id: myProfile.id < profileId ? profileId : myProfile.id,
          source: 'discovery'
        });

        // Create system message
        const match = await base44.entities.Match.filter({
          user_1_id: myProfile.id < profileId ? myProfile.id : profileId,
          user_2_id: myProfile.id < profileId ? profileId : myProfile.id
        });

        if (match.length > 0) {
          await base44.entities.Message.create({
            match_id: match[0].id,
            sender_id: 'system',
            type: 'system',
            text: "You matched! Start a conversation.",
            system_type: 'match_created'
          });
        }

        return { isMatch: true, matchedProfile: profiles.find(p => p.id === profileId) };
      }

      return { isMatch: false };
    },
    onSuccess: (data) => {
      if (data.isMatch) {
        setMatchedProfile(data.matchedProfile);
        setShowMatch(true);
      }
    }
  });

  const handleLike = () => {
    if (!currentProfile) return;
    if (isLikeLimitReached) return;

    // If Spark Note booster is active, show note modal first
    if (isSparkNoteActive) {
      setPendingLikeProfileId(currentProfile.id);
      setShowSparkNoteModal(true);
      return;
    }

    setSeenIds(prev => new Set([...prev, currentProfile.id]));
    const newCount = incrementDailyLikeCount();
    setDailyLikeCount(newCount);
    likeMutation.mutate({ profileId: currentProfile.id, note: null });
    setCurrentIndex(prev => prev + 1);
  };

  const handleSendSparkNote = (note) => {
    setShowSparkNoteModal(false);
    if (!pendingLikeProfileId) return;
    setSeenIds(prev => new Set([...prev, pendingLikeProfileId]));
    const newCount = incrementDailyLikeCount();
    setDailyLikeCount(newCount);
    likeMutation.mutate({ profileId: pendingLikeProfileId, note });
    setPendingLikeProfileId(null);
    setSparkNote('');
    setCurrentIndex(prev => prev + 1);
  };

  const handlePass = () => {
    if (currentProfile) {
      setPassHistory(prev => [...prev, currentProfile.id]);
      setSeenIds(prev => new Set([...prev, currentProfile.id]));
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleUndo = () => {
    if (!isPremium || passHistory.length === 0) return;
    const lastPassedId = passHistory[passHistory.length - 1];
    setPassHistory(prev => prev.slice(0, -1));
    setSeenIds(prev => {
      const next = new Set(prev);
      next.delete(lastPassedId);
      return next;
    });
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleViewProfile = () => {
    if (currentProfile) {
      window.location.href = createPageUrl('ProfileDetail') + `?id=${currentProfile.id}`;
    }
  };

  const handleMessageMatch = () => {
    setShowMatch(false);
    window.location.href = createPageUrl('ChatList');
  };

  const handleKeepSwiping = () => {
    setShowMatch(false);
    setMatchedProfile(null);
  };

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Match Confirmation Overlay */}
      <AnimatePresence>
        {showMatch && (
          <MatchConfirmation
            profile1={myProfile}
            profile2={matchedProfile}
            onMessage={handleMessageMatch}
            onKeepSwiping={handleKeepSwiping}
          />
        )}
      </AnimatePresence>

      {/* Active booster indicators */}
      {(isGoldenHourActive || isPrioritySparkActive || isSparkNoteActive) && (
        <div className="flex gap-2 flex-wrap mb-3">
          {isGoldenHourActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Clock className="w-3 h-3" /> Golden Hour Active
            </div>
          )}
          {isPrioritySparkActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E70F72]/20 border border-[#E70F72]/30 text-[#E70F72] text-xs font-semibold">
              <Zap className="w-3 h-3" /> Priority Sparks Active
            </div>
          )}
          {isSparkNoteActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <MessageCircle className="w-3 h-3" /> Spark Note Ready
            </div>
          )}
        </div>
      )}

      {/* Spark Note Modal */}
      <AnimatePresence>
        {showSparkNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4"
            onClick={() => setShowSparkNoteModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-sm bg-[#0B0B0B] border border-[#E70F72]/30 rounded-2xl p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-bold">💌 Add a Spark Note</h3>
                </div>
                <button onClick={() => setShowSparkNoteModal(false)}>
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <p className="text-white/50 text-sm mb-3">Write a short message that they'll see before deciding to match.</p>
              <textarea
                value={sparkNote}
                onChange={e => setSparkNote(e.target.value.slice(0, 150))}
                placeholder="What caught your attention?"
                maxLength={150}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-[#E70F72]/50 mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">{sparkNote.length}/150</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendSparkNote(null)}
                    className="px-3 py-1.5 text-white/50 text-sm hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleSendSparkNote(sparkNote || null)}
                    className="px-4 py-1.5 bg-[#E70F72] text-black text-sm font-semibold rounded-full hover:bg-[#E70F72]/90 transition-colors"
                  >
                    Send Spark ⚡
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily like counter / upgrade nudge for free users */}
      {!isPremium && !isLikeLimitReached && dailyLikeCount > 0 && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-white/45 text-xs">
            {likesRemaining} like{likesRemaining !== 1 ? 's' : ''} left today
          </span>
          {likesRemaining <= 3 && (
            <Link to="/CrossdPlus" className="text-[#E70F72] text-xs font-medium underline underline-offset-2">
              Get unlimited
            </Link>
          )}
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {isLikeLimitReached ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
          >
            <div className="w-20 h-20 bg-[#E70F72]/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-[#E70F72]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h2>
            <p className="text-white/65 mb-6">
              You've used your 10 free likes for today. Upgrade to Crossd+ for unlimited likes.
            </p>
            <Link to="/CrossdPlus">
              <CrossdButton>Upgrade to Crossd+</CrossdButton>
            </Link>
            <p className="text-white/40 text-xs mt-4">Resets at midnight</p>
          </motion.div>
        ) : currentProfile ? (
          <ProfileCard
            key={currentProfile.id}
            profile={currentProfile}
            myProfile={myProfile}
            myMoments={[]}
            onLike={handleLike}
            onPass={handlePass}
            onViewFull={handleViewProfile}
            onUndo={handleUndo}
            canUndo={isPremium && passHistory.length > 0}
            isPremium={isPremium}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
          >
            <div className="w-20 h-20 bg-[#E70F72]/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-[#E70F72]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No More Profiles</h2>
            <p className="text-white/65 mb-6">
              You've seen everyone for now. Check back later or expand your preferences.
            </p>
            <CrossdButton onClick={() => { setSeenIds(new Set()); setCurrentIndex(0); refetch(); }}>
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </CrossdButton>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}