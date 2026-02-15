import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CrossdButton } from '@/components/ui/crossd-button';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MomentsListSheet({ moments, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sortedMoments = [...moments].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );
  
  const deleteMomentMutation = useMutation({
    mutationFn: (momentId) => base44.entities.Moment.delete(momentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-moments']);
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  const getVibeEmoji = (moment) => {
    if (moment.mood_tags?.length > 0) {
      const tag = moment.mood_tags[0].toLowerCase();
      if (tag.includes('romantic') || tag.includes('intimate')) return '💕';
      if (tag.includes('calm') || tag.includes('peaceful')) return '🕯️';
      if (tag.includes('social') || tag.includes('vibrant')) return '🎉';
      if (tag.includes('creative') || tag.includes('artistic')) return '🎨';
      if (tag.includes('energetic') || tag.includes('active')) return '⚡';
    }
    const venueType = moment.venue_types?.[0];
    if (venueType === 'cafe' || venueType === 'restaurant') return '🕯️';
    if (venueType === 'bar' || venueType === 'night_club') return '🎉';
    if (venueType === 'park' || venueType === 'museum') return '🌿';
    return '✨';
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
          sortedMoments.map((moment) => <MomentItem key={moment.id} moment={moment} onDelete={deleteMomentMutation.mutate} navigate={navigate} formatDate={formatDate} getVibeEmoji={getVibeEmoji} />)
        )}
      </div>
    </motion.div>
  );
}

function MomentItem({ moment, onDelete, navigate, formatDate, getVibeEmoji }) {
  const [dragX, setDragX] = useState(0);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.1}
      onDragEnd={(e, info) => {
        if (info.offset.x < -80) {
          setShowDelete(true);
        } else {
          setDragX(0);
          setShowDelete(false);
        }
      }}
      onDrag={(e, info) => setDragX(info.offset.x)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, x: showDelete ? -100 : 0 }}
      className="relative"
    >
      {/* Delete button revealed on swipe */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (confirm('Delete this moment?')) {
                onDelete(moment.id);
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-full bg-red-600 rounded-xl flex items-center justify-center z-0"
          >
            <Trash2 className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main card */}
      <div
        onClick={() => navigate(createPageUrl('MomentDetail') + `?id=${moment.id}`)}
        className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl border border-[#E70F72]/20 hover:border-[#E70F72]/40 transition-colors overflow-hidden cursor-pointer relative z-10"
      >
        <div className="flex items-start gap-3 p-4">
          {/* Mini map preview */}
          <div className="w-16 h-16 rounded-xl bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {moment.lat && moment.lng ? (
              <MapContainer
                center={[moment.lat, moment.lng]}
                zoom={15}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                attributionControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[moment.lat, moment.lng]} />
              </MapContainer>
            ) : (
              <MapPin className="w-6 h-6 text-[#E70F72]" />
            )}
            <div className="absolute top-1 right-1 text-lg">{getVibeEmoji(moment)}</div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base mb-1">
              {moment.venue_name || 'Unknown Location'}
            </h3>
            
            <div className="flex items-center gap-3 text-white/50 text-xs mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(moment.created_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(moment.created_date).toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            {moment.note && (
              <p className="text-white/60 text-xs italic line-clamp-1">
                "{moment.note}"
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}