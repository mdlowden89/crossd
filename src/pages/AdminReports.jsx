import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, AlertTriangle, CheckCircle, Eye, Clock,
  User, Flag, Ban, Loader2, ChevronRight, BarChart3
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdModal } from '@/components/ui/crossd-modal';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState(null);
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

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['open-reports'],
    queryFn: () => base44.entities.Report.filter({ status: 'open' }, '-created_date'),
    enabled: user?.role === 'admin'
  });

  // Get reported profiles
  const { data: reportedProfiles = {} } = useQuery({
    queryKey: ['reported-profiles', reports],
    queryFn: async () => {
      const profiles = {};
      for (const report of reports) {
        const result = await base44.entities.Profile.filter({ id: report.reported_user_id });
        if (result.length > 0) profiles[report.reported_user_id] = result[0];
      }
      return profiles;
    },
    enabled: reports.length > 0
  });

  const actionMutation = useMutation({
    mutationFn: async ({ reportId, action, profileId }) => {
      // Update report
      await base44.entities.Report.update(reportId, { 
        status: 'actioned',
        action_taken: action
      });

      // Take action on profile if needed
      if (action === 'warning') {
        // Just dismiss, no profile action
      } else if (action === 'temporary_ban') {
        await base44.entities.Profile.update(profileId, { 
          status: 'banned',
          discoverable: false
        });
      } else if (action === 'permanent_ban') {
        await base44.entities.Profile.update(profileId, { 
          status: 'banned',
          discoverable: false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['open-reports']);
      setSelectedReport(null);
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async (reportId) => {
      await base44.entities.Report.update(reportId, { 
        status: 'dismissed',
        action_taken: 'none'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['open-reports']);
      setSelectedReport(null);
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

  const reasonLabels = {
    inappropriate_content: 'Inappropriate Content',
    harassment: 'Harassment',
    spam: 'Spam',
    fake_profile: 'Fake Profile',
    underage: 'Underage',
    other: 'Other'
  };

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
          <h1 className="text-xl font-bold text-white">Reports Queue</h1>
          <p className="text-white/65 text-sm">{reports.length} open reports</p>
        </div>
        <Link
          to="/admin-venue-analytics"
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Venue Analytics
        </Link>
      </div>

      {reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">All Clear!</h2>
          <p className="text-white/65">No open reports</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, index) => {
            const profile = reportedProfiles[report.reported_user_id];
            
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CrossdCard 
                  className="cursor-pointer hover:border-[#E70F72]/40"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a]">
                      {profile?.photos?.[0]?.url ? (
                        <img 
                          src={profile.photos[0].url} 
                          alt={profile.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{profile?.display_name || 'Unknown'}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                          {reasonLabels[report.reason]}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </CrossdCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <CrossdModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Review Report"
        className="max-w-lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Reported User */}
            {reportedProfiles[selectedReport.reported_user_id] && (
              <CrossdCard>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a1a]">
                    {reportedProfiles[selectedReport.reported_user_id]?.photos?.[0]?.url ? (
                      <img 
                        src={reportedProfiles[selectedReport.reported_user_id].photos[0].url} 
                        alt="Reported user"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {reportedProfiles[selectedReport.reported_user_id]?.display_name}
                    </h3>
                    <p className="text-white/50 text-sm">Reported User</p>
                  </div>
                </div>
              </CrossdCard>
            )}

            {/* Report Details */}
            <CrossdCard>
              <div className="space-y-3">
                <div>
                  <p className="text-white/50 text-sm">Reason</p>
                  <p className="text-white">{reasonLabels[selectedReport.reason]}</p>
                </div>
                {selectedReport.details && (
                  <div>
                    <p className="text-white/50 text-sm">Details</p>
                    <p className="text-white">{selectedReport.details}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/50 text-sm">Reported</p>
                  <p className="text-white">{new Date(selectedReport.created_date).toLocaleString()}</p>
                </div>
              </div>
            </CrossdCard>

            {/* Actions */}
            <div className="space-y-3">
              <CrossdButton
                variant="secondary"
                className="w-full"
                onClick={() => dismissMutation.mutate(selectedReport.id)}
                loading={dismissMutation.isPending}
              >
                Dismiss Report
              </CrossdButton>
              
              <CrossdButton
                variant="secondary"
                className="w-full"
                onClick={() => actionMutation.mutate({ 
                  reportId: selectedReport.id, 
                  action: 'warning',
                  profileId: selectedReport.reported_user_id
                })}
                loading={actionMutation.isPending}
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Issue Warning
              </CrossdButton>
              
              <CrossdButton
                variant="danger"
                className="w-full"
                onClick={() => actionMutation.mutate({ 
                  reportId: selectedReport.id, 
                  action: 'permanent_ban',
                  profileId: selectedReport.reported_user_id
                })}
                loading={actionMutation.isPending}
              >
                <Ban className="w-5 h-5 mr-2" />
                Ban User
              </CrossdButton>
            </div>
          </div>
        )}
      </CrossdModal>
    </div>
  );
}