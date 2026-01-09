import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, Settings, User } from 'lucide-react';
import CrossdLogo from '../common/CrossdLogo';

export default function TopHeader({ showNotifications = true, notificationCount = 0 }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/5 z-40 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={createPageUrl('Home')}>
          <CrossdLogo size="sm" />
        </Link>
        
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Link
              to={createPageUrl('Notifications')}
              className="relative p-2 text-white/60 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E70F72] rounded-full text-[10px] font-bold flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
          )}
          <Link
            to={createPageUrl('Settings')}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <Link
            to={createPageUrl('Profile')}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}