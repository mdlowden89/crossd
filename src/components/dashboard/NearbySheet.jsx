import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, TrendingUp, Coffee, Music, Sparkles, Navigation, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CrossdButton } from '@/components/ui/crossd-button';
import { base44 } from '@/api/base44Client';

export default function NearbySheet({ onClose, userLocation }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Smart suggestions based on time of day and PlacesDNA
  const getTimeBasedSuggestions = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return [
        { 
          icon: Coffee, 
          color: '#C49A6C',
          title: 'Coffee spots with calm vibes nearby',
          desc: 'Perfect for a quiet morning connection',
          placeTypes: ['cafe', 'coffee_shop'],
          archetype: 'Calm & Cozy'
        },
        { 
          icon: Sparkles, 
          color: '#9B5DE5',
          title: 'Art galleries & creative spaces',
          desc: 'Intellectual morning encounters',
          placeTypes: ['art_gallery', 'museum'],
          archetype: 'Creative'
        }
      ];
    } else if (hour >= 12 && hour < 17) {
      return [
        { 
          icon: Coffee, 
          color: '#FF6B3D',
          title: 'Social lunch spots trending now',
          desc: 'High-energy afternoon vibes',
          placeTypes: ['restaurant', 'cafe'],
          archetype: 'Social & Buzzing'
        },
        { 
          icon: MapPin, 
          color: '#6A8F7A',
          title: 'Parks & outdoor spaces nearby',
          desc: 'Grounded, peaceful encounters',
          placeTypes: ['park', 'natural_feature'],
          archetype: 'Nature & Grounded'
        }
      ];
    } else if (hour >= 17 && hour < 22) {
      return [
        { 
          icon: Sparkles, 
          color: '#E74C78',
          title: 'Romantic dinner spots nearby',
          desc: 'Intimate evening atmosphere',
          placeTypes: ['restaurant', 'wine_bar'],
          archetype: 'Romantic'
        },
        { 
          icon: Music, 
          color: '#F6C90E',
          title: 'Live music venues tonight',
          desc: 'Electric, sensory experiences',
          placeTypes: ['music_venue', 'bar'],
          archetype: 'Live & Electric'
        }
      ];
    } else {
      return [
        { 
          icon: Music, 
          color: '#B026FF',
          title: 'Nightlife & spontaneous vibes',
          desc: 'Late-night spark potential',
          placeTypes: ['night_club', 'bar'],
          archetype: 'Spontaneous & Nightlife'
        },
        { 
          icon: Coffee, 
          color: '#8B7355',
          title: 'Late-night cafes & intimate spots',
          desc: 'Local, cozy atmosphere',
          placeTypes: ['cafe', 'bar'],
          archetype: 'Intimate Local'
        }
      ];
    }
  };

  const suggestions = getTimeBasedSuggestions();

  const handleSuggestionClick = async (suggestion) => {
    if (!userLocation) {
      alert('Please enable location to see nearby places');
      return;
    }

    setSelectedSuggestion(suggestion);
    setLoading(true);
    
    try {
      // Search for places using the backend function
      const response = await base44.functions.invoke('searchPlaces', {
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: suggestion.placeTypes[0], // Use first type
        radius: 16000 // ~10 miles
      });
      
      // Get top 2 places
      const places = response.data.places?.slice(0, 2) || [];
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error fetching places:', error);
      setNearbyPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMoment = () => {
    onClose();
    navigate(createPageUrl('LogMoment'));
  };

  const handlePlaceSelect = (place) => {
    // Store selected place in sessionStorage for LogMoment page
    sessionStorage.setItem('selectedPlace', JSON.stringify({
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      types: place.types,
      place_id: place.place_id
    }));
    onClose();
    navigate(createPageUrl('LogMoment'));
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[9998]"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black rounded-t-3xl border-t border-[#E70F72]/30 overflow-y-auto max-h-[85vh]"
        style={{ boxShadow: '0 -4px 20px rgba(231, 15, 114, 0.1)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-[#E70F72]/20 pt-6 px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Nearby</h2>
              <p className="text-white/50 text-sm mt-1">Places with spark potential around you</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white/50" />
            </button>
          </div>
          {/* Spark gradient line */}
          <div className="h-1 bg-gradient-to-r from-[#E70F72] to-transparent rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4 pb-20">
          {!userLocation && (
            <div className="bg-[#E70F72]/10 border border-[#E70F72]/30 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-[#E70F72] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80 text-sm">
                    Enable location to see personalized nearby suggestions
                  </p>
                </div>
              </div>
            </div>
          )}

          {suggestions.map((suggestion, idx) => {
            const Icon = suggestion.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-2xl p-5 border hover:shadow-lg transition-all cursor-pointer"
                style={{ 
                  borderColor: `${suggestion.color}40`,
                  boxShadow: `0 0 20px ${suggestion.color}15`
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon Badge */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: `${suggestion.color}20`,
                      border: `2px solid ${suggestion.color}60`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: suggestion.color }} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {suggestion.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-3">
                      {suggestion.desc}
                    </p>
                    
                    {/* Archetype badge */}
                    <span 
                      className="inline-block text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ 
                        backgroundColor: `${suggestion.color}25`,
                        color: suggestion.color,
                        border: `1px solid ${suggestion.color}40`
                      }}
                    >
                      {suggestion.archetype}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Manual log option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: suggestions.length * 0.1 }}
            className="pt-4"
          >
            <CrossdButton
              onClick={handleLogMoment}
              className="w-full bg-[#E70F72] hover:bg-[#ff1a8c]"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Log a Custom Moment
            </CrossdButton>
          </motion.div>

          <p className="text-white/40 text-xs text-center mt-4 italic">
            Tap any suggestion to see actual places near you
          </p>
        </div>
      </motion.div>

      {/* Places Modal */}
      <AnimatePresence>
        {selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6"
            onClick={() => setSelectedSuggestion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#0B0B0B] to-[#050505] rounded-3xl border border-[#E70F72]/30 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Nearby Options</h3>
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/50 text-sm">Finding places near you...</p>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="space-y-3">
                  {nearbyPlaces.map((place, idx) => (
                    <motion.button
                      key={place.place_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handlePlaceSelect(place)}
                      className="w-full bg-black/40 rounded-2xl p-4 border border-[#E70F72]/20 hover:border-[#E70F72]/50 transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#E70F72] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{place.name}</h4>
                          <p className="text-white/50 text-xs mb-2">{place.vicinity}</p>
                          {place.rating && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-yellow-500">★</span>
                              <span className="text-white/70">{place.rating}</span>
                              {place.user_ratings_total && (
                                <span className="text-white/40">({place.user_ratings_total})</span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                      </div>
                    </motion.button>
                  ))}
                  
                  <button
                    onClick={handleLogMoment}
                    className="w-full mt-4 py-3 px-4 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
                  >
                    Or log a custom location
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-white/50 text-sm mb-4">No places found nearby</p>
                  <CrossdButton onClick={handleLogMoment} size="sm">
                    Log Custom Moment
                  </CrossdButton>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}