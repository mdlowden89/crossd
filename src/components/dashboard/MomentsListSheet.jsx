import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Calendar } from 'lucide-react';

export default function MomentsListSheet({ moments, onClose }) {
  const navigate = useNavigate();
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

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-[10000] bg-black rounded-t-3xl border-t border-[#E70F72]/30 max-h-[80vh] overflow-hidden flex flex-col safe-area-bottom"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#E70F72]/20">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl p-4 border border-[#E70F72]/20 hover:border-[#E70F72]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#E70F72]" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {moment.venue_name || 'Unknown Location'}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-white/50 text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(moment.created_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(moment.created_date).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  {moment.note && (
                    <p className="text-white/70 text-sm italic mb-2 bg-white/5 px-3 py-2 rounded-lg">
                      "{moment.note}"
                    </p>
                  )}

                  {moment.mood_tags && moment.mood_tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {moment.mood_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium bg-[#E70F72]/20 text-[#E70F72] px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}