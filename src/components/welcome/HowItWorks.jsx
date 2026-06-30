import React, { useRef, useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import { CrossdButton } from '@/components/ui/crossd-button';
import { motion } from 'framer-motion';

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
    heading: 'Safe Until You\'re Ready',
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

function StepCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex gap-5 items-start"
    >
      {/* Number bubble */}
      <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#E70F72]/40 bg-[#E70F72]/08 flex items-center justify-center text-[#E70F72] font-bold text-xl"
        style={{ background: 'rgba(231,15,114,0.08)' }}>
        {step.num}
      </div>

      {/* Card */}
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
  );
}

function SafetyCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
  );
}

export default function HowItWorks({ onBack }) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <StarBackground />

      {/* Ambient orbs */}
      <div className="fixed top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none z-0" style={{ background: 'rgba(231,15,114,0.09)', filter: 'blur(90px)' }} />
      <div className="fixed bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none z-0" style={{ background: 'rgba(231,15,114,0.07)', filter: 'blur(90px)' }} />

      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 border-b border-white/[0.08]" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
        <CrossdLogo size="sm" />
        <CrossdButton variant="ghost" size="sm" onClick={onBack}>← Back</CrossdButton>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            How It Works
          </h1>
          <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-md mx-auto mb-2">
            You've already met them.<br />
            <span className="text-white/40">You just don't know it yet.</span>
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-5 mb-10">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>

        {/* Safety cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {safetyCards.map((card, i) => (
            <SafetyCard key={i} card={card} index={i} />
          ))}
        </div>

        {/* CTA */}
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