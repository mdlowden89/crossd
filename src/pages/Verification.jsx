import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Camera, CheckCircle, Clock, XCircle,
  Shield, AlertCircle, Upload, RefreshCw
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';

export default function Verification() {
  const [myProfile, setMyProfile] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadProfile();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  const startCamera = async () => {
    setCapturing(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions.');
      setCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    setUploading(true);
    setError('');

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'verification-selfie.jpg', { type: 'image/jpeg' });

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Get primary profile photo
        const primaryPhoto = myProfile.photos?.find(p => p.is_primary) || myProfile.photos?.[0];
        if (!primaryPhoto) {
          setError('No profile photo found. Please add a profile photo first.');
          setUploading(false);
          return;
        }

        // Compare selfie with profile photo
        const { data: verification } = await base44.functions.invoke('verifyIdentity', {
          selfie_url: file_url,
          profile_photo_url: primaryPhoto.url
        });

        setVerificationResult(verification);

        // Only mark as pending if recommendation is not reject
        if (verification.recommendation !== 'reject') {
          await base44.entities.Profile.update(myProfile.id, {
            verification_selfie_url: file_url,
            verification_status: 'pending'
          });
        }

        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        setCapturing(false);
        loadProfile();
      } catch (err) {
        setError('Failed to process photo. Please try again.');
      }
      setUploading(false);
    }, 'image/jpeg', 0.9);
  };

  const cancelCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCapturing(false);
  };

  const statusConfig = {
    unverified: {
      icon: Shield,
      color: 'text-white/40',
      bgColor: 'bg-white/10',
      title: 'Not Verified',
      description: 'Verify your identity to build trust with your matches.'
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      title: 'Pending Review',
      description: 'Your verification is being reviewed. This usually takes 24-48 hours.'
    },
    verified: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      title: 'Verified',
      description: 'Your profile is verified! Your badge is now visible to others.'
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      title: 'Rejected',
      description: 'Your verification was not approved. Please try again with a clearer photo.'
    }
  };

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const status = myProfile.verification_status || 'unverified';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-black px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Verification</h1>
      </div>

      {verificationResult && !capturing ? (
        // Verification Result View
        <div className="space-y-6">
          <CrossdCard className={`text-center py-8 border-2 ${
            verificationResult.is_match 
              ? 'border-green-500/50 bg-green-500/10' 
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-20 h-20 mx-auto rounded-full ${
                verificationResult.is_match 
                  ? 'bg-green-500/20' 
                  : 'bg-red-500/20'
              } flex items-center justify-center mb-4`}
            >
              {verificationResult.is_match ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">
              {verificationResult.is_match ? 'Identity Verified!' : 'Identity Mismatch'}
            </h2>
            <p className="text-white/65 mb-4">{verificationResult.feedback}</p>
            <div className="text-sm text-white/50">
              Match Score: {verificationResult.match_score}% ({verificationResult.confidence} confidence)
            </div>
          </CrossdCard>

          {/* Reasons */}
          {verificationResult.reasons && verificationResult.reasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/65 text-sm">Analysis:</p>
              {verificationResult.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg">
                  <span className="text-[#E70F72] mt-0.5">•</span>
                  <span className="text-white/75 text-sm">{reason}</span>
                </div>
              ))}
            </div>
          )}

          <CrossdButton 
            className="w-full" 
            size="lg" 
            onClick={() => {
              setVerificationResult(null);
              loadProfile();
            }}
          >
            Continue
          </CrossdButton>
        </div>
      ) : capturing ? (
        // Camera View
        <div className="space-y-6">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0B0B0B]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-2 border-white/30 rounded-full" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-white mb-2">Position your face in the oval</p>
            <p className="text-white/50 text-sm">Make sure your face is clearly visible</p>
          </div>

          <div className="flex gap-4">
            <CrossdButton variant="secondary" className="flex-1" onClick={cancelCapture}>
              Cancel
            </CrossdButton>
            <CrossdButton 
              className="flex-1" 
              onClick={capturePhoto}
              loading={uploading}
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </CrossdButton>
          </div>
        </div>
      ) : (
        // Status View
        <div className="space-y-6">
          {/* Status Card */}
          <CrossdCard className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-20 h-20 mx-auto rounded-full ${config.bgColor} flex items-center justify-center mb-4`}
            >
              <StatusIcon className={`w-10 h-10 ${config.color}`} />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">{config.title}</h2>
            <p className="text-white/65">{config.description}</p>
          </CrossdCard>

          {/* Current Selfie */}
          {myProfile.verification_selfie_url && (
            <CrossdCard>
              <p className="text-white/65 text-sm mb-3">Your verification photo</p>
              <div className="aspect-square rounded-xl overflow-hidden max-w-[200px] mx-auto">
                <img
                  src={myProfile.verification_selfie_url}
                  alt="Verification selfie"
                  className="w-full h-full object-cover"
                />
              </div>
            </CrossdCard>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {(status === 'unverified' || status === 'rejected') && (
            <CrossdButton className="w-full" size="lg" onClick={startCamera}>
              <Camera className="w-5 h-5 mr-2" />
              {status === 'rejected' ? 'Try Again' : 'Start Verification'}
            </CrossdButton>
          )}

          {status === 'pending' && (
            <CrossdButton variant="secondary" className="w-full" size="lg" onClick={loadProfile}>
              <RefreshCw className="w-5 h-5 mr-2" />
              Check Status
            </CrossdButton>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">How it works</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#E70F72] font-bold">1</span>
              </div>
              <div>
                <p className="text-white">Take a selfie</p>
                <p className="text-white/50 text-sm">We'll compare it with your profile photos</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#E70F72] font-bold">2</span>
              </div>
              <div>
                <p className="text-white">Wait for review</p>
                <p className="text-white/50 text-sm">Our team reviews submissions within 24-48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E70F72]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#E70F72] font-bold">3</span>
              </div>
              <div>
                <p className="text-white">Get your badge</p>
                <p className="text-white/50 text-sm">Once approved, your verified badge appears on your profile</p>
              </div>
            </div>
          </div>

          <p className="text-white/45 text-xs text-center">
            Your verification photo is only used for identity verification and is not shared with other users.
          </p>
        </div>
      )}
    </div>
  );
}