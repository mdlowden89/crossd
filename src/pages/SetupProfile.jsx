import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Plus, X, ChevronRight, ChevronLeft, 
  User, Calendar, Heart, Briefcase, MapPin 
} from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdInput } from '@/components/ui/crossd-input';
import { CrossdCard } from '@/components/ui/crossd-card';

const genderOptions = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

const interestOptions = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'everyone', label: 'Everyone' }
];

const promptOptions = [
  "The way to win me over is...",
  "My ideal Sunday looks like...",
  "I'm looking for someone who...",
  "Two truths and a lie...",
  "My most controversial opinion is...",
  "I geek out about...",
  "The best trip I've been on...",
  "I'm weirdly attracted to...",
  "My simple pleasures are...",
  "A life goal of mine is..."
];

const vibeOptions = [
  'Adventurous', 'Creative', 'Ambitious', 'Chill', 'Intellectual',
  'Spontaneous', 'Romantic', 'Funny', 'Deep', 'Social',
  'Introverted', 'Extroverted', 'Artsy', 'Sporty', 'Foodie'
];

export default function SetupProfile() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    birthdate: '',
    gender: '',
    interested_in: '',
    bio: '',
    job_title: '',
    city: '',
    photos: [],
    prompts: [],
    vibe_tags: []
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    if (user?.full_name) {
      setProfile(prev => ({ ...prev, display_name: user.full_name }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfile(prev => ({
      ...prev,
      photos: [...prev.photos, { url: file_url, order: prev.photos.length, is_primary: prev.photos.length === 0 }]
    }));
    setLoading(false);
  };

  const removePhoto = (index) => {
    setProfile(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index).map((p, i) => ({
        ...p,
        order: i,
        is_primary: i === 0
      }))
    }));
  };

  const addPrompt = (question) => {
    if (profile.prompts.length < 3 && !profile.prompts.find(p => p.question === question)) {
      setProfile(prev => ({
        ...prev,
        prompts: [...prev.prompts, { question, answer: '' }]
      }));
    }
  };

  const updatePromptAnswer = (index, answer) => {
    setProfile(prev => ({
      ...prev,
      prompts: prev.prompts.map((p, i) => i === index ? { ...p, answer } : p)
    }));
  };

  const removePrompt = (index) => {
    setProfile(prev => ({
      ...prev,
      prompts: prev.prompts.filter((_, i) => i !== index)
    }));
  };

  const toggleVibe = (vibe) => {
    setProfile(prev => ({
      ...prev,
      vibe_tags: prev.vibe_tags.includes(vibe)
        ? prev.vibe_tags.filter(v => v !== vibe)
        : prev.vibe_tags.length < 5
          ? [...prev.vibe_tags, vibe]
          : prev.vibe_tags
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    
    await base44.entities.Profile.create({
      ...profile,
      user_id: user.id,
      onboarding_complete: true,
      last_active_at: new Date().toISOString(),
      status: 'active'
    });

    window.location.href = createPageUrl('MBTIQuiz');
  };

  const steps = [
    { title: 'Add Photos', subtitle: 'Show your best self' },
    { title: 'Basic Info', subtitle: 'Tell us about you' },
    { title: 'Prompts', subtitle: 'Share your personality' },
    { title: 'Your Vibe', subtitle: 'Pick up to 5 tags' }
  ];

  const canProceed = () => {
    switch(step) {
      case 0: return profile.photos.length >= 1;
      case 1: return profile.display_name && profile.birthdate && profile.gender && profile.interested_in;
      case 2: return profile.prompts.length >= 1 && profile.prompts.every(p => p.answer);
      case 3: return profile.vibe_tags.length >= 1;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <CrossdLogo size="sm" />
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index === step ? 'bg-[#E70F72] text-black' :
                index < step ? 'bg-[#E70F72]/30 text-[#E70F72]' : 'bg-white/10 text-white/40'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${index < step ? 'bg-[#E70F72]/30' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white">{steps[step].title}</h1>
          <p className="text-white/65">{steps[step].subtitle}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 0: Photos */}
          {step === 0 && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="aspect-[3/4] relative">
                    {profile.photos[index] ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <img
                          src={profile.photos[index].url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 text-xs bg-[#E70F72] text-black px-2 py-0.5 rounded-full font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                    ) : (
                      <label className="w-full h-full rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#E70F72]/50 transition-colors">
                        <Plus className="w-6 h-6 text-white/40" />
                        <span className="text-white/40 text-xs mt-1">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-white/45 text-sm text-center">
                Add at least 1 photo. First photo is your primary.
              </p>
            </motion.div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <label className="text-white/80 text-sm mb-2 block">Display Name</label>
                <CrossdInput
                  placeholder="Your name"
                  icon={User}
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Birthday</label>
                <CrossdInput
                  type="date"
                  icon={Calendar}
                  value={profile.birthdate}
                  onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setProfile({ ...profile, gender: option.value })}
                      className={`p-3 rounded-xl border transition-colors ${
                        profile.gender === option.value
                          ? 'border-[#E70F72] bg-[#E70F72]/10 text-[#E70F72]'
                          : 'border-white/15 text-white/65 hover:border-white/30'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">I'm interested in...</label>
                <div className="grid grid-cols-3 gap-3">
                  {interestOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setProfile({ ...profile, interested_in: option.value })}
                      className={`p-3 rounded-xl border transition-colors ${
                        profile.interested_in === option.value
                          ? 'border-[#E70F72] bg-[#E70F72]/10 text-[#E70F72]'
                          : 'border-white/15 text-white/65 hover:border-white/30'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Job Title (optional)</label>
                <CrossdInput
                  placeholder="What do you do?"
                  icon={Briefcase}
                  value={profile.job_title}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">City (optional)</label>
                <CrossdInput
                  placeholder="Where are you based?"
                  icon={MapPin}
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Prompts */}
          {step === 2 && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {profile.prompts.map((prompt, index) => (
                <CrossdCard key={index} className="relative">
                  <button
                    onClick={() => removePrompt(index)}
                    className="absolute top-3 right-3 p-1 text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-[#E70F72] text-sm font-medium mb-2">{prompt.question}</p>
                  <textarea
                    value={prompt.answer}
                    onChange={(e) => updatePromptAnswer(index, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full bg-transparent text-white resize-none focus:outline-none"
                    rows={3}
                  />
                </CrossdCard>
              ))}

              {profile.prompts.length < 3 && (
                <div className="space-y-2">
                  <p className="text-white/65 text-sm">Choose a prompt:</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {promptOptions.filter(p => !profile.prompts.find(pp => pp.question === p)).map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => addPrompt(prompt)}
                        className="w-full text-left p-3 rounded-xl border border-white/15 text-white/65 hover:border-[#E70F72]/50 hover:text-white transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Vibes */}
          {step === 3 && (
            <motion.div
              key="vibes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map(vibe => (
                  <button
                    key={vibe}
                    onClick={() => toggleVibe(vibe)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      profile.vibe_tags.includes(vibe)
                        ? 'border-[#E70F72] bg-[#E70F72]/20 text-[#E70F72]'
                        : 'border-white/15 text-white/65 hover:border-white/30'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
              <p className="text-white/45 text-sm text-center">
                Selected: {profile.vibe_tags.length}/5
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <CrossdButton variant="ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </CrossdButton>
          )}
          
          <CrossdButton
            className="flex-1"
            onClick={() => step < 3 ? setStep(step + 1) : handleSave()}
            disabled={!canProceed() || loading}
            loading={loading}
          >
            {step < 3 ? 'Continue' : 'Complete Profile'}
            {step < 3 && <ChevronRight className="w-5 h-5 ml-1" />}
          </CrossdButton>
        </div>
      </div>
    </div>
  );
}