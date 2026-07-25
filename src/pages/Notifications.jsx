import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Heart, MessageCircle, Sparkles, MapPin,
  BadgeCheck, Bell, Loader2, Check, Eye, Lock
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  new_crossing: Sparkles,
  seen_again: MapPin,
  new_match: Heart,
  new_message: MessageCircle,
  new_like: Heart,
  verification_approved: BadgeCheck,
  verification_rejected: BadgeCheck,
  glow_ended: Sparkles,
  system: Bell
};

const notificationColors = {
  new_crossing: 'bg-[#E70F72]/20 text-[#E70F72]',
  seen_again: 'bg-purple-500/20 text-purple-400',
  new_match: 'bg-[#E70F72]/20 text-[#E70F72]',
  new_message: 'bg-blue-500/20 text-blue-400',
  new_like: 'bg-pink-500/20 text-pink-400',
  verification_approved: 'bg-green-500/20 text-green-400',
  verification_rejected: 'bg-red-500/20 text-red-400',
  glow_ended: 'bg-yellow-500/20 text-yellow-400',
  system: 'bg-white/10 text-white/60'
};

export default function Notifications() {
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

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', myProfile?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: myProfile.id }, '-created_date', 50),
    enabled: !!myProfile
  });

  const likeRevealActive = myProfile?.like_reveal_active_until && new Date(myProfile.like_reveal_active_until) > new Date();

  // Fetch likes received when Like Reveal is active
  const { data: likesReceived = [] } = useQuery({
    queryKey: ['likes-received', myProfile?.id],
    queryFn: async () => {
      const likes = await base44.entities.Like.filter({ to_user_id: myProfile.id, status: 'active' }, '-created_date', 3);
      // Fetch profile for each liker
      const profiles = await Promise.all(
        likes.map(l => base44.entities.Profile.filter({ id: l.from_user_id }).then(r => r[0]))
      );
      return likes.map((l, i) => ({ like: l, profile: profiles[i] })).filter(x => x.profile);
    },
    enabled: !!myProfile && likeRevealActive
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.update(notificationId, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-notifications']);
    }
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-notifications']);
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    // Navigate based on type
    const data = notification.data || {};
    switch (notification.type) {
      case 'new_match':
      case 'new_message':
        if (data.match_id) {
          window.location.href = createPageUrl('Chat') + `?matchId=${data.match_id}`;
        }
        break;
      case 'new_crossing':
      case 'seen_again':
        window.location.href = createPageUrl('Trail');
        break;
      case 'new_like':
        window.location.href = createPageUrl('Explore');
        break;
      case 'verification_approved':
      case 'verification_rejected':
        window.location.href = createPageUrl('Verification');
        break;
      case 'glow_ended':
        window.location.href = createPageUrl('CrossdPlus');
        break;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>
        
        {unreadCount > 0 && (
          <CrossdButton
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            <Check className="w-4 h-4 mr-1" />
            Mark All Read
          </CrossdButton>
        )}
      </div>

      {/* Like Reveal Section */}
      {likeRevealActive && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-purple-400" />
            <h2 className="text-white font-bold text-sm">👀 Like Reveal — Active</h2>
            <span className="text-white/40 text-xs ml-auto">Up to 3 people</span>
          </div>
          {likesReceived.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <Lock className="w-6 h-6 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">No likes yet — check back soon!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {likesReceived.map(({ like, profile }) => (
                <div
                  key={like.id}
                  className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3 cursor-pointer hover:border-purple-500/40 transition-colors"
                  onClick={() => { window.location.href = createPageUrl('ProfileDetail') + `?id=${profile.id}`; }}
                >
                  {profile.photos?.[0]?.url ? (
                    <img src={profile.photos[0].url} alt="" className="w-12 h-12 rounded-full object-cover border border-purple-500/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{profile.display_name}</p>
                    <p className="text-white/50 text-xs">{profile.city || 'Liked your profile'}</p>
                    {like.liked_content?.comment && (
                      <p className="text-purple-300 text-xs mt-0.5 italic">💌 "{like.liked_content.comment}"</p>
                    )}
                  </div>
                  <Heart className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Notifications</h2>
          <p className="text-white/65">
            You're all caught up! Check back later.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || notificationColors.system;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CrossdCard
                    className={`cursor-pointer hover:border-[#E70F72]/40 ${!notification.read ? 'border-[#E70F72]/30' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass.split(' ')[0]}`}>
                        <Icon className={`w-5 h-5 ${colorClass.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${notification.read ? 'text-white/80' : 'text-white'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#E70F72] rounded-full" />
                          )}
                        </div>
                        <p className="text-white/50 text-sm line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CrossdCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}