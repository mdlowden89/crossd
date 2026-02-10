import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdButton } from '@/components/ui/crossd-button';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SparkSuggestionsUpsell() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <CrossdCard className="border-[#E70F72]/40 bg-gradient-to-br from-[#0B0B0B] to-[#1a0a0f]">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-[#E70F72]/20 to-[#E70F72]/5 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#E70F72]/30"
          >
            <Sparkles className="w-10 h-10 text-[#E70F72]" />
          </motion.div>

          <h2 className="text-2xl font-bold text-[#E70F72] mb-3">
            Unlock Spark Suggestions
          </h2>
          
          <p className="text-white/70 max-w-md mx-auto mb-6 leading-relaxed">
            Go where your vibe thrives. Upgrade to Crossd+ to get personalized recommendations 
            for places to visit, curated just for you by our AI.
          </p>

          <CrossdButton
            onClick={() => window.location.href = createPageUrl('CrossdPlus')}
            className="inline-flex items-center gap-2"
          >
            <Star className="w-5 h-5" />
            Upgrade to Crossd+
          </CrossdButton>
        </div>
      </CrossdCard>
    </motion.div>
  );
}