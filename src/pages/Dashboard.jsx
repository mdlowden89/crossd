import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Sparkles, CheckCircle2, Circle, Flame, Clock,
  Star, Zap, TrendingUp, Map, Award, Gift, Activity, ShieldCheck,
  Route, ChevronRight, AlertCircle, MapPin } from
'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import CrossdProgressRing from '@/components/ui/crossd-progress-ring';
import ActivityMap from '@/components/dashboard/ActivityMap';

import PersonalityCard from '@/components/mbti/PersonalityCard';
import ChallengesSection from '@/components/dashboard/ChallengesSection';
import CityPulseCard from '@/components/dashboard/CityPulseCard';
import SparkChanceMeter from '@/components/dashboard/SparkChanceMeter';
import TopPicksCard from '@/components/dashboard/TopPicksCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const today = new Date().toISOString().slice(0, 10);

  const { data: todayPath } = useQuery({
    queryKey: ['today-path', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const paths = await base44.entities.DailyPath.filter({ user_id: user.id, date: today });
      return paths[0] || null;
    },
    enabled: !!user
  });

  const { data: moments = [] } = useQuery({
    queryKey: ['my-moments'],
    queryFn: async () => {
      if (!profile) return [];
      const realMoments = await base44.entities.Moment.filter({ user_id: profile.id }, '-created_date', 100);
      
      // If no real moments, return sample data (tagged so UI can show example states)
      if (realMoments.length === 0) {
        const baseDate = new Date(2026, 1, 9);
        return [{
            _isSample: true,
            id: 'sample-1',
            user_id: profile.id,
            venue_name: 'Covent Garden',
            venue_types: ['tourist_attraction', 'point_of_interest'],
            lat: 51.3130,
            lng: -0.1233,
            geohash: 'u10hkq',
            tile_key: 'u10hkq',
            time_bucket: '2026-02-04-10',
            created_date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Watching the street performers. Someone next to me had the most infectious laugh.',
            nearby_spark_count: 0
          },
          {
            _isSample: true,
            id: 'sample-2',
            user_id: profile.id,
            venue_name: 'The Shard',
            venue_types: ['tourist_attraction', 'point_of_interest'],
            lat: 51.5045,
            lng: -0.0865,
            geohash: 'u10j5n',
            tile_key: 'u10j5n',
            time_bucket: '2026-02-03-10',
            created_date: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'The view was incredible, and I noticed someone with a great sense of style near the window.',
            nearby_spark_count: 1
          },
          {
            _isSample: true,
            id: 'sample-3',
            user_id: profile.id,
            venue_name: 'Tower of London',
            venue_types: ['museum', 'tourist_attraction'],
            lat: 51.5055,
            lng: -0.0754,
            geohash: 'u10j5q',
            tile_key: 'u10j5q',
            time_bucket: '2026-02-02-07',
            created_date: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Fascinating history. Saw someone else who seemed just as captivated by the Crown Jewels.',
            nearby_spark_count: 2
          },
          {
            _isSample: true,
            id: 'sample-4',
            user_id: profile.id,
            venue_name: 'British Museum',
            venue_types: ['museum', 'tourist_attraction'],
            lat: 51.5194,
            lng: -0.1270,
            geohash: 'u10h9u',
            tile_key: 'u10h9u',
            time_bucket: '2026-02-01-12',
            created_date: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Lost in the Egyptian exhibit. There was a quiet intensity about someone sketching near the Rosetta Stone.',
            nearby_spark_count: 1
          },
          {
            _isSample: true,
            id: 'sample-5',
            user_id: profile.id,
            venue_name: 'Tate Modern',
            venue_types: ['art_gallery', 'museum'],
            lat: 51.5076,
            lng: -0.0994,
            geohash: 'u10j4u',
            tile_key: 'u10j4u',
            time_bucket: '2026-01-31-06',
            created_date: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'The abstract art was moving. I shared a smile with someone who was also staring at a Rothko painting.',
            nearby_spark_count: 0
          },
          {
            _isSample: true,
            id: 'sample-6',
            user_id: profile.id,
            venue_name: 'Monmouth Coffee',
            venue_types: ['cafe', 'coffee_shop'],
            lat: 51.5052,
            lng: -0.0971,
            geohash: 'u10j4y',
            tile_key: 'u10j4y',
            time_bucket: '2026-01-30-10',
            created_date: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Perfect morning spot. Reading a book while someone sketched in the corner.',
            nearby_spark_count: 2
          },
          {
            _isSample: true,
            id: 'sample-7',
            user_id: profile.id,
            venue_name: 'Hyde Park',
            venue_types: ['park'],
            lat: 51.5074,
            lng: -0.1657,
            geohash: 'u10h8e',
            tile_key: 'u10h8e',
            time_bucket: '2026-01-29-14',
            created_date: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Peaceful afternoon walk by the Serpentine. The weather was perfect.',
            nearby_spark_count: 1
          },
          {
            _isSample: true,
            id: 'sample-8',
            user_id: profile.id,
            venue_name: 'The Ivy',
            venue_types: ['restaurant'],
            lat: 51.5129,
            lng: -0.1273,
            geohash: 'u10h9v',
            tile_key: 'u10h9v',
            time_bucket: '2026-01-27-20',
            created_date: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Lovely dinner atmosphere. Candlelight and soft music.',
            nearby_spark_count: 2
          },
          {
            _isSample: true,
            id: 'sample-9',
            user_id: profile.id,
            venue_name: 'Fabric',
            venue_types: ['night_club'],
            lat: 51.5203,
            lng: -0.1037,
            geohash: 'u10j2k',
            tile_key: 'u10j2k',
            time_bucket: '2026-01-26-23',
            created_date: new Date(baseDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Electric energy. Lost track of time on the dance floor.',
            nearby_spark_count: 5
          },
          {
            _isSample: true,
            id: 'sample-10',
            user_id: profile.id,
            venue_name: 'Third Space Gym',
            venue_types: ['gym'],
            lat: 51.5074,
            lng: -0.1419,
            geohash: 'u10h8h',
            tile_key: 'u10h8h',
            time_bucket: '2026-01-25-07',
            created_date: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Morning workout session. Spotted someone with impressive dedication.',
            nearby_spark_count: 1
          }
        ];
      }
      
      return realMoments;
    },
    enabled: !!profile
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['my-matches'],
    queryFn: async () => {
      if (!profile) return [];
      const allMatches = await base44.entities.Match.list();
      return allMatches.filter((m) =>
      m.user_1_id === profile.id || m.user_2_id === profile.id
      );
    },
    enabled: !!profile
  });

  // Calculate profile strength
  const calculateProfileStrength = () => {
    if (!profile) return { percentage: 0, items: [] };

    const items = [
    { text: 'Upload at least 3 photos', completed: profile.photos?.length >= 3, href: '/Profile#photos-section' },
    { text: 'Answer at least 2 prompts', completed: profile.prompts?.length >= 2, href: '/Profile#prompts-section' },
    { text: 'Select 5+ vibe tags', completed: profile.vibe_tags?.length >= 5, href: '/Profile#vibe-section' },
    { text: 'Write a bio', completed: !!profile.bio, href: '/Profile#bio-section' },
    { text: 'Set your dating intentions', completed: !!profile.dating_intentions, href: '/Profile' },
    { text: 'Verify your profile', completed: profile.verification_status === 'verified', href: '/Verification' },
    { text: 'Set your home location', completed: !!profile.city, href: '/Profile' }];


    const completed = items.filter((i) => i.completed).length;
    const percentage = Math.round(completed / items.length * 100);

    return { percentage, items };
  };

  // Calculate spark energy with detailed breakdown
  const calculateSparkEnergy = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Only use real data — no mock values for user-facing metrics
    const mockData = {
      resonanceValue: 0,
      isGlowActive: false,
      reportsW7: 0,
      blocksW7: 0,
      spamScore: 0
    };

    // Component A: Activity (30%) — based solely on real moments logged
    const momentsW7 = moments.filter((m) => new Date(m.created_date) > weekAgo).length;
    const cappedMoments = Math.min(momentsW7, 5);
    const activityScore = (cappedMoments / 5) * 100;

    // Component B: Streak (15%)
    const streakDays = calculateStreak();
    const streakScore = Math.min(streakDays, 7) / 7 * 100;

    // Component C: Profile Quality (20%)
    const { percentage: profileStrength } = calculateProfileStrength();
    const qualityScore = Math.min(100, profileStrength + (profile.verification_status === 'verified' ? 10 : 0));

    // Component D: Resonance (20%)
    const resonanceScore = mockData.resonanceValue * 100;

    // Component E: Freshness (10%)
    const hoursSinceActive = (now.getTime() - new Date(profile.last_active_at || now).getTime()) / (1000 * 60 * 60);
    let freshnessScore = 10;
    if (hoursSinceActive <= 24) freshnessScore = 100;else
    if (hoursSinceActive <= 72) freshnessScore = 70;else
    if (hoursSinceActive <= 168) freshnessScore = 40;

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
    return moments.filter((m) => new Date(m.created_date) < weekAgo).length;
  };

  // MBTI personality types with emojis and descriptions
  const mbtiTypes = {
    'INTJ': { emoji: '🏛️', name: 'Architect', description: 'Strategic masterminds who love planning and achieving goals.', matches: ['ENTP', 'ENFP', 'ENTJ'] },
    'INTP': { emoji: '🧪', name: 'Logician', description: 'Innovative inventive with an unquenchable thirst for knowledge.', matches: ['ENTJ', 'ENTP', 'INFJ'] },
    'ENTJ': { emoji: '👑', name: 'Commander', description: 'Bold and imaginative leaders who find a way or make one.', matches: ['INTP', 'INTJ', 'ENFP'] },
    'ENTP': { emoji: '💡', name: 'Debater', description: 'Smart and curious thinkers who love intellectual challenges.', matches: ['INFJ', 'INTJ', 'ENFJ'] },
    'INFJ': { emoji: '🌟', name: 'Advocate', description: 'Quiet and mystical, yet inspiring and idealistic.', matches: ['ENTP', 'ENFP', 'INFP'] },
    'INFP': { emoji: '🎨', name: 'Mediator', description: 'Poetic, kind souls always searching for meaning.', matches: ['ENFJ', 'ENTJ', 'INFJ'] },
    'ENFJ': { emoji: '✨', name: 'Protagonist', description: 'Charismatic and inspiring leaders who captivate audiences.', matches: ['INFP', 'ENFP', 'INFJ'] },
    'ENFP': { emoji: '🎉', name: 'Campaigner', description: 'Enthusiastic, creative free spirits with vibrant energy.', matches: ['INTJ', 'INFJ', 'ENFJ'] },
    'ISTJ': { emoji: '📋', name: 'Logistician', description: 'Practical and fact-minded with unwavering reliability.', matches: ['ESTP', 'ESFP', 'ESTJ'] },
    'ISFJ': { emoji: '🛡️', name: 'Defender', description: 'Dedicated protectors ready to defend loved ones.', matches: ['ESFP', 'ESTP', 'ISFP'] },
    'ESTJ': { emoji: '⚖️', name: 'Executive', description: 'Excellent administrators skilled in managing things and people.', matches: ['ISTP', 'ISTJ', 'ESFJ'] },
    'ESFJ': { emoji: '🤗', name: 'Consul', description: 'Caring and social, always eager to help others.', matches: ['ISFP', 'ISTP', 'ESTJ'] },
    'ISTP': { emoji: '🔧', name: 'Virtuoso', description: 'Bold and practical experimenters mastering tools.', matches: ['ESTJ', 'ESFJ', 'ESTP'] },
    'ISFP': { emoji: '🎨', name: 'Adventurer', description: 'Flexible and charming artists ready to explore.', matches: ['ESFJ', 'ENFJ', 'ESTJ'] },
    'ESTP': { emoji: '🚀', name: 'Entrepreneur', description: 'Smart, energetic risk-takers who live on the edge.', matches: ['ISFJ', 'ISTJ', 'ESFP'] },
    'ESFP': { emoji: '🌈', name: 'Entertainer', description: 'Spontaneous entertainers who love life and people.', matches: ['ISTJ', 'ISFJ', 'ESTP'] }
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
      </div>);

  }

  const { percentage: profileStrength, items: profileItems } = calculateProfileStrength();
  const energyData = calculateSparkEnergy();
  const dayStreak = calculateStreak();
  const expiringMoments = calculateExpiringMoments();
  const sparksThisWeek = moments.filter((m) =>
  new Date(m.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ boxShadow: '0 0 0 1.5px rgba(231,15,114,0.7), 0 0 24px 4px rgba(231,15,114,0.2)' }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #1a0510 0%, #0d000a 100%)',
            border: '1px solid rgba(231,15,114,0.3)'
          }}>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#E70F72]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome back, {profile.display_name}!</h1>
              <p className="text-white/50 text-sm mt-0.5">Did you see anyone interesting today?</p>
            </div>
          </div>

          {todayPath ? (
            <button
              onClick={() => navigate('/LogDailyPath')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/30 active:scale-95 transition-all mb-3"
            >
              <CheckCircle2 className="w-4 h-4" />
              Today's path logged — {todayPath.stops?.length || 0} stop{(todayPath.stops?.length || 0) !== 1 ? 's' : ''}
            </button>
          ) : (
            <button
              onClick={() => navigate('/LogDailyPath')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E70F72] text-black text-sm font-semibold hover:bg-[#E70F72]/90 active:scale-95 transition-all mb-3"
            >
              <MapPin className="w-4 h-4" />
              Log today's path
            </button>
          )}

          {/* How it works */}
          {!todayPath && (
            <div className="bg-white/5 border border-[#E70F72]/40 rounded-2xl px-3 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-white/60" />
                <span className="text-white font-semibold text-sm">How it works</span>
              </div>
              <div className="space-y-2">
                {[
                  'Tap the button and add the places you visited today.',
                  'Set rough times and how long you stayed — your route is private.',
                  "If someone near your path logged a place, we'll ping you to confirm the crossing."
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#E70F72]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#E70F72] text-[9px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-white/60 text-sm leading-snug">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todayPath && todayPath.stops?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {todayPath.stops.map((s, i) => (
                <span key={i} className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Profile Strength */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl p-5 border border-[#E70F72]/30">

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-lg font-bold text-white">Profile Strength</h2>
          </div>
          <p className="text-white/65 text-sm mb-4">
            Complete your profile to attract more compatible matches.
          </p>


          
          <div className="space-y-4">
            {/* Progress Ring */}
            <div className="flex items-center justify-center py-2">
              <CrossdProgressRing
                percentage={profileStrength}
                size={150}
                strokeWidth={10}
                showLabel={true} />
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
              {profileItems.map((item, idx) => {
                const inner = (
                  <>
                    {item.completed
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-white/30 flex-shrink-0" />}
                    <span className={`flex-1 text-sm ${item.completed ? 'text-white/90' : 'text-white/50'}`}>
                      {item.text}
                    </span>
                    {!item.completed && <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />}
                  </>
                );
                return item.completed ? (
                  <div key={idx} className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">{inner}</div>
                ) : (
                  <Link
                    key={idx}
                    to={item.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 border border-white/5 hover:bg-white/5 hover:border-[#E70F72]/20 active:bg-white/10 transition-colors"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Spark Energy Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl p-5 border border-[#E70F72]/30">

          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-lg font-bold text-[#E70F72]">Spark Energy Meter</h2>
          </div>
          <p className="text-white/65 text-sm mb-4">
            Your weekly engagement fuels your spark. Keep it high for better visibility!
          </p>
          
          {/* Energy Bar */}
          <div className="mb-3">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/60">
                        <span className="text-[#E70F72] font-bold">{energyData.score}%</span> toward this week's Spark goal
                      </span>
                      <span className="text-white/40">Goal: 80%</span>
                    </div>
                    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${energyData.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[#E70F72] rounded-full" />
                      {/* 80% milestone marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: '80%' }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-white/35 text-xs">
                        {energyData.score >= 80
                          ? '🎯 Spark goal reached — you\'re fully visible this week!'
                          : `Log ${5 - Math.min(sparksThisWeek, 5)} more moment${5 - Math.min(sparksThisWeek, 5) !== 1 ? 's' : ''} to boost your score`}
                      </span>
                      <span className="text-white/30 text-xs">↑ 80% = peak visibility</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-3 w-72 bg-[#0B0B0B] border-white/10">
                  <h4 className="font-semibold mb-2 text-white text-sm">Energy Breakdown</h4>
                  <div className="space-y-2.5">
                    {[
                      { icon: Activity, label: 'Activity', value: energyData.components.activity, color: '#E70F72', desc: 'Moments logged in the last 7 days.' },
                      { icon: Flame, label: 'Streak', value: energyData.components.streak, color: '#F97316', desc: 'Consecutive daily logging streak.' },
                      { icon: ShieldCheck, label: 'Profile Quality', value: energyData.components.profileQuality, color: '#22C55E', desc: 'Photos, bio, prompts, MBTI & verification.' },
                      { icon: Sparkles, label: 'Resonance', value: energyData.components.resonance, color: '#A855F7', desc: 'Consistency of your PlacesDNA vibe.' },
                      { icon: Clock, label: 'Freshness', value: energyData.components.freshness, color: '#3B82F6', desc: 'How recently you were active.' },
                    ].map(({ icon: Icon, label, value, color, desc }) => (
                      <div key={label}>
                        <div className="flex items-center gap-2 text-xs mb-0.5">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                          <span className="flex-1 text-white/90 font-medium">{label}</span>
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                          </div>
                          <span className="font-semibold w-8 text-right" style={{ color }}>{value}%</span>
                        </div>
                        <p className="text-white/35 text-xs ml-5 leading-snug">{desc}</p>
                      </div>
                    ))}
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
          <TooltipProvider>
            <div className="grid grid-cols-3 gap-2">
              {/* Day Streak */}
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="bg-black/40 rounded-2xl p-4 text-center border border-[#E70F72]/20 cursor-pointer hover:border-orange-500/40 transition-colors">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1.5" />
                    <div className="text-2xl font-bold text-white mb-0.5">{dayStreak}</div>
                    <div className="text-white/50 text-sm leading-snug">Day Streak</div>
                    {dayStreak === 0 && (
                      <div className="mt-2 text-[#E70F72] text-xs font-medium">Log a moment →</div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 w-64 bg-[#0B0B0B] border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-white text-sm">Day Streak 🔥</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed mb-2">
                    You've logged moments on <span className="text-orange-400 font-semibold">{dayStreak} consecutive day{dayStreak !== 1 ? 's' : ''}</span>. Keep it going!
                  </p>
                  <p className="text-white/45 text-xs leading-relaxed">
                    A 7-day streak maxes out your Streak score and boosts your overall Spark Energy. Log at least one moment per day to maintain it.
                  </p>
                  {dayStreak < 7 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-orange-400 text-xs font-medium">{7 - dayStreak} more day{7 - dayStreak !== 1 ? 's' : ''} to reach max streak ⚡</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>

              {/* Sparks This Week */}
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="bg-black/40 rounded-2xl p-4 text-center border border-[#E70F72]/20 cursor-pointer hover:border-[#E70F72]/50 transition-colors">
                    <Sparkles className="w-6 h-6 text-[#E70F72] mx-auto mb-1.5" />
                    <div className="text-2xl font-bold text-white mb-0.5">{sparksThisWeek}</div>
                    <div className="text-white/50 text-sm leading-snug">Sparks this week</div>
                    {sparksThisWeek === 0 && (
                      <div className="mt-2 text-[#E70F72] text-xs font-medium">Log a moment →</div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 w-64 bg-[#0B0B0B] border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#E70F72]" />
                    <span className="font-bold text-white text-sm">Sparks This Week ✨</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed mb-2">
                    You've logged <span className="text-[#E70F72] font-semibold">{sparksThisWeek} moment{sparksThisWeek !== 1 ? 's' : ''}</span> in the last 7 days.
                  </p>
                  <p className="text-white/45 text-xs leading-relaxed">
                    Each moment you log builds your Activity score and adds to your PlacesDNA — making your matches more accurate. Aim for 5+ moments a week for peak visibility.
                  </p>
                  {sparksThisWeek < 5 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-[#E70F72] text-xs font-medium">Log {5 - sparksThisWeek} more to reach peak activity 🎯</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>

              {/* Expiring Moments */}
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="bg-black/40 rounded-2xl p-4 text-center border border-[#E70F72]/20 cursor-pointer hover:border-blue-500/40 transition-colors">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
                    <div className="text-2xl font-bold text-white mb-0.5">{expiringMoments}</div>
                    <div className="text-white/50 text-sm leading-snug">Expiring Moments</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 w-64 bg-[#0B0B0B] border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-white text-sm">Expiring Moments ⏳</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed mb-2">
                    <span className="text-blue-400 font-semibold">{expiringMoments} moment{expiringMoments !== 1 ? 's' : ''}</span> {expiringMoments !== 1 ? 'are' : 'is'} older than 7 days and no longer contributing to active crossings.
                  </p>
                  <p className="text-white/45 text-xs leading-relaxed">
                    Moments power your ability to cross paths with others nearby. Only moments from the last 7 days are active — so keep logging to stay discoverable.
                  </p>
                  {expiringMoments > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-blue-400 text-xs font-medium">Log a new moment to refresh your trail 📍</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </motion.div>

        {/* City Pulse Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <CityPulseCard moments={moments} profile={profile} isNew={true} />
        </motion.div>

        {/* Spark Chance Meter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <SparkChanceMeter moments={moments.filter(m => !m._isSample)} />
        </motion.div>

        {/* Top 10 Spark Picks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <TopPicksCard profile={profile} moments={moments} />
        </motion.div>

        {/* Know Your Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>
          <PersonalityCard profile={profile} />
        </motion.div>

        {/* Activity Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl overflow-hidden border border-[#E70F72]/30"
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0">
              <Map className="w-5 h-5 text-[#E70F72]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Activity Map</h2>
              <p className="text-white/50 text-sm">Where your paths are crossing</p>
            </div>
            <button
              onClick={() => navigate(createPageUrl('ActivityMapPage'))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E70F72]/50 text-white text-sm font-semibold hover:bg-[#E70F72]/10 active:scale-95 transition-all"
            >
              Open <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-72 w-full">
            <ActivityMap moments={moments} profile={profile} />
          </div>
        </motion.div>

        {/* Challenges Section */}
        <ChallengesSection />

        {/* Crossd+ Upsell */}
        {!profile.crossd_plus &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl p-5 text-center border border-[#E70F72]/30"
          style={{
            background: 'linear-gradient(135deg, #1a0510 0%, #0B0B0B 100%)'
          }}>

            <div className="w-16 h-16 bg-[#E70F72] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#E70F72] mb-3">Unlock Crossd+</h2>
            <p className="text-white/65 text-sm mb-6 max-w-md mx-auto">
              Supercharge your experience with unlimited likes, see who likes you, 
              and more exclusive perks!
            </p>
            <Link to={createPageUrl('CrossdPlus')} className="inline-block">
              <CrossdButton
              className="bg-gradient-to-r from-[#E70F72] to-orange-500 text-white hover:shadow-lg hover:shadow-[#E70F72]/30"
              size="lg">

                Explore Premium Features
              </CrossdButton>
            </Link>
          </motion.div>
        }

        {/* À La Carte Boosters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl p-5 border border-[#E70F72]/30">

          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-[#E70F72]" />
            <h2 className="text-lg font-bold text-white">À La Carte Boosters</h2>
          </div>
          <p className="text-white/65 text-sm mb-4">
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