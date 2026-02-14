import React from 'react';
import { Circle } from 'react-leaflet';
import { motion } from 'framer-motion';
import { getArchetypeInfo } from '@/components/spark/placesDnaEngine';

export default function ZoneBlob({ zone, onClick }) {
  const { label, emoji, color } = getArchetypeInfo(zone.primaryArchetype);
  
  return (
    <>
      {/* Outer glow */}
      <Circle
        center={[zone.lat, zone.lng]}
        radius={zone.radius * 1.5}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.1,
          color: color,
          opacity: 0.2,
          weight: 1
        }}
      />
      
      {/* Main blob */}
      <Circle
        center={[zone.lat, zone.lng]}
        radius={zone.radius}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.25,
          color: color,
          opacity: 0.4,
          weight: 2
        }}
        eventHandlers={{
          click: () => onClick(zone)
        }}
      />
      
      {/* Inner core */}
      <Circle
        center={[zone.lat, zone.lng]}
        radius={zone.radius * 0.3}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.5,
          color: color,
          opacity: 0.6,
          weight: 0
        }}
        eventHandlers={{
          click: () => onClick(zone)
        }}
      />
    </>
  );
}