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
    queryFn: () => base44.entities.Moment.filter({ id: momentId }).then(m => m[0]),
    enabled: !!momentId
  });

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