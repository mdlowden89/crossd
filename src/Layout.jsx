import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TopHeader from '@/components/navigation/TopHeader';
import BottomNav from '@/components/navigation/BottomNav';

// Pages that don't show the main navigation
const authPages = ['Welcome', 'Login', 'Signup', 'Onboarding', 'SetupProfile', 'Permissions', 'MBTIQuiz', 'FirstMoment', 'Recaps'];
const adminPages = ['AdminVerification', 'AdminReports'];
const fullScreenPages = ['Chat', 'ProfileDetail', 'MomentDetail', 'Verification', 'Settings', 'Notifications', 'ActivityMapPage', 'LogDailyPath'];

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  const { data: notifications } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      const profile = await base44.entities.Profile.filter({ user_id: user.id });
      if (!profile.length) return [];
      return base44.entities.Notification.filter({ 
        user_id: profile[0].id, 
        read: false 
      });
    },
    enabled: isAuthenticated,
    refetchInterval: 30000
  });

  const unreadCount = notifications?.length || 0;
  const showNav = isAuthenticated && !authPages.includes(currentPageName) && !adminPages.includes(currentPageName) && !fullScreenPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        :root {
          --crossd-pink: #E70F72;
          --crossd-black: #000000;
          --crossd-dark: #0B0B0B;
          --crossd-darker: #050505;
        }
        
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(231, 15, 114, 0.3);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(231, 15, 114, 0.5);
        }
      `}</style>
      
      {showNav && (
        <TopHeader 
          showNotifications={true} 
          notificationCount={unreadCount} 
        />
      )}
      
      <main className={showNav ? 'pt-16 pb-40' : ''}>
        {children}
      </main>
      
      {showNav && (
        <BottomNav currentPage={currentPageName} />
      )}
    </div>
  );
}