import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronLeft, ChevronRight, MapPin, Briefcase, BadgeCheck, Sparkles, Flame, Music, Zap, Lightbulb } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';

export default function ProfileCard({ profile, onLike, onPass, onViewFull }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = profile.photos || [];

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const age = profile.birthdate
    ? Math.floor((new Date() - new Date(profile.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const isGlowing = profile.glow_active_until && new Date(profile.glow_active_until) > new Date();

  return (
    <motion.div
      className="w-full max-w-sm mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <div 
        className={`relative rounded-3xl overflow-hidden bg-[#0B0B0B] ${
          isGlowing ? 'ring-2 ring-[#E70F72] shadow-[0_0_40px_rgba(231,15,114,0.3)]' : ''
        }`}
        onClick={onViewFull}
      >
        {/* Photo Section */}
        <div className="relative aspect-[3/4]">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[currentPhotoIndex]?.url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
              
              {/* Photo Navigation */}
              {photos.length > 1 && (
                <>
                  <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
                    {photos.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {currentPhotoIndex > 0 && (
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                  )}
                  
                  {currentPhotoIndex < photos.length - 1 && (
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 rounded-full"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  )}
                </>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white/40">No photos</span>
            </div>
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {profile.display_name}{age ? `, ${age}` : ''}
              </h2>
              {profile.verification_status === 'verified' && (
                <BadgeCheck className="w-6 h-6 text-[#E70F72]" />
              )}
              {isGlowing && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-[#E70F72]" />
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-white/70 text-sm">
              {profile.job_title && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.job_title}</span>
                </div>
              )}
              {profile.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Creative Info Section */}
        <div className="p-5 space-y-4 border-t border-white/10">
          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-white/80 text-sm italic">"{profile.bio}"</p>
            </div>
          )}

          {/* Vibe Tags - More Creative Display */}
          {profile.vibe_tags && profile.vibe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.vibe_tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E70F72]/20 to-[#E70F72]/10 text-[#E70F72] text-xs font-medium border border-[#E70F72]/30"
                >
                  ✨ {tag}
                </span>
              ))}
            </div>
          )}

          {/* Lifestyle Grid */}
          <div className="grid grid-cols-2 gap-2">
            {profile.drinking && (
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Drinking</p>
                <p className="text-white text-sm font-medium">{profile.drinking}</p>
              </div>
            )}
            {profile.smoking && (
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Smoking</p>
                <p className="text-white text-sm font-medium">{profile.smoking}</p>
              </div>
            )}
            {profile.zodiac_sign && (
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Zodiac</p>
                <p className="text-white text-sm font-medium">{profile.zodiac_sign}</p>
              </div>
            )}
            {profile.height && (
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Height</p>
                <p className="text-white text-sm font-medium">{profile.height}cm</p>
              </div>
            )}
          </div>

          {/* Prompts - Featured Answer */}
          {profile.prompts && profile.prompts.length > 0 && (
            <div className="bg-gradient-to-r from-white/5 to-transparent rounded-xl p-3 border border-[#E70F72]/20">
              <p className="text-[#E70F72] text-xs font-semibold mb-1 uppercase tracking-wider">
                💭 {profile.prompts[0].question}
              </p>
              <p className="text-white text-sm">"{profile.prompts[0].answer}"</p>
            </div>
          )}

          {/* Dating Intentions */}
          {profile.dating_intentions && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E70F72]/10 border border-[#E70F72]/30">
              <Zap className="w-4 h-4 text-[#E70F72]" />
              <span className="text-white text-sm font-medium">{profile.dating_intentions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPass}
          className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/40 transition-colors"
        >
          <X className="w-8 h-8 text-white/60" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          className="w-20 h-20 rounded-full bg-[#E70F72] flex items-center justify-center shadow-[0_0_30px_rgba(231,15,114,0.4)]"
        >
          <Heart className="w-10 h-10 text-black" fill="black" />
        </motion.button>
      </div>
    </motion.div>
  );
}