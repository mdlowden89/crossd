import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Bell, Shield, Eye, 
  LogOut, Trash2, HelpCircle, FileText, Mail,
  MapPin, Users, Heart, MessageCircle, Sparkles,
  BadgeCheck
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const [myProfile, setMyProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    const profiles = await base44.entities.Profile.filter({ user_id: currentUser.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const updateProfile = async (updates) => {
    setSaving(true);
    await base44.entities.Profile.update(myProfile.id, updates);
    setMyProfile({ ...myProfile, ...updates });
    setSaving(false);
  };

  const updateNotificationPref = (key, value) => {
    const newPrefs = { ...myProfile.notification_prefs, [key]: value };
    updateProfile({ notification_prefs: newPrefs });
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Welcome'));
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data including matches, messages, and moments. Continue?')) {
        await base44.entities.Profile.update(myProfile.id, { status: 'deleted', discoverable: false });
        handleLogout();
      }
    }
  };

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      {/* Account */}
      <div className="mb-8">
        <h2 className="text-white/65 text-sm font-medium mb-3 px-1">Account</h2>
        <div className="space-y-2">
          <CrossdCard>
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-white/40" />
              <div className="flex-1">
                <p className="text-white">{user?.email}</p>
                <p className="text-white/50 text-sm">Email</p>
              </div>
            </div>
          </CrossdCard>

          <CrossdCard 
            className="cursor-pointer hover:border-[#E70F72]/40"
            onClick={() => window.location.href = createPageUrl('Profile')}
          >
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-white/40" />
              <div className="flex-1">
                <p className="text-white">Edit Profile</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </CrossdCard>

          <CrossdCard 
            className="cursor-pointer hover:border-[#E70F72]/40"
            onClick={() => window.location.href = createPageUrl('Verification')}
          >
            <div className="flex items-center gap-4">
              <BadgeCheck className="w-5 h-5 text-white/40" />
              <div className="flex-1">
                <p className="text-white">Verification</p>
                <p className="text-white/50 text-sm capitalize">{myProfile.verification_status || 'Not verified'}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </CrossdCard>
        </div>
      </div>

      {/* Discovery */}
      <div className="mb-8">
        <h2 className="text-white/65 text-sm font-medium mb-3 px-1">Discovery</h2>
        <div className="space-y-2">
          <CrossdCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Eye className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white">Discoverable</p>
                  <p className="text-white/50 text-sm">Show your profile in discovery</p>
                </div>
              </div>
              <Switch
                checked={myProfile.discoverable !== false}
                onCheckedChange={(checked) => updateProfile({ discoverable: checked })}
              />
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white">Verified Only</p>
                  <p className="text-white/50 text-sm">Only see verified profiles</p>
                </div>
              </div>
              <Switch
                checked={myProfile.verified_only_mode === true}
                onCheckedChange={(checked) => updateProfile({ verified_only_mode: checked })}
              />
            </div>
          </CrossdCard>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <h2 className="text-white/65 text-sm font-medium mb-3 px-1">Notifications</h2>
        <div className="space-y-2">
          <CrossdCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-white/40" />
                <p className="text-white">New Match</p>
              </div>
              <Switch
                checked={myProfile.notification_prefs?.new_match !== false}
                onCheckedChange={(checked) => updateNotificationPref('new_match', checked)}
              />
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageCircle className="w-5 h-5 text-white/40" />
                <p className="text-white">New Message</p>
              </div>
              <Switch
                checked={myProfile.notification_prefs?.new_message !== false}
                onCheckedChange={(checked) => updateNotificationPref('new_message', checked)}
              />
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="w-5 h-5 text-white/40" />
                <p className="text-white">Second Chance Alerts</p>
              </div>
              <Switch
                checked={myProfile.notification_prefs?.second_chance !== false}
                onCheckedChange={(checked) => updateNotificationPref('second_chance', checked)}
              />
            </div>
          </CrossdCard>

          <CrossdCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-white/40" />
                <p className="text-white">Marketing</p>
              </div>
              <Switch
                checked={myProfile.notification_prefs?.marketing === true}
                onCheckedChange={(checked) => updateNotificationPref('marketing', checked)}
              />
            </div>
          </CrossdCard>
        </div>
      </div>

      {/* Support */}
      <div className="mb-8">
        <h2 className="text-white/65 text-sm font-medium mb-3 px-1">Support</h2>
        <div className="space-y-2">
          <CrossdCard 
            className="cursor-pointer hover:border-[#E70F72]/40"
            onClick={() => window.location.href = createPageUrl('HelpCenter')}
          >
            <div className="flex items-center gap-4">
              <HelpCircle className="w-5 h-5 text-white/40" />
              <p className="text-white">Help Center</p>
              <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
            </div>
          </CrossdCard>

          <CrossdCard className="cursor-pointer hover:border-[#E70F72]/40">
            <div className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-white/40" />
              <p className="text-white">Privacy Policy</p>
              <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
            </div>
          </CrossdCard>

          <Link to={createPageUrl('TermsOfService')}>
            <CrossdCard 
              className="cursor-pointer hover:border-[#E70F72]/40"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-white/40" />
                <p className="text-white">Terms of Service</p>
                <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
              </div>
            </CrossdCard>
          </Link>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <CrossdButton variant="secondary" className="w-full" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </CrossdButton>

        <CrossdButton variant="danger" className="w-full" onClick={handleDeleteAccount}>
          <Trash2 className="w-5 h-5 mr-2" />
          Delete Account
        </CrossdButton>
      </div>

      <p className="text-white/30 text-xs text-center mt-8">
        Crossd v1.0.0
      </p>
    </div>
  );
}