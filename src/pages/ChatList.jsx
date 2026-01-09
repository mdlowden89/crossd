import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Sparkles, BadgeCheck, Search, Loader2
} from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdInput } from '@/components/ui/crossd-input';
import { format, formatDistanceToNow } from 'date-fns';

export default function ChatList() {
  const [myProfile, setMyProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  // Fetch matches
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const asUser1 = await base44.entities.Match.filter({ user_1_id: myProfile.id, blocked: false });
      const asUser2 = await base44.entities.Match.filter({ user_2_id: myProfile.id, blocked: false });
      return [...asUser1, ...asUser2];
    },
    enabled: !!myProfile
  });

  // Fetch profiles for matches
  const { data: matchProfiles = {} } = useQuery({
    queryKey: ['match-profiles', matches],
    queryFn: async () => {
      const profileIds = matches.map(m => 
        m.user_1_id === myProfile.id ? m.user_2_id : m.user_1_id
      );
      const profiles = {};
      for (const id of profileIds) {
        const result = await base44.entities.Profile.filter({ id });
        if (result.length > 0) profiles[id] = result[0];
      }
      return profiles;
    },
    enabled: matches.length > 0
  });

  // Fetch last messages
  const { data: lastMessages = {} } = useQuery({
    queryKey: ['last-messages', matches],
    queryFn: async () => {
      const messages = {};
      for (const match of matches) {
        const result = await base44.entities.Message.filter({ match_id: match.id }, '-created_date', 1);
        if (result.length > 0) messages[match.id] = result[0];
      }
      return messages;
    },
    enabled: matches.length > 0
  });

  // Filter matches by search
  const filteredMatches = matches.filter(match => {
    const otherId = match.user_1_id === myProfile?.id ? match.user_2_id : match.user_1_id;
    const profile = matchProfiles[otherId];
    if (!profile) return false;
    if (!searchQuery) return true;
    return profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort by last message
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const aTime = lastMessages[a.id]?.created_date || a.created_date;
    const bTime = lastMessages[b.id]?.created_date || b.created_date;
    return new Date(bTime) - new Date(aTime);
  });

  // Separate new matches (no messages yet)
  const newMatches = sortedMatches.filter(m => !lastMessages[m.id] || lastMessages[m.id]?.type === 'system');
  const activeChats = sortedMatches.filter(m => lastMessages[m.id] && lastMessages[m.id]?.type !== 'system');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
        <CrossdInput
          placeholder="Search matches..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto bg-[#E70F72]/10 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-[#E70F72]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Matches Yet</h2>
          <p className="text-white/65">
            Start swiping to find your first match!
          </p>
        </motion.div>
      ) : (
        <>
          {/* New Matches */}
          {newMatches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-white/65 text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E70F72]" />
                New Matches
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                {newMatches.map((match, index) => {
                  const otherId = match.user_1_id === myProfile?.id ? match.user_2_id : match.user_1_id;
                  const profile = matchProfiles[otherId];
                  if (!profile) return null;

                  return (
                    <motion.button
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => window.location.href = createPageUrl('Chat') + `?matchId=${match.id}`}
                      className="flex-shrink-0 text-center"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E70F72]">
                          {profile.photos?.[0]?.url ? (
                            <img 
                              src={profile.photos[0].url} 
                              alt={profile.display_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1a1a1a]" />
                          )}
                        </div>
                        {match.source === 'crossing' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#E70F72]" />
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm mt-2 max-w-[80px] truncate">
                        {profile.display_name}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Chats */}
          {activeChats.length > 0 && (
            <div>
              <h2 className="text-white/65 text-sm font-medium mb-3">Messages</h2>
              <div className="space-y-2">
                {activeChats.map((match, index) => {
                  const otherId = match.user_1_id === myProfile?.id ? match.user_2_id : match.user_1_id;
                  const profile = matchProfiles[otherId];
                  const lastMessage = lastMessages[match.id];
                  const unreadCount = match.user_1_id === myProfile?.id 
                    ? match.unread_count_user_1 
                    : match.unread_count_user_2;

                  if (!profile) return null;

                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CrossdCard
                        className="cursor-pointer hover:border-[#E70F72]/40"
                        onClick={() => window.location.href = createPageUrl('Chat') + `?matchId=${match.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full overflow-hidden">
                              {profile.photos?.[0]?.url ? (
                                <img 
                                  src={profile.photos[0].url} 
                                  alt={profile.display_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#1a1a1a]" />
                              )}
                            </div>
                            {unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E70F72] rounded-full flex items-center justify-center">
                                <span className="text-black text-xs font-bold">{unreadCount}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">{profile.display_name}</h3>
                              {profile.verification_status === 'verified' && (
                                <BadgeCheck className="w-4 h-4 text-[#E70F72]" />
                              )}
                            </div>
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-white' : 'text-white/50'}`}>
                              {lastMessage?.type === 'voice' 
                                ? '🎤 Voice message'
                                : lastMessage?.text || 'Start chatting!'
                              }
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-white/40 text-xs">
                              {lastMessage?.created_date 
                                ? formatDistanceToNow(new Date(lastMessage.created_date), { addSuffix: false })
                                : ''
                              }
                            </p>
                          </div>
                        </div>
                      </CrossdCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}