import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export default function Moments() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [newMoment, setNewMoment] = useState({ venue_name: '', note: '' });
  const [myProfile, setMyProfile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['my-moments', myProfile?.id],
    queryFn: () => base44.entities.Moment.filter({ user_id: myProfile.id }, '-created_date', 50),
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

  const logMomentMutation = useMutation({
    mutationFn: async () => {
      if (!location || !myProfile) return;

      const now = new Date();
      const timeBucket = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
      const geohash = encodeGeohash(location.lat, location.lng);
      const tileKey = geohash.substring(0, 6);

      return base44.entities.Moment.create({
        user_id: myProfile.id,
        lat: location.lat,
        lng: location.lng,
        geohash,
        tile_key: tileKey,
        time_bucket: timeBucket,
        venue_name: newMoment.venue_name || 'My Location',
        note: newMoment.note || null,
        privacy_level: 'approximate',
        device_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-moments']);
      setShowLogModal(false);
      setNewMoment({ venue_name: '', note: '' });
      setLocation(null);
    }
  });

  const getLocation = () => {
    setGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGettingLocation(false);
        },
        () => setGettingLocation(false),
        { enableHighAccuracy: true }
      );
    } else {
      setGettingLocation(false);
    }
  };

  const openLogModal = () => {
    setShowLogModal(true);
    getLocation();
  };

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Moments</h1>
          <p className="text-white/65 text-sm">Track where you've been</p>
        </div>
        <CrossdButton onClick={openLogModal}>
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
            <CrossdButton onClick={openLogModal}>
              <Plus className="w-5 h-5 mr-1" />
              Log Your First Moment
            </CrossdButton>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {moments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CrossdCard 
                className="cursor-pointer hover:border-[#E70F72]/40 transition-colors"
                onClick={() => window.location.href = createPageUrl('MomentDetail') + `?id=${moment.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E70F72]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#E70F72]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {moment.venue_name || 'Unknown Location'}
                    </h3>
                    <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(new Date(moment.created_date), 'MMM d, h:mm a')}</span>
                      </div>
                      {moment.nearby_spark_count > 0 && (
                        <div className="flex items-center gap-1 text-[#E70F72]">
                          <Users className="w-3.5 h-3.5" />
                          <span>{moment.nearby_spark_count}</span>
                        </div>
                      )}
                    </div>
                    {moment.note && (
                      <p className="text-white/65 text-sm mt-2 line-clamp-1">{moment.note}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </div>
              </CrossdCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Moment Modal */}
      <CrossdModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Log a Moment"
      >
        <div className="space-y-6">
          {/* Location */}
          <CrossdCard>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#E70F72]/10 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-[#E70F72]" />
              </div>
              <div className="flex-1">
                <p className="text-white/65 text-sm">Current Location</p>
                {gettingLocation ? (
                  <p className="text-white/45 text-sm">Getting location...</p>
                ) : location ? (
                  <p className="text-white text-sm">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-red-400 text-sm">Unable to get location</p>
                )}
              </div>
              {!gettingLocation && !location && (
                <CrossdButton variant="secondary" size="sm" onClick={getLocation}>
                  Retry
                </CrossdButton>
              )}
            </div>
          </CrossdCard>

          {/* Venue Name */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">Venue Name</label>
            <CrossdInput
              placeholder="e.g., Coffee Shop, Gym..."
              icon={MapPin}
              value={newMoment.venue_name}
              onChange={(e) => setNewMoment({ ...newMoment, venue_name: e.target.value })}
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">Note (optional)</label>
            <CrossdInput
              placeholder="What's the vibe?"
              icon={Edit3}
              value={newMoment.note}
              onChange={(e) => setNewMoment({ ...newMoment, note: e.target.value })}
            />
          </div>

          <CrossdButton
            onClick={() => logMomentMutation.mutate()}
            className="w-full"
            disabled={!location || logMomentMutation.isPending}
            loading={logMomentMutation.isPending}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Log Moment
          </CrossdButton>

          <p className="text-white/45 text-xs text-center">
            Your precise location is never shared with other users.
          </p>
        </div>
      </CrossdModal>
    </div>
  );
}