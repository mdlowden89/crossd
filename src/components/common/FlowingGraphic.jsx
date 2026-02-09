import React from 'react';
import { motion } from 'framer-motion';

export default function FlowingGraphic() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden pointer-events-none">
      <motion.img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696101571241f794c88771c9/ad32279fb_image.png"
        alt="Flowing design"
        className="w-full h-full object-cover object-top"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  );
}