import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Bell, Sparkles, Heart, Zap } from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import { CrossdButton } from '@/components/ui/crossd-button';

// ── Step visuals ──────────────────────────────────────────────────────────────

function WelcomeVisual() {
  const nodes = [
    { x: '20%', y: '25%', delay: 0 },
    { x: '75%', y: '18%', delay: 0.3 },
    { x: '55%', y: '60%', delay: 0.6 },
    { x: '15%', y: '70%', delay: 0.9 },
    { x: '80%', y: '72%', delay: 0.5 },
  ];

  return (
    <div className="relative w-full h-56 mx-auto">
      {/* Glowing centre */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#E70F72] blur-2xl opacity-50"
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#E70F72] flex items-center justify-center z-10">
        <Heart className="w-7 h-7 text-white fill-white" />
      </div>

      {/* Orbit nodes */}
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: n.delay + 0.4, duration: 0.4 }}
          style={{ left: n.x, top: n.y }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E70F72] to-[#ff6faa] opacity-80" />
          </motion.div>
        </motion.div>
      ))}

      {/* Connecting lines SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="rgba(231,15,114,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="75%" y2="18%" stroke="rgba(231,15,114,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="55%" y2="60%" stroke="rgba(231,15,114,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="15%" y2="70%" stroke="rgba(231,15,114,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="80%" y2="72%" stroke="rgba(231,15,114,0.2)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}

function WelcomeVisualBoxed() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#E70F72]/20"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #220010 0%, #0a0008 100%)' }}>
      <WelcomeVisual />
    </div>
  );
}

function LocationVisual() {
  const [notifVisible, setNotifVisible] = useState(false);
  const [phase, setPhase] = useState(0); // 0=apart, 1=approaching, 2=crossed

  useEffect(() => {
    const t = setTimeout(() => setNotifVisible(true), 600);
    const p1 = setTimeout(() => setPhase(1), 400);
    const p2 = setTimeout(() => setPhase(2), 1400);
    return () => { clearTimeout(t); clearTimeout(p1); clearTimeout(p2); };
  }, []);

  // Street/city landmarks
  const landmarks = [
    { x: '18%', y: '30%', label: 'Café', color: '#a78bfa' },
    { x: '72%', y: '55%', label: 'Park', color: '#34d399' },
    { x: '30%', y: '70%', label: 'Station', color: '#60a5fa' },
    { x: '78%', y: '22%', label: 'Bar', color: '#f59e0b' },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Map mockup */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-white/10"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, #0f0a1e 0%, #080810 100%)' }}>

        {/* Street network SVG */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.35 }}>
          {/* Horizontal streets */}
          <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#4338ca" strokeWidth="6" />
          <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#4338ca" strokeWidth="3" />
          <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#312e81" strokeWidth="2" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#312e81" strokeWidth="2" />
          {/* Vertical streets */}
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#4338ca" strokeWidth="6" />
          <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#4338ca" strokeWidth="3" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#312e81" strokeWidth="2" />
          {/* Diagonal road */}
          <line x1="0" y1="100%" x2="60%" y2="0" stroke="#3730a3" strokeWidth="2" />
          {/* City blocks (filled rects) */}
          <rect x="26%" y="21%" width="33%" height="13%" fill="#1e1b4b" opacity="0.6" />
          <rect x="61%" y="36%" width="18%" height="28%" fill="#1e1b4b" opacity="0.6" />
          <rect x="0%" y="36%" width="24%" height="28%" fill="#1e1b4b" opacity="0.5" />
          <rect x="26%" y="66%" width="33%" height="13%" fill="#1e1b4b" opacity="0.5" />
        </svg>

        {/* Landmark dots */}
        {landmarks.map((lm, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: lm.x, top: lm.y }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full" style={{ background: lm.color, boxShadow: `0 0 6px ${lm.color}` }} />
              <span className="text-[8px] font-medium" style={{ color: lm.color }}>{lm.label}</span>
            </div>
          </motion.div>
        ))}

        {/* Pulse zone at crossing point */}
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute rounded-full bg-[#E70F72]"
          style={{ left: '25%', top: '35%', width: 32, height: 32, transform: 'translate(-50%,-50%)' }}
        />

        {/* User A — moves toward crossing */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-full"
          animate={{ left: phase >= 1 ? '25%' : '10%', top: phase >= 1 ? '35%' : '55%' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{ left: '10%', top: '55%' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#E70F72] flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(231,15,114,0.7)' }}>
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="w-1.5 h-1.5 bg-[#E70F72] rounded-full mx-auto -mt-0.5" />
        </motion.div>

        {/* User B — moves toward crossing from opposite side */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-full"
          animate={{ left: phase >= 1 ? '25%' : '70%', top: phase >= 1 ? '35%' : '18%' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{ left: '70%', top: '18%' }}
        >
          <div className="w-8 h-8 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full mx-auto -mt-0.5" />
        </motion.div>

        {/* CROSSED badge */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-1/2 bottom-3 -translate-x-1/2"
            >
              <div className="flex items-center gap-1.5 bg-[#E70F72] rounded-full px-3 py-1 shadow-lg"
                style={{ boxShadow: '0 0 20px rgba(231,15,114,0.6)' }}>
                <Zap className="w-3 h-3 text-white fill-white" />
                <span className="text-white text-xs font-bold tracking-wider">PATHS CROSSED</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mock notification */}
      <AnimatePresence>
        {notifVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl border border-[#E70F72]/25 bg-[#E70F72]/8 backdrop-blur-sm p-4 text-left"
            style={{ boxShadow: '0 0 30px rgba(231,15,114,0.12)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E70F72] flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ boxShadow: '0 0 16px rgba(231,15,114,0.5)' }}>
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#E70F72] text-xs font-semibold">Crossd</span>
                  <span className="text-white/30 text-xs">· just now</span>
                </div>
                <p className="text-white text-sm font-semibold">You crossed paths with someone ✨</p>
                <p className="text-white/55 text-xs mt-0.5">Near Waterloo Station this morning — want to say hi?</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-white/40 text-xs text-center">Your precise location is never shared with other users.</p>
    </div>
  );
}

function NotificationsVisual() {
  const notifications = [
    { icon: '⚡', text: 'You crossed paths with someone at Borough Market', time: '5m ago', color: '#E70F72' },
    { icon: '💬', text: 'Alex sent you a message', time: '12m ago', color: '#a855f7' },
    { icon: '❤️', text: 'Someone liked your profile', time: '1h ago', color: '#ec4899' },
  ];

  return (
    <div className="w-full space-y-3">
      {notifications.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.18 + 0.2, duration: 0.4 }}
          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3.5"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${n.color}22`, border: `1px solid ${n.color}44` }}>
            {n.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm leading-snug line-clamp-1">{n.text}</p>
            <p className="text-white/35 text-xs mt-0.5">{n.time}</p>
          </div>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
        </motion.div>
      ))}
    </div>
  );
}

function CrossingHistoryVisual() {
  const mockProfiles = [
    { initials: 'S', age: 26, distance: '0.2mi', crossings: 3, color: '#E70F72' },
    { initials: 'J', age: 29, distance: '0.5mi', crossings: 1, color: '#a855f7' },
    { initials: 'M', age: 24, distance: '0.8mi', crossings: 2, color: '#ec4899' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Counter badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-fit flex items-center gap-2 rounded-full px-4 py-2 border border-[#E70F72]/40 bg-[#E70F72]/10"
        style={{ boxShadow: '0 0 30px rgba(231,15,114,0.2)' }}
      >
        <Zap className="w-4 h-4 text-[#E70F72] fill-[#E70F72]" />
        <span className="text-white font-bold text-sm">3 crossings</span>
        <span className="text-white/50 text-sm">this week</span>
      </motion.div>

      {/* Blurred profile cards */}
      <div className="space-y-3">
        {mockProfiles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
            className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-3.5 overflow-hidden"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
              style={{ background: `linear-gradient(135deg, ${p.color}88, ${p.color}44)`, border: `1px solid ${p.color}55`, filter: 'blur(6px)' }}>
              {p.initials}
            </div>

            {/* Info — blurred */}
            <div className="flex-1 min-w-0" style={{ filter: 'blur(5px)', userSelect: 'none' }}>
              <div className="h-3.5 w-24 rounded bg-white/30 mb-1.5" />
              <div className="h-2.5 w-16 rounded bg-white/15" />
            </div>

            {/* Crossing count pill */}
            <div className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>
              ×{p.crossings}
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-end pr-14 pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                <span className="text-white/60 text-xs">🔒</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-white/40 text-xs">Complete your profile to unlock these connections</p>
    </div>
  );
}

// ── Step data ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'welcome',
    eyebrow: 'Welcome',
    title: 'Missed someone?',
    titleAccent: "Now you won't.",
    description: 'Crossd connects you with people you\'ve already crossed paths with in real life.',
    visual: <WelcomeVisualBoxed />,
    gradient: 'from-[#E70F72]/20 via-transparent to-transparent',
  },
  {
    id: 'location',
    eyebrow: 'Step 1 of 2',
    title: 'Know when paths',
    titleAccent: 'cross.',
    description: 'Enable location so Crossd can detect when you\'ve been in the same place as someone.',
    visual: <LocationVisual />,
    action: 'Enable Location',
    gradient: 'from-[#E70F72]/15 via-transparent to-transparent',
  },
  {
    id: 'notifications',
    eyebrow: 'Step 2 of 2',
    title: 'Never miss a',
    titleAccent: 'second chance.',
    description: 'Get notified the moment you cross paths with someone or receive a match.',
    visual: <NotificationsVisual />,
    action: 'Enable Notifications',
    gradient: 'from-purple-500/15 via-transparent to-transparent',
  },
  {
    id: 'teaser',
    eyebrow: 'Already happening',
    title: 'They\'re already',
    titleAccent: 'out there.',
    description: 'You\'ve crossed paths 3 times this week. Complete your profile to see who — and connect.',
    visual: <CrossingHistoryVisual />,
    gradient: 'from-[#E70F72]/25 via-purple-900/10 to-transparent',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const advanceOrFinish = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      navigate('/SetupProfile');
    }
  };

  const handleAction = async () => {
    const step = STEPS[currentStep];
    if (step.id === 'location') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            sessionStorage.setItem('crossd_location', JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }));
            advanceOrFinish();
          },
          () => advanceOrFinish(),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        advanceOrFinish();
      }
    } else if (step.id === 'notifications') {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      advanceOrFinish();
    } else {
      advanceOrFinish();
    }
  };

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${step.gradient} pointer-events-none transition-all duration-700`} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#E70F72]/8 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col flex-1 max-w-md mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <CrossdLogo size="sm" />
          <button
            onClick={() => navigate('/SetupProfile')}
            className="text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#E70F72]"
                initial={{ width: '0%' }}
                animate={{ width: i <= currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Eyebrow */}
            <p className="text-[#E70F72] text-xs font-semibold tracking-widest uppercase mb-3">
              {step.eyebrow}
            </p>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white leading-tight mb-1">
              {step.title}
            </h1>
            <h1 className="text-4xl font-bold leading-tight mb-4"
              style={{ background: 'linear-gradient(135deg, #E70F72 0%, #ff6faa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {step.titleAccent}
            </h1>

            <p className="text-white/50 text-sm leading-relaxed mb-8">{step.description}</p>

            {/* Visual */}
            <div className="flex-1 flex items-center justify-center">
              {step.visual}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {step.action && (
            <CrossdButton onClick={handleAction} className="w-full" size="lg">
              {step.action}
            </CrossdButton>
          )}

          <div className="flex gap-3">
            {currentStep > 0 && (
              <CrossdButton
                variant="ghost"
                onClick={() => setCurrentStep(s => s - 1)}
                className="flex-none px-4"
              >
                <ChevronLeft className="w-5 h-5" />
              </CrossdButton>
            )}

            <CrossdButton
              variant={step.action ? 'secondary' : 'primary'}
              onClick={step.action ? advanceOrFinish : handleAction}
              className="flex-1"
              size="lg"
            >
              {isLast ? 'Complete My Profile →' : step.action ? 'Skip for now' : 'Continue'}
              {!step.action && <ChevronRight className="w-4 h-4 ml-1" />}
            </CrossdButton>
          </div>
        </div>
      </div>
    </div>
  );
}