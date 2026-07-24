import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Heart, Lock } from 'lucide-react';
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
  const [passHistory, setPassHistory] = useState([]); // stack of passed profile ids for undo
  const [dailyLikeCount, setDailyLikeCount] = useState(getDailyLikeCount());
  const queryClient = useQueryClient();

  const isPremium = myProfile?.crossd_plus;
  const likesRemaining = isPremium ? Infinity : FREE_DAILY_LIKE_LIMIT - dailyLikeCount;
  const isLikeLimitReached = !isPremium && dailyLikeCount >= FREE_DAILY_LIKE_LIMIT;

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
      
      // Sort by compatibility - high energy matches float to top
      const { calculateCompatibility } = await import('@/components/spark/compatibilityEngine');
      
      const profilesWithCompatibility = filteredProfiles.map(p => ({
        profile: p,
        compatibility: calculateCompatibility(myProfile, p, [], []).total
      }));
      
      // Sort by compatibility descending
      profilesWithCompatibility.sort((a, b) => b.compatibility - a.compatibility);
      
      return profilesWithCompatibility.map(p => p.profile);
    },
    enabled: !!myProfile
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (profileId) => {
      // Create like
      await base44.entities.Like.create({
        from_user_id: myProfile.id,
        to_user_id: profileId,
        source: 'discovery',
        status: 'active'
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
    setSeenIds(prev => new Set([...prev, currentProfile.id]));
    const newCount = incrementDailyLikeCount();
    setDailyLikeCount(newCount);
    likeMutation.mutate(currentProfile.id);
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