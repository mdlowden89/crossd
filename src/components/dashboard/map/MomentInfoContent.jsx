import React from 'react';

// Content of the map info window for one logged moment
export default function MomentInfoContent({ moment, state }) {
  return (
    <div className="p-4 max-w-[280px]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{state.placeIcon}</span>
          <div>
            <div className="font-bold text-white text-lg leading-tight">
              {moment.venue_name || 'Logged Moment'}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {new Date(moment.created_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {state.hasMatch && (
          <span className="text-sm font-semibold bg-green-500/30 text-green-300 px-3 py-1.5 rounded-full border border-green-400/30">
            🌟 Match
          </span>
        )}
        {state.isReSight && (
          <span className="text-sm font-semibold bg-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full border border-purple-400/30">
            Re-Sight ×{state.reSightCount}
          </span>
        )}
        {state.isExpiringSoon && (
          <span className="text-sm font-semibold bg-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-full border border-yellow-400/30">
            ⏰ {Math.round(state.hoursUntilExpiry)}h left
          </span>
        )}
        {state.isExpired && (
          <span className="text-sm font-semibold bg-gray-500/30 text-gray-400 px-3 py-1.5 rounded-full border border-gray-400/30">
            Expired
          </span>
        )}
        {state.isToday && (
          <span className="text-sm font-semibold bg-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full border border-orange-400/30">
            Today
          </span>
        )}
        {state.isGlowActive && (
          <span className="text-sm font-semibold bg-pink-500/30 text-pink-300 px-3 py-1.5 rounded-full border border-pink-400/30">
            ✨ Glow Active
          </span>
        )}
      </div>

      {moment.note && (
        <div className="text-white/90 text-base mb-3 italic leading-relaxed px-2 py-2 bg-white/5 rounded-lg border border-white/10">
          "{moment.note}"
        </div>
      )}

      {moment.mood_tags && moment.mood_tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {moment.mood_tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-sm font-medium bg-[#E70F72]/25 text-[#E70F72] px-3 py-1 rounded-full border border-[#E70F72]/40"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-white/50 text-sm pt-3 border-t border-white/10 font-medium">
        {state.ageDays < 1
          ? 'Today'
          : state.ageDays < 2
            ? 'Yesterday'
            : `${Math.round(state.ageDays)} days ago`}
      </div>
    </div>
  );
}