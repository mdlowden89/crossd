import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Compass, Share2 } from 'lucide-react';
import ActivityMap from './ActivityMap';

export default function ExpandedActivityMap({ moments, profile, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/70 hover:bg-black/90 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Map - fills most of screen */}
      <div className="flex-1 overflow-hidden">
        <ActivityMap moments={moments} profile={profile} />
      </div>

      {/* Bottom Action Buttons */}
      <div className="bg-black border-t border-[#E70F72]/20 px-6 py-4 flex gap-4">
        {/* Button 1 - Heart */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Heart className="w-7 h-7 text-[#E70F72]" />
        </motion.button>

        {/* Button 2 - Compass */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Compass className="w-7 h-7 text-[#E70F72]" />
        </motion.button>

        {/* Button 3 - Share */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-16 rounded-2xl bg-gradient-to-b from-[#E70F72]/20 to-[#E70F72]/10 border border-[#E70F72]/30 flex items-center justify-center hover:border-[#E70F72]/50 transition-colors"
        >
          <Share2 className="w-7 h-7 text-[#E70F72]" />
        </motion.button>
      </div>
    </motion.div>
  );
}