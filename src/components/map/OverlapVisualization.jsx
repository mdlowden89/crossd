import React from 'react';
import { Circle } from 'react-leaflet';
import { motion } from 'framer-motion';

export default function OverlapVisualization({ myZones, theirZones, sharedZones }) {
  return (
    <>
      {/* My zones - Blue family */}
      {myZones.map((zone, idx) => (
        <React.Fragment key={`my-${idx}`}>
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              fillColor: '#4169E1',
              fillOpacity: 0.15,
              color: '#4169E1',
              opacity: 0.4,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        </React.Fragment>
      ))}

      {/* Their zones - Pink family */}
      {theirZones.map((zone, idx) => (
        <React.Fragment key={`their-${idx}`}>
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              fillColor: '#E70F72',
              fillOpacity: 0.15,
              color: '#E70F72',
              opacity: 0.4,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        </React.Fragment>
      ))}

      {/* Shared zones - Purple glow (overlap) */}
      {sharedZones.map((zone, idx) => (
        <React.Fragment key={`shared-${idx}`}>
          {/* Outer glow */}
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius * 1.3}
            pathOptions={{
              fillColor: '#9B5DE5',
              fillOpacity: 0.1,
              color: '#9B5DE5',
              opacity: 0.3,
              weight: 1
            }}
          />
          
          {/* Main overlap */}
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              fillColor: '#9B5DE5',
              fillOpacity: 0.35,
              color: '#FFB800',
              opacity: 0.7,
              weight: 3
            }}
          />
          
          {/* Spark core */}
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius * 0.2}
            pathOptions={{
              fillColor: '#FFB800',
              fillOpacity: 0.8,
              color: '#FFB800',
              opacity: 1,
              weight: 0
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
}