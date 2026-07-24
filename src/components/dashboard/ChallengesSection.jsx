import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, CheckCircle2 } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';

// Calculate streak days from moments
function calcStreak(moments) {
  const real = moments.filter(m => !m._isSample);
  if (!real.length) return 0;
  const uniqueDates = [...new Set(real.map(m => new Date(m.created_date).toISOString().slice(0, 10)))].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = Math.round((new Date(uniqueDates[i - 1]) - new Date(uniqueDates[i])) / 86400000);
    if (diff === 1) streak++; else break;
  }
  return streak;
}

// Count distinct geohash prefixes (4 chars = ~20km district) in real moments
function countDistricts(moments) {
  const real = moments.filter(m => !m._isSample && m.geohash);
  return new Set(real.map(m => m.geohash.slice(0, 4))).size;
}

export default function ChallengesSection({ moments = [], matches = [] }) {
  const streak = useMemo(() => calcStreak(moments), [moments]);
  const districts = useMemo(() => countDistricts(moments), [moments]);
  const totalMatches = matches.length;

  const CHALLENGES = useMemo(() => [
    {
      id: 'moment-marathon',
      name: 'Moment Marathon',
      icon: '📍',
      description: 'Log a Moment 7 days in a row',
      progress: Math.min(streak, 7),
      total: 7,
      nextMilestone: 'Achieve "Wanderer" Badge: Cross 3 Zones',
      reward: 'Exclusive "Wanderer" Badge',
    },
    {
      id: 'chatterbox',
      name: 'Chatterbox Challenge',
      icon: '💬',
      description: 'Get 5 matches by crossing paths.',
      progress: Math.min(totalMatches, 5),
      total: 5,
      nextMilestone: '"Chatterbox" Badge unlocked at 5 matches',
      reward: 'Exclusive "Chatterbox" Badge',
    },
    {
      id: 'city-navigator',
      name: 'City Navigator',
      icon: '🏙️',
      description: 'Log Moments in 3 distinct areas this month.',
      progress: Math.min(districts, 3),
      total: 3,
      nextMilestone: '"Navigator" Map Feature for Profile',
      reward: '"Navigator" Basic Map Trigger for Profile',
    },
    {
      id: 'serendipity',
      name: 'Serendipity Seeker',
      icon: '💖',
      description: 'Achieve 3 crossings that lead to a match.',
      progress: Math.min(matches.filter(m => m.source === 'crossing').length, 3),
      total: 3,
      nextMilestone: '"Serendipity" Badge at 3 crossing matches',
      reward: '"Serendipity" Badge, Unlocked Other Features',
    }
  ], [streak, totalMatches, districts, matches]);

  const completed = CHALLENGES.filter(c => c.progress >= c.total);
  const active = CHALLENGES.filter(c => c.progress > 0 && c.progress < c.total);
  const notStarted = CHALLENGES.filter(c => c.progress === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl p-8 border border-[#E70F72]/30"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-10 h-10 text-[#E70F72]" />
          <h2 className="text-2xl font-bold text-white">Your Progress & Achievements</h2>
        </div>
        <p className="text-white/65">Track your active challenges and view your earned badges.</p>
      </div>

      {/* Active Challenges */}
      <div className="mb-10">
        <h3 className="text-[#E70F72] font-semibold text-lg mb-4">Active Challenges</h3>
        <div className="space-y-4">
          {[...active, ...notStarted].map((challenge) => {
            const pct = (challenge.progress / challenge.total) * 100;
            const isStarted = challenge.progress > 0;
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-black/40 border rounded-2xl p-6 ${isStarted ? 'border-[#E70F72]/30' : 'border-white/10'}`}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-5xl leading-none">{challenge.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{challenge.name}</h4>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${isStarted ? 'bg-[#E70F72]/20 text-[#E70F72]' : 'bg-white/10 text-white/50'}`}>
                          {isStarted ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/65 text-sm">{challenge.description}</p>
                  </div>

                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/65 text-xs">Progress:</span>
                        <span className="text-white font-semibold text-sm">{challenge.progress} / {challenge.total}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-[#E70F72]"
                        />
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <span className="text-white/50 text-xs">{isStarted ? 'Next Milestone:' : 'Reward Preview:'}</span>
                      <p className="text-white/75 text-sm mt-1">{isStarted ? challenge.nextMilestone : challenge.reward}</p>
                    </div>
                    {!isStarted && (
                      <CrossdButton className="w-full text-sm py-2 mt-3">Start Challenge</CrossdButton>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Earned Achievements */}
      <div>
        <h3 className="text-[#E70F72] font-semibold text-lg mb-4">Earned Achievements</h3>
        {completed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <Trophy className="w-12 h-12 text-white/20 mb-3" />
            <h4 className="text-white font-semibold mb-1">No Achievements Unlocked Yet</h4>
            <p className="text-white/50 text-sm">Keep exploring and interacting on Crossd to earn badges!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completed.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 border border-green-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl leading-none">{challenge.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold text-lg">{challenge.name}</h4>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="inline-block text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      Completed ✓
                    </span>
                    <p className="text-white/65 text-sm mt-2">{challenge.reward}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">{challenge.total}/{challenge.total}</div>
                    <div className="text-white/40 text-xs">done</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}