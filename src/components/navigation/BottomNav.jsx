import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Compass, MapPin, MessageCircle, Map, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Explore', icon: Compass, page: 'Explore' },
  { name: 'Moments', icon: MapPin, page: 'Moments' },
  { name: 'Chat', icon: MessageCircle, page: 'ChatList' },
  { name: 'Profile', icon: Sparkles, page: 'Profile', isGlow: true }
];

export default function BottomNav({ currentPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors",
                isActive ? "text-[#E70F72]" : "text-white/50 hover:text-white/70"
              )}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Icon className="w-6 h-6" />
                {item.isGlow && isActive && (
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-[#E70F72]/30 rounded-full blur-md -z-10"
                  />
                )}
              </motion.div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}