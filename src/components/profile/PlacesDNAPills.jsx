import React from 'react';
import { calculateUserPlacesDNA, getArchetypeInfo } from '@/components/spark/placesDnaEngine';

export default function PlacesDNAPills({ profile, moments = [] }) {
  const dna = calculateUserPlacesDNA(moments);
  
  // Fall back to hangout_areas venue_types if no moments
  let archetypes = dna?.dominantArchetypes || [];

  // If no moments data, derive from profile hangout_areas or vibe_tags
  if (archetypes.length === 0 && profile.hangout_areas && profile.hangout_areas.length > 0) {
    // Build synthetic moments from hangout_areas venue_types
    const syntheticMoments = profile.hangout_areas.flatMap(area =>
      (area.venue_types || []).map(type => ({
        venue_types: [type],
        mood_tags: [],
        created_date: new Date().toISOString()
      }))
    );
    const syntheticDna = calculateUserPlacesDNA(syntheticMoments);
    archetypes = syntheticDna?.dominantArchetypes || [];
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