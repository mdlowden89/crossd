import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import ActivityMap from './ActivityMap';
import MomentsTrail from '@/components/moments/MomentsTrail';
import { createPageUrl } from '@/utils';

export default function ExpandedActivityMap({ moments, profile, onClose }) {
  const [bottomSheetHeight, setBottomSheetHeight] = useState(200);
  const MIN_HEIGHT = 150;
  const MAX_HEIGHT = window.innerHeight * 0.7;

  const handleDrag = (e) => {
    const startY = e.clientY || e.touches?.[0]?.clientY;
    const startHeight = bottomSheetHeight;

    const handleMove = (moveEvent) => {
      const currentY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
      const diff = startY - currentY;
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + diff));
      setBottomSheetHeight(newHeight);
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Map - fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <ActivityMap moments={moments} profile={profile} />
      </div>

      {/* Bottom Sheet - Moments List */}
      <motion.div
        className="bg-black border-t border-[#E70F72]/30 overflow-hidden flex flex-col"
        style={{ height: bottomSheetHeight }}
        layout
      >
        {/* Drag Handle */}
        <div
          onMouseDown={handleDrag}
          onTouchStart={handleDrag}
          className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing bg-[#0B0B0B] border-b border-white/10"
        >
          <div className="w-12 h-1 rounded-full bg-white/30" />
        </div>

        {/* Moments Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {moments.length > 0 ? (
            <div className="space-y-2">
              {moments.map((moment) => (
                <div
                  key={moment.id}
                  onClick={() => window.location.href = createPageUrl('MomentDetail') + `?id=${moment.id}`}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#E70F72]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{moment.venue_name || 'Logged Moment'}</p>
                      <p className="text-white/50 text-sm">
                        {new Date(moment.created_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    {moment.nearby_spark_count > 0 && (
                      <span className="text-xs bg-[#E70F72]/20 text-[#E70F72] px-2 py-1 rounded-full">
                        ✨ {moment.nearby_spark_count}
                      </span>
                    )}
                  </div>
                  {moment.note && (
                    <p className="text-white/70 text-xs mt-2 line-clamp-2">{moment.note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-8">No moments logged yet</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}