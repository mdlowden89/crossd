import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Zap, Star, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { MBTI_FULL_DESCRIPTIONS } from './PersonalityDescriptions';
import { calculateCompatibility } from './CompatibilityMatrix';
import { motion, AnimatePresence } from 'framer-motion';

function CompatibilityTier({ label, color, matches }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold mb-2" style={{ color }}>{label}</div>
      <div className="space-y-2">
        {matches.map(m => (
          <div key={m.type} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
            <span className="text-sm font-bold w-12 text-white">{m.type}</span>
            <span className="text-white/50 text-xs flex-1">{m.label}</span>
            <span className="text-xs font-bold" style={{ color }}>{m.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandableSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-white font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

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
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{description.emoji}</div>
                  <h2 className="text-2xl font-bold text-white mb-1">{description.title}</h2>
                  {description.sparkArchetype && (
                    <p className="text-[#E70F72] text-sm font-medium mb-1">✨ {description.sparkArchetype}</p>
                  )}
                  <div className="text-xs text-white/30 mb-3">{mbtiType}{description.typeCode ? ` · ${description.typeCode}` : ''}</div>
                  {description.population && (
                    <p className="text-white/40 text-xs mb-3">{description.population}</p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    {description.keyTraits.map((trait, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#E70F72]/10 text-[#E70F72] rounded-full text-xs">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nicknames */}
                {description.nicknames && (
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {description.nicknames.map((n, i) => (
                      <span key={i} className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">{n}</span>
                    ))}
                  </div>
                )}

                {/* Core at-a-glance */}
                {(description.coreEnergy || description.romanticStyle) && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {description.coreEnergy && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Core Energy</p>
                        <p className="text-white text-xs leading-snug">{description.coreEnergy}</p>
                      </div>
                    )}
                    {description.romanticStyle && (
                      <div className="bg-[#E70F72]/8 rounded-xl p-3">
                        <p className="text-[#E70F72]/60 text-[10px] uppercase tracking-wider mb-1">Romantic Style</p>
                        <p className="text-white text-xs leading-snug">{description.romanticStyle}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Core Characteristics */}
                {description.coreCharacteristics && (
                  <ExpandableSection title="🔍 Core Characteristics">
                    <div className="space-y-3 pt-1">
                      {description.coreCharacteristics.map((c, i) => (
                        <div key={i}>
                          <p className="text-white text-xs font-semibold mb-0.5">{c.trait}</p>
                          <p className="text-white/55 text-xs leading-relaxed">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                )}

                {/* Cognitive Functions */}
                {description.cognitiveFunctions && (
                  <ExpandableSection title="🧭 Cognitive Function Stack">
                    <div className="space-y-3 pt-1">
                      {description.cognitiveFunctions.map((f, i) => (
                        <div key={i}>
                          <p className="text-[#E70F72] text-xs font-semibold mb-0.5">{f.name}</p>
                          <p className="text-white/55 text-xs leading-relaxed">{f.description}</p>
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                )}

                {/* Dating Strengths */}
                {description.datingStrengths && (
                  <ExpandableSection title="✅ Dating Strengths">
                    <div className="space-y-3 pt-1">
                      {description.datingStrengths.map((s, i) => (
                        <div key={i} className="flex gap-3">
                          <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500 flex-shrink-0 mt-1.5" />
                          <div>
                            <p className="text-white text-xs font-semibold">{s.strength}</p>
                            <p className="text-white/50 text-xs leading-relaxed">{s.why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                )}

                {/* Dating Challenges */}
                {description.datingChallenges && (
                  <ExpandableSection title="❌ Dating Challenges">
                    <div className="space-y-3 pt-1">
                      {description.datingChallenges.map((c, i) => (
                        <div key={i} className="flex gap-3">
                          <Circle className="w-1.5 h-1.5 fill-orange-500 text-orange-500 flex-shrink-0 mt-1.5" />
                          <div>
                            <p className="text-white text-xs font-semibold">{c.challenge}</p>
                            <p className="text-white/50 text-xs leading-relaxed">{c.looks}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                )}

                {/* How They Show Love */}
                {description.loveSigns && (
                  <ExpandableSection title="❤️ How They Show Love">
                    <div className="space-y-3 pt-1">
                      {description.loveSigns.map((l, i) => (
                        <div key={i}>
                          <p className="text-[#E70F72] text-xs font-semibold mb-0.5">{l.signal}</p>
                          <p className="text-white/55 text-xs leading-relaxed">{l.looks}</p>
                        </div>
                      ))}
                    </div>
                    {description.romanticChallenge && (
                      <div className="mt-4 p-3 bg-[#E70F72]/8 rounded-xl border border-[#E70F72]/20">
                        <p className="text-[#E70F72] text-[10px] uppercase tracking-wider mb-1">Romantic Challenge</p>
                        <p className="text-white/70 text-xs leading-relaxed italic">{description.romanticChallenge}</p>
                      </div>
                    )}
                  </ExpandableSection>
                )}

                {/* Communication Tips */}
                {description.communicationDos && (
                  <ExpandableSection title="🗣️ Communication Guide">
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <p className="text-green-400 text-[10px] font-bold uppercase mb-2">Do</p>
                        {description.communicationDos.map((d, i) => (
                          <div key={i} className="flex items-start gap-1.5 mb-1.5">
                            <Circle className="w-1 h-1 fill-green-500 text-green-500 flex-shrink-0 mt-1.5" />
                            <p className="text-white/60 text-xs">{d}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-red-400 text-[10px] font-bold uppercase mb-2">Avoid</p>
                        {description.communicationAvoids.map((a, i) => (
                          <div key={i} className="flex items-start gap-1.5 mb-1.5">
                            <Circle className="w-1 h-1 fill-red-500 text-red-500 flex-shrink-0 mt-1.5" />
                            <p className="text-white/60 text-xs">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ExpandableSection>
                )}

                {/* Love Languages */}
                {description.loveLanguages && (
                  <ExpandableSection title="🔁 Love Languages">
                    <div className="space-y-2.5 pt-1">
                      {description.loveLanguages.map((l, i) => (
                        <div key={i}>
                          <p className="text-white text-xs font-semibold mb-0.5">{l.language}</p>
                          <p className="text-white/50 text-xs leading-relaxed">{l.expression}</p>
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                )}

                {/* Compatibility Matrix */}
                {description.compatibilityMatrix ? (
                  <ExpandableSection title="💞 Compatibility Profile">
                    <div className="pt-1">
                      <CompatibilityTier label="💫 Elite Sparks" color="#FFD700" matches={description.compatibilityMatrix.elite} />
                      <CompatibilityTier label="🔥 Strong Sparks" color="#FF6B35" matches={description.compatibilityMatrix.strong} />
                      <CompatibilityTier label="🌗 Wild Card Sparks" color="#9B5DE5" matches={description.compatibilityMatrix.wildcard} />
                      <CompatibilityTier label="⚠️ Friction Sparks" color="#64748B" matches={description.compatibilityMatrix.friction} />
                    </div>
                  </ExpandableSection>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-[#E70F72]/10 to-purple-500/10 rounded-2xl border border-[#E70F72]/20 mb-3">
                    <p className="text-white/90 font-semibold text-sm mb-1">🎯 Best Compatibility</p>
                    <p className="text-white/70 text-sm">{description.compatibility}</p>
                  </div>
                )}

                {/* Persona Card */}
                {description.personaCard && (
                  <div className="p-4 bg-gradient-to-r from-[#E70F72]/15 to-purple-900/20 rounded-2xl border border-[#E70F72]/30 mb-4">
                    <p className="text-[#E70F72] text-xs font-bold uppercase tracking-wider mb-1">🖤 Crossd Persona — {description.personaCard.name}</p>
                    <p className="text-white/70 text-sm italic leading-relaxed">{description.personaCard.bio}</p>
                  </div>
                )}

                {/* Famous Examples */}
                <div className="mb-6">
                  <p className="text-white/50 text-xs font-semibold mb-2">⭐ Famous {description.title.split('/')[0].trim()}s</p>
                  <div className="flex flex-wrap gap-2">
                    {description.famousExamples.map((ex, i) => (
                      <span key={i} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-lg">{ex}</span>
                    ))}
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