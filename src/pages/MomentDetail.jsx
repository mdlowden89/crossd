import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Clock, Sparkles, Users, 
  Eye, Heart, Trash2
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { format } from 'date-fns';

export default function MomentDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const momentId = urlParams.get('id');
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const { data: moment, isLoading } = useQuery({
    queryKey: ['moment', momentId],
    queryFn: async () => {
      // Check if it's a sample moment
      if (momentId?.startsWith('sample-')) {
        const sampleMoments = generateSampleMoments();
        return sampleMoments.find(m => m.id === momentId);
      }
      const moments = await base44.entities.Moment.filter({ id: momentId });
      return moments[0];
    },
    enabled: !!momentId
  });

  // Generate sample moments (same as Moments page)
  function generateSampleMoments() {
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
  }

  const { data: crossings = [] } = useQuery({
    queryKey: ['moment-crossings', momentId, myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const asA = await base44.entities.Crossing.filter({ moment_a_id: momentId });
      const asB = await base44.entities.Crossing.filter({ moment_b_id: momentId });
      return [...asA, ...asB];
    },
    enabled: !!momentId && !!myProfile
  });

  const deleteMoment = async () => {
    if (!moment) return;
    if (confirm('Are you sure you want to delete this moment?')) {
      await base44.entities.Moment.delete(moment.id);
      window.location.href = createPageUrl('Moments');
    }
  };

  if (isLoading || !moment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{moment.venue_name || 'Moment'}</h1>
          <p className="text-white/65 text-sm">
            {format(new Date(moment.created_date), 'MMMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={deleteMoment}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Map Placeholder */}
      <CrossdCard className="mb-6 h-48 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-[#E70F72] mx-auto mb-2" />
          <p className="text-white/65 text-sm">
            {moment.lat.toFixed(4)}, {moment.lng.toFixed(4)}
          </p>
          <p className="text-white/45 text-xs mt-1">
            Approximate location
          </p>
        </div>
      </CrossdCard>

      {/* Details */}
      <div className="space-y-4 mb-6">
        <CrossdCard>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#E70F72]" />
            <div>
              <p className="text-white/65 text-sm">Logged at</p>
              <p className="text-white">
                {format(new Date(moment.created_date), 'h:mm a')}
              </p>
            </div>
          </div>
        </CrossdCard>

        {moment.note && (
          <CrossdCard>
            <p className="text-white/65 text-sm mb-1">Note</p>
            <p className="text-white">{moment.note}</p>
          </CrossdCard>
        )}
      </div>

      {/* Crossings */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E70F72]" />
          Crossed Paths
        </h2>

        {crossings.length === 0 ? (
          <CrossdCard className="text-center py-8">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/65">No crossings detected yet</p>
            <p className="text-white/45 text-sm mt-1">
              Keep logging moments to find people nearby
            </p>
          </CrossdCard>
        ) : (
          <div className="space-y-3">
            {crossings.map((crossing, index) => (
              <motion.div
                key={crossing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CrossdCard glow className="cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E70F72]/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#E70F72]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        Crossed Path #{index + 1}
                      </p>
                      <p className="text-white/65 text-sm">
                        Score: {crossing.crossing_score || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#E70F72] text-sm font-medium">
                        {crossing.status}
                      </p>
                    </div>
                  </div>
                </CrossdCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <p className="text-white/45 text-xs text-center">
        Identities are kept private until you match.
      </p>
    </div>
  );
}