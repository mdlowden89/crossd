import React, { useRef } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import { CrossdButton } from '@/components/ui/crossd-button';

const steps = [
  {
    num: '1',
    label: 'STEP ONE',
    heading: 'Log Your Moments',
    body: "The person at your usual coffee shop. Someone at the gym you keep seeing. That face on your commute you've never spoken to. Check in to the places you go and start building a trail — because the connection you almost made might already be waiting.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E70F72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    num: '2',
    label: 'STEP TWO',
    heading: 'Your Vibe Finds Its Match',
    body: "Our engine reads your patterns — the places you go, the energy you bring — and quietly surfaces people who move through the world the same way you do. No swiping required.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E70F72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    num: '3',
    label: 'STEP THREE',
    heading: 'Like. Match. Actually Talk.',
    body: "Browse people who've shared your world. When the interest is mutual, the conversation opens. No guessing, no ghosting limbo — just a real chance at something real.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E70F72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

const safetyCards = [
  {
    label: 'PRIVACY',
    heading: "Safe Until You're Ready",
    body: 'Once you match, chat securely inside Crossd. Your number, your socials, your business — all yours until you choose to share them.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E70F72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: 'LOCATION',
    heading: 'Your Location Stays Yours',
    body: 'We never share where you are. Crossd works on approximate areas and only connects the dots when both sides are interested.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E70F72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
  },
];

export default function Welcome() {
  const howItWorksRef = useRef(null);

  const handleLogin = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      window.location.href = createPageUrl('Home');
    } else {
      base44.auth.redirectToLogin(createPageUrl('Home'));
    }
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black relative overflow-hidden">
      <StarBackground />

      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16">
        <CrossdLogo size="sm" />
        <div className="flex items-center gap-4">
          <CrossdButton variant="ghost" size="sm" onClick={handleLogin}>Login</CrossdButton>
          <CrossdButton size="sm" onClick={() => window.location.href = createPageUrl('Onboarding')}>Sign Up</CrossdButton>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center max-w-3xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            Crossed Paths?{' '}
            <span className="text-[#E70F72]">Reconnect Now.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed"
          >
            Crossd helps you find and connect with people you've encountered in real life.
            Turn missed connections into meaningful conversations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <CrossdButton
              size="lg"
              onClick={() => window.location.href = createPageUrl('Onboarding')}
              className="min-w-[200px]"
            >
              Join Crossd Today
            </CrossdButton>

            <CrossdButton
              variant="secondary"
              size="lg"
              onClick={scrollToHowItWorks}
              className="min-w-[200px]"
            >
              Learn More ↓
            </CrossdButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="relative z-10 h-[50vh] pointer-events-none"
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696101571241f794c88771c9/76f683a5d_image.png"
          alt="Connection visualization"
          className="w-full h-full object-cover object-top opacity-80"
          style={{
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        />
      </motion.div>

      {/* How It Works Section */}
      <div ref={howItWorksRef} className="relative z-10 max-w-2xl mx-auto px-6 pt-24 pb-32">

        {/* Ambient orbs */}
        <div className="absolute top-0 left-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none" style={{ background: 'rgba(231,15,114,0.09)', filter: 'blur(90px)' }} />
        <div className="absolute bottom-0 right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'rgba(231,15,114,0.07)', filter: 'blur(90px)' }} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-block text-[#E70F72] text-[11px] font-semibold tracking-widest uppercase border border-[#E70F72]/35 rounded-full px-4 py-1.5 mb-6" style={{ background: 'rgba(231,15,114,0.08)' }}>
            HOW IT WORKS
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            You've already met them.<br />
            <span className="text-[#E70F72] font-bold">You just don't know it yet.</span>
          </h2>
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md">
            Crossd finds the connection that was always there — hidden in the places you both call yours.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-5 mb-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-5 items-start"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#E70F72]/40 flex items-center justify-center text-[#E70F72] font-bold text-xl"
                style={{ background: 'rgba(231,15,114,0.08)' }}>
                {step.num}
              </div>
              <div className="flex-1 bg-[#0B0B0B] border border-white/[0.06] rounded-2xl p-7 hover:border-[#E70F72]/40 transition-all duration-300"
                style={{ boxShadow: 'none' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(231,15,114,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E70F72]/30" style={{ background: 'rgba(231,15,114,0.08)' }}>
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">{step.label}</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{step.heading}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {safetyCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#0B0B0B] border border-white/[0.06] rounded-2xl p-6 hover:border-[#E70F72]/40 transition-all duration-300"
              style={{ boxShadow: 'none' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(231,15,114,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E70F72]/30" style={{ background: 'rgba(231,15,114,0.08)' }}>
                  {card.icon}
                </div>
                <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">{card.label}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{card.heading}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <CrossdButton
            size="lg"
            onClick={() => window.location.href = createPageUrl('Onboarding')}
            className="min-w-[220px]"
          >
            Start Crossing Paths →
          </CrossdButton>
          <p className="text-white/40 text-sm mt-4">Free to join · No credit card needed</p>
        </motion.div>
      </div>
    </div>
  );
}