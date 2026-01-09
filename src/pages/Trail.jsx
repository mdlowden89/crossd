import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Map, List, Clock, MapPin, Sparkles, Users, 
  ChevronRight, Filter, Heart
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

export default function Trail() {
  const [view, setView] = useState('timeline'); // 'timeline' | 'heatmap'
  const [myProfile, setMyProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const { data: moments = [] } = useQuery({
    queryKey: ['trail-moments', myProfile?.id],
    queryFn: () => base44.entities.Moment.filter({ user_id: myProfile.id }, '-created_date', 100),
    enabled: !!myProfile
  });

  const { data: crossings = [] } = useQuery({
    queryKey: ['trail-crossings', myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const asA = await base44.entities.Crossing.filter({ user_a_id: myProfile.id });
      const asB = await base44.entities.Crossing.filter({ user_b_id: myProfile.id });
      return [...asA, ...asB];
    },
    enabled: !!myProfile
  });

  // Get week days
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group moments by location for heatmap
  const locationCounts = moments.reduce((acc, moment) => {
    const key = moment.tile_key;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Group moments by day
  const momentsByDay = moments.reduce((acc, moment) => {
    const day = format(new Date(moment.created_date), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(moment);
    return acc;
  }, {});

  // Stats
  const totalMoments = moments.length;
  const totalCrossings = crossings.length;
  const uniqueLocations = Object.keys(locationCounts).length;

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Trail</h1>
          <p className="text-white/65 text-sm">Where you've been</p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setView('timeline')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'timeline' ? 'bg-[#E70F72] text-black' : 'text-white/65'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'heatmap' ? 'bg-[#E70F72] text-black' : 'text-white/65'
            }`}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <CrossdCard className="text-center py-4">
          <p className="text-2xl font-bold text-[#E70F72]">{totalMoments}</p>
          <p className="text-white/65 text-xs">Moments</p>
        </CrossdCard>
        <CrossdCard className="text-center py-4">
          <p className="text-2xl font-bold text-[#E70F72]">{totalCrossings}</p>
          <p className="text-white/65 text-xs">Crossings</p>
        </CrossdCard>
        <CrossdCard className="text-center py-4">
          <p className="text-2xl font-bold text-[#E70F72]">{uniqueLocations}</p>
          <p className="text-white/65 text-xs">Places</p>
        </CrossdCard>
      </div>

      {/* Week Selector */}
      <div className="flex justify-between mb-6">
        {weekDays.map(day => {
          const dayMoments = momentsByDay[format(day, 'yyyy-MM-dd')] || [];
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isSelected ? 'bg-[#E70F72]/20' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-white/45 text-xs">
                {format(day, 'EEE')}
              </span>
              <span className={`text-lg font-medium ${
                isToday ? 'text-[#E70F72]' : 'text-white'
              }`}>
                {format(day, 'd')}
              </span>
              {dayMoments.length > 0 && (
                <div className="w-1.5 h-1.5 bg-[#E70F72] rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {view === 'timeline' ? (
        <div className="space-y-4">
          {moments.length === 0 ? (
            <CrossdCard className="text-center py-12">
              <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/65">No moments logged yet</p>
              <CrossdButton 
                variant="secondary" 
                className="mt-4"
                onClick={() => window.location.href = createPageUrl('Moments')}
              >
                Log Your First Moment
              </CrossdButton>
            </CrossdCard>
          ) : (
            <>
              {Object.entries(momentsByDay)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([date, dayMoments]) => (
                  <div key={date}>
                    <p className="text-white/45 text-sm mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(date), 'EEEE, MMMM d')}
                    </p>
                    <div className="space-y-2">
                      {dayMoments.map(moment => (
                        <CrossdCard 
                          key={moment.id}
                          className="cursor-pointer hover:border-[#E70F72]/40"
                          onClick={() => window.location.href = createPageUrl('MomentDetail') + `?id=${moment.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E70F72]/10 rounded-xl flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-[#E70F72]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{moment.venue_name || 'Unknown'}</p>
                              <p className="text-white/50 text-sm">
                                {format(new Date(moment.created_date), 'h:mm a')}
                              </p>
                            </div>
                            {moment.nearby_spark_count > 0 && (
                              <div className="flex items-center gap-1 text-[#E70F72]">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm">{moment.nearby_spark_count}</span>
                              </div>
                            )}
                          </div>
                        </CrossdCard>
                      ))}
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </div>
      ) : (
        // Heatmap View
        <div>
          <CrossdCard className="mb-4">
            <div className="aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Simplified radial heatmap visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {Object.entries(locationCounts).slice(0, 10).map(([key, count], index) => {
                  const angle = (index / 10) * Math.PI * 2;
                  const radius = 40 + Math.random() * 40;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const size = Math.min(count * 8 + 20, 60);
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.6 }}
                      transition={{ delay: index * 0.1 }}
                      className="absolute rounded-full bg-[#E70F72]"
                      style={{
                        width: size,
                        height: size,
                        left: `calc(50% + ${x}px - ${size/2}px)`,
                        top: `calc(50% + ${y}px - ${size/2}px)`,
                        filter: 'blur(10px)'
                      }}
                    />
                  );
                })}
              </div>
              
              {/* Center marker */}
              <div className="relative z-10 w-16 h-16 bg-black/80 rounded-full flex items-center justify-center border-2 border-[#E70F72]">
                <Heart className="w-8 h-8 text-[#E70F72]" />
              </div>
            </div>
          </CrossdCard>

          {/* Location List */}
          <h3 className="text-white font-medium mb-3">Most Visited Places</h3>
          <div className="space-y-2">
            {Object.entries(locationCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([tileKey, count], index) => {
                const moment = moments.find(m => m.tile_key === tileKey);
                return (
                  <CrossdCard key={tileKey}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-[#E70F72]' : 'bg-white/10'
                      }`}>
                        <span className={`font-bold text-sm ${index === 0 ? 'text-black' : 'text-white'}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{moment?.venue_name || 'Unknown Location'}</p>
                        <p className="text-white/50 text-sm">{count} visits</p>
                      </div>
                    </div>
                  </CrossdCard>
                );
              })
            }
          </div>
        </div>
      )}
    </div>
  );
}