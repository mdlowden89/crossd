import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Lightbulb, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SparkAssist({ myProfile, otherProfile, onSelectMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [toneAdvice, setToneAdvice] = useState(null);

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    if (!myProfile?.mbti_type || !otherProfile?.mbti_type) return;
    
    setLoading(true);
    
    const prompt = `You are an expert in MBTI personality compatibility and dating conversation dynamics.

My MBTI Type: ${myProfile.mbti_type}
Their MBTI Type: ${otherProfile.mbti_type}

My profile details:
- Vibe tags: ${myProfile.vibe_tags?.join(', ') || 'None'}
- Prompts: ${myProfile.prompts?.map(p => `${p.question}: ${p.answer}`).join('; ') || 'None'}

Their profile details:
- Vibe tags: ${otherProfile.vibe_tags?.join(', ') || 'None'}  
- Prompts: ${otherProfile.prompts?.map(p => `${p.question}: ${p.answer}`).join('; ') || 'None'}

Generate:
1. Three natural, engaging conversation openers tailored to this specific MBTI pairing
2. Tone advice explaining how ${otherProfile.mbti_type} types typically communicate and what they appreciate

Make openers:
- Reference their prompts or vibe tags when possible
- Match the communication style that ${otherProfile.mbti_type} typically responds well to
- Be authentic, not cheesy
- 15-30 words each

Tone advice should be 1-2 sentences explaining the best approach (e.g., "They appreciate direct honesty" or "Start playfully and build depth gradually").`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            openers: {
              type: 'array',
              items: { type: 'string' }
            },
            tone_advice: { type: 'string' }
          }
        }
      });

      setSuggestions(result.openers || []);
      setToneAdvice(result.tone_advice);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelectMessage(suggestion);
    setIsOpen(false);
  };

  if (!myProfile?.mbti_type || !otherProfile?.mbti_type) return null;

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-[#E70F72] transition-colors"
      >
        <Sparkles className="w-5 h-5" />
      </motion.button>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E70F72] to-[#FF6B9D] rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Spark Assist</h2>
                    <p className="text-white/50 text-xs">
                      {myProfile.mbti_type} × {otherProfile.mbti_type} pairing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 mb-4"
                    >
                      <Sparkles className="w-12 h-12 text-[#E70F72]" />
                    </motion.div>
                    <p className="text-white/60 text-sm">Analyzing compatibility...</p>
                  </div>
                ) : (
                  <>
                    {/* Tone Advice Card */}
                    {toneAdvice && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#E70F72]/20 via-[#E70F72]/10 to-transparent border border-[#E70F72]/30 rounded-2xl p-5"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#E70F72] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-sm mb-1">Communication Style</h3>
                            <p className="text-white/80 text-sm leading-relaxed">{toneAdvice}</p>
                          </div>
                        </div>
                        
                        {/* MBTI Badge */}
                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                          <span className="text-xs text-white/50">Best for</span>
                          <div className="px-2 py-1 bg-white/10 rounded-md">
                            <span className="text-[#E70F72] text-xs font-bold">{otherProfile.mbti_type}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Suggested Openers */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-white/50" />
                        <h3 className="text-white font-bold text-sm">Suggested Openers</h3>
                      </div>
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#0B0B0B] border border-white/10 hover:border-[#E70F72]/40 rounded-2xl p-4 text-left transition-all group"
                          >
                            <p className="text-white/90 text-sm leading-relaxed mb-2">{suggestion}</p>
                            <div className="flex items-center gap-2 text-xs text-white/40 group-hover:text-[#E70F72] transition-colors">
                              <span>Tap to use</span>
                              <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                →
                              </motion.div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Pairing Info */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-white/30 text-xs text-center">
                        Generated based on {myProfile.mbti_type} × {otherProfile.mbti_type} compatibility dynamics
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}