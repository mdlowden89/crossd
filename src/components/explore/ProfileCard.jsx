import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronLeft, ChevronRight, MapPin, Briefcase, BadgeCheck, Sparkles, Flame, Music, Zap, Lightbulb, Info } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';
import SparkSignatureRow from '@/components/profile/SparkSignatureRow';

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
        className="relative rounded-3xl overflow-hidden bg-[#0B0B0B]"
        style={{
          border: profile.vibe_tags && profile.vibe_tags.length > 0 ? `1px solid ${(() => {
            const vibeColors = {
              'Romantic': '#E74C78',
              'Flirty': '#FF6B9D',
              'Cozy': '#C49A6C',
              'Calm': '#6A8F7A',
              'Creative': '#9B5DE5',
              'Artistic': '#8A63F6',
              'Social': '#FFB800',
              'Energetic': '#FF6B3D',
              'Vibrant': '#FF4081',
              'Peaceful': '#4169E1',
              'Natural': '#2DD881',
              'Spontaneous': '#F6C90E',
              'Adventurous': '#FF6B35',
              'Deep talk': '#4169E1',
              'Intellectual': '#8B7355',
              'Active': '#FF4081',
              'Low-key': '#8B7355',
              'Outgoing': '#FFB800'
            };
            return vibeColors[profile.vibe_tags[0]] || '#E70F72';
          })()}40` : isGlowing ? '1px solid rgba(231,15,114,0.4)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: profile.vibe_tags && profile.vibe_tags.length > 0 ? `0 0 50px ${(() => {
            const vibeColors = {
              'Romantic': '#E74C78',
              'Flirty': '#FF6B9D',
              'Cozy': '#C49A6C',
              'Calm': '#6A8F7A',
              'Creative': '#9B5DE5',
              'Artistic': '#8A63F6',
              'Social': '#FFB800',
              'Energetic': '#FF6B3D',
              'Vibrant': '#FF4081',
              'Peaceful': '#4169E1',
              'Natural': '#2DD881',
              'Spontaneous': '#F6C90E',
              'Adventurous': '#FF6B35',
              'Deep talk': '#4169E1',
              'Intellectual': '#8B7355',
              'Active': '#FF4081',
              'Low-key': '#8B7355',
              'Outgoing': '#FFB800'
            };
            return vibeColors[profile.vibe_tags[0]] || '#E70F72';
          })()}50, 0 0 100px ${(() => {
            const vibeColors = {
              'Romantic': '#E74C78',
              'Flirty': '#FF6B9D',
              'Cozy': '#C49A6C',
              'Calm': '#6A8F7A',
              'Creative': '#9B5DE5',
              'Artistic': '#8A63F6',
              'Social': '#FFB800',
              'Energetic': '#FF6B3D',
              'Vibrant': '#FF4081',
              'Peaceful': '#4169E1',
              'Natural': '#2DD881',
              'Spontaneous': '#F6C90E',
              'Adventurous': '#FF6B35',
              'Deep talk': '#4169E1',
              'Intellectual': '#8B7355',
              'Active': '#FF4081',
              'Low-key': '#8B7355',
              'Outgoing': '#FFB800'
            };
            return vibeColors[profile.vibe_tags[0]] || '#E70F72';
          })()}25` : isGlowing ? '0 0 40px rgba(231,15,114,0.3)' : 'none'
        }}
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

          {/* Animated Aura Behind Name - Based on Dominant Vibe */}
          {profile.vibe_tags && profile.vibe_tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${(() => {
                  const vibeColors = {
                    'Romantic': '#E74C78',
                    'Flirty': '#FF6B9D',
                    'Cozy': '#C49A6C',
                    'Calm': '#6A8F7A',
                    'Creative': '#9B5DE5',
                    'Artistic': '#8A63F6',
                    'Social': '#FFB800',
                    'Energetic': '#FF6B3D',
                    'Vibrant': '#FF4081',
                    'Peaceful': '#4169E1',
                    'Natural': '#2DD881',
                    'Spontaneous': '#F6C90E',
                    'Adventurous': '#FF6B35',
                    'Deep talk': '#4169E1',
                    'Intellectual': '#8B7355',
                    'Active': '#FF4081',
                    'Low-key': '#8B7355',
                    'Outgoing': '#FFB800'
                  };
                  const dominantVibe = profile.vibe_tags[0];
                  return vibeColors[dominantVibe] || '#E70F72';
                })()} 25%, transparent 70%)`,
              }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1], 
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              />
            </motion.div>
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">
                {profile.display_name}{age ? `, ${age}` : ''}
              </h2>
              <span className="text-lg">✨</span>
              {profile.verification_status === 'verified' && (
                <BadgeCheck className="w-5 h-5 text-[#E70F72]" />
              )}
              {isGlowing && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-[#E70F72]" />
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              {profile.city && (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.city}</span>
                </>
              )}
              {profile.verification_status === 'verified' && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="text-[#E70F72] font-medium">Verified</span>
                </>
              )}
            </div>

            {profile.mbti_type && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-white/90 font-semibold text-sm">
                  {profile.mbti_type} · {(() => {
                    const mbtiNames = {
                      'ENFJ': 'Protagonist', 'ENFP': 'Campaigner', 'INFJ': 'Advocate', 'INFP': 'Mediator',
                      'ENTJ': 'Commander', 'ENTP': 'Debater', 'INTJ': 'Architect', 'INTP': 'Logician',
                      'ESFJ': 'Consul', 'ESFP': 'Entertainer', 'ISFJ': 'Defender', 'ISFP': 'Adventurer',
                      'ESTJ': 'Executive', 'ESTP': 'Entrepreneur', 'ISTJ': 'Logistician', 'ISTP': 'Virtuoso'
                    };
                    return mbtiNames[profile.mbti_type] || 'Personality';
                  })()}
                </span>
              </div>
            )}
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

          {/* Key Attributes */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            {profile.height && (
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E70F72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs">Height</p>
                  <p className="text-white text-sm font-medium">{Math.floor(profile.height / 30.48)}'{Math.round((profile.height % 30.48) / 2.54)}"</p>
                </div>
              </div>
            )}
            {profile.ethnicity && (
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E70F72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs">Ethnicity</p>
                  <p className="text-white text-sm font-medium">{profile.ethnicity.split('/')[0]}</p>
                </div>
              </div>
            )}
            {profile.children && (
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E70F72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 14c-4 0-7 2-7 5v2h14v-2c0-3-3-5-7-5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs">Children</p>
                  <p className="text-white text-sm font-medium">{profile.children === "Don't have children" ? "Don't have c..." : profile.children}</p>
                </div>
              </div>
            )}
            {profile.family_plans && (
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E70F72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs">Family Plans</p>
                  <p className="text-white text-sm font-medium">{profile.family_plans === "Not sure yet" ? "Not Sure" : profile.family_plans.split(' ')[0]}</p>
                </div>
              </div>
            )}
            {profile.drinking && (
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E70F72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2v20M6 7h5M6 12h5" />
                    <path d="M16 4v4a2 2 0 0 0 2 2h2v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs">Drinking</p>
                  <p className="text-white text-sm font-medium">{profile.drinking}</p>
                </div>
              </div>
            )}
          </div>

          {/* Spark Signature Row */}
          <SparkSignatureRow profile={profile} moments={[]} />

          {/* Vibe Tags - More Creative Display */}
          {profile.vibe_tags && profile.vibe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.vibe_tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E70F72]/20 to-[#E70F72]/10 text-[#E70F72] text-xs font-medium border border-[#E70F72]/30 capitalize"
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
          onClick={onViewFull}
          className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/40 transition-colors"
        >
          <Info className="w-7 h-7 text-white/60" />
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