import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Calendar, Plus, Trash2, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CrossdButton } from '@/components/ui/crossd-button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MomentsListSheet({ moments, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [swipedMoment, setSwipedMoment] = useState(null);
  
  const sortedMoments = [...moments].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getPlacePhotoUrl = (moment) => {
    if (!moment.venue_id) return null;
    return `https://qtrypzzcjebvfcihiynt.supabase.co/functions/v1/getPlacePhoto?place_id=${moment.venue_id}&max_width=400`;
  };

  const getVibeEmoji = (moment) => {
    const types = moment.venue_types || [];
    if (types.includes('cafe') || types.includes('coffee_shop')) return '☕';
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('bar') || types.includes('night_club')) return '🍸';
    if (types.includes('park')) return '🌳';
    if (types.includes('museum') || types.includes('art_gallery')) return '🎨';
    if (types.includes('gym')) return '💪';
    if (types.includes('tourist_attraction')) return '✨';
    return '📍';
  };

  const handleDelete = async (momentId) => {
    try {
      await base44.entities.Moment.delete(momentId);
      queryClient.invalidateQueries(['my-moments']);
      setSwipedMoment(null);
    } catch (error) {
      console.error('Failed to delete moment:', error);
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-[10000] bg-black rounded-t-3xl border-t border-[#E70F72]/30 max-h-[80vh] overflow-hidden flex flex-col safe-area-bottom"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#E70F72]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Moments</h2>
            <p className="text-white/60 text-sm mt-1">{moments.length} logged encounters</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#E70F72]/20 hover:bg-[#E70F72]/30 transition-colors"
          >
            <X className="w-6 h-6 text-[#E70F72]" />
          </button>
        </div>
        
        <CrossdButton
          onClick={() => {
            onClose();
            navigate(createPageUrl('LogMoment'));
          }}
          className="w-full bg-[#E70F72] hover:bg-[#ff1a8c]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log New Moment
        </CrossdButton>
      </div>

      {/* Scrollable moments list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {sortedMoments.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-white/40" />
            <p>No moments logged yet</p>
          </div>
        ) : (
          sortedMoments.map((moment) => (
            <motion.div
              key={moment.id}
              drag="x"
              dragConstraints={{ left: -100, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (info.offset.x < -80) {
                  setSwipedMoment(moment.id);
                } else {
                  setSwipedMoment(null);
                }
              }}
              className="relative"
            >
              {/* Delete button revealed on swipe */}
              {swipedMoment === moment.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4"
                >
                  <button
                    onClick={() => handleDelete(moment.id)}
                    className="p-3 rounded-xl bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </motion.div>
              )}

              {/* Moment Card */}
              <motion.div
                onClick={() => {
                  onClose();
                  navigate(createPageUrl('MomentDetail') + `?id=${moment.id}`);
                }}
                className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl overflow-hidden border border-[#E70F72]/20 hover:border-[#E70F72]/40 transition-colors cursor-pointer"
              >
                <div className="flex gap-3">
                  {/* Place Photo */}
                  <div className="w-24 h-24 flex-shrink-0 bg-[#E70F72]/10 relative overflow-hidden">
                    {getPlacePhotoUrl(moment) ? (
                      <img
                        src={getPlacePhotoUrl(moment)}
                        alt={moment.venue_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-[#E70F72]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-3 pr-4">
                    <h3 className="text-white font-semibold text-base mb-1.5 truncate">
                      {moment.venue_name || 'Unknown Location'}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-white/50 text-xs mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(moment.created_date).toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(moment.created_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{getVibeEmoji(moment)}</span>
                      <span className="text-xs text-white/60">
                        {moment.venue_types?.[0]?.replace(/_/g, ' ') || 'Place'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}