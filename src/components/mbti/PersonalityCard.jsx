import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Zap, Star, Circle } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { MBTI_FULL_DESCRIPTIONS } from './PersonalityDescriptions';
import { calculateCompatibility } from './CompatibilityMatrix';
import { motion, AnimatePresence } from 'framer-motion';

export default function PersonalityCard({ profile }) {
  const [showDetails, setShowDetails] = useState(false);
  const mbtiType = profile?.mbti_type;
  const isPremium = profile?.crossd_plus;

  if (!mbtiType) {
    return (
      <CrossdCard className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] border-[#E70F72]/30">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#E70F72]" />
          <h2 className="text-2xl font-bold text-white">Your Connection Style</h2>
        </div>
        <p className="text-white/65 mb-6">
          Answer a few questions and we'll build your Crossd personality profile to surface more meaningful connections.
        </p>
        <Link to={createPageUrl('MBTIQuiz')}>
          <CrossdButton className="w-full" size="lg">
            <Sparkles className="w-5 h-5" />
            Take Quiz
          </CrossdButton>
        </Link>
      </CrossdCard>
    );
  }

  const description = MBTI_FULL_DESCRIPTIONS[mbtiType];
  
  if (!description) return null;

  return (
    <>
      <CrossdCard className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] border-[#E70F72]/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          <h2 className="text-xl font-bold text-white">Your Connection Style</h2>
        </div>
        
        <div className="mb-6">
          <div className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-5xl">{description.emoji}</span>
            <div>
              <div>{description.title.split('/')[0].trim()}</div>
              <div className="text-white/30 text-sm font-normal mt-0.5">Personality code: {mbtiType}</div>
            </div>
          </div>
          <p className="text-white/65">
            {description.keyTraits.join(' • ')}
          </p>
        </div>

        <div className="space-y-3">
          <CrossdButton 
            onClick={() => setShowDetails(true)} 
            variant="secondary" 
            className="w-full"
          >
            View Full Profile
          </CrossdButton>
          <Link to={createPageUrl('MBTIQuiz')}>
            <CrossdButton variant="outline" className="w-full">
              Retake Style Quiz
            </CrossdButton>
          </Link>
        </div>
      </CrossdCard>

      {/* Full Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl bg-[#0B0B0B] rounded-3xl border border-[#E70F72]/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="text-7xl mb-4">{description.emoji}</div>
                  <h2 className="text-3xl font-bold text-white mb-2">{description.title}</h2>
                  <div className="text-sm text-white/35 mb-4">Personality code: {mbtiType}</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {description.keyTraits.map((trait, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-[#E70F72]/10 text-[#E70F72] rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      Strengths
                    </h3>
                    <div className="space-y-2">
                      {description.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                          <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500 flex-shrink-0" />
                          {strength}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Growth Areas
                    </h3>
                    <div className="space-y-2">
                      {description.weaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                          <Circle className="w-1.5 h-1.5 fill-orange-500 text-orange-500 flex-shrink-0" />
                          {weakness}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ideal Roles */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3">💼 Ideal Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {description.idealRoles.map((role, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-white/5 text-white/80 rounded-lg text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Insights - visible to all */}
                <div className="p-6 bg-gradient-to-r from-[#E70F72]/10 to-purple-500/10 rounded-2xl border border-[#E70F72]/20 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-[#E70F72]" />
                    <h3 className="text-lg font-bold text-[#E70F72]">Connection Insights</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/90 font-semibold mb-2">💘 Relationship Approach</p>
                      <p className="text-white/70 text-sm italic leading-relaxed">
                        "{description.relationshipApproach}"
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-white/90 font-semibold mb-2">💬 Communication Style</p>
                      <p className="text-white/70 text-sm">
                        {description.communication}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-white/90 font-semibold mb-2">🎯 Best Compatibility</p>
                      <p className="text-white/70 text-sm">
                        {description.compatibility}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-white/90 font-semibold mb-2">⭐ Famous {description.title.split('/')[0].trim()}s</p>
                      <p className="text-white/70 text-sm">
                        {description.famousExamples.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <CrossdButton onClick={() => setShowDetails(false)} variant="secondary" className="w-full">
                  Close
                </CrossdButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}