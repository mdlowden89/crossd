import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import FlowingGraphic from '@/components/common/FlowingGraphic';
import { CrossdButton } from '@/components/ui/crossd-button';
import SparkIcon from '@/components/common/SparkIcon';
import { MapPin, Sparkles, Heart, Shield, ChevronRight, Lock, EyeOff } from 'lucide-react';

export default function Welcome() {
  const [showDetails, setShowDetails] = useState(false);

  const handleLogin = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      window.location.href = createPageUrl('Home');
    } else {
      base44.auth.redirectToLogin(createPageUrl('Home'));
    }
  };

  if (showDetails) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <StarBackground />
        
        <div className="relative z-10 min-h-screen px-6 py-12 bg-[#0B0B0B]">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <CrossdLogo size="default" />
            <CrossdButton 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              Back
            </CrossdButton>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                How Crossd Works
              </h1>
              <p className="text-white/65 text-lg">
                You've already met them. You just don't know it yet.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#141414] border border-[#E70F72]/25 rounded-2xl p-8"
            >
              <p className="text-[#E70F72] text-xs font-mono font-semibold tracking-widest uppercase mb-6">Feature 01 — Moments</p>
              <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
                Log the person you <span className="text-[#E70F72] italic font-serif">almost</span> spoke to.
              </h3>
              <p className="text-white/65 text-base leading-relaxed mb-8">
                A Moment is a quiet note. The face you keep noticing at the gym. The person reading at your usual café. The smile on the platform you couldn't quite read. You log it. Crossd holds it. If they ever log you back, you'll know.
              </p>
              <div className="space-y-4">
                {[
                  { bold: 'Private by default.', text: 'No one sees your Moments — not even matched users — unless they logged you too.' },
                  { bold: 'Approximate, not exact.', text: 'Locations resolve to neighbourhood-level zones, never coordinates.' },
                  { bold: 'Auto-expires.', text: 'Moments fade after 30 days unless renewed — your trail stays current, not collected.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E70F72] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      <span className="font-bold text-white">{item.bold}</span> {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#141414] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your Vibe Finds Its Match</h3>
              <p className="text-white/65">
                Our engine reads your patterns — the places you go, the energy you bring — and quietly surfaces people who move through the world the same way you do. No swiping required.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#141414] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Like. Match. Actually Talk.</h3>
              <p className="text-white/65">
                Browse people who've shared your world. When the interest is mutual, the conversation opens. No guessing, no ghosting limbo — just a real chance at something real.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#141414] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Keep It Safe Until You're Ready</h3>
              <p className="text-white/65">
                Once you match, chat securely inside Crossd. Your number, your socials, your business — all yours until you choose to share them.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-[#141414] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your Location Stays Yours</h3>
              <p className="text-white/65">
                We never share where you are. Crossd works on approximate areas and only connects the dots when both sides are interested. You stay in control — always.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-8"
            >
              <CrossdButton 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = createPageUrl('Onboarding')}
              >
                <SparkIcon size={20} />
                Start Crossing Paths
              </CrossdButton>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <StarBackground />
      
      {/* Top Navigation */}
      <div className="absolute top-0 right-0 px-6 py-6 flex items-center gap-4 z-20">
        <CrossdButton 
          variant="ghost" 
          size="sm"
          onClick={handleLogin}
        >
          Login
        </CrossdButton>
        <CrossdButton 
          size="sm"
          onClick={() => window.location.href = createPageUrl('Onboarding')}
        >
          Sign Up
        </CrossdButton>
      </div>

      {/* Logo */}
      <div className="absolute top-0 left-0 px-6 py-6 z-20">
        <CrossdLogo size="sm" />
      </div>

      {/* Main Content */}
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
              onClick={() => setShowDetails(true)}
              className="min-w-[200px]"
            >
              Learn More
            </CrossdButton>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-white/45 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E70F72]" />
              <span>Location stays approximate</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E70F72]" />
              <span>Photo-verified profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#E70F72]" />
              <span>No infinite swipe</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Hero Image at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-[50vh] pointer-events-none"
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
    </div>
  );
}