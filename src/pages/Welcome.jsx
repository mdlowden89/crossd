import React from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import { CrossdButton } from '@/components/ui/crossd-button';
import SparkIcon from '@/components/common/SparkIcon';

export default function Welcome() {
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
            className="text-white/65 text-lg mb-8 leading-relaxed"
          >
            Discover the people you've crossed paths with. 
            Turn missed connections into meaningful matches.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col w-full gap-4"
          >
            <CrossdButton 
              className="w-full" 
              size="lg"
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
            >
              <SparkIcon size={20} />
              Join Crossd Today
            </CrossdButton>
            
            <CrossdButton 
              variant="secondary" 
              className="w-full" 
              size="lg"
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
            >
              Log In
            </CrossdButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-white/45 text-sm mt-8"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}