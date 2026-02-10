import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Heart, MapPin, Share2, Compass, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActivityMap from '@/components/dashboard/ActivityMap';
import InsightsSheet from '@/components/dashboard/InsightsSheet';
import { AnimatePresence } from 'framer-motion';

export default function ActivityMapPage() {
  const [user, setUser] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
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
      return await base44.entities.Moment.filter({ user_id: profile.id }, '-created_date', 100);
    },
    enabled: !!profile
  });

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col safe-area-top safe-area-bottom">
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
          className="absolute right-6 bottom-32 z-[9999] p-3 rounded-full bg-[#E70F72] hover:bg-[#ff1a8c] transition-all shadow-lg"
        >
          <Compass className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Bottom Action Buttons */}
      <div className="bg-black border-t border-[#E70F72]/20 px-4 md:px-6 py-3 md:py-4 flex gap-3 md:gap-4">
        {/* Button 1 - Heart */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Heart className="w-6 h-6 md:w-7 md:h-7 text-[#E70F72]" />
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

        {/* Button 3 - Share */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Share2 className="w-6 h-6 md:w-7 md:h-7 text-[#E70F72]" />
        </motion.button>
      </div>
    </div>
  );
}