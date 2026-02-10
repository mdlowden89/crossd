import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Map, Grid3x3, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdButton } from '@/components/ui/crossd-button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

export default function SparkSuggestionsSection({ profile, apiKey }) {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Mock data for demo
  const mockSuggestions = [
    {
      id: 'mock-1',
      placeName: 'The Blind Poet',
      type: 'Hidden Gem',
      vibe: 'Cozy & Intimate',
      reason: `Because you're an ${profile?.mbti_type || 'INFP'} who appreciates deep conversations, this tucked-away poetry bar hosts open mic nights where meaningful connections happen naturally.`,
      address: '112 Portobello Road, London',
      coordinates: { lat: 51.5194, lng: -0.2058 },
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'
    },
    {
      id: 'mock-2',
      placeName: 'Dishoom Covent Garden',
      type: 'High-Spark Spot',
      vibe: 'Buzzing & Social',
      reason: 'Your vibe tags suggest you love good food and lively atmospheres—this Bombay café is always packed with interesting people sharing tables.',
      address: '12 Upper St Martin\'s Lane, London',
      coordinates: { lat: 51.5115, lng: -0.1268 },
      imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'
    },
    {
      id: 'mock-3',
      placeName: 'Bounce Farringdon',
      type: 'Social Scene',
      vibe: 'Playful & Energetic',
      reason: 'For someone who values fun and spontaneity, this ping pong bar breaks the ice naturally—expect laughs and friendly competition.',
      address: '121 Holborn, London',
      coordinates: { lat: 51.5186, lng: -0.1089 },
      imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800'
    },
    {
      id: 'mock-4',
      placeName: 'South Bank Book Market',
      type: 'Creative Corner',
      vibe: 'Laid-back & Cultured',
      reason: 'Fellow book lovers gather here on weekends—it's the perfect spot for a serendipitous chat over vintage finds and river views.',
      address: 'South Bank, London',
      coordinates: { lat: 51.5074, lng: -0.1157 },
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'
    },
    {
      id: 'mock-5',
      placeName: 'The Jazz Cafe',
      type: 'Date Night',
      vibe: 'Live Music & Romantic',
      reason: 'Your love for music makes this legendary venue ideal—intimate shows create shared moments that spark real connections.',
      address: '5 Parkway, Camden, London',
      coordinates: { lat: 51.5430, lng: -0.1434 },
      imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'
    }
  ];

  const { data: suggestions = mockSuggestions, isLoading } = useQuery({
    queryKey: ['spark-suggestions', profile?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('getSparkSuggestions', {
        profileId: profile.id
      });
      return response.data.suggestions || mockSuggestions;
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    initialData: mockSuggestions
  });

  const typeColors = {
    'Hidden Gem': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'High-Spark Spot': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'Creative Corner': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Date Night': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Social Scene': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#E70F72] animate-spin" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <CrossdCard>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-[#E70F72]" />
              <h2 className="text-2xl font-bold text-white">Spark Suggestions</h2>
            </div>
            <p className="text-white/60 text-sm">
              Go where your vibe thrives. Your personalized guide to places where you're likely to connect.
            </p>
          </div>
        </div>

        {/* Profile Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-white/10">
          {profile.mbti_type && (
            <Badge className="bg-[#E70F72]/20 text-[#E70F72] border border-[#E70F72]/30">
              {profile.mbti_type}
            </Badge>
          )}
          {profile.vibe_tags?.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="outline" className="border-white/20 text-white/70">
              {tag}
            </Badge>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-[#E70F72] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Weekly Picks
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'map'
                ? 'bg-[#E70F72] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            <Map className="w-4 h-4" />
            Spark Map
          </button>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0B0B0B] border border-white/10 rounded-xl overflow-hidden hover:border-[#E70F72]/50 transition-all"
              >
                {/* Image */}
                {suggestion.imageUrl ? (
                  <div className="relative aspect-video">
                    <img
                      src={suggestion.imageUrl}
                      alt={suggestion.placeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/60 backdrop-blur text-white border-none">
                        {suggestion.vibe}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#E70F72]/10 to-[#E70F72]/5 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-[#E70F72]/30" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">{suggestion.placeName}</h3>
                  <p className={`text-xs font-medium mb-3 inline-block px-2 py-1 rounded-full border ${typeColors[suggestion.type] || 'bg-white/10 text-white/70 border-white/20'}`}>
                    {suggestion.type}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    {suggestion.reason}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedMarker(suggestion);
                      setViewMode('map');
                    }}
                    className="text-sm text-[#E70F72] hover:text-[#E70F72]/80 flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    View on Map
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-[#E70F72]/25">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '500px' }}
              center={
                selectedMarker?.coordinates ||
                (suggestions.length > 0 ? suggestions[0].coordinates : { lat: 51.5074, lng: -0.1278 })
              }
              zoom={selectedMarker ? 15 : 12}
              options={{
                styles: [
                  { elementType: "geometry", stylers: [{ color: "#000000" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
                  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#E70F72" }, { weight: 0.5 }] },
                  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
                  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E70F72" }, { weight: 0.3 }] },
                  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] },
                  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
                  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#E70F72" }, { weight: 0.5 }] },
                  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] },
                  { featureType: "water", elementType: "geometry.stroke", stylers: [{ color: "#E70F72" }, { weight: 0.3 }] },
                  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0B0B0B" }] },
                  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                  { featureType: "transit", stylers: [{ visibility: "off" }] }
                ],
                disableDefaultUI: true,
                zoomControl: true
              }}
            >
              {suggestions.map((suggestion) => (
                <Marker
                  key={suggestion.id}
                  position={suggestion.coordinates}
                  onClick={() => setSelectedMarker(suggestion)}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 14,
                    fillColor: '#E70F72',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3
                  }}
                />
              ))}

              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.coordinates}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 bg-[#0B0B0B] text-white max-w-xs">
                    <h3 className="font-semibold mb-1">{selectedMarker.placeName}</h3>
                    <p className="text-sm text-white/70 mb-2">{selectedMarker.reason}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMarker.placeName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#E70F72] hover:text-[#E70F72]/80 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in Google Maps
                    </a>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}
      </CrossdCard>
    </div>
  );
}