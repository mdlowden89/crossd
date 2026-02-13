import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route, LayoutGrid, List } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';
import MomentTrailCard from './MomentTrailCard';

export default function MomentsTrail({ moments, onMomentClick }) {
  const [viewMode, setViewMode] = useState('grid');

  if (moments.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-[#E70F72]" />
          <div>
            <h2 className="text-white font-semibold">Your Moment Logs</h2>
            <p className="text-white/50 text-xs">A highlight reel of your memorable moments</p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2 bg-[#0B0B0B] rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-[#E70F72]/20 text-[#E70F72]' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' 
                ? 'bg-[#E70F72]/20 text-[#E70F72]' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          {moments.map((moment, index) => (
            <MomentTrailCard
              key={moment.id}
              moment={moment}
              status="pending"
              onClick={() => onMomentClick(moment.id)}
            />
          ))}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-[52px] top-0 bottom-0 w-px bg-gradient-to-b from-[#E70F72]/40 via-[#E70F72]/20 to-transparent" />
          
          {moments.map((moment, index) => {
            const momentDate = new Date(moment.created_date);
            const prevMomentDate = index > 0 ? new Date(moments[index - 1].created_date) : null;
            const showDateDivider = !prevMomentDate || 
              momentDate.toDateString() !== prevMomentDate.toDateString();
            
            // Calculate time of day
            const hour = momentDate.getHours();
            let timeOfDay = '';
            if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
            else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
            else if (hour >= 17 && hour < 21) timeOfDay = 'Evening';
            else timeOfDay = 'Night';

            return (
              <div key={moment.id}>
                {/* Date Divider */}
                {showDateDivider && (
                  <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
                    <div className="w-11 h-11 rounded-full bg-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#E70F72] text-sm font-bold">
                        {momentDate.getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">
                        {momentDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-16 pb-6 last:pb-0"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-[46px] top-2 w-3 h-3 rounded-full bg-[#E70F72] border-2 border-black shadow-lg shadow-[#E70F72]/50" />

                  {/* Story Card */}
                  <div 
                    onClick={() => onMomentClick(moment.id)}
                    className="cursor-pointer group"
                  >
                    <div className="bg-[#0B0B0B] border border-white/10 rounded-xl p-4 hover:border-[#E70F72]/40 transition-all">
                      <div className="flex items-start gap-4">
                        {/* Image Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#050505] border border-white/10">
                          <img
                            src={`https://source.unsplash.com/100x100/?${encodeURIComponent(moment.venue_name)}`}
                            alt={moment.venue_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Story Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-white/40 text-xs">
                              {timeOfDay} • {momentDate.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          <h3 className="font-semibold text-white mb-1.5 leading-snug">
                            {moment.venue_name || 'Somewhere special'}
                          </h3>
                          
                          {moment.note && (
                            <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                              {moment.note}
                            </p>
                          )}
                          
                          {moment.nearby_spark_count > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#E70F72] animate-pulse" />
                              <p className="text-[#E70F72] text-xs font-medium">
                                {moment.nearby_spark_count} {moment.nearby_spark_count === 1 ? 'person' : 'people'} nearby
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}