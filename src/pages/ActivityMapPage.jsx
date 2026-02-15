import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Sparkles, MapPin, Share2, Compass, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActivityMap from '@/components/dashboard/ActivityMap';
import InsightsSheet from '@/components/dashboard/InsightsSheet';
import MomentsListSheet from '@/components/dashboard/MomentsListSheet';
import NearbySheet from '@/components/dashboard/NearbySheet';
import MapLayerToggle from '@/components/map/MapLayerToggle';
import ZoneCard from '@/components/map/ZoneCard';
import { AnimatePresence } from 'framer-motion';

export default function ActivityMapPage() {
  const [user, setUser] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [activeLayer, setActiveLayer] = useState('moments');
  const [selectedZone, setSelectedZone] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
    
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => console.log('Location access denied')
    );
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: moments = [] } = useQuery({
    queryKey: ['my-moments'],
    queryFn: async () => {
      if (!profile) return [];
      const realMoments = await base44.entities.Moment.filter({ user_id: profile.id }, '-created_date', 100);
      
      // If no real moments, show sample data (same as Moments page)
      if (realMoments.length === 0) {
        const baseDate = new Date(2026, 1, 9);
        return [
          {
            id: 'sample-1',
            user_id: profile.id,
            venue_name: 'Covent Garden',
            venue_types: ['tourist_attraction', 'point_of_interest'],
            lat: 51.3130,
            lng: -0.1233,
            geohash: 'u10hkq',
            tile_key: 'u10hkq',
            time_bucket: '2026-02-04-10',
            created_date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Watching the street performers. Someone next to me had the most infectious laugh.',
            nearby_spark_count: 0
          },
          {
            id: 'sample-2',
            user_id: profile.id,
            venue_name: 'The Shard',
            venue_types: ['tourist_attraction', 'point_of_interest'],
            lat: 51.5045,
            lng: -0.0865,
            geohash: 'u10j5n',
            tile_key: 'u10j5n',
            time_bucket: '2026-02-03-10',
            created_date: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'The view was incredible, and I noticed someone with a great sense of style near the window.',
            nearby_spark_count: 1
          },
          {
            id: 'sample-3',
            user_id: profile.id,
            venue_name: 'Tower of London',
            venue_types: ['museum', 'tourist_attraction'],
            lat: 51.5055,
            lng: -0.0754,
            geohash: 'u10j5q',
            tile_key: 'u10j5q',
            time_bucket: '2026-02-02-07',
            created_date: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Fascinating history. Saw someone else who seemed just as captivated by the Crown Jewels.',
            nearby_spark_count: 2
          },
          {
            id: 'sample-4',
            user_id: profile.id,
            venue_name: 'British Museum',
            venue_types: ['museum', 'tourist_attraction'],
            lat: 51.5194,
            lng: -0.1270,
            geohash: 'u10h9u',
            tile_key: 'u10h9u',
            time_bucket: '2026-02-01-12',
            created_date: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Lost in the Egyptian exhibit. There was a quiet intensity about someone sketching near the Rosetta Stone.',
            nearby_spark_count: 1
          },
          {
            id: 'sample-5',
            user_id: profile.id,
            venue_name: 'Tate Modern',
            venue_types: ['art_gallery', 'museum'],
            lat: 51.5076,
            lng: -0.0994,
            geohash: 'u10j4u',
            tile_key: 'u10j4u',
            time_bucket: '2026-01-31-06',
            created_date: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'The abstract art was moving. I shared a smile with someone who was also staring at a Rothko painting.',
            nearby_spark_count: 0
          },
          {
            id: 'sample-6',
            user_id: profile.id,
            venue_name: 'Monmouth Coffee',
            venue_types: ['cafe', 'coffee_shop'],
            lat: 51.5052,
            lng: -0.0971,
            geohash: 'u10j4y',
            tile_key: 'u10j4y',
            time_bucket: '2026-01-30-10',
            created_date: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Perfect morning spot. Reading a book while someone sketched in the corner.',
            nearby_spark_count: 2
          },
          {
            id: 'sample-7',
            user_id: profile.id,
            venue_name: 'Hyde Park',
            venue_types: ['park'],
            lat: 51.5074,
            lng: -0.1657,
            geohash: 'u10h8e',
            tile_key: 'u10h8e',
            time_bucket: '2026-01-29-14',
            created_date: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Peaceful afternoon walk by the Serpentine. The weather was perfect.',
            nearby_spark_count: 1
          },
          {
            id: 'sample-8',
            user_id: profile.id,
            venue_name: 'The Ivy',
            venue_types: ['restaurant'],
            lat: 51.5129,
            lng: -0.1273,
            geohash: 'u10h9v',
            tile_key: 'u10h9v',
            time_bucket: '2026-01-27-20',
            created_date: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Lovely dinner atmosphere. Candlelight and soft music.',
            nearby_spark_count: 2
          },
          {
            id: 'sample-9',
            user_id: profile.id,
            venue_name: 'Fabric',
            venue_types: ['night_club'],
            lat: 51.5203,
            lng: -0.1037,
            geohash: 'u10j2k',
            tile_key: 'u10j2k',
            time_bucket: '2026-01-26-23',
            created_date: new Date(baseDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Electric energy. Lost track of time on the dance floor.',
            nearby_spark_count: 5
          },
          {
            id: 'sample-10',
            user_id: profile.id,
            venue_name: 'Third Space Gym',
            venue_types: ['gym'],
            lat: 51.5074,
            lng: -0.1419,
            geohash: 'u10h8h',
            tile_key: 'u10h8h',
            time_bucket: '2026-01-25-07',
            created_date: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Morning workout session. Spotted someone with impressive dedication.',
            nearby_spark_count: 1
          }
        ];
      }
      
      return realMoments;
    },
    enabled: !!profile
  });

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col safe-area-top safe-area-bottom">
      <AnimatePresence>
        {showInsights && (
          <InsightsSheet moments={moments} profile={profile} onClose={() => setShowInsights(false)} />
        )}
        {showMoments && (
          <MomentsListSheet moments={moments} onClose={() => setShowMoments(false)} />
        )}
        {showNearby && (
          <NearbySheet onClose={() => setShowNearby(false)} userLocation={userLocation} />
        )}
        {selectedZone && (
          <ZoneCard 
            zone={selectedZone} 
            onClose={() => setSelectedZone(null)} 
            isPremium={profile?.crossd_plus || false}
          />
        )}
      </AnimatePresence>
      
      {/* Layer Toggle - temporarily hidden */}
      {/* <MapLayerToggle 
        activeLayer={activeLayer}
        onLayerChange={(layer) => {
          if (layer === 'overlap' && !profile?.crossd_plus) {
            navigate(createPageUrl('CrossdPlus'));
          } else {
            setActiveLayer(layer);
          }
        }}
        isPremium={profile?.crossd_plus || false}
      /> */}
      
      {/* Close button */}
      <button
        onClick={() => navigate(createPageUrl('Dashboard'))}
        className="absolute top-6 right-6 z-[9999] p-3 rounded-full bg-black border border-[#E70F72]/50 hover:bg-[#E70F72]/20 transition-all"
      >
        <X className="w-6 h-6 text-[#E70F72]" />
      </button>

      {/* Map - fills most of screen */}
      <div className="flex-1 w-full h-full overflow-hidden" ref={setMapRef}>
        {profile && (
          <ActivityMap 
            moments={moments} 
            profile={profile} 
            mapRef={mapRef}
            activeLayer={activeLayer}
            onZoneClick={setSelectedZone}
          />
        )}
        
        {/* Location button - right side, bottom third */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              if (mapRef) {
                const leafletMap = mapRef.querySelector('.leaflet-container')?._leaflet_map;
                if (leafletMap) {
                  leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
                }
              }
            });
          }}
          className="absolute right-6 bottom-40 z-[9999] p-3 rounded-full bg-[#E70F72] hover:bg-[#ff1a8c] transition-all shadow-lg"
        >
          <Compass className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Bottom Action Buttons */}
      <div className="bg-black border-t border-[#E70F72]/20 px-4 md:px-6 py-3 md:py-4 flex gap-3 md:gap-4">
        {/* Button 1 - Moments */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMoments(true)}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#E70F72]" />
        </motion.button>

        {/* Button 2 - Nearby */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNearby(true)}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <MapPin className="w-6 h-6 md:w-7 md:h-7 text-[#E70F72]" />
        </motion.button>

        {/* Button 3 - Insights */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInsights(true)}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Zap className="w-6 h-6 md:w-7 md:h-7 text-[#E70F72]" />
        </motion.button>
      </div>
    </div>
  );
}