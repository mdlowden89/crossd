import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Sparkles, ChevronRight, Clock, Edit3 } from 'lucide-react';
import CrossdLogo from '@/components/common/CrossdLogo';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdInput } from '@/components/ui/crossd-input';

// Simple geohash encoder
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
      if (lng >= midLng) {
        idx = idx * 2 + 1;
        minLng = midLng;
      } else {
        idx = idx * 2;
        maxLng = midLng;
      }
    } else {
      const midLat = (minLat + maxLat) / 2;
      if (lat >= midLat) {
        idx = idx * 2 + 1;
        minLat = midLat;
      } else {
        idx = idx * 2;
        maxLat = midLat;
      }
    }
    evenBit = !evenBit;
    if (++bit === 5) {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }
  return geohash;
}

export default function FirstMoment() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [note, setNote] = useState('');
  const [venueName, setVenueName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setGettingLocation(true);
    setError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGettingLocation(false);
        },
        (err) => {
          setError('Unable to get your location. Please enable location services.');
          setGettingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Location services not available');
      setGettingLocation(false);
    }
  };

  const logMoment = async () => {
    if (!location) return;

    setLoading(true);
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });

    if (!profiles.length) {
      setError('Profile not found');
      setLoading(false);
      return;
    }

    const now = new Date();
    const timeBucket = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
    const geohash = encodeGeohash(location.lat, location.lng);
    const tileKey = geohash.substring(0, 6);

    await base44.entities.Moment.create({
      user_id: profiles[0].id,
      lat: location.lat,
      lng: location.lng,
      geohash,
      tile_key: tileKey,
      time_bucket: timeBucket,
      venue_name: venueName || 'My Location',
      note: note || null,
      privacy_level: 'approximate',
      device_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    window.location.href = createPageUrl('Explore');
  };

  const skipMoment = () => {
    window.location.href = createPageUrl('Explore');
  };

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <CrossdLogo size="sm" />
          <CrossdButton variant="ghost" size="sm" onClick={skipMoment}>
            Skip
          </CrossdButton>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 bg-[#E70F72]/20 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#E70F72]" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full border-2 border-[#E70F72]"
            />
          </div>
          <p className="text-[#E70F72] text-xs font-semibold tracking-widest uppercase mb-2">Let's start your story</p>
          <h1 className="text-3xl font-bold text-white mb-2">Where are you right now?</h1>
          <p className="text-white/65">
            Your first moment is the beginning of your trail. Every crossing starts here.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CrossdCard className="mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#E70F72]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Navigation className="w-6 h-6 text-[#E70F72]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">Your Location</h3>
                {gettingLocation ? (
                  <p className="text-white/45 text-sm">Getting location...</p>
                ) : location ? (
                  <p className="text-white/65 text-sm">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
              </div>
              {!gettingLocation && !location && (
                <CrossdButton variant="secondary" size="sm" onClick={getLocation}>
                  Retry
                </CrossdButton>
              )}
            </div>
          </CrossdCard>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Venue Name (optional)</label>
              <CrossdInput
                placeholder="e.g., Coffee Shop, Office, etc."
                icon={MapPin}
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Note (optional)</label>
              <CrossdInput
                placeholder="What's the vibe?"
                icon={Edit3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <CrossdButton
            onClick={logMoment}
            className="w-full mb-4"
            size="lg"
            disabled={!location || loading}
            loading={loading}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Log Moment
          </CrossdButton>

          <div className="flex items-center justify-center gap-2 text-white/45 text-sm">
            <Clock className="w-4 h-4" />
            <span>Logged at {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/45 text-xs text-center mt-8"
        >
          Your precise location is never shared with other users.
          We use approximate areas only.
        </motion.p>
      </div>
    </div>
  );
}