import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import CrossdLogo from '@/components/common/CrossdLogo';
import StarBackground from '@/components/common/StarBackground';
import { CrossdButton } from '@/components/ui/crossd-button';
import HowItWorks from '@/components/welcome/HowItWorks';
import LiveCrossingCounter from '@/components/welcome/LiveCrossingCounter';

export default function Welcome() {
  const [showDetails, setShowDetails] = useState(false);
  const [city, setCity] = useState('');

  useEffect(() => {
    // Best-effort: reverse geocode via a free IP-based service, no key needed
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => { if (d.city) setCity(d.city); })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      window.location.href = createPageUrl('Home');
    } else {
      base44.auth.redirectToLogin(createPageUrl('Home'));
    }
  };

  if (showDetails) {
    return <HowItWorks onBack={() => setShowDetails(false)} />;
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-8"
          >
            <LiveCrossingCounter city={city} />
          </motion.div>

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