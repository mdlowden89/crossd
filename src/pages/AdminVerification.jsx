import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, CheckCircle, XCircle, Eye, Clock,
  User, AlertTriangle, Loader2
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdModal } from '@/components/ui/crossd-modal';

export default function AdminVerification() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    if (currentUser?.role !== 'admin') {
      window.location.href = createPageUrl('Explore');
    }
  };

  const { data: pendingProfiles = [], isLoading } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: () => base44.entities.Profile.filter({ verification_status: 'pending' }),
    enabled: user?.role === 'admin'
  });

  const approveMutation = useMutation({
    mutationFn: async (profileId) => {
      await base44.entities.Profile.update(profileId, { verification_status: 'verified' });
      
      // Create notification
      await base44.entities.Notification.create({
        user_id: profileId,
        type: 'verification_approved',
        title: 'Verification Approved! ✓',
        body: 'Your profile is now verified. Your badge is visible to others.',
        data: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-verifications']);
      setSelectedProfile(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (profileId) => {
      await base44.entities.Profile.update(profileId, { verification_status: 'rejected' });
      
      // Create notification
      await base44.entities.Notification.create({
        user_id: profileId,
        type: 'verification_rejected',
        title: 'Verification Not Approved',
        body: 'Your verification was not approved. Please try again with a clearer photo.',
        data: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-verifications']);
      setSelectedProfile(null);
    }
  });

  if (user?.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
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
        <div>
          <h1 className="text-xl font-bold text-white">Verification Queue</h1>
          <p className="text-white/65 text-sm">{pendingProfiles.length} pending</p>
        </div>
      </div>

      {pendingProfiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">All Clear!</h2>
          <p className="text-white/65">No pending verifications</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pendingProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CrossdCard 
                className="cursor-pointer hover:border-[#E70F72]/40"
                onClick={() => setSelectedProfile(profile)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a1a]">
                    {profile.photos?.[0]?.url ? (
                      <img 
                        src={profile.photos[0].url} 
                        alt={profile.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{profile.display_name}</h3>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Submitted {new Date(profile.updated_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-white/40" />
                </div>
              </CrossdCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <CrossdModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title="Review Verification"
        className="max-w-lg"
      >
        {selectedProfile && (
          <div className="space-y-6">
            {/* Side by Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/65 text-sm mb-2">Profile Photo</p>
                <div className="aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
                  {selectedProfile.photos?.[0]?.url ? (
                    <img 
                      src={selectedProfile.photos[0].url} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-white/65 text-sm mb-2">Verification Selfie</p>
                <div className="aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
                  {selectedProfile.verification_selfie_url ? (
                    <img 
                      src={selectedProfile.verification_selfie_url} 
                      alt="Verification"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AlertTriangle className="w-12 h-12 text-red-500/50" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <CrossdCard>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50">Name</span>
                  <span className="text-white">{selectedProfile.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Created</span>
                  <span className="text-white">{new Date(selectedProfile.created_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Photos</span>
                  <span className="text-white">{selectedProfile.photos?.length || 0}</span>
                </div>
              </div>
            </CrossdCard>

            {/* Actions */}
            <div className="flex gap-4">
              <CrossdButton
                variant="danger"
                className="flex-1"
                onClick={() => rejectMutation.mutate(selectedProfile.id)}
                loading={rejectMutation.isPending}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject
              </CrossdButton>
              <CrossdButton
                className="flex-1"
                onClick={() => approveMutation.mutate(selectedProfile.id)}
                loading={approveMutation.isPending}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve
              </CrossdButton>
            </div>
          </div>
        )}
      </CrossdModal>
    </div>
  );
}