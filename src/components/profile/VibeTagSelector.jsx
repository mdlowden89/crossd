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
    ]
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
  }
};

export default function VibeTagSelector({ selectedTags = [], onTagsChange, editMode = false }) {
  const handleToggleTag = (tagName) => {
    const updatedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(updatedTags);
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
          <h3 className="text-white text-sm font-medium mb-3">Your current vibes</h3>
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
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleToggleTag(tag.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                      selectedTags.includes(tag.name)
                        ? 'bg-[#E70F72]/20 border-[#E70F72]/50'
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
  );
}