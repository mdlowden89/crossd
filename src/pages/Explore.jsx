import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Loader2, RefreshCw, Heart, MapPin } from 'lucide-react';
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
  const queryClient = useQueryClient();

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
    if (currentProfile) {
      setSeenIds(prev => new Set([...prev, currentProfile.id]));
      likeMutation.mutate(currentProfile.id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePass = () => {
    if (currentProfile) {
      setSeenIds(prev => new Set([...prev, currentProfile.id]));
      setCurrentIndex(prev => prev + 1);
    }
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
    <div className="min-h-screen bg-black py-4" style={{ overflowX: 'hidden' }}>
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

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentProfile ? (
          <div className="relative flex items-start justify-center px-4">
            {/* Next card — peeking on the right */}
            {profiles[currentIndex + 1] && (
              <div
                className="absolute top-0 rounded-3xl overflow-hidden pointer-events-none"
                style={{
                  width: '84vw',
                  maxWidth: '384px',
                  left: '50%',
                  transform: 'translateX(58%)',
                  filter: 'blur(6px)',
                  opacity: 0.4,
                  zIndex: 0,
                }}
              >
                <div className="bg-[#0B0B0B] rounded-3xl overflow-hidden">
                  {profiles[currentIndex + 1].photos?.[0]?.url && (
                    <img
                      src={profiles[currentIndex + 1].photos[0].url}
                      alt=""
                      className="w-full aspect-[3/4] object-cover"
                    />
                  )}
                </div>
              </div>
            )}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '384px' }}>
              <ProfileCard
                key={currentProfile.id}
                profile={currentProfile}
                myProfile={myProfile}
                myMoments={[]}
                onLike={handleLike}
                onPass={handlePass}
                onViewFull={handleViewProfile}
              />
            </div>
          </div>
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