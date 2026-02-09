import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import FlowingGraphic from '@/components/common/FlowingGraphic';
import { CrossdButton } from '@/components/ui/crossd-button';
import SparkIcon from '@/components/common/SparkIcon';
import { MapPin, Sparkles, Heart, Shield, ChevronRight } from 'lucide-react';

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
        
        <div className="relative z-10 min-h-screen px-6 py-12">
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
                Transform your daily encounters into meaningful connections
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Log Your Moments</h3>
              <p className="text-white/65">
                Check in at places you visit. Build your trail of locations throughout your day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Discover Crossings</h3>
              <p className="text-white/65">
                When you and someone else are at the same place around the same time, it's a crossing. 
                We'll notify you of potential connections.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Match & Connect</h3>
              <p className="text-white/65">
                Browse profiles, like people you find interesting. When it's mutual, you can start chatting 
                and turn that missed connection into something real.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] border border-[#E70F72]/25 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#E70F72]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
              <p className="text-white/65">
                Your exact location is never shared. We use approximate areas and only reveal crossings 
                when there's mutual interest. You're always in control.
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
                Get Started
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
        </motion.div>
      </div>

      {/* Flowing Graphic at bottom */}
      <FlowingGraphic />
    </div>
  );
}