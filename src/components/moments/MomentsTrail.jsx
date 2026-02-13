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
          className="space-y-3"
        >
          {moments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onMomentClick(moment.id)}
              className="cursor-pointer group"
            >
              <CrossdCard className="hover:border-[#E70F72]/40 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Image Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#050505] border border-white/10">
                    <img
                      src={`https://source.unsplash.com/100x100/?${encodeURIComponent(moment.venue_name)}`}
                      alt={moment.venue_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {moment.venue_name || 'Unknown Location'}
                    </h3>
                    <p className="text-white/50 text-sm mt-1">
                      {new Date(moment.created_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })} • {new Date(moment.created_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {moment.note && (
                      <p className="text-white/60 text-sm mt-2 line-clamp-1">
                        {moment.note}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[#E70F72] text-sm font-medium">⏳</p>
                    <p className="text-white/50 text-xs mt-1">Pending</p>
                  </div>
                </div>
              </CrossdCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}