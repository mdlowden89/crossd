import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Zap, Star, Circle, ChevronRight, Target, Heart, MessageCircle, Users, Shield, AlertTriangle, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { MBTI_FULL_DESCRIPTIONS } from './PersonalityDescriptions';
import { motion, AnimatePresence } from 'framer-motion';

const COMPAT_COLORS = {
  soulSparks: { bg: 'bg-[#E70F72]/15', text: 'text-[#E70F72]', border: 'border-[#E70F72]/30', label: '✦ Soul Sparks', desc: 'Naturally unlock your hidden warmth and depth.' },
  powerMatches: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-400/30', label: '⚡ Power Matches', desc: 'Respect, chemistry, and long-term growth.' },
  wildSparks: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-400/30', label: '⚡ Wild Sparks', desc: 'Pull you into present-moment chemistry.' },
  frictionMatches: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-400/30', label: '△ Friction Matches', desc: 'Workable, but need maturity around pace and emotion.' },
};

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="bg-[#1a1a1a] rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
          <p className="text-white/55 text-xs leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ icon, title, children, glowColor }) {
  return (
    <div className={`rounded-3xl border p-6 ${glowColor || 'border-white/10 bg-[#0d0d0d]'}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[#E70F72]">{icon}</span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CompatGroup({ groupKey, group, data }) {
  const colors = COMPAT_COLORS[groupKey];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-bold text-sm ${colors.text}`}>{colors.label}</span>
      </div>
      <p className="text-white/45 text-xs mb-3">{colors.desc}</p>
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, i) => (
          <div key={i} className={`${colors.bg} border ${colors.border} rounded-2xl p-3 flex items-start gap-3`}>
            <div className={`w-10 h-10 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-bold ${colors.text}`}>{item.type}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold text-sm">{item.type}</span>
                <span className={`text-sm font-bold ${colors.text}`}>{item.score}%</span>
              </div>
              <p className="text-white/50 text-xs leading-snug">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PersonalityCard({ profile }) {
  const [showDetails, setShowDetails] = useState(false);
  const mbtiType = profile?.mbti_type;

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
      {/* Summary Card — matches the "IDENTITY MODULE" header design */}
      <div className="rounded-3xl overflow-hidden border border-[#E70F72]/25 bg-[#0B0B0B]">
        {/* Header bar */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between">
          <div>
            <p className="text-[#E70F72] text-xs font-bold tracking-widest uppercase">Identity Module</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3 h-3 text-white/40" />
              <span className="text-white/40 text-xs tracking-wide">Verified Result</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/25 text-xs tracking-widest uppercase">Type-ID · {mbtiType}</p>
          </div>
        </div>

        {/* Hero section — icon + title + code */}
        <div
          className="mx-4 mb-4 rounded-2xl py-8 px-6 flex flex-col items-center text-center"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(231,15,114,0.15) 0%, #000 70%)' }}
        >
          {/* Emoji in circle */}
          <div className="w-20 h-20 rounded-full bg-[#E70F72]/15 border border-[#E70F72]/30 flex items-center justify-center mb-4">
            <span className="text-4xl">{description.emoji}</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">{description.title}</h2>

          {/* MBTI code box */}
          <div className="bg-black/60 rounded-xl px-6 py-2 mb-4 flex items-center gap-3">
            <div className="w-6 h-px bg-[#E70F72]" />
            <span className="text-[#E70F72] text-3xl font-black tracking-widest">{mbtiType}</span>
            <div className="w-6 h-px bg-[#E70F72]" />
          </div>

          <p className="text-white/40 text-xs tracking-widest uppercase">{description.groupLabel}</p>
        </div>

        {/* Trait tags */}
        <div className="px-5 pb-4 flex flex-wrap gap-2 justify-center">
          {description.keyTraits.map((trait, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                i === 0
                  ? 'bg-[#E70F72]/20 text-[#E70F72] border-[#E70F72]/40'
                  : 'bg-white/5 text-white/60 border-white/15'
              }`}
            >
              {trait.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 space-y-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-[#E70F72] hover:bg-[#c90d63] text-white font-bold py-4 rounded-2xl transition-all active:scale-98 text-sm tracking-wide"
          >
            {showDetails ? 'Hide Full Profile' : 'View Full Profile'}
          </button>
          <Link to={createPageUrl('MBTIQuiz')}>
            <button className="w-full text-white/40 text-xs tracking-widest uppercase py-2 hover:text-white/60 transition-colors">
              Retake Quiz
            </button>
          </Link>
        </div>
      </div>

      {/* Meta info card */}
      <div className="rounded-3xl border border-white/8 bg-[#0d0d0d] p-6 grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Spark Archetype</p>
          <p className="text-white font-semibold text-sm">{description.sparkArchetype}</p>
        </div>
        <div>
          <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Also Known As</p>
          <p className="text-white font-semibold text-sm">{description.alsoKnownAs}</p>
        </div>
        <div>
          <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Core Energy</p>
          <p className="text-white font-semibold text-sm">{description.coreEnergy}</p>
        </div>
        <div>
          <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Romantic Style</p>
          <p className="text-white font-semibold text-sm">{description.romanticStyle}</p>
        </div>
        {description.whatTheyNeed && (
          <div className="col-span-2">
            <p className="text-white/30 text-xs tracking-widest uppercase mb-1">What They Need</p>
            <p className="text-white font-semibold text-sm">{description.whatTheyNeed}</p>
          </div>
        )}
      </div>

      {/* Full expanded profile */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* Hero repeat */}
            <div className="rounded-3xl border border-[#E70F72]/20 bg-[#0d0d0d] p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#E70F72]/15 border border-[#E70F72]/25 flex items-center justify-center mb-4">
                <span className="text-3xl">{description.emoji}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{description.title}</h2>
              <p className="text-[#E70F72] text-3xl font-black tracking-widest mb-4">{mbtiType}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {description.keyTraits.map((trait, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full text-sm border border-[#E70F72]/30 text-[#E70F72] bg-[#E70F72]/10">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Growth */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <h3 className="text-white font-bold">Strengths</h3>
                  </div>
                  <div className="space-y-2.5">
                    {description.strengths.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <h3 className="text-white font-bold">Growth Areas</h3>
                  </div>
                  <div className="space-y-2.5">
                    {description.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ideal Roles */}
              {description.idealRoles && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-[#E70F72]" />
                    <h3 className="text-white font-bold">Ideal Roles</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {description.idealRoles.map((role, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Core Characteristics */}
            {description.coreCharacteristics && (
              <SectionCard icon={<Target className="w-5 h-5" />} title="Core Characteristics">
                <InfoGrid items={description.coreCharacteristics} />
              </SectionCard>
            )}

            {/* Cognitive Function Stack */}
            {description.cognitiveFunctions && (
              <SectionCard icon={<Sparkles className="w-5 h-5" />} title="Cognitive Function Stack">
                <InfoGrid items={description.cognitiveFunctions} />
              </SectionCard>
            )}

            {/* Dating Strengths */}
            {description.datingStrengths && (
              <div className="rounded-3xl border border-green-500/20 bg-[#0d0d0d] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Dating Strengths</h3>
                </div>
                <InfoGrid items={description.datingStrengths} />
              </div>
            )}

            {/* Dating Challenges */}
            {description.datingChallenges && (
              <div className="rounded-3xl border border-orange-500/20 bg-[#0d0d0d] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <XCircle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Dating Challenges</h3>
                </div>
                <InfoGrid items={description.datingChallenges} />
              </div>
            )}

            {/* Friendship */}
            {description.friendship && (
              <SectionCard icon={<Users className="w-5 h-5" />} title="Friendship">
                <p className="text-white/60 text-sm mb-5 leading-relaxed">{description.friendship.description}</p>
                <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Core Needs</p>
                <InfoGrid items={description.friendship.coreNeeds} />
                <p className="text-white/30 text-xs tracking-widest uppercase mb-3 mt-5">Red Flags</p>
                <InfoGrid items={description.friendship.redFlags} />
              </SectionCard>
            )}

            {/* Romance */}
            {description.romance && (
              <div className="rounded-3xl border border-[#E70F72]/20 bg-[#0d0d0d] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-[#E70F72]" />
                  <h3 className="text-lg font-bold text-white">Romance</h3>
                </div>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">{description.romance.description}</p>
                <p className="text-white/30 text-xs tracking-widest uppercase mb-3">How They Show Love</p>
                <InfoGrid items={description.romance.howTheyShowLove} />
                {description.romance.romanticChallenge && (
                  <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-white/70 text-sm">
                      <span className="text-red-400 font-semibold">Romantic challenge: </span>
                      {description.romance.romanticChallenge}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Communication Style */}
            {description.communicationStyle && (
              <div className="rounded-3xl border border-[#E70F72]/20 bg-[#0d0d0d] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MessageCircle className="w-5 h-5 text-[#E70F72]" />
                  <h3 className="text-lg font-bold text-white">Communication Style</h3>
                </div>
                <InfoGrid items={description.communicationStyle.styles} />
                {description.communicationStyle.dos && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">DO</p>
                      <div className="space-y-2">
                        {description.communicationStyle.dos.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/70 text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                      <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">AVOID</p>
                      <div className="space-y-2">
                        {description.communicationStyle.avoids.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/70 text-xs">
                            <XCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Love Language */}
            {description.loveLanguage && (
              <SectionCard icon={<Heart className="w-5 h-5" />} title="Love Language">
                <InfoGrid items={description.loveLanguage} />
              </SectionCard>
            )}

            {/* Compatibility Constellation */}
            {description.compatibilityConstellation && (
              <div className="rounded-3xl border border-[#E70F72]/20 bg-[#0d0d0d] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#E70F72]" />
                  <h3 className="text-lg font-bold text-white">{mbtiType} Compatibility Constellation</h3>
                </div>
                <p className="text-white/45 text-sm mb-6">Your map of who naturally clicks with you — and where to bring extra care.</p>
                {Object.entries(description.compatibilityConstellation).map(([key, data]) => (
                  <CompatGroup key={key} groupKey={key} data={data} />
                ))}
              </div>
            )}

            {/* Persona Card */}
            {description.personaCard && (
              <div className="rounded-3xl border border-[#E70F72]/25 bg-gradient-to-br from-[#E70F72]/10 to-transparent p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-5 h-5 text-[#E70F72]" />
                  <h3 className="text-lg font-bold text-[#E70F72]">Persona Card</h3>
                </div>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[#E70F72]/15 border border-[#E70F72]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{description.emoji}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Meet the {description.personaCard.meetThe}</h4>
                    <p className="text-white/65 text-sm leading-relaxed">{description.personaCard.description}</p>
                  </div>
                </div>
                <div className="bg-black/40 rounded-2xl p-4 border border-white/8">
                  <div className="flex items-start gap-2">
                    <span className="text-[#E70F72] text-xl font-black leading-none mt-0.5">"</span>
                    <p className="text-white/80 text-sm italic leading-relaxed flex-1">{description.personaCard.suggestedBio.replace(/^"|"$/g, '')}</p>
                  </div>
                  <p className="text-white/25 text-xs tracking-widest uppercase mt-3">Suggested Bio Prompt</p>
                </div>
              </div>
            )}

            {/* Connection Insights */}
            <div className="p-6 bg-gradient-to-r from-[#E70F72]/10 to-purple-500/10 rounded-3xl border border-[#E70F72]/20">
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-5 h-5 text-[#E70F72]" />
                <h3 className="text-lg font-bold text-[#E70F72]">Personality Insights</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/90 font-semibold text-sm">Relationship Approach</p>
                  </div>
                  <p className="text-white/65 text-sm italic leading-relaxed">"{description.relationshipApproach}"</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/90 font-semibold text-sm">Communication Style</p>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed">{description.communication}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/90 font-semibold text-sm">Best Compatibility</p>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed">{description.compatibility}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-[#E70F72]" />
                    <p className="text-white/90 font-semibold text-sm">Famous {mbtiType}s</p>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed">{description.famousExamples?.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowDetails(false)}
              className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold py-4 rounded-2xl transition-all text-sm"
            >
              Hide Full Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}