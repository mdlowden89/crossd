import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ChevronRight, MapPin, Zap, Shield } from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import { CrossdButton } from '@/components/ui/crossd-button';

const slides = [
  {
    id: 'hook',
    eyebrow: 'You just crossed paths.',
    headline: `You've already met\nyour next connection.`,
    body: `That person at the coffee shop. The one at the gallery. The stranger whose eyes met yours on the train.\n\nThey were real. The moment was real.\n\nCrossd makes it mean something.`,
    cta: 'Tell me more',
    bg: 'from-[#0B0B0B] via-[#12020a] to-[#0B0B0B]',
    icon: null,
    accent: '#E70F72',
  },
  {
    id: 'value',
    eyebrow: 'How it works',
    headline: 'Most apps match\nstrangers. We\nreconnect moments.',
    body: null,
    cta: 'Start my story',
    bg: 'from-[#0B0B0B] via-[#07060f] to-[#0B0B0B]',
    features: [
      {
        icon: MapPin,
        color: '#E70F72',
        title: 'Log a Moment',
        desc: 'Check in where you are. Build a trail of real places.',
      },
      {
        icon: Zap,
        color: '#F97316',
        title: 'Discover a Crossing',
        desc: 'We detect when you were near someone compatible.',
      },
      {
        icon: Shield,
        color: '#22C55E',
        title: 'Your rules, always',
        desc: 'Your exact location is never shared. You\'re in control.',
      },
    ],
  },
];

export default function IntroStory() {
  const [slide, setSlide] = useState(0);
  const [checked, setChecked] = useState(false);

  // Skip if already authenticated (returning user)
  useEffect(() => {
    base44.auth.isAuthenticated().then((isAuth) => {
      if (isAuth) {
        window.location.href = createPageUrl('Home');
      } else {
        setChecked(true);
      }
    });
  }, []);

  const handleCta = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      window.location.href = createPageUrl('Welcome');
    }
  };

  if (!checked) return null;

  const current = slides[slide];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${current.bg} relative overflow-hidden flex flex-col`}>
      <StarBackground />

      {/* Logo + skip */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8">
        <CrossdLogo size="sm" />
        <button
          onClick={() => window.location.href = createPageUrl('Welcome')}
          className="text-white/40 text-sm hover:text-white/70 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide dots */}
      <div className="relative z-10 flex justify-center gap-2 mt-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === slide ? 24 : 8,
              background: i === slide ? '#E70F72' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Eyebrow */}
            <p className="text-[#E70F72] text-sm font-semibold tracking-widest uppercase">
              {current.eyebrow}
            </p>

            {/* Headline */}
            <h1 className="text-4xl font-bold text-white leading-tight whitespace-pre-line">
              {current.headline}
            </h1>

            {/* Body text */}
            {current.body && (
              <p className="text-white/60 text-lg leading-relaxed whitespace-pre-line">
                {current.body}
              </p>
            )}

            {/* Feature cards */}
            {current.features && (
              <div className="space-y-3 mt-2">
                {current.features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}22` }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{f.title}</p>
                      <p className="text-white/50 text-sm mt-0.5">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 pb-12 max-w-md mx-auto w-full">
        <CrossdButton onClick={handleCta} className="w-full" size="lg">
          {current.cta}
          <ChevronRight className="w-5 h-5 ml-1" />
        </CrossdButton>
      </div>
    </div>
  );
}