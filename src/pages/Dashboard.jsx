import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, CheckCircle2, Circle, Flame, Clock, 
  Star, Zap, TrendingUp, Map, Award, Gift, Activity, ShieldCheck
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import CrossdProgressRing from '@/components/ui/crossd-progress-ring';
import ActivityMap from '@/components/dashboard/ActivityMap';
import PersonalityCard from '@/components/mbti/PersonalityCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

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

  // Calculate spark energy with detailed breakdown
  const calculateSparkEnergy = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Mock data (would come from backend in production)
    const mockData = {
      likesSentD1: 34,
      sessionsD1: 4,
      resonanceValue: 0.78,
      isGlowActive: false,
      reportsW7: 0,
      blocksW7: 0,
      spamScore: 0,
    };
    
    // Component A: Activity (30%)
    const momentsW7 = moments.filter(m => new Date(m.created_date) > weekAgo).length;
    const cappedMoments = Math.min(momentsW7, 5);
    const cappedLikes = Math.min(mockData.likesSentD1, 50);
    const cappedSessions = Math.min(mockData.sessionsD1, 10);
    const activityScore = ((cappedMoments / 5) + (cappedLikes / 50) + (cappedSessions / 10)) / 3 * 100;
    
    // Component B: Streak (15%)
    const streakDays = calculateStreak();
    const streakScore = (Math.min(streakDays, 7) / 7) * 100;
    
    // Component C: Profile Quality (20%)
    const { percentage: profileStrength } = calculateProfileStrength();
    const qualityScore = Math.min(100, profileStrength + (profile.verification_status === 'verified' ? 10 : 0));
    
    // Component D: Resonance (20%)
    const resonanceScore = mockData.resonanceValue * 100;
    
    // Component E: Freshness (10%)
    const hoursSinceActive = (now.getTime() - new Date(profile.last_active_at || now).getTime()) / (1000 * 60 * 60);
    let freshnessScore = 10;
    if (hoursSinceActive <= 24) freshnessScore = 100;
    else if (hoursSinceActive <= 72) freshnessScore = 70;
    else if (hoursSinceActive <= 168) freshnessScore = 40;
    
    // Component F: Boosts
    const boostValue = (mockData.isGlowActive ? 20 : 0) + (profile.crossd_plus ? 5 : 0);
    
    // Component G: Penalties
    const penaltyValue = Math.min(25, mockData.reportsW7 * 5 + mockData.blocksW7 * 3 + mockData.spamScore);
    
    // Final Score
    const baseScore = 
      0.30 * activityScore +
      0.15 * streakScore +
      0.20 * qualityScore +
      0.20 * resonanceScore +
      0.10 * freshnessScore;
    
    const finalScore = Math.round(Math.max(0, Math.min(100, baseScore + boostValue - penaltyValue)));
    
    return {
      score: finalScore,
      components: {
        activity: Math.round(activityScore),
        streak: Math.round(streakScore),
        profileQuality: Math.round(qualityScore),
        resonance: Math.round(resonanceScore),
        freshness: Math.round(freshnessScore),
        boosts: boostValue,
        penalties: penaltyValue
      }
    };
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

  // MBTI personality types with emojis and descriptions
  const mbtiTypes = {
    'INTJ': { emoji: '✒️', name: 'Architect', description: 'Strategic masterminds who love planning and achieving goals.', matches: ['ENTP', 'ENFP', 'ENTJ'] },
    'INTP': { emoji: '🧪', name: 'Logician', description: 'Innovative inventive with an unquenchable thirst for knowledge.', matches: ['ENTJ', 'ENTP', 'INFJ'] },
    'ENTJ': { emoji: '👑', name: 'Commander', description: 'Bold and imaginative leaders who find a way or make one.', matches: ['INTP', 'INTJ', 'ENFP'] },
    'ENTP': { emoji: '🗣️', name: 'Debater', description: 'Smart and curious thinkers who love intellectual challenges.', matches: ['INFJ', 'INTJ', 'ENFJ'] },
    'INFJ': { emoji: '🤝', name: 'Advocate', description: 'Quiet and mystical, yet inspiring and idealistic.', matches: ['ENTP', 'ENFP', 'INFP'] },
    'INFP': { emoji: '🧘', name: 'Mediator', description: 'Poetic, kind souls always searching for meaning.', matches: ['ENFJ', 'ENTJ', 'INFJ'] },
    'ENFJ': { emoji: '🦸', name: 'Protagonist', description: 'Charismatic and inspiring leaders who captivate audiences.', matches: ['INFP', 'ENFP', 'INFJ'] },
    'ENFP': { emoji: '🎉', name: 'Campaigner', description: 'Enthusiastic, creative free spirits with vibrant energy.', matches: ['INTJ', 'INFJ', 'ENFJ'] },
    'ISTJ': { emoji: '📊', name: 'Logistician', description: 'Practical and fact-minded with unwavering reliability.', matches: ['ESTP', 'ESFP', 'ESTJ'] },
    'ISFJ': { emoji: '🛡️', name: 'Defender', description: 'Dedicated protectors ready to defend loved ones.', matches: ['ESFP', 'ESTP', 'ISFP'] },
    'ESTJ': { emoji: '👔', name: 'Executive', description: 'Excellent administrators skilled in managing things and people.', matches: ['ISTP', 'ISTJ', 'ESFJ'] },
    'ESFJ': { emoji: '🤗', name: 'Consul', description: 'Caring and social, always eager to help others.', matches: ['ISFP', 'ISTP', 'ESTJ'] },
    'ISTP': { emoji: '🔧', name: 'Virtuoso', description: 'Bold and practical experimenters mastering tools.', matches: ['ESTJ', 'ESFJ', 'ESTP'] },
    'ISFP': { emoji: '🎨', name: 'Adventurer', description: 'Flexible and charming artists ready to explore.', matches: ['ESFJ', 'ENFJ', 'ESTJ'] },
    'ESTP': { emoji: '🚀', name: 'Entrepreneur', description: 'Smart, energetic risk-takers who live on the edge.', matches: ['ISFJ', 'ISTJ', 'ESFP'] },
    'ESFP': { emoji: '✨', name: 'Entertainer', description: 'Spontaneous entertainers who love life and people.', matches: ['ISTJ', 'ISFJ', 'ESTP'] }
  };

  const getMBTIInfo = (type) => {
    return mbtiTypes[type] || { emoji: '✨', name: 'Unknown', description: 'Discover your personality type!', matches: [] };
  };

  // Premium MBTI insights (only for Crossd+ users)
  const premiumInsights = {
    'INTP': {
      strengths: ['Analytical', 'Original', 'Open-minded', 'Objective'],
      weaknesses: ['Private', 'Indecisive', 'Absent-minded', 'Condescending'],
      relationshipApproach: "In relationships, Logicians value intellectual connection above all. They show affection through shared ideas and problem-solving rather than overt emotional displays, and they need a partner who respects their independence and thirst for solitude.",
      famousExamples: ['Albert Einstein', 'Bill Gates', 'Isaac Newton', 'Stanley Kubrick']
    },
    'INTJ': {
      strengths: ['Strategic', 'Independent', 'Determined', 'Insightful'],
      weaknesses: ['Arrogant', 'Dismissive', 'Overly critical', 'Emotionally distant'],
      relationshipApproach: "Architects approach relationships with the same strategic mindset they apply to everything else. They value partners who can match their intellect and ambition while respecting their need for independence.",
      famousExamples: ['Elon Musk', 'Friedrich Nietzsche', 'Michelle Obama', 'Christopher Nolan']
    },
    'ENTJ': {
      strengths: ['Efficient', 'Confident', 'Strategic', 'Charismatic'],
      weaknesses: ['Stubborn', 'Intolerant', 'Impatient', 'Ruthless'],
      relationshipApproach: "Commanders seek partners who can keep up with their ambitious nature. They value efficiency and directness in relationships and show love through acts of service and achieving shared goals.",
      famousExamples: ['Steve Jobs', 'Margaret Thatcher', 'Napoleon Bonaparte', 'Gordon Ramsay']
    },
    'ENTP': {
      strengths: ['Quick-witted', 'Charismatic', 'Energetic', 'Knowledgeable'],
      weaknesses: ['Argumentative', 'Insensitive', 'Unfocused', 'Intolerant'],
      relationshipApproach: "Debaters thrive on intellectual sparring and mental stimulation in relationships. They need partners who can engage in debates without taking things personally and who appreciate their playful nature.",
      famousExamples: ['Mark Twain', 'Adam Savage', 'Sarah Silverman', 'Tyrion Lannister']
    },
    'INFJ': {
      strengths: ['Creative', 'Insightful', 'Principled', 'Passionate'],
      weaknesses: ['Perfectionist', 'Overly sensitive', 'Private', 'Burnout-prone'],
      relationshipApproach: "Advocates seek deep, meaningful connections and are intensely devoted partners. They need someone who can appreciate their idealism and provide emotional reciprocity in the relationship.",
      famousExamples: ['Martin Luther King Jr.', 'Nelson Mandela', 'Lady Gaga', 'Plato']
    },
    'INFP': {
      strengths: ['Empathetic', 'Creative', 'Idealistic', 'Open-minded'],
      weaknesses: ['Unrealistic', 'Self-critical', 'Impractical', 'Emotionally vulnerable'],
      relationshipApproach: "Mediators are hopeless romantics who seek authentic, soulful connections. They express love through creative gestures and need partners who can appreciate their emotional depth and idealistic nature.",
      famousExamples: ['William Shakespeare', 'Vincent van Gogh', 'Audrey Hepburn', 'Johnny Depp']
    },
    'ENFJ': {
      strengths: ['Charismatic', 'Altruistic', 'Natural leader', 'Reliable'],
      weaknesses: ['Overly idealistic', 'Too selfless', 'Sensitive to criticism', 'Fluctuating self-esteem'],
      relationshipApproach: "Protagonists are warm and affirming partners who prioritize their loved one's growth. They show love through encouragement and support, and need partners who can reciprocate their emotional investment.",
      famousExamples: ['Barack Obama', 'Oprah Winfrey', 'Maya Angelou', 'Jennifer Lawrence']
    },
    'ENFP': {
      strengths: ['Enthusiastic', 'Creative', 'Sociable', 'Free-spirited'],
      weaknesses: ['Unfocused', 'Overthinking', 'Overly emotional', 'Difficulty with routine'],
      relationshipApproach: "Campaigners bring energy and warmth to relationships, constantly seeking new experiences with their partners. They need someone who can match their enthusiasm while providing gentle grounding.",
      famousExamples: ['Robin Williams', 'Ellen DeGeneres', 'Quentin Tarantino', 'Walt Disney']
    },
    'ISTJ': {
      strengths: ['Reliable', 'Practical', 'Responsible', 'Detail-oriented'],
      weaknesses: ['Stubborn', 'Insensitive', 'By-the-book', 'Judgmental'],
      relationshipApproach: "Logisticians show love through loyalty and dependability. They value tradition and stability in relationships and express affection through practical acts of service rather than grand romantic gestures.",
      famousExamples: ['George Washington', 'Warren Buffett', 'Angela Merkel', 'Denzel Washington']
    },
    'ISFJ': {
      strengths: ['Supportive', 'Reliable', 'Patient', 'Practical'],
      weaknesses: ['Overly humble', 'Shy', 'Too altruistic', 'Reluctant to change'],
      relationshipApproach: "Defenders are devoted and attentive partners who remember small details that matter. They need partners who appreciate their selfless nature and can encourage them to prioritize their own needs.",
      famousExamples: ['Mother Teresa', 'Queen Elizabeth II', 'Kate Middleton', 'Beyoncé']
    },
    'ESTJ': {
      strengths: ['Dedicated', 'Strong-willed', 'Direct', 'Loyal'],
      weaknesses: ['Inflexible', 'Uncomfortable with emotion', 'Judgmental', 'Difficult to relax'],
      relationshipApproach: "Executives approach relationships with the same dedication they bring to everything else. They value honesty and commitment, and show love through creating stability and security for their partners.",
      famousExamples: ['John D. Rockefeller', 'Sonia Sotomayor', 'Lyndon B. Johnson', 'Judge Judy']
    },
    'ESFJ': {
      strengths: ['Strong practical skills', 'Loyal', 'Warm', 'Sensitive'],
      weaknesses: ['Needy', 'Inflexible', 'Reluctant to change', 'Too selfless'],
      relationshipApproach: "Consuls are warm and nurturing partners who excel at creating harmonious relationships. They show love through caring gestures and need partners who can express appreciation and reciprocate their affection.",
      famousExamples: ['Taylor Swift', 'Danny Glover', 'Jennifer Garner', 'Terry Bradshaw']
    },
    'ISTP': {
      strengths: ['Practical', 'Creative', 'Relaxed', 'Spontaneous'],
      weaknesses: ['Stubborn', 'Insensitive', 'Private', 'Easily bored'],
      relationshipApproach: "Virtuosos need space and freedom in relationships. They show affection through actions rather than words and need partners who can respect their independence while sharing in hands-on adventures.",
      famousExamples: ['Clint Eastwood', 'Bear Grylls', 'Tom Cruise', 'Olivia Wilde']
    },
    'ISFP': {
      strengths: ['Charming', 'Sensitive', 'Imaginative', 'Passionate'],
      weaknesses: ['Fiercely independent', 'Unpredictable', 'Easily stressed', 'Overly competitive'],
      relationshipApproach: "Adventurers are spontaneous and creative partners who live in the moment. They express love through thoughtful gestures and experiences, and need partners who appreciate their free-spirited nature.",
      famousExamples: ['Michael Jackson', 'Britney Spears', 'Lana Del Rey', 'Kevin Costner']
    },
    'ESTP': {
      strengths: ['Bold', 'Rational', 'Perceptive', 'Direct'],
      weaknesses: ['Impatient', 'Risk-prone', 'Unstructured', 'Insensitive'],
      relationshipApproach: "Entrepreneurs bring excitement and energy to relationships. They live for action and adventure, and need partners who can keep up with their fast-paced lifestyle and appreciate their spontaneity.",
      famousExamples: ['Madonna', 'Ernest Hemingway', 'Eddie Murphy', 'Bruce Willis']
    },
    'ESFP': {
      strengths: ['Bold', 'Original', 'Practical', 'Excellent people skills'],
      weaknesses: ['Sensitive', 'Conflict-averse', 'Easily bored', 'Poor long-term planner'],
      relationshipApproach: "Entertainers are fun-loving and affectionate partners who excel at making others feel special. They show love through creating joyful experiences and need partners who can appreciate their vibrant energy.",
      famousExamples: ['Marilyn Monroe', 'Jamie Oliver', 'Adele', 'Elvis Presley']
    }
  };

  const getInsights = (type) => {
    return premiumInsights[type] || null;
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/65">Loading your dashboard...</div>
      </div>
    );
  }

  const { percentage: profileStrength, items: profileItems } = calculateProfileStrength();
  const energyData = calculateSparkEnergy();
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
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-[#E70F72]/30"
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
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-[#E70F72]/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-[#E70F72]">Spark Energy Meter</h2>
          </div>
          <p className="text-white/65 mb-6">
            Your weekly engagement fuels your spark. Keep it high for better visibility!
          </p>
          
          {/* Energy Bar */}
          <div className="mb-8">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${energyData.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[#E70F72] rounded-full"
                      />
                    </div>
                    <div className="text-center text-[#E70F72] font-bold mt-2">
                      {energyData.score}%
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 w-80 bg-[#0B0B0B] border-white/10">
                  <h4 className="font-semibold mb-3 text-white">Energy Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Activity className="w-4 h-4 text-[#E70F72] flex-shrink-0" />
                      <span className="flex-1 text-white/90">Activity</span>
                      <Progress value={energyData.components.activity} className="w-24 h-2 bg-white/10" />
                      <span className="font-semibold w-10 text-right text-white">{energyData.components.activity}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Flame className="w-4 h-4 text-[#E70F72] flex-shrink-0" />
                      <span className="flex-1 text-white/90">Streak</span>
                      <Progress value={energyData.components.streak} className="w-24 h-2 bg-white/10" />
                      <span className="font-semibold w-10 text-right text-white">{energyData.components.streak}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <ShieldCheck className="w-4 h-4 text-[#E70F72] flex-shrink-0" />
                      <span className="flex-1 text-white/90">Profile Quality</span>
                      <Progress value={energyData.components.profileQuality} className="w-24 h-2 bg-white/10" />
                      <span className="font-semibold w-10 text-right text-white">{energyData.components.profileQuality}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Sparkles className="w-4 h-4 text-[#E70F72] flex-shrink-0" />
                      <span className="flex-1 text-white/90">Resonance</span>
                      <Progress value={energyData.components.resonance} className="w-24 h-2 bg-white/10" />
                      <span className="font-semibold w-10 text-right text-white">{energyData.components.resonance}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-[#E70F72] flex-shrink-0" />
                      <span className="flex-1 text-white/90">Freshness</span>
                      <Progress value={energyData.components.freshness} className="w-24 h-2 bg-white/10" />
                      <span className="font-semibold w-10 text-right text-white">{energyData.components.freshness}%</span>
                    </div>
                    {energyData.components.boosts > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="flex-1 text-white/90">Boosts</span>
                        <span className="font-semibold text-green-400">+{energyData.components.boosts}</span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/40 rounded-2xl p-4 text-center border border-[#E70F72]/20">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{dayStreak}</div>
              <div className="text-white/50 text-sm">Day Streak</div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-4 text-center border border-[#E70F72]/20">
              <Sparkles className="w-6 h-6 text-[#E70F72] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{sparksThisWeek}</div>
              <div className="text-white/50 text-sm">Sparks this week</div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-4 text-center border border-[#E70F72]/20">
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
        >
          <PersonalityCard profile={profile} />
        </motion.div>

        {/* Activity Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-[#E70F72]/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">Your Activity Map</h2>
          </div>
          <p className="text-white/65 mb-6">
            A visual journey of your logged encounters.
          </p>
          
          <ActivityMap moments={moments} profile={profile} />
        </motion.div>

        {/* Active Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-[#E70F72]/30"
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
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-[#E70F72]/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-2xl font-bold text-white">À La Carte Boosters</h2>
          </div>
          <p className="text-white/65 mb-6">
            Enhance your experience with powerful one-time purchases.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[#E70F72]/20">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-white font-semibold">Glow Mode</div>
                  <div className="text-white/50 text-sm">24h visibility boost</div>
                </div>
              </div>
              <CrossdButton size="sm" variant="secondary">Get</CrossdButton>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[#E70F72]/20">
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