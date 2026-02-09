import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ImageOff } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const statusEmojis = {
  pending: '⏳',
  confirmed: '🤝',
  rejected: '❌',
  waiting: '⏳'
};

export default function MomentTrailCard({ moment, status = 'pending', onClick }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPlacePhoto = async () => {
      try {
        setImageLoading(true);
        const response = await base44.functions.invoke('getPlacePhoto', {
          venue_name: moment.venue_name,
          lat: moment.lat,
          lng: moment.lng
        });
        
        if (response.data?.photo_url) {
          setImageUrl(response.data.photo_url);
        } else {
          setImageError(true);
        }
      } catch (error) {
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    if (moment.venue_name) {
      fetchPlacePhoto();
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [moment.venue_name]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const statusText = {
    pending: 'Waiting for a response...',
    confirmed: 'You matched with someone!',
    rejected: "This moment wasn't a match.",
    waiting: 'Waiting for a response...'
  }[status] || 'Waiting for a response...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="bg-[#0B0B0B] border border-white/10 rounded-lg overflow-hidden hover:border-[#E70F72]/40 transition-colors">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#050505]">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
              <Loader2 className="w-6 h-6 text-[#E70F72] animate-spin" />
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
              <ImageOff className="w-8 h-8 text-white/40 mb-2" />
              <span className="text-white/40 text-xs">No photo available</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={moment.venue_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium border border-white/10">
            <span className="mr-1">{statusEmojis[status] || statusEmojis.pending}</span>
            <span className="text-white text-xs">{status === 'confirmed' ? 'Match' : status === 'rejected' ? 'No Match' : 'Pending'}</span>
          </div>

          {/* Place Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-semibold truncate">
              {moment.venue_name || 'Unknown Location'}
            </h3>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4">
          <p className="text-white/65 text-sm mb-2">
            {format(new Date(moment.created_date), 'MMM d, yyyy • h:mm a')}
          </p>
          <p className="text-white/50 text-xs">
            {statusText}
          </p>
          {moment.note && (
            <p className="text-white/60 text-sm mt-2 line-clamp-2 italic">
              "{moment.note}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}