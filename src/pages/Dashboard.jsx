import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, CheckCircle2, Circle, Flame, Clock, 
  Star, Zap, TrendingUp, Map, Award, Gift
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import CrossdProgressRing from '@/components/ui/crossd-progress-ring';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: moments = [] } = useQuery({
    queryKey: ['my-moments'],
    queryFn: async () => {
      if (!profile) return [];
      return await base44.entities.Moment.filter({ user_id: profile.id }, '-created_date', 100);
    },
    enabled: !!profile
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['my-matches'],
    queryFn: async () => {
      if (!profile) return [];
      const allMatches = await base44.entities.Match.list();
      return allMatches.filter(m => 
        m.user_1_id === profile.id || m.user_2_id === profile.id
      );
    },
    enabled: !!profile
  });

  // Calculate profile strength
  const calculateProfileStrength = () => {
    if (!profile) return { percentage: 0, items: [] };
    
    const items = [
      { text: 'Upload at least 3 photos', completed: profile.photos?.length >= 3 },
      { text: 'Answer at least 2 prompts', completed: profile.prompts?.length >= 2 },
      { text: 'Select 5+ vibe tags', completed: profile.vibe_tags?.length >= 5 },
      { text: 'Write a bio', completed: !!profile.bio },
      { text: 'Set your dating intentions', completed: !!profile.interested_in },
      { text: 'Verify your profile', completed: profile.verification_status === 'verified' },
      { text: 'Set your home location', completed: !!profile.city }
    ];
    
    const completed = items.filter(i => i.completed).length;
    const percentage = Math.round((completed / items.length) * 100);
    
    return { percentage, items };
  };

  // Calculate spark energy (based on weekly activity)
  const calculateSparkEnergy = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMoments = moments.filter(m => new Date(m.created_date) > weekAgo).length;
    const recentMatches = matches.filter(m => new Date(m.created_date) > weekAgo).length;
    
    // Simple energy calculation: moments + matches * 5, capped at 100
    const energy = Math.min(100, (recentMoments * 2) + (recentMatches * 10));
    
    return Math.round(energy);
  };

  // Calculate day streak
  const calculateStreak = () => {
    if (moments.length === 0) return 0;
    
    const sortedMoments = [...moments].sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const moment of sortedMoments) {
      const momentDate = new Date(moment.created_date);
      momentDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - momentDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };

  // Calculate expiring moments (moments from over a week ago)
  const calculateExpiringMoments = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return moments.filter(m => new Date(m.created_date) < weekAgo).length;
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/65">Loading your dashboard...</div>
      </div>
    );
  }

  const { percentage: profileStrength, items: profileItems } = calculateProfileStrength();
  const sparkEnergy = calculateSparkEnergy();
  const dayStreak = calculateStreak();
  const expiringMoments = calculateExpiringMoments();
  const sparksThisWeek = moments.filter(m => 
    new Date(m.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, #0B0B0B 0%, #1a0510 100%)',
            boxShadow: '0 0 40px rgba(231, 15, 114, 0.15)'
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-[#E70F72] mt-1 flex-shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {profile.display_name}!
              </h1>
              <p className="text-white/65 text-lg">
                Here's what's new on Crossd. Did you see anyone interesting today?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Strength */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">Profile Strength</h2>
          </div>
          <p className="text-white/65 mb-6">
            Complete your profile to attract more compatible matches.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Checklist */}
            <div className="space-y-3">
              {profileItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/30 flex-shrink-0" />
                  )}
                  <span className={item.completed ? 'text-white/90' : 'text-white/50'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress Ring */}
            <div className="flex items-center justify-center">
              <CrossdProgressRing 
                percentage={profileStrength} 
                size={180} 
                strokeWidth={12}
                showLabel={true}
              />
            </div>
          </div>
        </motion.div>

        {/* Spark Energy Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-[#E70F72]">Spark Energy Meter</h2>
          </div>
          <p className="text-white/65 mb-6">
            Your weekly engagement fuels your spark. Keep it high for better visibility!
          </p>
          
          {/* Energy Bar */}
          <div className="relative mb-8">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sparkEnergy}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-[#E70F72] rounded-full"
              />
            </div>
            <div className="absolute -right-2 -top-1 text-[#E70F72] font-bold">
              {sparkEnergy}%
            </div>
          </div>
          
          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{dayStreak}</div>
              <div className="text-white/50 text-sm">Day Streak</div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
              <Sparkles className="w-6 h-6 text-[#E70F72] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{sparksThisWeek}</div>
              <div className="text-white/50 text-sm">Sparks this week</div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{expiringMoments}</div>
              <div className="text-white/50 text-sm">Expiring Moments</div>
            </div>
          </div>
        </motion.div>

        {/* Know Your Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">Know Your Type?</h2>
          </div>
          
          {profile.mbti_type ? (
            <>
              <p className="text-white/65 mb-4">Your personality type is:</p>
              <div className="text-6xl font-bold text-[#E70F72] mb-4">
                {profile.mbti_type}
              </div>
              <p className="text-white/65 mb-6">
                Adding your personality type leads to more compatible Spark Swipes.
              </p>
            </>
          ) : (
            <>
              <p className="text-white/65 mb-6">
                Discover your MBTI personality type and find more compatible matches.
              </p>
            </>
          )}
          
          <Link to={createPageUrl('MBTIQuiz')}>
            <CrossdButton className="w-full" size="lg">
              <Sparkles className="w-5 h-5" />
              {profile.mbti_type ? 'Retake Quiz' : 'Take Quiz'}
            </CrossdButton>
          </Link>
        </motion.div>

        {/* Activity Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">Your Activity Map</h2>
          </div>
          <p className="text-white/65 mb-6">
            A visual journey of your logged encounters.
          </p>
          
          <div className="aspect-video bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden">
            {moments.length > 0 ? (
              <div className="text-center p-8">
                <Map className="w-12 h-12 text-[#E70F72] mx-auto mb-4" />
                <p className="text-white/65">
                  You've logged {moments.length} moments
                </p>
                <Link to={createPageUrl('Trail')}>
                  <CrossdButton variant="ghost" className="mt-4">
                    View Your Trail
                  </CrossdButton>
                </Link>
              </div>
            ) : (
              <div className="text-center p-8">
                <Map className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/50">Start logging moments to see your journey</p>
                <Link to={createPageUrl('Moments')}>
                  <CrossdButton variant="secondary" className="mt-4">
                    Log First Moment
                  </CrossdButton>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">Active Challenge</h2>
          </div>
          <p className="text-white/65 mb-6">
            Moment Marathon: Log a Moment 7 days in a row
          </p>
          
          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/30 rounded-full transition-all duration-500"
                style={{ width: `${(dayStreak / 7) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-white/50 text-sm mb-6">{dayStreak} / 7 days logged</p>
          
          <CrossdButton variant="secondary" className="w-full">
            View All Challenges
          </CrossdButton>
        </motion.div>

        {/* Crossd+ Upsell */}
        {!profile.crossd_plus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #E70F72 0%, #000000 100%)'
            }}
          >
            <Star className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">Unlock Crossd+</h2>
            <p className="text-white/90 text-lg mb-6 max-w-md mx-auto">
              Supercharge your experience with unlimited likes, see who likes you, 
              and more exclusive perks!
            </p>
            <Link to={createPageUrl('CrossdPlus')}>
              <CrossdButton 
                className="bg-white text-[#E70F72] hover:bg-white/90"
                size="lg"
              >
                Explore Premium Features
              </CrossdButton>
            </Link>
          </motion.div>
        )}

        {/* À La Carte Boosters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">À La Carte Boosters</h2>
          </div>
          <p className="text-white/65 mb-6">
            Enhance your experience with powerful one-time purchases.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-white font-semibold">Glow Mode</div>
                  <div className="text-white/50 text-sm">24h visibility boost</div>
                </div>
              </div>
              <CrossdButton size="sm" variant="secondary">Get</CrossdButton>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#E70F72]" />
                <div>
                  <div className="text-white font-semibold">FateSync Pack</div>
                  <div className="text-white/50 text-sm">5 priority matches</div>
                </div>
              </div>
              <CrossdButton size="sm" variant="secondary">Get</CrossdButton>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}