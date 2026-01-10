import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Bell, Sparkles } from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import { CrossdButton } from '@/components/ui/crossd-button';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Crossd',
    description: 'Where missed connections become meaningful matches.',
    icon: Sparkles,
    content: (
      <div className="space-y-4 text-center">
        <p className="text-white/65">
          Crossd helps you reconnect with people you've crossed paths with in real life.
        </p>
        <p className="text-white/65">
          Log moments, discover crossings, and turn chance encounters into something more.
        </p>
      </div>
    )
  },
  {
    id: 'location',
    title: 'Enable Location',
    description: 'Required for discovering crossings',
    icon: MapPin,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 mx-auto bg-[#E70F72]/20 rounded-full flex items-center justify-center">
          <MapPin className="w-10 h-10 text-[#E70F72]" />
        </div>
        <p className="text-white/65">
          We use your location to detect when you've crossed paths with someone.
        </p>
        <p className="text-white/45 text-sm">
          Your precise location is never shared with other users.
        </p>
      </div>
    ),
    action: 'Enable Location'
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get notified about second chances',
    icon: Bell,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 mx-auto bg-[#E70F72]/20 rounded-full flex items-center justify-center">
          <Bell className="w-10 h-10 text-[#E70F72]" />
        </div>
        <p className="text-white/65">
          Receive alerts when you cross paths with someone special, or when you get a match.
        </p>
        <p className="text-white/45 text-sm">
          You can customize notifications anytime in settings.
        </p>
      </div>
    ),
    action: 'Enable Notifications'
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleAction = async () => {
    const step = steps[currentStep];
    
    if (step.id === 'location') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationEnabled(true);
            setCurrentStep(currentStep + 1);
          },
          () => {
            // Location denied, continue anyway
            setCurrentStep(currentStep + 1);
          }
        );
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else if (step.id === 'notifications') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
      }
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      window.location.href = createPageUrl('SetupProfile');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep] || steps[0];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-black px-6 py-8 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8">
          <CrossdLogo size="sm" />
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-[#E70F72]' : 
                index < currentStep ? 'bg-[#E70F72]/50' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-white/65">{currentStepData.description}</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {currentStepData.content}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 space-y-4">
          {currentStepData.action ? (
            <CrossdButton onClick={handleAction} className="w-full" size="lg">
              {currentStepData.action}
            </CrossdButton>
          ) : null}

          <div className="flex gap-4">
            {currentStep > 0 && (
              <CrossdButton 
                variant="ghost" 
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </CrossdButton>
            )}
            
            <CrossdButton 
              variant={currentStepData.action ? 'secondary' : 'primary'}
              onClick={handleNext}
              className="flex-1"
              size="lg"
            >
              {isLastStep ? 'Set Up Profile' : currentStepData.action ? 'Skip' : 'Continue'}
              {!isLastStep && <ChevronRight className="w-5 h-5 ml-1" />}
            </CrossdButton>
          </div>
        </div>
      </div>
    </div>
  );
}