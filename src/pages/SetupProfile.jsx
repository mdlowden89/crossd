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
  { q: "The way to win me over is...", eg: "e.g. 'honestly just coffee and a good conversation'" },
  { q: "My ideal Sunday looks like...", eg: "e.g. 'farmers market in the morning, film in the evening'" },
  { q: "I'm looking for someone who...", eg: "e.g. 'makes me laugh and actually texts back'" },
  { q: "Two truths and a lie...", eg: "e.g. 'I've been to 30 countries, I hate cheese, I own a boat'" },
  { q: "My most controversial opinion is...", eg: "e.g. 'Die Hard is not a Christmas film, I'm done arguing'" },
  { q: "I geek out about...", eg: "e.g. 'obscure 70s cinema and sourdough hydration ratios'" },
  { q: "The best trip I've been on...", eg: "e.g. 'solo week in Kyoto — completely changed how I see the world'" },
  { q: "I'm weirdly attracted to...", eg: "e.g. 'people who are really passionate about something, anything'" },
  { q: "My simple pleasures are...", eg: "e.g. 'cold side of the pillow, finding a great playlist'" },
  { q: "A life goal of mine is...", eg: "e.g. 'learn to sail before I turn 35'" },
];

const vibeOptions = [
  'Adventurous', 'Creative', 'Ambitious', 'Chill', 'Intellectual',
  'Spontaneous', 'Romantic', 'Funny', 'Deep', 'Social',
  'Introverted', 'Extroverted', 'Artsy', 'Sporty', 'Foodie'
];

export default function SetupProfile() {
  const [step, setStep] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    return stepParam ? parseInt(stepParam) : 0;
  });
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
    vibe_tags: [],
    age_min: 18,
    age_max: 40,
    hangout_areas: [],
    hangout_input: ''
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
    if (profile.prompts.length < 2 && !profile.prompts.find(p => p.question === question)) {
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

  const addHangoutArea = (area) => {
    const trimmed = area.trim();
    if (trimmed && !profile.hangout_areas.includes(trimmed) && profile.hangout_areas.length < 5) {
      setProfile(prev => ({ ...prev, hangout_areas: [...prev.hangout_areas, trimmed], hangout_input: '' }));
    }
  };

  const removeHangoutArea = (area) => {
    setProfile(prev => ({ ...prev, hangout_areas: prev.hangout_areas.filter(a => a !== area) }));
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
    
    // Check if profile already exists
    const existingProfiles = await base44.entities.Profile.filter({ user_id: user.id });
    
    const { hangout_input, ...profileData } = profile;

    if (existingProfiles.length > 0) {
      await base44.entities.Profile.update(existingProfiles[0].id, profileData);
    } else {
      await base44.entities.Profile.create({
        ...profileData,
        user_id: user.id,
        onboarding_complete: true,
        last_active_at: new Date().toISOString(),
        status: 'active'
      });
    }

    // If came from a specific step (e.g., from Profile page), go back to Profile
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    window.location.href = stepParam ? createPageUrl('Profile') : createPageUrl('MBTIQuiz');
  };

  const steps = [
    { title: 'Add Photos', subtitle: 'Show your best self' },
    { title: 'Basic Info', subtitle: 'Tell us about you' },
    { title: 'Prompts', subtitle: 'Pick up to 2 to share your personality' },
    { title: 'Your Vibe', subtitle: 'Pick up to 5 tags' }
  ];

  const canProceed = () => {
    switch(step) {
      case 0: return profile.photos.length >= 1;
      case 1: return profile.display_name && profile.birthdate && profile.gender && profile.interested_in;
      case 2: return profile.prompts.length >= 1 && profile.prompts.every(p => p.answer.trim());
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
              {/* Tip banner */}
              <div className="flex items-start gap-2.5 rounded-xl bg-[#E70F72]/10 border border-[#E70F72]/25 px-3.5 py-3">
                <span className="text-lg leading-none mt-0.5">📸</span>
                <div>
                  <p className="text-white text-sm font-semibold">Clear face photo = 3× more connections</p>
                  <p className="text-white/50 text-xs mt-0.5">Good lighting, facing camera, no sunglasses.</p>
                </div>
              </div>

              {/* Primary (large) slot + 5 secondary slots */}
              <div className="flex gap-3">
                {/* Primary — tall left column */}
                <div className="flex-shrink-0 w-[52%]" style={{ aspectRatio: '3/4' }}>
                  {profile.photos[0] ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#E70F72]"
                      style={{ boxShadow: '0 0 16px rgba(231,15,114,0.35)' }}>
                      <img src={profile.photos[0].url} alt="Primary" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(0)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="text-xs text-white font-semibold">⭐ Main photo</span>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full rounded-2xl border-2 border-dashed border-[#E70F72]/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#E70F72] transition-colors bg-[#E70F72]/5"
                      style={{ boxShadow: '0 0 20px rgba(231,15,114,0.08)' }}>
                      <div className="w-12 h-12 rounded-full bg-[#E70F72]/15 flex items-center justify-center mb-2">
                        <Camera className="w-6 h-6 text-[#E70F72]" />
                      </div>
                      <span className="text-[#E70F72] text-sm font-semibold">Main Photo</span>
                      <span className="text-white/35 text-xs mt-1 text-center px-4">Your best face-forward shot</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={loading} />
                    </label>
                  )}
                </div>

                {/* Secondary slots — 2 columns × 3 rows */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className={`relative ${index === 5 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                      {profile.photos[index] ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/15">
                          <img src={profile.photos[index].url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(index)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-full rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center cursor-pointer hover:border-white/35 transition-colors">
                          <Plus className="w-5 h-5 text-white/30" />
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={loading} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white/35 text-xs text-center">Add at least 1 photo to continue · Up to 6 total</p>
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
                {profile.birthdate && (() => {
                  const age = Math.floor((new Date() - new Date(profile.birthdate)) / (365.25 * 24 * 60 * 60 * 1000));
                  return age > 0 && age < 120 ? (
                    <p className="text-white/45 text-xs mt-1.5 ml-1">
                      Your profile will show: <span className="text-white/70 font-medium">Age {age}</span>
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Age preference</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-white/40 text-xs mb-1 block">Min</label>
                    <select
                      value={profile.age_min || 18}
                      onChange={(e) => setProfile({ ...profile, age_min: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#E70F72]/50"
                    >
                      {Array.from({ length: 47 }, (_, i) => i + 18).map(n => (
                        <option key={n} value={n} className="bg-black">{n}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-white/30 mt-4">–</span>
                  <div className="flex-1">
                    <label className="text-white/40 text-xs mb-1 block">Max</label>
                    <select
                      value={profile.age_max || 40}
                      onChange={(e) => setProfile({ ...profile, age_max: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#E70F72]/50"
                    >
                      {Array.from({ length: 47 }, (_, i) => i + 18).map(n => (
                        <option key={n} value={n} className="bg-black">{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
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

              <div>
                <label className="text-white/80 text-sm mb-1 block">Where do you usually hang out?</label>
                <p className="text-white/40 text-xs mb-2">Helps us find crossings that feel intentional, not random. Up to 5 areas.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profile.hangout_input}
                    onChange={(e) => setProfile(prev => ({ ...prev, hangout_input: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addHangoutArea(profile.hangout_input);
                      }
                    }}
                    placeholder="e.g. Shoreditch, King's Cross..."
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#E70F72]/50 placeholder:text-white/30"
                  />
                  <button
                    onClick={() => addHangoutArea(profile.hangout_input)}
                    disabled={!profile.hangout_input?.trim()}
                    className="px-3 py-2.5 rounded-xl bg-[#E70F72]/15 text-[#E70F72] border border-[#E70F72]/30 disabled:opacity-30 hover:bg-[#E70F72]/25 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {profile.hangout_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {profile.hangout_areas.map(area => (
                      <span key={area} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/25 text-[#E70F72] text-sm">
                        <MapPin className="w-3 h-3" />
                        {area}
                        <button onClick={() => removeHangoutArea(area)} className="ml-0.5 text-[#E70F72]/60 hover:text-[#E70F72]">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
              {profile.prompts.map((prompt, index) => {
                const meta = promptOptions.find(p => p.q === prompt.question);
                return (
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
                      placeholder={meta?.eg ?? 'Your answer...'}
                      className="w-full bg-transparent text-white resize-none focus:outline-none placeholder:text-white/30 placeholder:italic"
                      rows={3}
                    />
                  </CrossdCard>
                );
              })}

              {profile.prompts.length < 2 && (
                <div className="space-y-2">
                  <p className="text-white/65 text-sm">Choose a prompt ({profile.prompts.length}/2):</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {promptOptions.filter(p => !profile.prompts.find(pp => pp.question === p.q)).map(prompt => (
                      <button
                        key={prompt.q}
                        onClick={() => addPrompt(prompt.q)}
                        className="w-full text-left p-3 rounded-xl border border-white/15 hover:border-[#E70F72]/50 hover:text-white transition-colors group"
                      >
                        <p className="text-white/80 text-sm group-hover:text-white">{prompt.q}</p>
                        <p className="text-white/35 text-xs mt-0.5 italic">{prompt.eg}</p>
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