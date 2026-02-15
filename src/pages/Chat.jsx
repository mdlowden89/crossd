import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Send, Mic, Square, BadgeCheck, 
  MoreVertical, Flag, Ban, Sparkles, Play, Pause,
  Lightbulb
} from 'lucide-react';
import { CrossdButton } from '@/components/ui/crossd-button';
import { CrossdCard } from '@/components/ui/crossd-card';
import { CrossdModal } from '@/components/ui/crossd-modal';
import { format } from 'date-fns';
import SparkAssist from '@/components/chat/SparkAssist';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('matchId');
  
  const [myProfile, setMyProfile] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    if (profiles.length > 0) setMyProfile(profiles[0]);
  };

  // Fetch match
  const { data: match } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => base44.entities.Match.filter({ id: matchId }).then(m => m[0]),
    enabled: !!matchId
  });

  // Get other profile
  const otherId = match ? (match.user_1_id === myProfile?.id ? match.user_2_id : match.user_1_id) : null;
  
  const { data: otherProfile } = useQuery({
    queryKey: ['other-profile', otherId],
    queryFn: () => base44.entities.Profile.filter({ id: otherId }).then(p => p[0]),
    enabled: !!otherId
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: () => base44.entities.Message.filter({ match_id: matchId }, '-created_date', 100).then(msgs => msgs.reverse()),
    enabled: !!matchId,
    refetchInterval: 3000
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && myProfile) {
      messages.forEach(msg => {
        if (msg.sender_id !== myProfile.id && !msg.read_by?.includes(myProfile.id)) {
          base44.entities.Message.update(msg.id, {
            read_by: [...(msg.read_by || []), myProfile.id]
          });
        }
      });
      
      // Reset unread count
      if (match) {
        const update = match.user_1_id === myProfile.id 
          ? { unread_count_user_1: 0 }
          : { unread_count_user_2: 0 };
        base44.entities.Match.update(match.id, update);
      }
    }
  }, [messages, myProfile, match]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await base44.entities.Message.create({
        match_id: matchId,
        sender_id: myProfile.id,
        ...messageData
      });
      
      // Update match last message time and unread count
      const unreadUpdate = match.user_1_id === myProfile.id 
        ? { unread_count_user_2: (match.unread_count_user_2 || 0) + 1 }
        : { unread_count_user_1: (match.unread_count_user_1 || 0) + 1 };
      
      await base44.entities.Match.update(matchId, {
        last_message_at: new Date().toISOString(),
        ...unreadUpdate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', matchId]);
      setNewMessage('');
    }
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate({ type: 'text', text: newMessage.trim() });
  };

  // Voice recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
      
      // Upload voice message
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMessageMutation.mutate({ 
        type: 'voice', 
        media_url: file_url,
        media_duration: recordingTime
      });
      setRecordingTime(0);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    const interval = setInterval(() => {
      setRecordingTime(t => t + 1);
    }, 1000);
    
    mediaRecorderRef.current.interval = interval;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      clearInterval(mediaRecorderRef.current.interval);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  // AI Suggestions
  const loadSuggestions = async () => {
    if (!myProfile || !otherProfile) return;
    setLoadingSuggestions(true);
    
    const prompt = `Generate 3 conversation starters for a dating app chat between two people.
    
    Person 1 prompts: ${myProfile.prompts?.map(p => `${p.question}: ${p.answer}`).join('; ')}
    Person 1 vibes: ${myProfile.vibe_tags?.join(', ')}
    
    Person 2 prompts: ${otherProfile.prompts?.map(p => `${p.question}: ${p.answer}`).join('; ')}
    Person 2 vibes: ${otherProfile.vibe_tags?.join(', ')}
    
    Generate 3 short, natural, flirty but respectful openers that reference their shared interests or prompts. Return as JSON array of strings.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setSuggestions(result.suggestions || []);
    setLoadingSuggestions(false);
    setShowSuggestions(true);
  };

  // Block user
  const handleBlock = async () => {
    if (!myProfile || !otherProfile) return;
    await base44.entities.Block.create({
      blocker_id: myProfile.id,
      blocked_id: otherProfile.id,
      match_id: matchId
    });
    await base44.entities.Match.update(matchId, {
      blocked: true,
      blocked_by: myProfile.id
    });
    window.location.href = createPageUrl('ChatList');
  };

  // Report user
  const handleReport = () => {
    window.location.href = createPageUrl('ProfileDetail') + `?id=${otherProfile.id}&report=true`;
  };

  if (!match || !otherProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E70F72] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => window.location.href = createPageUrl('ProfileDetail') + `?id=${otherProfile.id}`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {otherProfile.photos?.[0]?.url ? (
              <img 
                src={otherProfile.photos[0].url} 
                alt={otherProfile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-white">{otherProfile.display_name}</h2>
              {otherProfile.verification_status === 'verified' && (
                <BadgeCheck className="w-4 h-4 text-[#E70F72]" />
              )}
            </div>
            {match.source === 'crossing' && (
              <p className="text-[#E70F72] text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Crossed paths
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 flex items-center justify-center text-white/60"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Menu Dropdown */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden z-50"
            >
              <button
                onClick={handleReport}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/80 hover:bg-white/5"
              >
                <Flag className="w-4 h-4" /> Report
              </button>
              <button
                onClick={handleBlock}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-white/5"
              >
                <Ban className="w-4 h-4" /> Block
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => {
          const isMe = message.sender_id === myProfile?.id;
          const isSystem = message.type === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="text-center">
                <span className="text-white/45 text-sm px-4 py-2 bg-white/5 rounded-full inline-block">
                  {message.text}
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                {message.type === 'voice' ? (
                  <VoiceMessage message={message} isMe={isMe} />
                ) : (
                  <div className={`px-4 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-[#E70F72] text-black rounded-br-none' 
                      : 'bg-white/10 text-white rounded-bl-none'
                  }`}>
                    <p>{message.text}</p>
                  </div>
                )}
                <p className={`text-xs text-white/30 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {format(new Date(message.created_date), 'h:mm a')}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 pb-2"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMessage(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="flex-shrink-0 px-4 py-2 bg-[#E70F72]/10 border border-[#E70F72]/30 rounded-full text-sm text-white hover:bg-[#E70F72]/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/10 safe-area-bottom">
        <div className="flex items-center gap-3">
          {!isRecording && (
            <SparkAssist 
              myProfile={myProfile} 
              otherProfile={otherProfile}
              onSelectMessage={setNewMessage}
            />
          )}
          
          {isRecording ? (
            <div className="flex-1 flex items-center gap-4 bg-[#E70F72]/10 rounded-full px-4 py-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-mono">
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </span>
              <div className="flex-1" />
              <button onClick={stopRecording} className="w-10 h-10 bg-[#E70F72] rounded-full flex items-center justify-center">
                <Square className="w-4 h-4 text-black" fill="black" />
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E70F72]/50"
              />
              
              {newMessage.trim() ? (
                <button
                  onClick={handleSend}
                  className="w-12 h-12 bg-[#E70F72] rounded-full flex items-center justify-center"
                >
                  <Send className="w-5 h-5 text-black" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Voice Message Component
function VoiceMessage({ message, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 ${
      isMe 
        ? 'bg-[#E70F72] rounded-br-none' 
        : 'bg-white/10 rounded-bl-none'
    }`}>
      <audio ref={audioRef} src={message.media_url} />
      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isMe ? 'bg-black/20' : 'bg-white/10'
        }`}
      >
        {isPlaying ? (
          <Pause className={`w-5 h-5 ${isMe ? 'text-black' : 'text-white'}`} />
        ) : (
          <Play className={`w-5 h-5 ${isMe ? 'text-black' : 'text-white'}`} />
        )}
      </button>
      
      <div className="flex-1">
        <div className={`h-1 rounded-full ${isMe ? 'bg-black/20' : 'bg-white/20'}`}>
          <div 
            className={`h-full rounded-full ${isMe ? 'bg-black' : 'bg-[#E70F72]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {message.media_duration && (
          <p className={`text-xs mt-1 ${isMe ? 'text-black/60' : 'text-white/50'}`}>
            {Math.floor(message.media_duration / 60)}:{String(message.media_duration % 60).padStart(2, '0')}
          </p>
        )}
      </div>
    </div>
  );
}