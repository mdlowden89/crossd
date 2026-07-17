import React from 'react';
import { calculateUserPlacesDNA, getArchetypeInfo, ARCHETYPES } from '@/components/spark/placesDnaEngine';

// Map vibe tags directly to PlacesDNA archetypes as a fallback
const VIBE_TO_ARCHETYPE = {
  'Romantic': ARCHETYPES.ROMANTIC,
  'Flirty': ARCHETYPES.ROMANTIC,
  'Cozy': ARCHETYPES.CALM_COZY,
  'Calm': ARCHETYPES.CALM_COZY,
  'Peaceful': ARCHETYPES.CALM_COZY,
  'Creative': ARCHETYPES.CREATIVE,
  'Artistic': ARCHETYPES.CREATIVE,
  'Social': ARCHETYPES.SOCIAL_BUZZING,
  'Outgoing': ARCHETYPES.SOCIAL_BUZZING,
  'Vibrant': ARCHETYPES.SOCIAL_BUZZING,
  'Natural': ARCHETYPES.NATURE_GROUNDED,
  'Outdoorsy': ARCHETYPES.NATURE_GROUNDED,
  'Energetic': ARCHETYPES.LIVE_ELECTRIC,
  'Live music': ARCHETYPES.LIVE_ELECTRIC,
  'Deep talk': ARCHETYPES.DEEP_INTELLECTUAL,
  'Intellectual': ARCHETYPES.DEEP_INTELLECTUAL,
  'Bookish': ARCHETYPES.DEEP_INTELLECTUAL,
  'Active': ARCHETYPES.ACTIVE_ENERGETIC,
  'Sporty': ARCHETYPES.ACTIVE_ENERGETIC,
  'Party': ARCHETYPES.NIGHTLIFE,
  'Night owl': ARCHETYPES.NIGHTLIFE,
  'Low-key': ARCHETYPES.INTIMATE_LOCAL,
  'Introvert': ARCHETYPES.INTIMATE_LOCAL,
  'Spontaneous': ARCHETYPES.LIVE_ELECTRIC,
  'Adventurous': ARCHETYPES.ACTIVE_ENERGETIC,
};

export default function PlacesDNAPills({ profile, moments = [] }) {
  let archetypes = [];

  // 1. Try real moments
  if (moments.length > 0) {
    archetypes = calculateUserPlacesDNA(moments)?.dominantArchetypes || [];
  }

  // 2. Try hangout_areas venue_types
  if (archetypes.length === 0 && profile.hangout_areas?.length > 0) {
    const syntheticMoments = profile.hangout_areas.flatMap(area =>
      (area.venue_types || []).map(type => ({
        venue_types: [type],
        mood_tags: [],
        created_date: new Date().toISOString()
      }))
    );
    archetypes = calculateUserPlacesDNA(syntheticMoments)?.dominantArchetypes || [];
  }

  // 3. Derive from vibe_tags
  if (archetypes.length === 0 && profile.vibe_tags?.length > 0) {
    const seen = new Set();
    archetypes = profile.vibe_tags
      .map(tag => VIBE_TO_ARCHETYPE[tag])
      .filter(arch => arch && !seen.has(arch) && seen.add(arch))
      .map(archetype => ({ archetype, score: 1 }));
  }

  if (archetypes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {archetypes.slice(0, 6).map(({ archetype }, idx) => {
        const info = getArchetypeInfo(archetype);
        return (
          <div
            key={archetype}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border"
            style={{
              borderColor: `${info.color}40`,
              background: `linear-gradient(135deg, ${info.color}10, ${info.color}05)`,
              boxShadow: `0 0 20px ${info.color}20`
            }}
          >
            <span className="text-base">{info.emoji}</span>
            <span className="text-sm font-semibold truncate" style={{ color: info.color }}>
              {info.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}