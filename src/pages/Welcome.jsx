import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import MapIllustration from '@/components/common/MapIllustration';
import { CrossdButton } from '@/components/ui/crossd-button';
import SparkIcon from '@/components/common/SparkIcon';
import { MapPin, Sparkles, Heart, Shield, ChevronRight } from 'lucide-react';

export default function Welcome() {
  const [showDetails, setShowDetails] = useState(false);

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
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <CrossdLogo size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="text-white">Crossed Paths?</span>
              <br />
              <span className="text-[#E70F72]">Reconnect Now.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-white/65 text-lg mb-4 leading-relaxed"
          >
            Discover the people you've crossed paths with. 
            Turn missed connections into meaningful matches.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <MapIllustration />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col w-full gap-4 mb-6"
          >
            <CrossdButton 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = createPageUrl('Onboarding')}
            >
              <SparkIcon size={20} />
              Join Crossd Today
            </CrossdButton>
            
            <CrossdButton 
              variant="secondary" 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = createPageUrl('Onboarding')}
            >
              Log In
            </CrossdButton>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={() => setShowDetails(true)}
            className="text-white/65 hover:text-white transition-colors flex items-center gap-2 mb-8"
          >
            Learn how it works
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-white/45 text-sm"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}