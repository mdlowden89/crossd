import React, { useState } from 'react';
import { X } from 'lucide-react';

const VIBE_TAG_CATEGORIES = {
  personality: {
    label: 'Personality',
    tags: [
      { name: 'Morning Person', emoji: '🌅' },
      { name: 'Thoughtful', emoji: '🤔' },
      { name: 'Spontaneous', emoji: '⚡' },
      { name: 'Optimist', emoji: '😊' },
      { name: 'Realist', emoji: '😌' },
      { name: 'Introvert', emoji: '🎧' },
      { name: 'Extrovert', emoji: '🌐' },
      { name: 'Calm', emoji: '🕯️' },
      { name: 'Energetic', emoji: '⚙️' },
      { name: 'Romantic', emoji: '❤️' },
      { name: 'Witty', emoji: '😄' },
    ],
    subcategories: {
      cognitive: {
        label: 'Mental Energy',
        tags: [
          { name: 'Deep Thinker', emoji: '🧩' },
          { name: 'Overthinker', emoji: '🌀' },
          { name: 'Focused', emoji: '🎯' },
          { name: 'Go-with-the-flow', emoji: '🌊' },
          { name: 'Curious', emoji: '🔍' },
          { name: 'Analytical', emoji: '🧠' },
          { name: 'Introspective', emoji: '💭' },
          { name: 'Experimental', emoji: '🧪' },
          { name: 'Mindful', emoji: '🧘' },
        ]
      },
      communication: {
        label: 'Communication & Social Style',
        tags: [
          { name: 'Great Listener', emoji: '🎤' },
          { name: 'Storyteller', emoji: '🗣' },
          { name: 'Flirty', emoji: '😏' },
          { name: 'Emotionally Open', emoji: '🤍' },
          { name: 'Guarded at First', emoji: '🧱' },
          { name: 'Dry Humour', emoji: '🧊' },
          { name: 'Playful Teaser', emoji: '😄' },
          { name: 'Calm Communicator', emoji: '🧘' },
          { name: 'Passionate Talker', emoji: '🔥' },
        ]
      },
      energy: {
        label: 'Energy Rhythm',
        tags: [
          { name: 'Sunrise Chaser', emoji: '🌅' },
          { name: 'Late-Night Thinker', emoji: '🌙' },
          { name: 'Burst Energy', emoji: '⚡' },
          { name: 'Consistent Routine', emoji: '🔁' },
          { name: 'Slow & Steady', emoji: '🐢' },
          { name: 'Spontaneous Bursts', emoji: '🚀' },
          { name: 'Recharge Alone', emoji: '🛌' },
          { name: 'Social Battery Saver', emoji: '🔋' },
        ]
      }
    }
  },
  activities: {
    label: 'Places & Activities',
    tags: [
      { name: 'Theatres', emoji: '🎭' },
      { name: 'Cinemas', emoji: '🎬' },
      { name: 'Bowling', emoji: '🎳' },
      { name: 'Beaches', emoji: '🏖️' },
      { name: 'Countryside', emoji: '🌿' },
      { name: 'Mountains', emoji: '⛰️' },
      { name: 'Restaurants', emoji: '🌙' },
      { name: 'Museums', emoji: '🏛️' },
      { name: 'Live Music', emoji: '🎸' },
      { name: 'Art Galleries', emoji: '🎨' },
      { name: 'Parks', emoji: '🎪' },
      { name: 'Clubs', emoji: '🎵' },
    ]
  },
  zodiac: {
    label: 'Zodiac',
    tags: [
      { name: 'Aries', emoji: '♈' },
      { name: 'Taurus', emoji: '♉' },
      { name: 'Gemini', emoji: '♊' },
      { name: 'Cancer', emoji: '♋' },
      { name: 'Leo', emoji: '♌' },
      { name: 'Virgo', emoji: '♍' },
      { name: 'Libra', emoji: '♎' },
      { name: 'Scorpio', emoji: '♏' },
      { name: 'Sagittarius', emoji: '♐' },
      { name: 'Capricorn', emoji: '♑' },
      { name: 'Aquarius', emoji: '♒' },
      { name: 'Pisces', emoji: '♓' },
    ]
  },
  dating: {
    label: 'Dating & Connection Style',
    tags: [
      { name: 'Slow Burn', emoji: '🕯' },
      { name: 'Instant Spark', emoji: '⚡' },
      { name: 'Emotional First', emoji: '🧠' },
      { name: 'Physical Chemistry Matters', emoji: '🔥' },
      { name: 'Friends-to-Lovers', emoji: '💬' },
      { name: 'Intentional Dating', emoji: '🧭' },
      { name: 'Emotional Adventurer', emoji: '🎢' },
      { name: 'Mutual Effort Matters', emoji: '🪞' },
      { name: 'Low-Drama', emoji: '🧘' },
    ]
  },
  lifestyle: {
    label: 'Lifestyle & Values',
    tags: [
      { name: 'Eco-Conscious', emoji: '🌱' },
      { name: 'Health-Focused', emoji: '🏋️' },
      { name: 'Wellness-Oriented', emoji: '🧘' },
      { name: 'Minimalist', emoji: '🎒' },
      { name: 'Career-Driven', emoji: '💼' },
      { name: 'Homebody', emoji: '🏡' },
      { name: 'Global Citizen', emoji: '🌍' },
      { name: 'Aesthetic-Led', emoji: '🎨' },
      { name: 'Values Freedom', emoji: '🕊' },
    ]
  },
  culture: {
    label: 'Culture & Sensory',
    tags: [
      { name: 'Live Sets', emoji: '🎧' },
      { name: 'Acoustic Lover', emoji: '🎼' },
      { name: 'Indie Films', emoji: '🎥' },
      { name: 'Bookish', emoji: '📚' },
      { name: 'Casual Gamer', emoji: '🎮' },
      { name: 'Visual Thinker', emoji: '🎨' },
      { name: 'Candlelit Everything', emoji: '🕯' },
      { name: 'Coffee Over Cocktails', emoji: '☕' },
      { name: 'Wine Nights', emoji: '🍷' },
    ]
  }
};

export default function VibeTagSelector({ selectedTags = [], onTagsChange, editMode = false, isPremium = false }) {
  const MAX_TAGS = isPremium ? Infinity : 8;

  const handleToggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      const updatedTags = selectedTags.filter(t => t !== tagName);
      onTagsChange(updatedTags);
    } else if (selectedTags.length < MAX_TAGS) {
      const updatedTags = [...selectedTags, tagName];
      onTagsChange(updatedTags);
    }
  };

  const handleRemoveTag = (tagName) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  const getTagEmoji = (tagName) => {
    for (const category of Object.values(VIBE_TAG_CATEGORIES)) {
      const tag = category.tags.find(t => t.name === tagName);
      if (tag) return tag.emoji;
    }
    return '✨';
  };

  return (
    <div className="space-y-6">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">Your current vibes</h3>
            {!isPremium && <span className="text-white/50 text-xs">{selectedTags.length}/{MAX_TAGS}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E70F72]/20 border border-[#E70F72]/50"
              >
                <span>{getTagEmoji(tag)}</span>
                <span className="text-[#E70F72] text-sm font-medium">{tag}</span>
                {editMode && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags by Category */}
      {editMode && (
        <div className="space-y-6">
          {Object.entries(VIBE_TAG_CATEGORIES).map(([key, category]) => (
            <div key={key}>
              <h3 className="text-white/65 text-sm font-medium mb-3">{category.label}</h3>
              
              {/* Main tags */}
              {category.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.tags.map((tag) => (
                    <button
                       key={tag.name}
                       onClick={() => handleToggleTag(tag.name)}
                       disabled={!selectedTags.includes(tag.name) && selectedTags.length >= MAX_TAGS}
                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                         selectedTags.includes(tag.name)
                           ? 'bg-[#E70F72]/20 border-[#E70F72]/50'
                           : selectedTags.length >= MAX_TAGS
                           ? 'bg-white/5 border-white/20 opacity-50 cursor-not-allowed'
                           : 'bg-white/5 border-white/20 hover:border-[#E70F72]/50'
                       }`}
                     >
                      <span>{tag.emoji}</span>
                      <span className={selectedTags.includes(tag.name) ? 'text-[#E70F72]' : 'text-white/60'}>
                        {tag.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Subcategories */}
              {category.subcategories && (
                <div className="space-y-4 ml-2 border-l border-white/10 pl-4">
                  {Object.entries(category.subcategories).map(([subkey, subcat]) => (
                    <div key={subkey}>
                      <h4 className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">{subcat.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {subcat.tags.map((tag) => (
                          <button
                            key={tag.name}
                            onClick={() => handleToggleTag(tag.name)}
                            disabled={!selectedTags.includes(tag.name) && selectedTags.length >= MAX_TAGS}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                              selectedTags.includes(tag.name)
                                ? 'bg-[#E70F72]/20 border-[#E70F72]/50'
                                : selectedTags.length >= MAX_TAGS
                                ? 'bg-white/5 border-white/20 opacity-50 cursor-not-allowed'
                                : 'bg-white/5 border-white/20 hover:border-[#E70F72]/50'
                            }`}
                          >
                            <span>{tag.emoji}</span>
                            <span className={selectedTags.includes(tag.name) ? 'text-[#E70F72]' : 'text-white/60'}>
                              {tag.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}