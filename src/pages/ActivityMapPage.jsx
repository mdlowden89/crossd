import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Sparkles, MapPin, Share2, Compass, Zap, Plus, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActivityMap from '@/components/dashboard/ActivityMap';
import InsightsSheet from '@/components/dashboard/InsightsSheet';
import MomentsListSheet from '@/components/dashboard/MomentsListSheet';
import NearbySheet from '@/components/dashboard/NearbySheet';
import { AnimatePresence } from 'framer-motion';

export default function ActivityMapPage() {
  const [user, setUser] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7days');
  const [vibeFilter, setVibeFilter] = useState('all');
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

  // Filter moments based on selected filters
  const filteredMoments = moments.filter(m => {
    const momentDate = new Date(m.created_date);
    const now = new Date();
    const daysDiff = Math.floor((now - momentDate) / (1000 * 60 * 60 * 24));
    
    // Time filter
    if (timeFilter === 'today' && daysDiff > 0) return false;
    if (timeFilter === '7days' && daysDiff > 7) return false;
    if (timeFilter === '30days' && daysDiff > 30) return false;
    
    // Vibe filter (based on venue_types for now - can be enhanced)
    if (vibeFilter !== 'all') {
      const vibeMapping = {
        'romantic': ['restaurant', 'bar', 'night_club'],
        'calm': ['cafe', 'park', 'library'],
        'social': ['night_club', 'bar', 'restaurant'],
        'creative': ['art_gallery', 'museum', 'cafe']
      };
      const vibeTypes = vibeMapping[vibeFilter] || [];
      if (!m.venue_types?.some(type => vibeTypes.includes(type))) return false;
    }
    
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col safe-area-top safe-area-bottom">
      <AnimatePresence>
        {showInsights && (
          <InsightsSheet moments={filteredMoments} profile={profile} onClose={() => setShowInsights(false)} />
        )}
        {showMoments && (
          <MomentsListSheet moments={filteredMoments} onClose={() => setShowMoments(false)} />
        )}
        {showNearby && (
          <NearbySheet onClose={() => setShowNearby(false)} userLocation={userLocation} />
        )}
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[9999] bg-[#0B0B0B] rounded-t-3xl max-h-[70vh] overflow-y-auto border-t border-[#E70F72]/20"
          >
            <div className="sticky top-0 bg-[#0B0B0B] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">Filter Moments</h2>
              <button
                onClick={() => setShowFilter(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* Time Filter */}
              <div>
                <h3 className="text-white font-semibold mb-3">Time Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'today', label: 'Today' },
                    { value: '7days', label: 'Last 7 Days' },
                    { value: '30days', label: 'Last 30 Days' },
                    { value: 'all', label: 'All Time' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTimeFilter(option.value)}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        timeFilter === option.value
                          ? 'bg-[#E70F72] border-[#E70F72] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-[#E70F72]/30'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe Filter */}
              <div>
                <h3 className="text-white font-semibold mb-3">Vibe</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'All Vibes', icon: '✨' },
                    { value: 'romantic', label: 'Romantic', icon: '🌹' },
                    { value: 'calm', label: 'Calm', icon: '🍃' },
                    { value: 'social', label: 'Social', icon: '🎉' },
                    { value: 'creative', label: 'Creative', icon: '🎨' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setVibeFilter(option.value)}
                      className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                        vibeFilter === option.value
                          ? 'bg-[#E70F72] border-[#E70F72] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-[#E70F72]/30'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setTimeFilter('7days');
                  setVibeFilter('all');
                  setShowFilter(false);
                }}
                className="w-full px-4 py-3 rounded-xl border border-white/20 text-white/70 hover:border-[#E70F72]/30 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
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
        {profile && <ActivityMap moments={filteredMoments} profile={profile} mapRef={mapRef} />}
        
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
      <div className="bg-black border-t border-[#E70F72]/20 px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
        {/* Button 1 - Filter */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilter(true)}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex flex-col items-center justify-center gap-1 hover:border-[#E70F72]/50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-[#E70F72]" />
          <span className="text-[#E70F72] text-xs font-medium">Filter</span>
        </motion.button>

        {/* Button 2 - Log Moment (Center, Larger) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(createPageUrl('LogMoment'))}
          className="h-16 md:h-18 px-6 md:px-8 rounded-2xl bg-[#E70F72] border-2 border-[#E70F72] flex items-center justify-center gap-2 hover:bg-[#ff1a8c] transition-all shadow-[0_0_30px_rgba(231,15,114,0.4)]"
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
          <span className="text-white font-semibold text-sm md:text-base">Log Moment</span>
        </motion.button>

        {/* Button 3 - Insights */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInsights(true)}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex flex-col items-center justify-center gap-1 hover:border-[#E70F72]/50 transition-colors"
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#E70F72]" />
          <span className="text-[#E70F72] text-xs font-medium">Insights</span>
        </motion.button>
      </div>
    </div>
  );
}