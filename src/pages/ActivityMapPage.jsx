import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin, Compass, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActivityMap from '@/components/dashboard/ActivityMap';
import InsightsSheet from '@/components/dashboard/InsightsSheet';
import MomentsListSheet from '@/components/dashboard/MomentsListSheet';
import NearbySheet from '@/components/dashboard/NearbySheet';
import ZoneCard from '@/components/map/ZoneCard';
import MapFilters from '@/components/map/MapFilters';
import ZoneSparkSheet from '@/components/map/ZoneSparkSheet';

export default function ActivityMapPage() {
  const [user, setUser] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [activeLayer, setActiveLayer] = useState('moments');
  const [liveSpark, setLiveSpark] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSparkZone, setSelectedSparkZone] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    time: 'all',
    type: 'myMoments',
    vibe: null,
    matchMomentsOnly: false,
    intensity: 'medium'
  });
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

  // Mock zone data for demo purposes
  const MOCK_HISTORIC_ZONES = [
    { zone_id: 'ldn_brixton', centroid_lat: 51.4613, centroid_lng: -0.1156, historic_score: 0.88, dominant_archetypes: ['nightlife', 'social_buzzing'], archetype_scores: { nightlife: 0.88, social_buzzing: 0.72 }, peak_buckets: ['evening', 'night'], moment_count: 142 },
    { zone_id: 'ldn_peckham', centroid_lat: 51.4740, centroid_lng: -0.0697, historic_score: 0.75, dominant_archetypes: ['creative', 'social_buzzing'], archetype_scores: { creative: 0.75, social_buzzing: 0.60 }, peak_buckets: ['evening', 'afternoon'], moment_count: 98 },
    { zone_id: 'ldn_dalston', centroid_lat: 51.5462, centroid_lng: -0.0754, historic_score: 0.82, dominant_archetypes: ['live_electric', 'nightlife'], archetype_scores: { live_electric: 0.82, nightlife: 0.70 }, peak_buckets: ['night', 'late'], moment_count: 117 },
    { zone_id: 'ldn_shoreditch', centroid_lat: 51.5225, centroid_lng: -0.0755, historic_score: 0.91, dominant_archetypes: ['creative', 'live_electric'], archetype_scores: { creative: 0.91, live_electric: 0.78 }, peak_buckets: ['evening', 'night'], moment_count: 203 },
    { zone_id: 'ldn_soho', centroid_lat: 51.5137, centroid_lng: -0.1337, historic_score: 0.95, dominant_archetypes: ['social_buzzing', 'romantic'], archetype_scores: { social_buzzing: 0.95, romantic: 0.80 }, peak_buckets: ['afternoon', 'evening', 'night'], moment_count: 289 },
    { zone_id: 'ldn_greenwich', centroid_lat: 51.4827, centroid_lng: -0.0077, historic_score: 0.62, dominant_archetypes: ['nature_grounded', 'calm_cozy'], archetype_scores: { nature_grounded: 0.62, calm_cozy: 0.50 }, peak_buckets: ['morning', 'afternoon'], moment_count: 74 },
    { zone_id: 'ldn_hackney', centroid_lat: 51.5450, centroid_lng: -0.0553, historic_score: 0.70, dominant_archetypes: ['creative', 'intimate_local'], archetype_scores: { creative: 0.70, intimate_local: 0.58 }, peak_buckets: ['afternoon', 'evening'], moment_count: 88 },
    { zone_id: 'ldn_kingsxrd', centroid_lat: 51.5306, centroid_lng: -0.1234, historic_score: 0.78, dominant_archetypes: ['deep_intellectual', 'social_buzzing'], archetype_scores: { deep_intellectual: 0.78, social_buzzing: 0.65 }, peak_buckets: ['morning', 'evening'], moment_count: 105 },
  ];

  const MOCK_LIVE_ZONES = [
    { zone_id: 'ldn_brixton',   live_score: 0.95, state: 'peaking', activity_band: 'high', recent_moment_count: 18 },
    { zone_id: 'ldn_shoreditch', live_score: 0.80, state: 'peaking', activity_band: 'high', recent_moment_count: 24 },
    { zone_id: 'ldn_soho',      live_score: 0.72, state: 'active',  activity_band: 'high', recent_moment_count: 31 },
    { zone_id: 'ldn_peckham',   live_score: 0.55, state: 'active',  activity_band: 'med',  recent_moment_count: 9  },
    { zone_id: 'ldn_dalston',   live_score: 0.40, state: 'active',  activity_band: 'med',  recent_moment_count: 7  },
    { zone_id: 'ldn_hackney',   live_score: 0.20, state: 'calm',    activity_band: 'low',  recent_moment_count: 3  },
    { zone_id: 'ldn_kingsxrd',  live_score: 0.35, state: 'active',  activity_band: 'med',  recent_moment_count: 6  },
  ];

  // Fetch historic + live zone data
  const { data: historicZonesRaw = [] } = useQuery({
    queryKey: ['zone-historic'],
    queryFn: () => base44.entities.ZoneHistoric.list('-historic_score', 100),
    enabled: liveSpark,
    staleTime: 5 * 60 * 1000,
  });

  const { data: liveZonesRaw = [] } = useQuery({
    queryKey: ['zone-live'],
    queryFn: () => base44.entities.ZoneLive.list('-live_score', 100),
    enabled: liveSpark,
    refetchInterval: 60 * 1000, // refresh every minute
  });

  // Fall back to mock data if DB is empty
  const historicZones = historicZonesRaw.length > 0 ? historicZonesRaw : MOCK_HISTORIC_ZONES;
  const liveZones = liveZonesRaw.length > 0 ? liveZonesRaw : MOCK_LIVE_ZONES;

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

  // Filter moments based on active filters
  const filteredMoments = React.useMemo(() => {
    if (!moments) return [];
    
    let filtered = [...moments];
    
    // Time filter
    if (filters.time !== 'all') {
      const now = new Date();
      let cutoffDate;
      if (filters.time === 'today') {
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filters.time === '7days') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.time === '30days') {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (cutoffDate) {
        filtered = filtered.filter(m => new Date(m.created_date) >= cutoffDate);
      }
    }
    
    // Vibe filter (map to mood_tags or venue_types)
    if (filters.vibe) {
      const vibeMap = {
        calm: ['cafe', 'park', 'museum', 'library'],
        social: ['restaurant', 'bar', 'night_club'],
        romantic: ['restaurant', 'bar', 'wine_bar'],
        creative: ['art_gallery', 'museum', 'bookstore'],
        highEnergy: ['night_club', 'gym', 'sports_complex']
      };
      const targetTypes = vibeMap[filters.vibe] || [];
      filtered = filtered.filter(m => 
        m.venue_types?.some(vt => targetTypes.includes(vt)) ||
        m.mood_tags?.some(tag => tag.toLowerCase().includes(filters.vibe))
      );
    }
    
    // Match moments only filter (placeholder - would need match data)
    if (filters.matchMomentsOnly) {
      // Filter moments that led to matches (would need crossing/match data)
      // For now, just return all as we don't have that relationship data here
    }
    
    return filtered;
  }, [moments, filters]);

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col safe-area-top safe-area-bottom">
      <AnimatePresence>
        {showInsights && (
          <InsightsSheet moments={moments} profile={profile} onClose={() => setShowInsights(false)} userId={profile?.id} />
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
        {selectedSparkZone && (
          <ZoneSparkSheet
            zone={selectedSparkZone}
            isPremium={profile?.crossd_plus || false}
            onClose={() => setSelectedSparkZone(null)}
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
      
      {/* Map Filters */}
      <MapFilters 
        filters={filters}
        onFiltersChange={setFilters}
        isPremium={profile?.crossd_plus || false}
      />
      
      {/* Close button */}
      <button
        onClick={() => navigate(createPageUrl('Dashboard'))}
        className="absolute top-6 right-6 z-[9999] p-3 rounded-full bg-black border border-[#E70F72]/50 hover:bg-[#E70F72]/20 transition-all"
      >
        <X className="w-6 h-6 text-[#E70F72]" />
      </button>

      {/* Live Spark toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLiveSpark(v => !v)}
        className={`absolute bottom-24 right-6 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg ${
          liveSpark
            ? 'bg-[#FF6B3D] text-white shadow-orange-500/30'
            : 'bg-black border border-white/20 text-white/70'
        }`}
        style={liveSpark ? { boxShadow: '0 0 20px rgba(255,107,61,0.4)' } : {}}
      >
        <Flame className={`w-4 h-4 ${liveSpark ? 'text-white' : 'text-white/50'}`} />
        Live Spark
      </motion.button>

      {/* Map - fills most of screen */}
      <div className="flex-1 w-full h-full overflow-hidden" ref={setMapRef}>
        {profile && (
          <ActivityMap 
            moments={filteredMoments} 
            profile={profile} 
            mapRef={mapRef}
            activeLayer={activeLayer}
            onZoneClick={setSelectedZone}
            liveSpark={liveSpark}
            historicZones={historicZones}
            liveZones={liveZones}
            onSparkZoneClick={setSelectedSparkZone}
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
        {/* Button 1 - City Pulse */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInsights(true)}
          className="flex-1 h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex flex-col items-center justify-center gap-1 hover:border-[#E70F72]/50 transition-colors"
        >
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          <span className="text-[#E70F72] text-[10px] font-bold tracking-wide">Pulse</span>
        </motion.button>

        {/* Button 2 - Nearby */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNearby(true)}
          className="flex-1 h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex flex-col items-center justify-center gap-1 hover:border-[#E70F72]/50 transition-colors"
        >
          <MapPin className="w-5 h-5 text-[#E70F72]" />
          <span className="text-[#E70F72] text-[10px] font-bold tracking-wide">Nearby</span>
        </motion.button>

        {/* Button 3 - Moments */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMoments(true)}
          className="flex-1 h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex flex-col items-center justify-center gap-1 hover:border-[#E70F72]/50 transition-colors"
        >
          <Zap className="w-5 h-5 text-[#E70F72]" />
          <span className="text-[#E70F72] text-[10px] font-bold tracking-wide">Moments</span>
        </motion.button>
      </div>
    </div>
  );
}