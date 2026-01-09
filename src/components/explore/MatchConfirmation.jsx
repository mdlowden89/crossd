import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';

export default function MatchConfirmation({ profile1, profile2, onMessage, onKeepSwiping }) {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    // Generate random spark particles
    const newSparks = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1.5
    }));
    setSparks(newSparks);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center px-6"
    >
      {/* Spark particles */}
      {sparks.map(spark => (
        <motion.div
          key={spark.id}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: '50%',
            y: '50%'
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: `${spark.x}%`,
            y: `${spark.y}%`
          }}
          transition={{ 
            duration: spark.duration,
            delay: spark.delay,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 bg-[#E70F72] rounded-full"
        />
      ))}

      {/* Content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-center"
      >
        {/* Profile pics */}
        <div className="flex items-center justify-center mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#E70F72] z-10"
          >
            {profile1?.photos?.[0]?.url ? (
              <img 
                src={profile1.photos[0].url} 
                alt={profile1.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]" />
            )}
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="w-14 h-14 -mx-4 bg-black rounded-full flex items-center justify-center z-20 border-2 border-[#E70F72]"
          >
            <Heart className="w-7 h-7 text-[#E70F72]" fill="#E70F72" />
          </motion.div>
          
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#E70F72] z-10"
          >
            {profile2?.photos?.[0]?.url ? (
              <img 
                src={profile2.photos[0].url} 
                alt={profile2.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]" />
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-[#E70F72]" />
            <h1 className="text-4xl font-bold text-white">It's a Match!</h1>
            <Sparkles className="w-6 h-6 text-[#E70F72]" />
          </div>
          
          <p className="text-white/65 mb-8">
            You and {profile2?.display_name || 'someone special'} liked each other
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <CrossdButton onClick={onMessage} size="lg" className="w-full">
              <MessageCircle className="w-5 h-5 mr-2" />
              Send a Message
            </CrossdButton>
            
            <CrossdButton variant="secondary" onClick={onKeepSwiping} size="lg" className="w-full">
              Keep Swiping
            </CrossdButton>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}