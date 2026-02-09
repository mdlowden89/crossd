import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Heart } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';

const CHALLENGES = [
  {
    id: 'moment-marathon',
    name: 'Moment Marathon',
    icon: '📍',
    status: 'Active',
    description: 'Log a Moment 7 days in a row',
    progress: 3,
    total: 7,
    nextMilestone: 'Achieve "Wanderer" Badge: Cross 3 Zones',
    reward: 'Exclusive "Wanderer" Badge',
    action: 'In Progress'
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox Challenge',
    icon: '💬',
    status: 'Active',
    description: 'Reply to 5 Moment Matches within 48 hours of matching.',
    progress: 5,
    total: 5,
    nextMilestone: '2 First Audio Chats, "Chatterbox" Badge',
    reward: 'Exclusive "Chatterbox" Badge',
    action: 'In Progress'
  },
  {
    id: 'city-navigator',
    name: 'City Navigator',
    icon: '🏙️',
    status: 'Not Started',
    description: 'Visit and log Moments in 3 distinct boroughs or districts this month.',
    progress: 0,
    total: 3,
    nextMilestone: '"Vandals" Radius Map Timefor Poste',
    reward: '"Navigator" Basic Map Trigger for Profile',
    action: 'Start Challenge'
  },
  {
    id: 'serendipity',
    name: 'Serendipity Seeker',
    icon: '💖',
    status: 'Active',
    description: 'Achieve 3 "Crossd Spark" matches (match + crossd + 2 hrs)',
    progress: 0,
    total: 3,
    nextMilestone: 'Get Matched 2+ "Hype" Goals, Unlocked Other Features',
    reward: '"Serendipity" Badge, Unlocked Other Features',
    action: 'In Progress'
  }
];

export default function ChallengesSection() {
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
          <Award className="w-5 h-5 text-[#E70F72]" />
          <h2 className="text-2xl font-bold text-white">Your Progress & Achievements</h2>
        </div>
        <p className="text-white/65">Track your active challenges and view your earned badges.</p>
      </div>

      {/* Active Challenges */}
      <div className="mb-10">
        <h3 className="text-[#E70F72] font-semibold text-lg mb-4">Active Challenges</h3>
        <div className="space-y-4">
          {CHALLENGES.filter(c => c.status !== 'Not Started').map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-[#E70F72]/30 rounded-2xl p-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Side */}
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{challenge.name}</h4>
                      <span className="inline-block text-xs bg-[#E70F72]/20 text-[#E70F72] px-2 py-1 rounded-full mt-1">
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/65 text-sm mb-4">{challenge.description}</p>
                </div>

                {/* Right Side */}
                <div>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/65 text-xs">Progress:</span>
                      <span className="text-white font-semibold text-sm">{challenge.progress} / {challenge.total}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-[#E70F72]"
                      />
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                    <span className="text-white/50 text-xs">Next Milestone:</span>
                    <p className="text-white/75 text-sm mt-1">{challenge.nextMilestone}</p>
                  </div>

                  {/* Action Button */}
                  <CrossdButton variant="secondary" className="w-full text-sm py-2">
                    {challenge.action}
                  </CrossdButton>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Not Started Challenge */}
          {CHALLENGES.filter(c => c.status === 'Not Started').map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/10 rounded-2xl p-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Side */}
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{challenge.name}</h4>
                      <span className="inline-block text-xs bg-white/10 text-white/50 px-2 py-1 rounded-full mt-1">
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/65 text-sm mb-4">{challenge.description}</p>
                </div>

                {/* Right Side */}
                <div>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/65 text-xs">Progress:</span>
                      <span className="text-white font-semibold text-sm">{challenge.progress} / {challenge.total}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20" style={{ width: '0%' }} />
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                    <span className="text-white/50 text-xs">Reward Preview:</span>
                    <p className="text-white/75 text-sm mt-1">{challenge.reward}</p>
                  </div>

                  {/* Action Button */}
                  <CrossdButton className="w-full text-sm py-2">
                    {challenge.action}
                  </CrossdButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Earned Achievements */}
      <div>
        <h3 className="text-[#E70F72] font-semibold text-lg mb-4">Earned Achievements</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
          <Trophy className="w-12 h-12 text-white/20 mb-3" />
          <h4 className="text-white font-semibold mb-1">No Achievements Unlocked Yet</h4>
          <p className="text-white/50 text-sm">Keep exploring and interacting on Crossd to earn badges!</p>
        </div>
      </div>
    </motion.div>
  );
}