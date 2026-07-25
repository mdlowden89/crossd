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

  // DEV PREVIEW: force first challenge as completed to preview earned state
  const PREVIEW_COMPLETED = true;
  const completedRaw = CHALLENGES.filter(c => c.progress >= c.total);
  const completed = PREVIEW_COMPLETED && completedRaw.length === 0
    ? [{ ...CHALLENGES[0], progress: CHALLENGES[0].total }]
    : completedRaw;
  const active = CHALLENGES.filter(c => c.progress > 0 && c.progress < c.total && !completed.find(cc => cc.id === c.id));
  const notStarted = CHALLENGES.filter(c => c.progress === 0 && !completed.find(cc => cc.id === c.id));

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
          <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-white/10 rounded-2xl relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative mb-5">
              {/* Outer ring */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/10 to-[#E70F72]/10 border border-amber-500/20 flex items-center justify-center">
                {/* Inner ring */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-[#E70F72]/20 border border-amber-400/30 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              {/* Sparkle dots */}
              <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-400/40 flex items-center justify-center text-[10px]">✦</div>
              <div className="absolute bottom-1 left-0 w-3 h-3 rounded-full bg-[#E70F72]/40 flex items-center justify-center text-[8px]">✦</div>
            </div>
            <h4 className="text-white font-bold text-base mb-1">No Achievements Unlocked Yet</h4>
            <p className="text-white/40 text-sm max-w-xs">Complete challenges above to earn badges and unlock exclusive features.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-[#E70F72]/5 to-transparent border border-amber-500/30 rounded-2xl p-4"
              >
                {/* shimmer strip */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-[#E70F72]/20 border border-amber-400/30 flex items-center justify-center text-2xl flex-shrink-0">
                      {challenge.icon}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h4 className="text-white font-bold leading-tight">{challenge.name}</h4>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap">Badge Earned</span>
                    </div>
                    <p className="text-white/50 text-xs">{challenge.reward}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-0.5" />
                    <div className="text-amber-400 font-bold text-sm">{challenge.total}/{challenge.total}</div>
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