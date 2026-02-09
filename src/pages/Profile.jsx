import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Camera, Edit2, BadgeCheck, Sparkles, Plus, X,
  ChevronRight, Upload, User, MapPin, Briefcase, Ruler, GraduationCap, Heart, Cake, Wand2
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdProgressRing } from '@/components/ui/crossd-progress-ring';
import { CrossdInput } from '@/components/ui/crossd-input';
import { CrossdModal } from '@/components/ui/crossd-modal';

export default function Profile() {
  const [myProfile, setMyProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) {
      setMyProfile(profiles[0]);
      setEditedProfile(profiles[0]);
    }
  };

  // Calculate profile completion
  const calculateCompletion = (profile) => {
    if (!profile) return 0;
    const checks = [
      profile.display_name,
      profile.birthdate,
      profile.gender,
      profile.interested_in,
      profile.photos?.length >= 1,
      profile.photos?.length >= 3,
      profile.prompts?.length >= 1,
      profile.prompts?.length >= 2,
      profile.vibe_tags?.length >= 1,
      profile.bio,
      profile.verification_status === 'verified'
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const completionPercentage = calculateCompletion(myProfile);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Profile.update(myProfile.id, data);
    },
    onSuccess: () => {
      loadProfile();
      setEditMode(false);
      queryClient.invalidateQueries(['my-profile']);
    }
  });

  // Photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const newPhotos = [
      ...(editedProfile?.photos || []),
      { url: file_url, order: editedProfile?.photos?.length || 0, is_primary: !editedProfile?.photos?.length }
    ];
    
    setEditedProfile({ ...editedProfile, photos: newPhotos });
    await updateProfileMutation.mutateAsync({ photos: newPhotos });
    setUploadingPhoto(false);
  };

  const removePhoto = async (index) => {
    const newPhotos = editedProfile.photos
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, order: i, is_primary: i === 0 }));
    
    setEditedProfile({ ...editedProfile, photos: newPhotos });
    await updateProfileMutation.mutateAsync({ photos: newPhotos });
  };

  const saveChanges = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const generateBioWithAI = async () => {
    if (!myProfile.vibe_tags || myProfile.vibe_tags.length === 0) {
      alert('Add some vibe tags first to generate a bio!');
      return;
    }

    setGeneratingBio(true);
    try {
      const vibeTags = myProfile.vibe_tags.join(', ');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a short, engaging dating profile bio (2-3 sentences max) for someone with these vibe tags: ${vibeTags}. Make it authentic, fun, and conversational. Don't use hashtags or emojis. Just write natural, first-person text.`,
      });
      
      setEditedProfile({ ...editedProfile, bio: response });
    } catch (error) {
      alert('Failed to generate bio. Please try again.');
    } finally {
      setGeneratingBio(false);
    }
  };

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photos = myProfile.photos || [];
  const age = myProfile.birthdate
    ? Math.floor((new Date() - new Date(myProfile.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <CrossdButton
          variant={editMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => editMode ? saveChanges() : setEditMode(true)}
          loading={updateProfileMutation.isPending}
        >
          {editMode ? 'Save' : 'Edit'}
        </CrossdButton>
      </div>

      {/* Profile Completion */}
      {completionPercentage < 100 && (
        <CrossdCard className="mb-6">
          <div className="flex items-center gap-4">
            <CrossdProgressRing percentage={completionPercentage} size={70} strokeWidth={6} />
            <div className="flex-1">
              <h3 className="font-medium text-white">Profile Strength</h3>
              <p className="text-white/65 text-sm">Complete your profile to get more matches</p>
            </div>
          </div>
        </CrossdCard>
      )}

      {/* Photos */}
      <div className="mb-6">
        <h2 className="text-white/65 text-sm font-medium mb-3">Photos</h2>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="aspect-[3/4] relative">
              {photos[index] ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <img
                    src={photos[index].url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {editMode && (
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 text-xs bg-[#E70F72] text-black px-2 py-0.5 rounded-full font-medium">
                      Primary
                    </span>
                  )}
                </div>
              ) : editMode || photos.length === index ? (
                <label className="w-full h-full rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#E70F72]/50 transition-colors">
                  {uploadingPhoto ? (
                    <div className="w-6 h-6 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-white/40" />
                      <span className="text-white/40 text-xs mt-1">Add</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              ) : (
                <div className="w-full h-full rounded-xl border-2 border-dashed border-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4 mb-6">
        <h2 className="text-white/65 text-sm font-medium">Basic Info</h2>
        
        <CrossdCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-white/40" />
              <div className="flex-1">
                <p className="text-white/50 text-sm">Name</p>
                {editMode ? (
                  <CrossdInput
                    value={editedProfile?.display_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, display_name: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-white">{myProfile.display_name}</p>
                )}
              </div>
            </div>
            {myProfile.verification_status === 'verified' && (
              <BadgeCheck className="w-5 h-5 text-[#E70F72]" />
            )}
          </div>
        </CrossdCard>

        <CrossdCard>
          <div className="flex items-center gap-3">
            <Cake className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <p className="text-white/50 text-sm">{editMode ? 'Birthdate' : 'Age'}</p>
              {editMode ? (
                <CrossdInput
                  type="date"
                  value={editedProfile?.birthdate || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, birthdate: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-white">{age || 'Not set'}</p>
              )}
            </div>
          </div>
        </CrossdCard>

        <CrossdCard>
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <p className="text-white/50 text-sm">Interested In</p>
              {editMode ? (
                <select
                  value={editedProfile?.interested_in || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, interested_in: e.target.value })}
                  className="w-full bg-transparent text-white mt-1 focus:outline-none"
                >
                  <option value="" className="bg-[#0B0B0B]">Select...</option>
                  <option value="everyone" className="bg-[#0B0B0B]">Everyone</option>
                  <option value="men" className="bg-[#0B0B0B]">Men</option>
                  <option value="women" className="bg-[#0B0B0B]">Women</option>
                  <option value="men_and_women" className="bg-[#0B0B0B]">Men & Women</option>
                </select>
              ) : (
                <p className="text-white capitalize">{myProfile.interested_in?.replace('_', ' & ') || 'Not set'}</p>
              )}
            </div>
          </div>
        </CrossdCard>

        <CrossdCard>
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <p className="text-white/50 text-sm">Height</p>
              {editMode ? (
                <div className="flex gap-2 items-center mt-1">
                  <CrossdInput
                    type="number"
                    value={editedProfile?.height || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, height: parseInt(e.target.value) || null })}
                    placeholder="170"
                    className="w-20"
                  />
                  <span className="text-white/65">cm</span>
                </div>
              ) : (
                <p className="text-white">{myProfile.height ? `${myProfile.height} cm` : 'Not set'}</p>
              )}
            </div>
          </div>
        </CrossdCard>

        <CrossdCard>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <p className="text-white/50 text-sm">University</p>
              {editMode ? (
                <CrossdInput
                  value={editedProfile?.university || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                  placeholder="Which university did you attend?"
                  className="mt-1"
                />
              ) : (
                <p className="text-white">{myProfile.university || 'Not set'}</p>
              )}
            </div>
          </div>
        </CrossdCard>

        <CrossdCard>
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <p className="text-white/50 text-sm">Job Title</p>
              {editMode ? (
                <CrossdInput
                  value={editedProfile?.job_title || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, job_title: e.target.value })}
                  placeholder="What do you do?"
                  className="mt-1"
                />
              ) : (
                <p className="text-white">{myProfile.job_title || 'Not set'}</p>
              )}
            </div>
          </div>
        </CrossdCard>

        <CrossdCard>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <p className="text-white/50 text-sm">City</p>
              {editMode ? (
                <CrossdInput
                  value={editedProfile?.city || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                  placeholder="Where are you based?"
                  className="mt-1"
                />
              ) : (
                <p className="text-white">{myProfile.city || 'Not set'}</p>
              )}
            </div>
          </div>
        </CrossdCard>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white/65 text-sm font-medium">Bio</h2>
          {editMode && myProfile.vibe_tags && myProfile.vibe_tags.length > 0 && (
            <button
              onClick={generateBioWithAI}
              disabled={generatingBio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E70F72]/10 text-[#E70F72] text-xs font-medium hover:bg-[#E70F72]/20 transition-colors disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {generatingBio ? 'Generating...' : 'Suggest with AI'}
            </button>
          )}
        </div>
        <CrossdCard>
          {editMode ? (
            <textarea
              value={editedProfile?.bio || ''}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              placeholder="Tell people about yourself..."
              className="w-full bg-transparent text-white resize-none focus:outline-none min-h-[100px]"
            />
          ) : (
            <p className="text-white">{myProfile.bio || 'No bio yet'}</p>
          )}
        </CrossdCard>
      </div>

      {/* Prompts */}
      <div className="mb-6">
        <h2 className="text-white/65 text-sm font-medium mb-3">Prompts</h2>
        {myProfile.prompts?.map((prompt, index) => (
          <CrossdCard key={index} className="mb-3">
            <p className="text-[#E70F72] text-sm font-medium mb-1">{prompt.question}</p>
            <p className="text-white">{prompt.answer}</p>
          </CrossdCard>
        ))}
        {(!myProfile.prompts || myProfile.prompts.length < 3) && (
          <button
            onClick={() => window.location.href = createPageUrl('SetupProfile') + '?step=2'}
            className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 text-white/40 hover:border-[#E70F72]/50 hover:text-white/60 transition-colors"
          >
            <Plus className="w-5 h-5 mx-auto mb-1" />
            Add Prompt
          </button>
        )}
      </div>

      {/* Vibe Tags */}
      <div className="mb-6">
        <h2 className="text-white/65 text-sm font-medium mb-3">Your Vibe</h2>
        <div className="flex flex-wrap gap-2">
          {myProfile.vibe_tags?.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full bg-[#E70F72]/10 text-[#E70F72] text-sm border border-[#E70F72]/30"
            >
              {tag}
            </span>
          ))}
          {(!myProfile.vibe_tags || myProfile.vibe_tags.length < 5) && (
            <button
              onClick={() => window.location.href = createPageUrl('SetupProfile') + '?step=3'}
              className="px-4 py-2 rounded-full border-2 border-dashed border-white/20 text-white/40 hover:border-[#E70F72]/50"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Lifestyle & Background */}
      <div className="mb-6">
        <h2 className="text-white/65 text-sm font-medium mb-3">Lifestyle & Background</h2>
        <div className="space-y-3">
          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Ethnicity</p>
                {editMode ? (
                  <CrossdInput
                    value={editedProfile?.ethnicity || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, ethnicity: e.target.value })}
                    placeholder="Your ethnicity"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-white">{myProfile.ethnicity || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Religion</p>
                {editMode ? (
                  <CrossdInput
                    value={editedProfile?.religion || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, religion: e.target.value })}
                    placeholder="Your religion"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-white">{myProfile.religion || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Zodiac Sign</p>
                {editMode ? (
                  <select
                    value={editedProfile?.zodiac_sign || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, zodiac_sign: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Aries" className="bg-[#0B0B0B]">Aries</option>
                    <option value="Taurus" className="bg-[#0B0B0B]">Taurus</option>
                    <option value="Gemini" className="bg-[#0B0B0B]">Gemini</option>
                    <option value="Cancer" className="bg-[#0B0B0B]">Cancer</option>
                    <option value="Leo" className="bg-[#0B0B0B]">Leo</option>
                    <option value="Virgo" className="bg-[#0B0B0B]">Virgo</option>
                    <option value="Libra" className="bg-[#0B0B0B]">Libra</option>
                    <option value="Scorpio" className="bg-[#0B0B0B]">Scorpio</option>
                    <option value="Sagittarius" className="bg-[#0B0B0B]">Sagittarius</option>
                    <option value="Capricorn" className="bg-[#0B0B0B]">Capricorn</option>
                    <option value="Aquarius" className="bg-[#0B0B0B]">Aquarius</option>
                    <option value="Pisces" className="bg-[#0B0B0B]">Pisces</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.zodiac_sign || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Drinking</p>
                {editMode ? (
                  <select
                    value={editedProfile?.drinking || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, drinking: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Never" className="bg-[#0B0B0B]">Never</option>
                    <option value="Sometimes" className="bg-[#0B0B0B]">Sometimes</option>
                    <option value="Regularly" className="bg-[#0B0B0B]">Regularly</option>
                    <option value="Prefer not to say" className="bg-[#0B0B0B]">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.drinking || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Smoking</p>
                {editMode ? (
                  <select
                    value={editedProfile?.smoking || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, smoking: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Never" className="bg-[#0B0B0B]">Never</option>
                    <option value="Sometimes" className="bg-[#0B0B0B]">Sometimes</option>
                    <option value="Regularly" className="bg-[#0B0B0B]">Regularly</option>
                    <option value="Prefer not to say" className="bg-[#0B0B0B]">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.smoking || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>
        </div>
      </div>

      {/* Dating & Relationships */}
      <div className="mb-6">
        <h2 className="text-white/65 text-sm font-medium mb-3">Dating & Relationships</h2>
        <div className="space-y-3">
          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Relationship Type</p>
                {editMode ? (
                  <select
                    value={editedProfile?.relationship_type || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, relationship_type: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Monogamy" className="bg-[#0B0B0B]">Monogamy</option>
                    <option value="Ethical non-monogamy" className="bg-[#0B0B0B]">Ethical non-monogamy</option>
                    <option value="Open to either" className="bg-[#0B0B0B]">Open to either</option>
                    <option value="Prefer not to say" className="bg-[#0B0B0B]">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.relationship_type || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Dating Intentions</p>
                {editMode ? (
                  <select
                    value={editedProfile?.dating_intentions || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, dating_intentions: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Long-term relationship" className="bg-[#0B0B0B]">Long-term relationship</option>
                    <option value="Short-term fun" className="bg-[#0B0B0B]">Short-term fun</option>
                    <option value="New friends" className="bg-[#0B0B0B]">New friends</option>
                    <option value="Still figuring it out" className="bg-[#0B0B0B]">Still figuring it out</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.dating_intentions || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Children</p>
                {editMode ? (
                  <select
                    value={editedProfile?.children || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, children: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Don't have children" className="bg-[#0B0B0B]">Don't have children</option>
                    <option value="Have children" className="bg-[#0B0B0B]">Have children</option>
                    <option value="Prefer not to say" className="bg-[#0B0B0B]">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.children || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white/50 text-sm">Family Plans</p>
                {editMode ? (
                  <select
                    value={editedProfile?.family_plans || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, family_plans: e.target.value })}
                    className="w-full bg-transparent text-white mt-1 focus:outline-none"
                  >
                    <option value="" className="bg-[#0B0B0B]">Select...</option>
                    <option value="Want children" className="bg-[#0B0B0B]">Want children</option>
                    <option value="Don't want children" className="bg-[#0B0B0B]">Don't want children</option>
                    <option value="Open to children" className="bg-[#0B0B0B]">Open to children</option>
                    <option value="Not sure yet" className="bg-[#0B0B0B]">Not sure yet</option>
                  </select>
                ) : (
                  <p className="text-white">{myProfile.family_plans || 'Not set'}</p>
                )}
              </div>
            </div>
          </CrossdCard>
        </div>
      </div>

      {/* MBTI */}
      {myProfile.mbti_type && (
        <CrossdCard className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">Personality Type</p>
              <p className="text-2xl font-bold text-[#E70F72]">{myProfile.mbti_type}</p>
            </div>
            <button
              onClick={() => window.location.href = createPageUrl('MBTIQuiz')}
              className="text-white/50 hover:text-white"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </CrossdCard>
      )}

      {/* Verification */}
      <CrossdCard 
        className="mb-6 cursor-pointer hover:border-[#E70F72]/40"
        onClick={() => window.location.href = createPageUrl('Verification')}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            myProfile.verification_status === 'verified' ? 'bg-green-500/20' : 'bg-[#E70F72]/20'
          }`}>
            <BadgeCheck className={`w-6 h-6 ${
              myProfile.verification_status === 'verified' ? 'text-green-500' : 'text-[#E70F72]'
            }`} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Verification</p>
            <p className="text-white/65 text-sm capitalize">
              {myProfile.verification_status || 'Not verified'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </div>
      </CrossdCard>

      {/* Crossd+ Badge */}
      {myProfile.crossd_plus && (
        <CrossdCard glow className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#E70F72] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="font-medium text-white">Crossd+ Member</p>
              <p className="text-[#E70F72] text-sm">Premium features unlocked</p>
            </div>
          </div>
        </CrossdCard>
      )}
    </div>
  );
}