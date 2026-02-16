import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Clock, Sparkles, Users, ChevronRight, 
  Navigation, Edit3, Loader2
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdInput } from '@/components/ui/crossd-input';
import { CrossdModal } from '@/components/ui/crossd-modal';
import { format } from 'date-fns';
import MomentsTrail from '@/components/moments/MomentsTrail';
import SparkSuggestionsSection from '@/components/moments/SparkSuggestionsSection';
import SparkSuggestionsUpsell from '@/components/moments/SparkSuggestionsUpsell';
import { LoadScript } from '@react-google-maps/api';

// Geohash encoder
function encodeGeohash(lat, lng, precision = 7) {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';
  let minLat = -90, maxLat = 90;
  let minLng = -180, maxLng = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const midLng = (minLng + maxLng) / 2;
      if (lng >= midLng) { idx = idx * 2 + 1; minLng = midLng; }
      else { idx = idx * 2; maxLng = midLng; }
    } else {
      const midLat = (minLat + maxLat) / 2;
      if (lat >= midLat) { idx = idx * 2 + 1; minLat = midLat; }
      else { idx = idx * 2; maxLat = midLat; }
    }
    evenBit = !evenBit;
    if (++bit === 5) { geohash += BASE32[idx]; bit = 0; idx = 0; }
  }
  return geohash;
}

// Generate sample moments for demo
const generateSampleMoments = () => {
  const baseDate = new Date(2026, 1, 9);
  return [
    {
      id: 'sample-1',
      user_id: 'sample',
      venue_name: 'Covent Garden',
      venue_types: ['plaza', 'tourist_attraction'],
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
      user_id: 'sample',
      venue_name: 'The Shard',
      venue_types: ['tourist_attraction'],
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
      user_id: 'sample',
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
      user_id: 'sample',
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
      user_id: 'sample',
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
      user_id: 'sample',
      venue_name: 'Borough Market',
      venue_types: ['market', 'farmers_market'],
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
      user_id: 'sample',
      venue_name: 'Buckingham Palace',
      venue_types: ['tourist_attraction'],
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
      user_id: 'sample',
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
};

const libraries = ['places'];

export default function Moments() {
  const [myProfile, setMyProfile] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    fetchApiKey();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const fetchApiKey = async () => {
    try {
      const key = await base44.functions.invoke('getGoogleApiKey');
      setApiKey(key.data.apiKey);
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['my-moments', myProfile?.id],
    queryFn: async () => {
      const realMoments = await base44.entities.Moment.filter({ user_id: myProfile.id }, '-created_date', 50);
      return realMoments.length > 0 ? realMoments : generateSampleMoments();
    },
    enabled: !!myProfile
  });

  const { data: crossings = [] } = useQuery({
    queryKey: ['my-crossings', myProfile?.id],
    queryFn: async () => {
      const asA = await base44.entities.Crossing.filter({ user_a_id: myProfile.id, status: 'new' });
      const asB = await base44.entities.Crossing.filter({ user_b_id: myProfile.id, status: 'new' });
      return [...asA, ...asB];
    },
    enabled: !!myProfile
  });

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Moments</h1>
          <p className="text-white/65 text-sm">Track where you've been</p>
        </div>
        <CrossdButton onClick={() => window.location.href = createPageUrl('LogMoment')}>
           <Plus className="w-5 h-5 mr-1" />
           Log Moment
        </CrossdButton>
      </div>

      {/* Crossings Alert */}
      {crossings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <CrossdCard glow className="cursor-pointer" onClick={() => window.location.href = createPageUrl('Trail')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E70F72]/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#E70F72]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">You've Crossd Paths!</p>
                <p className="text-white/65 text-sm">
                  {crossings.length} new crossing{crossings.length > 1 ? 's' : ''} detected
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </CrossdCard>
        </motion.div>
      )}

      {/* Moments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
        </div>
      ) : moments.length === 0 ? (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex flex-col items-center justify-center text-center py-20"
         >
           <div className="w-20 h-20 bg-[#E70F72]/10 rounded-full flex items-center justify-center mb-6">
             <MapPin className="w-10 h-10 text-[#E70F72]" />
           </div>
           <h2 className="text-xl font-bold text-white mb-2">No Moments Yet</h2>
           <p className="text-white/65 mb-6">
             Log your first moment to start discovering crossings.
           </p>
           <div className="flex justify-center">
             <CrossdButton onClick={() => window.location.href = createPageUrl('LogMoment')}>
               <Plus className="w-5 h-5 mr-1" />
               Log Your First Moment
             </CrossdButton>
           </div>
         </motion.div>
       ) : (
         <>
           <MomentsTrail 
             moments={moments}
             onMomentClick={(id) => window.location.href = createPageUrl('MomentDetail') + `?id=${id}`}
           />
         </>
       )}

       {/* Spark Suggestions */}
       {moments.length > 0 && myProfile && (
         myProfile.crossd_plus ? (
           <SparkSuggestionsSection profile={myProfile} apiKey={apiKey} />
         ) : (
           <SparkSuggestionsUpsell />
         )
       )}

      </div>
    </LoadScript>
  );
}