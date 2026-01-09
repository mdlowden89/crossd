import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Share2, MapPin, Heart, 
  MessageCircle, Sparkles, Users, TrendingUp, Calendar
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function Recaps() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  // Get data for recap
  const lastMonth = subMonths(new Date(), 1);
  const monthStart = startOfMonth(lastMonth);
  const monthEnd = endOfMonth(lastMonth);

  const { data: moments = [] } = useQuery({
    queryKey: ['recap-moments', myProfile?.id],
    queryFn: () => base44.entities.Moment.filter({ user_id: myProfile?.id }),
    enabled: !!myProfile
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['recap-matches', myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const asUser1 = await base44.entities.Match.filter({ user_1_id: myProfile.id });
      const asUser2 = await base44.entities.Match.filter({ user_2_id: myProfile.id });
      return [...asUser1, ...asUser2];
    },
    enabled: !!myProfile
  });

  const { data: crossings = [] } = useQuery({
    queryKey: ['recap-crossings', myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const asA = await base44.entities.Crossing.filter({ user_a_id: myProfile.id });
      const asB = await base44.entities.Crossing.filter({ user_b_id: myProfile.id });
      return [...asA, ...asB];
    },
    enabled: !!myProfile
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['recap-messages', myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      return base44.entities.Message.filter({ sender_id: myProfile.id });
    },
    enabled: !!myProfile
  });

  // Calculate stats
  const stats = {
    totalMoments: moments.length,
    totalMatches: matches.length,
    totalCrossings: crossings.length,
    messagesSent: messages.length,
    uniquePlaces: [...new Set(moments.map(m => m.tile_key))].length,
    topLocation: moments.reduce((acc, m) => {
      acc[m.venue_name || 'Unknown'] = (acc[m.venue_name || 'Unknown'] || 0) + 1;
      return acc;
    }, {})
  };

  const topLocationName = Object.entries(stats.topLocation)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

  const slides = [
    // Slide 1: Intro
    {
      gradient: 'from-[#E70F72] to-purple-600',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Sparkles className="w-20 h-20 text-white mx-auto mb-6" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Your Crossd Recap</h1>
          <p className="text-white/80 text-xl">{format(lastMonth, 'MMMM yyyy')}</p>
        </div>
      )
    },
    // Slide 2: Moments
    {
      gradient: 'from-purple-600 to-blue-600',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="w-16 h-16 text-white mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-2">You logged</p>
            <p className="text-7xl font-bold text-white mb-2">{stats.totalMoments}</p>
            <p className="text-2xl text-white/80">moments</p>
          </motion.div>
        </div>
      )
    },
    // Slide 3: Top Location
    {
      gradient: 'from-blue-600 to-cyan-500',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/80 text-lg mb-4">Your favorite spot was</p>
            <p className="text-4xl font-bold text-white mb-4">"{topLocationName}"</p>
            <p className="text-white/80">
              You visited {stats.uniquePlaces} unique places
            </p>
          </motion.div>
        </div>
      )
    },
    // Slide 4: Crossings
    {
      gradient: 'from-cyan-500 to-[#E70F72]',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Users className="w-16 h-16 text-white mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-2">You crossed paths with</p>
            <p className="text-7xl font-bold text-white mb-2">{stats.totalCrossings}</p>
            <p className="text-2xl text-white/80">people</p>
          </motion.div>
        </div>
      )
    },
    // Slide 5: Matches
    {
      gradient: 'from-[#E70F72] to-orange-500',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Heart className="w-16 h-16 text-white mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-2">You matched with</p>
            <p className="text-7xl font-bold text-white mb-2">{stats.totalMatches}</p>
            <p className="text-2xl text-white/80">people</p>
          </motion.div>
        </div>
      )
    },
    // Slide 6: Messages
    {
      gradient: 'from-orange-500 to-pink-500',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MessageCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-2">You sent</p>
            <p className="text-7xl font-bold text-white mb-2">{stats.messagesSent}</p>
            <p className="text-2xl text-white/80">messages</p>
          </motion.div>
        </div>
      )
    },
    // Slide 7: Summary
    {
      gradient: 'from-pink-500 to-[#E70F72]',
      content: (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Keep the spark alive!</h2>
            
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-white/10 rounded-xl p-4">
                <MapPin className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalMoments}</p>
                <p className="text-white/70 text-sm">Moments</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <Users className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalCrossings}</p>
                <p className="text-white/70 text-sm">Crossings</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <Heart className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalMatches}</p>
                <p className="text-white/70 text-sm">Matches</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <MessageCircle className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.messagesSent}</p>
                <p className="text-white/70 text-sm">Messages</p>
              </div>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slides[currentSlide].gradient} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <div className="flex gap-1">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-1 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        
        <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full max-w-md"
        >
          {slides[currentSlide].content}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            currentSlide === 0 ? 'bg-white/10' : 'bg-white/20'
          }`}
        >
          <ChevronLeft className={`w-6 h-6 ${currentSlide === 0 ? 'text-white/30' : 'text-white'}`} />
        </button>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            currentSlide === slides.length - 1 ? 'bg-white/10' : 'bg-white'
          }`}
        >
          <ChevronRight className={`w-6 h-6 ${
            currentSlide === slides.length - 1 ? 'text-white/30' : 'text-black'
          }`} />
        </button>
      </div>
    </div>
  );
}