import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Sparkles, Zap, Star, Target, Heart, MessageCircle, Users, AlertTriangle, CheckCircle, XCircle, Brain, Layers } from 'lucide-react';
import { MBTI_FULL_DESCRIPTIONS } from '@/components/mbti/PersonalityDescriptions';
import PersonalityStrengthBar from '@/components/mbti/PersonalityStrengthBar';

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

const TRAIT_ACCENTS = [
  { border: 'border-[#E70F72]/40', bg: 'bg-[#E70F72]/10', text: 'text-[#E70F72]', num: 'bg-[#E70F72]' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', num: 'bg-purple-500' },
  { border: 'border-sky-500/40', bg: 'bg-sky-500/10', text: 'text-sky-400', num: 'bg-sky-500' },
  { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', num: 'bg-amber-500' },
];

function CoreCharacteristicsGrid({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const accent = TRAIT_ACCENTS[i % TRAIT_ACCENTS.length];
        return (
          <div key={i} className={`rounded-2xl border ${accent.border} ${accent.bg} p-4 flex items-start gap-4`}>
            <div className={`w-10 h-10 rounded-xl ${accent.num} flex items-center justify-center flex-shrink-0`}
                 style={{ opacity: 0.85 }}>
              <span className="text-white text-base font-black">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm mb-0.5 ${accent.text}`}>{item.title}</p>
              <p className="text-white/60 text-xs leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const COGNITIVE_META = [
  { rank: 'Dom', label: 'Dominant', color: 'text-[#E70F72]', border: 'border-[#E70F72]/40', bg: 'bg-[#E70F72]/8', bar: 'bg-[#E70F72]', barW: 'w-full' },
  { rank: 'Aux', label: 'Auxiliary', color: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-500/8', bar: 'bg-purple-400', barW: 'w-3/4' },
  { rank: 'Ter', label: 'Tertiary', color: 'text-sky-400', border: 'border-sky-400/40', bg: 'bg-sky-500/8', bar: 'bg-sky-400', barW: 'w-1/2' },
  { rank: 'Inf', label: 'Inferior', color: 'text-white/35', border: 'border-white/15', bg: 'bg-white/5', bar: 'bg-white/25', barW: 'w-1/4' },
];

const COGNITIVE_WIDTHS = [100, 75, 50, 25];

function CognitiveFunctionStack({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const meta = COGNITIVE_META[i] || COGNITIVE_META[3];
        const descTitle = item.title.replace(/^(Dominant|Auxiliary|Tertiary|Inferior)\s*[—-]\s*/i, '');
        const isDom = i === 0;
        return (
          <div key={i} className={`rounded-2xl border ${meta.border} ${isDom ? 'bg-gradient-to-r from-[#E70F72]/12 to-transparent' : meta.bg} p-4`}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-lg border ${meta.border} ${meta.color} whitespace-nowrap`}>
                  {meta.label}
                </span>
                <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden mt-1" style={{ minWidth: 56 }}>
                  <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${COGNITIVE_WIDTHS[i]}%` }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm mb-1 ${isDom ? 'text-white' : meta.color}`}>{descTitle}</p>
                <p className="text-white/55 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ icon, title, children, borderColor }) {
  return (
    <div className={`rounded-3xl border p-6 bg-[#0d0d0d] ${borderColor || 'border-white/10'}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[#E70F72]">{icon}</span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CompatGroup({ groupKey, data }) {
  const colors = COMPAT_COLORS[groupKey];
  return (
    <div className="mb-6">
      <p className={`font-bold text-sm ${colors.text} mb-1`}>{colors.label}</p>
      <p className="text-white/45 text-xs mb-3">{colors.desc}</p>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className={`${colors.bg} border ${colors.border} rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-bold ${colors.text}`}>{item.type}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-bold text-sm">{item.type}</span>
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

export default function PersonalityProfile() {
  const navigate = useNavigate();
  const [mbtiType, setMbtiType] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.Profile.filter({ user_id: user.id });
        if (profiles.length) {
          setMbtiType(profiles[0].mbti_type);
          setQuizResults(profiles[0].mbti_quiz_results || null);
        }
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#E70F72] rounded-full animate-spin" />
      </div>
    );
  }

  const description = mbtiType ? MBTI_FULL_DESCRIPTIONS[mbtiType] : null;

  if (!description) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <p className="text-white/50 mb-4">No personality type found.</p>
        <button onClick={() => navigate(-1)} className="text-[#E70F72]">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky back header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/Dashboard')} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <p className="text-white font-bold text-sm">Identity Module</p>
          <p className="text-white/40 text-xs">{mbtiType} · Full Profile</p>
        </div>
      </div>

      <div className="px-4 pb-12 space-y-4 mt-4">
        {/* Hero card */}
        <div className="rounded-3xl overflow-hidden border border-[#E70F72]/25 bg-[#0B0B0B]">
          <div className="px-5 pt-5 pb-3 flex items-start justify-between">
            <div>
              <p className="text-[#E70F72] text-xs font-bold tracking-widest uppercase">Identity Module</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles className="w-3 h-3 text-white/40" />
                <span className="text-white/40 text-xs tracking-wide">Verified Result</span>
              </div>
            </div>
            <p className="text-white/25 text-xs tracking-widest uppercase">Type-ID · {mbtiType}</p>
          </div>

          <div
            className="mx-4 mb-4 rounded-2xl py-8 px-6 flex flex-col items-center text-center"
            style={{ background: 'radial-gradient(ellipse 50% 70% at 50% 10%, rgba(231,15,114,0.30) 0%, rgba(231,15,114,0.08) 55%, #000 80%)' }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                 style={{ background: 'radial-gradient(circle, rgba(231,15,114,0.5) 0%, rgba(231,15,114,0.2) 50%, transparent 100%)', boxShadow: '0 0 40px rgba(231,15,114,0.5), 0 0 80px rgba(231,15,114,0.2)' }}>
              <span className="text-4xl">{description.emoji}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{description.title}</h2>
            <div className="bg-black/60 rounded-xl px-6 py-2 mb-4 flex items-center gap-3">
              <div className="w-6 h-px bg-[#E70F72]" />
              <span className="text-[#E70F72] text-3xl font-black tracking-normal">{mbtiType}</span>
              <div className="w-6 h-px bg-[#E70F72]" />
            </div>
            <p className="text-white/40 text-xs tracking-widest uppercase mb-4">{description.groupLabel}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {description.keyTraits.map((trait, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                  i === 0 ? 'bg-[#E70F72]/20 text-[#E70F72] border-[#E70F72]/40' : 'bg-white/5 text-white/60 border-white/15'
                }`}>{trait.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="rounded-3xl border border-white/8 bg-[#0d0d0d] p-6 space-y-4">
          <div>
            <p className="text-[#E70F72] text-xs tracking-widest uppercase mb-1">Spark Archetype</p>
            <p className="text-white font-semibold text-sm capitalize">{description.sparkArchetype}</p>
          </div>
          <div>
            <p className="text-[#E70F72] text-xs tracking-widest uppercase mb-1">Also Known As</p>
            <p className="text-white font-semibold text-sm capitalize">{description.alsoKnownAs}</p>
          </div>
          <div>
            <p className="text-[#E70F72] text-xs tracking-widest uppercase mb-1">Core Energy</p>
            <p className="text-white font-semibold text-sm capitalize">{description.coreEnergy}</p>
          </div>
          <div>
            <p className="text-[#E70F72] text-xs tracking-widest uppercase mb-1">Romantic Style</p>
            <p className="text-white font-semibold text-sm capitalize">{description.romanticStyle}</p>
          </div>
          {description.whatTheyNeed && (
            <div>
              <p className="text-[#E70F72] text-xs tracking-widest uppercase mb-1">What They Need</p>
              <p className="text-white font-semibold text-sm capitalize">{description.whatTheyNeed}</p>
            </div>
          )}
        </div>



        {/* Strengths & Growth */}
        <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-green-400" />
              <h3 className="text-white font-bold">Strengths</h3>
            </div>
            <div className="space-y-2">
              {description.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-white/6" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-orange-400" />
              <h3 className="text-white font-bold">Growth Areas</h3>
            </div>
            <div className="space-y-2">
              {description.weaknesses.map((w, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PersonalityStrengthBar mbtiType={mbtiType} quizResults={quizResults} />

        {description.coreCharacteristics && (
          <SectionCard icon={<Target className="w-5 h-5" />} title="Core Characteristics">
            <CoreCharacteristicsGrid items={description.coreCharacteristics} />
          </SectionCard>
        )}

        {description.cognitiveFunctions && (
          <SectionCard icon={<Brain className="w-5 h-5" />} title="Cognitive Function Stack">
            <CognitiveFunctionStack items={description.cognitiveFunctions} />
          </SectionCard>
        )}

        {(description.datingStrengths || description.datingChallenges) && (
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d0d]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E70F72]/15 border border-[#E70F72]/30 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-[#E70F72]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Dating Profile</h3>
                <p className="text-white/35 text-[11px]">Superpowers & blind spots</p>
              </div>
            </div>

            {description.datingStrengths && (
              <div className="px-6 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-green-500/20" />
                  <span className="text-green-400 text-[10px] font-black tracking-widest uppercase px-2">Superpowers</span>
                  <div className="h-px flex-1 bg-green-500/20" />
                </div>
                <div className="space-y-2">
                  {description.datingStrengths.map((item, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden border border-green-500/20 bg-green-500/5 p-4">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/60 rounded-l-2xl" />
                      <div className="pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          <p className="text-white font-bold text-sm">{item.title}</p>
                        </div>
                        <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {description.datingChallenges && (
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-orange-500/20" />
                  <span className="text-orange-400 text-[10px] font-black tracking-widest uppercase px-2">Blind Spots</span>
                  <div className="h-px flex-1 bg-orange-500/20" />
                </div>
                <div className="space-y-2">
                  {description.datingChallenges.map((item, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden border border-orange-500/20 bg-orange-500/5 p-4">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500/60 rounded-l-2xl" />
                      <div className="pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                          <p className="text-white font-bold text-sm">{item.title}</p>
                        </div>
                        <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {description.friendship && (
          <div className="rounded-3xl border border-sky-500/20 bg-[#0d0d0d] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Friendship</h3>
            </div>
            <p className="text-white/60 text-sm mb-5 leading-relaxed italic border-l-2 border-sky-500/40 pl-3">{description.friendship.description}</p>
            <p className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-3">Core Needs</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {description.friendship.coreNeeds.map((item, i) => (
                <div key={i} className="bg-sky-500/8 border border-sky-500/20 rounded-2xl p-3">
                  <p className="text-sky-300 font-semibold text-xs mb-1">{item.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="text-red-400 text-xs font-bold tracking-widest uppercase mb-3">🚩 Red Flags</p>
            <div className="space-y-2">
              {description.friendship.redFlags.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl p-3">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-xs">{item.title}</p>
                    <p className="text-white/45 text-xs leading-relaxed mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {description.romance && (
          <div className="rounded-3xl border border-[#E70F72]/25 bg-[#0d0d0d] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#E70F72]" />
              <h3 className="text-lg font-bold text-white">Romance</h3>
            </div>
            <p className="text-white/60 text-sm mb-5 leading-relaxed italic border-l-2 border-[#E70F72]/40 pl-3">{description.romance.description}</p>
            <p className="text-[#E70F72] text-xs font-bold tracking-widest uppercase mb-3">How They Show Love</p>
            <div className="space-y-2 mb-4">
              {description.romance.howTheyShowLove.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#E70F72]/8 border border-[#E70F72]/20 rounded-2xl p-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#E70F72] text-[10px] font-black">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-white/50 text-xs leading-relaxed mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {description.romance.romanticChallenge && (
              <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/8 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/70 text-sm leading-relaxed">
                  <span className="text-amber-400 font-semibold">Growth edge: </span>
                  {description.romance.romanticChallenge}
                </p>
              </div>
            )}
          </div>
        )}

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
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">AVOID</p>
                  <div className="space-y-2">
                    {description.communicationStyle.avoids.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/70 text-xs">
                        <XCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {description.loveLanguage && (
          <div className="rounded-3xl border border-[#E70F72]/25 bg-[#0d0d0d] p-6">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#E70F72]" />
              <h3 className="text-lg font-bold text-white">Love Language</h3>
            </div>
            <p className="text-white/35 text-xs mb-5">Ranked by natural intensity — how they give and receive love</p>
            <div className="space-y-3">
              {description.loveLanguage.map((item, i) => {
                const fillPct = Math.round(100 - i * 16);
                const isTop = i === 0;
                return (
                  <div key={i} className={`rounded-2xl p-4 border ${isTop ? 'border-[#E70F72]/40 bg-[#E70F72]/10' : 'border-white/8 bg-white/3'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black ${isTop ? 'bg-[#E70F72] text-white' : 'bg-white/10 text-white/50'}`}>
                        {i + 1}
                      </span>
                      <p className={`font-bold text-sm flex-1 ${isTop ? 'text-white' : 'text-white/80'}`}>{item.title}</p>
                      <span className={`text-xs font-bold ${isTop ? 'text-[#E70F72]' : 'text-white/30'}`}>{fillPct}%</span>
                    </div>
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-2 ml-9">
                      <div
                        className={`h-full rounded-full transition-all ${isTop ? 'bg-[#E70F72]' : 'bg-white/20'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <p className="text-white/45 text-xs leading-relaxed ml-9">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        <button
          onClick={() => navigate('/Dashboard')}
          className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold py-4 rounded-2xl transition-all text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}