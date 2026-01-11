import React, { useEffect, useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        window.location.href = createPageUrl('Welcome');
        return;
      }

      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });

      if (profiles.length === 0 || !profiles[0].onboarding_complete) {
        // No profile or onboarding not complete
        if (profiles.length === 0) {
          window.location.href = createPageUrl('Onboarding');
        } else {
          window.location.href = createPageUrl('SetupProfile');
        }
        return;
      }

      // Profile exists and complete, go to Dashboard
      window.location.href = createPageUrl('Dashboard');
    } catch (error) {
      window.location.href = createPageUrl('Welcome');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}