import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, BarChart3, Loader2, TrendingUp, Users, Heart, Zap } from 'lucide-react';
import { PLACE_CATALOGUE } from '@/components/spark/crossdPlacePool';
import { getCrossdDNAFromVenueTypes } from '@/components/spark/googlePlacesDnaMapper';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DNA_COLORS = {
  "Calm & Cosy":        "#C49A6C",
  "Creative":           "#9B5DE5",
  "Live Events":        "#F6C90E",
  "Romantic":           "#E74C78",
  "Active":             "#FF4081",
  "Social Buzz":        "#FFB800",
  "Foodie":             "#FF6B35",
  "Nightlife":          "#8A63F6",
  "Outdoors":           "#2DD881",
  "Wellness":           "#00B4D8",
  "Learning & Culture": "#4169E1",
  "Shopping":           "#F9A8D4",
  "Premium Lifestyle":  "#D4AF37",
  "Work & Ambition":    "#64B5F6",
};

function StatCard({ icon: Icon, label, value, color = '#E70F72' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-white/45 text-xs">{label}</p>
        <p className="text-white font-bold text-lg">{value}</p>
      </div>
    </div>
  );
}

export default function AdminVenueAnalytics() {
  const [sortBy, setSortBy] = useState('matches'); // matches | likes | crossings | score
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (!u || u?.role !== 'admin') window.location.href = '/';
    }).catch(() => {
      window.location.href = '/';
    });
  }, []);

  // Load all the data we need
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['admin-all-profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 200),
    enabled: user?.role === 'admin',
  });

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['admin-all-matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 500),
    enabled: user?.role === 'admin',
  });

  const { data: likes = [], isLoading: loadingLikes } = useQuery({
    queryKey: ['admin-all-likes'],
    queryFn: () => base44.entities.Like.list('-created_date', 500),
    enabled: user?.role === 'admin',
  });

  const { data: crossings = [], isLoading: loadingCrossings } = useQuery({
    queryKey: ['admin-all-crossings'],
    queryFn: () => base44.entities.Crossing.list('-created_date', 500),
    enabled: user?.role === 'admin',
  });

  const isLoading = loadingProfiles || loadingMatches || loadingLikes || loadingCrossings;

  // Build venue template performance by mapping user hangout areas → DNA → templates
  const venueStats = useMemo(() => {
    if (!profiles.length) return [];

    // Build lookup: user_id → DNA tags from their hangout areas
    const userDNA = {};
    profiles.forEach(p => {
      const dnaSet = new Set();
      (p.hangout_areas || []).forEach(area => {
        getCrossdDNAFromVenueTypes(area.venue_types || []).forEach(d => dnaSet.add(d));
      });
      userDNA[p.user_id] = dnaSet;
    });

    // Build lookup: user_id → profile id
    const userToProfile = {};
    profiles.forEach(p => { userToProfile[p.user_id] = p.id; });

    // For each venue template, score how often its DNA tags appear in
    // profiles that went on to match / like / cross
    const stats = {};

    PLACE_CATALOGUE.forEach(venue => {
      stats[venue.id] = {
        id: venue.id,
        label: venue.label,
        icon: venue.icon,
        dna: venue.dna,
        family: venue.experienceFamily,
        matchCount: 0,
        likeCount: 0,
        crossingCount: 0,
        avgCrossingScore: 0,
        crossingScoreSum: 0,
        profileReach: 0, // how many profiles have at least 1 matching DNA tag
      };
    });

    // Count how many user profiles have DNA overlap with each template
    profiles.forEach(p => {
      const pDNA = userDNA[p.user_id] || new Set();
      PLACE_CATALOGUE.forEach(venue => {
        const overlap = venue.dna.filter(d => pDNA.has(d)).length;
        if (overlap > 0) stats[venue.id].profileReach++;
      });
    });

    // Count matches — both users in a match get their DNA checked
    matches.forEach(match => {
      const dnaA = userDNA[match.user_1_id] || new Set();
      const dnaB = userDNA[match.user_2_id] || new Set();
      const combined = new Set([...dnaA, ...dnaB]);
      PLACE_CATALOGUE.forEach(venue => {
        const overlap = venue.dna.filter(d => combined.has(d)).length;
        if (overlap >= 1) stats[venue.id].matchCount++;
      });
    });

    // Count likes
    likes.forEach(like => {
      const fromProfile = profiles.find(p => p.user_id === like.from_user_id);
      const toProfile = profiles.find(p => p.user_id === like.to_user_id);
      const dnaA = userDNA[like.from_user_id] || new Set();
      const dnaB = userDNA[like.to_user_id] || new Set();
      const combined = new Set([...dnaA, ...dnaB]);
      PLACE_CATALOGUE.forEach(venue => {
        const overlap = venue.dna.filter(d => combined.has(d)).length;
        if (overlap >= 1) stats[venue.id].likeCount++;
      });
    });

    // Count crossings + avg score
    crossings.forEach(crossing => {
      const dnaA = userDNA[crossing.user_a_id] || new Set();
      const dnaB = userDNA[crossing.user_b_id] || new Set();
      const combined = new Set([...dnaA, ...dnaB]);
      PLACE_CATALOGUE.forEach(venue => {
        const overlap = venue.dna.filter(d => combined.has(d)).length;
        if (overlap >= 1) {
          stats[venue.id].crossingCount++;
          stats[venue.id].crossingScoreSum += (crossing.crossing_score || 0);
        }
      });
    });

    // Compute avg crossing score and composite score
    return Object.values(stats).map(s => ({
      ...s,
      avgCrossingScore: s.crossingCount > 0 ? Math.round(s.crossingScoreSum / s.crossingCount) : 0,
      // Composite: weighted sum normalised to 0-100
      compositeScore: Math.min(100, Math.round(
        (s.matchCount * 3 + s.likeCount * 1 + s.crossingCount * 0.5) /
        Math.max(1, s.profileReach) * 20
      )),
    }));
  }, [profiles, matches, likes, crossings]);

  const sorted = useMemo(() => {
    const key = sortBy === 'score' ? 'compositeScore'
      : sortBy === 'matches' ? 'matchCount'
      : sortBy === 'likes' ? 'likeCount'
      : 'crossingCount';
    return [...venueStats].sort((a, b) => b[key] - a[key]);
  }, [venueStats, sortBy]);

  // DNA category rollup
  const dnaRollup = useMemo(() => {
    const map = {};
    venueStats.forEach(v => {
      v.dna.forEach(tag => {
        if (!map[tag]) map[tag] = { tag, matches: 0, likes: 0, crossings: 0 };
        map[tag].matches += v.matchCount;
        map[tag].likes += v.likeCount;
        map[tag].crossings += v.crossingCount;
      });
    });
    return Object.values(map).sort((a, b) => b.matches - a.matches);
  }, [venueStats]);

  // Hard block — render nothing until auth is confirmed
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  const top = sorted[0];
  const totalMatches = matches.length;
  const totalLikes = likes.filter(l => l.status === 'active').length;
  const totalCrossings = crossings.length;

  return (
    <div className="min-h-screen bg-black px-4 py-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E70F72]" />
            Venue Template Performance
          </h1>
          <p className="text-white/45 text-xs mt-0.5">Which place types are driving the most spark connections</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Users} label="Total Profiles" value={profiles.length} color="#9B5DE5" />
        <StatCard icon={Heart} label="Total Matches" value={totalMatches} color="#E70F72" />
        <StatCard icon={TrendingUp} label="Total Likes" value={totalLikes} color="#F6C90E" />
        <StatCard icon={Zap} label="Total Crossings" value={totalCrossings} color="#2DD881" />
      </div>

      {/* DNA Category Rollup */}
      <div className="rounded-2xl border border-white/10 bg-white/4 p-4 mb-6">
        <h2 className="text-white font-semibold text-sm mb-3">DNA Category — Match Attribution</h2>
        <p className="text-white/35 text-xs mb-4">Which PlacesDNA archetypes appear most in matched user pairs</p>
        <div className="space-y-2.5">
          {dnaRollup.slice(0, 8).map(({ tag, matches: m }) => {
            const color = DNA_COLORS[tag] || '#E70F72';
            const maxMatches = dnaRollup[0]?.matches || 1;
            return (
              <div key={tag}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color }}>{tag}</span>
                  <span className="text-white/45">{m} matches</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(m / maxMatches) * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'score', label: 'Composite Score' },
          { key: 'matches', label: 'Matches' },
          { key: 'likes', label: 'Likes' },
          { key: 'crossings', label: 'Crossings' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              sortBy === key
                ? 'bg-[#E70F72] border-[#E70F72] text-white'
                : 'border-white/15 text-white/45 hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Venue list */}
      <div className="space-y-2">
        {sorted.map((venue, i) => {
          const maxVal = sortBy === 'score' ? 100
            : sortBy === 'matches' ? (sorted[0]?.matchCount || 1)
            : sortBy === 'likes' ? (sorted[0]?.likeCount || 1)
            : (sorted[0]?.crossingCount || 1);
          const val = sortBy === 'score' ? venue.compositeScore
            : sortBy === 'matches' ? venue.matchCount
            : sortBy === 'likes' ? venue.likeCount
            : venue.crossingCount;

          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isTop = i === 0;

          return (
            <div
              key={venue.id}
              className={`rounded-2xl border p-3 transition-colors ${
                isTop ? 'border-[#E70F72]/40 bg-[#E70F72]/5' : 'border-white/8 bg-white/3'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg flex-shrink-0">{venue.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-white text-sm font-semibold truncate">{venue.label}</span>
                    <span className={`text-xs font-bold flex-shrink-0 ${isTop ? 'text-[#E70F72]' : 'text-white/50'}`}>
                      #{i + 1}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {venue.dna.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${DNA_COLORS[tag] || '#fff'}15`, color: DNA_COLORS[tag] || '#fff' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar */}
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: isTop ? '#E70F72' : '#9B5DE5' }}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-1 text-center">
                {[
                  { label: 'Matches', val: venue.matchCount },
                  { label: 'Likes', val: venue.likeCount },
                  { label: 'Crossings', val: venue.crossingCount },
                  { label: 'Avg Score', val: venue.avgCrossingScore },
                ].map(({ label, val: v }) => (
                  <div key={label}>
                    <p className="text-white font-bold text-xs">{v}</p>
                    <p className="text-white/30 text-[9px]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-white/20 text-[10px] text-center mt-6 pb-8">
        Attribution: venue templates scored by DNA overlap with user hangout areas at time of connection event
      </p>
    </div>
  );
}