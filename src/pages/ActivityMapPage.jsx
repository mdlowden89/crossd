import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Heart, MapPin, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityMap from '@/components/dashboard/ActivityMap';

export default function ActivityMapPage() {
  const [user, setUser] = useState(null);
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
        onClick={() => navigate(-1)}
        className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-black/70 hover:bg-black/90 transition-colors"
      >
        <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      {/* Map - fills most of screen */}
      <div className="flex-1 w-full h-full overflow-hidden">
        {profile && <ActivityMap moments={moments} profile={profile} />}
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

        {/* Button 2 - Compass */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-14 md:h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Compass className="w-6 h-6 md:w-7 md:h-7 text-[#E70F72]" />
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