import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Camera, Edit2, BadgeCheck, Sparkles, Plus, X,
  ChevronRight, Upload, User, MapPin, Briefcase
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
              <div>
                <p className="text-white/50 text-sm">Name</p>
                {editMode ? (
                  <CrossdInput
                    value={editedProfile?.display_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, display_name: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-white">{myProfile.display_name}{age ? `, ${age}` : ''}</p>
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
        <h2 className="text-white/65 text-sm font-medium mb-3">Bio</h2>
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