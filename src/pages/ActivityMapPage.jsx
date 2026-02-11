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
import { AnimatePresence } from 'framer-motion';

export default function ActivityMapPage() {
  const [user, setUser] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
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
            venue_name: 'Borough Market',
            venue_types: ['food', 'market', 'point_of_interest'],
            lat: 51.5052,
            lng: -0.0971,
            geohash: 'u10j4y',
            tile_key: 'u10j4y',
            time_bucket: '2026-01-30-19',
            created_date: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'The energy was amazing! So many great smells. Laughed with a stranger over a ridiculously large cheese wheel.',
            nearby_spark_count: 3
          },
          {
            id: 'sample-7',
            user_id: profile.id,
            venue_name: 'Buckingham Palace',
            venue_types: ['tourist_attraction', 'point_of_interest'],
            lat: 51.5007,
            lng: -0.1415,
            geohash: 'u10h8e',
            tile_key: 'u10h8e',
            time_bucket: '2026-01-29-09',
            created_date: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'Classic tourist moment. Saw someone else looking just as impressed by the guards.',
            nearby_spark_count: 0
          },
          {
            id: 'sample-8',
            user_id: profile.id,
            venue_name: 'Montclair Art Museum',
            venue_types: ['art_gallery', 'museum'],
            lat: 40.8207,
            lng: -74.2099,
            geohash: 'dr5rtu',
            tile_key: 'dr5rtu',
            time_bucket: '2026-01-27-09',
            created_date: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            privacy_level: 'approximate',
            note: 'The modern art wing was particularly striking today.',
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
      </AnimatePresence>
      {/* Close button */}
      <button
        onClick={() => navigate(createPageUrl('Dashboard'))}
        className="absolute top-6 right-6 z-[9999] p-3 rounded-full bg-black border border-[#E70F72]/50 hover:bg-[#E70F72]/20 transition-all"
      >
        <X className="w-6 h-6 text-[#E70F72]" />
      </button>

      {/* Map - fills most of screen */}
      <div className="flex-1 w-full h-full overflow-hidden" ref={setMapRef}>
        {profile && <ActivityMap moments={moments} profile={profile} mapRef={mapRef} />}
        
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

        {/* Button 2 - Location */}
        <motion.button
          whileHover={{ scale: 1.05 }}
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