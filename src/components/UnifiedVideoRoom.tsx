/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';
import SimpleVideoFrame from './SimpleVideoFrame';

// Daily.co TypeScript interfaces for better event typing
interface DailyEvent {
  participant?: {
    user_id?: string;
    user_name?: string;
    local?: boolean;
  };
}

interface DailyError {
  errorMsg?: string;
  message?: string;
}

interface UnifiedVideoRoomProps {
  gameId: string;
  className?: string;
  observerMode?: boolean; // For host PC to observe without appearing in video
}

export default function UnifiedVideoRoom({
  gameId,
  className = '',
  observerMode = false,
}: UnifiedVideoRoomProps) {
  const state = useGameState();
  const { generateDailyToken } = useGameActions();
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [callState, setCallState] = useState<string>('new');
  const [error, setError] = useState<string>('');
  const [participantCount, setParticipantCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Determine user role and info from current context
  const getUserInfo = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const name = urlParams.get('name') || 'مستخدم';
    
    // If observer mode is enabled, treat as host but hidden
    if (observerMode) {
      return {
        userName: state.hostName || name,
        isHost: true,
        userRole: 'host-observer',
        isObserver: true
      };
    }
    
    if (role === 'host' || role === 'host-mobile') {
      return {
        userName: state.hostName || name,
        isHost: true,
        userRole: 'host-mobile',
        isObserver: false
      };
    } else if (role === 'playerA' || role === 'playerB') {
      return {
        userName: name,
        isHost: false,
        userRole: role,
        isObserver: false
      };
    }
    
    return {
      userName: name,
      isHost: false,
      userRole: 'guest',
      isObserver: false
    };
  }, [state.hostName, observerMode]);

  const joinCall = useCallback(async () => {
    if (!callFrameRef.current || !state.videoRoomUrl) return;
    
    const userInfo = getUserInfo();
    console.log(`[UnifiedVideoRoom] Attempting to join call`, {
      roomUrl: state.videoRoomUrl,
      userInfo
    });

    setIsJoining(true);
    setError('');

    try {
      // Get Daily.co token for this user
      console.log(`[UnifiedVideoRoom] Generating token...`);
      const token = await generateDailyToken(
        gameId,
        userInfo.userName,
        userInfo.isHost,
        userInfo.isObserver, // Pass observer flag
      );
      if (!token) {
        throw new Error('Failed to get access token');
      }
      console.log(`[UnifiedVideoRoom] Token generated successfully`);

      // Lazy load Daily.co SDK
      console.log(`[UnifiedVideoRoom] Loading Daily.co SDK...`);
      const DailyIframe = await import('@daily-co/daily-js');
      
      // Create Daily call object optimized for multiple participants and mobile
      const callObject = DailyIframe.default.createCallObject({
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: '#1f2937', // gray-800
        },
        showLeaveButton: !userInfo.isObserver, // Hide leave button for observers
        showFullscreenButton: true,
        showLocalVideo: !userInfo.isObserver, // Hide local video for observers
        showParticipantsBar: true,
        activeSpeakerMode: true, // Better for mobile
        url: state.videoRoomUrl, // Set URL directly for better mobile compatibility
        theme: {
          colors: {
            accent: '#3b82f6', // blue-500
            accentText: '#ffffff',
            background: '#1f2937', // gray-800
            backgroundAccent: '#374151', // gray-700
            baseText: '#f9fafb', // gray-50
            border: '#6b7280', // gray-500
            mainAreaBg: '#111827', // gray-900
            mainAreaBgAccent: '#1f2937', // gray-800
            mainAreaText: '#f9fafb', // gray-50
            supportiveText: '#d1d5db', // gray-300
          },
        },
      });

      callObjectRef.current = callObject;

      // Add comprehensive event listeners
      (callObject as any)
        .on('joining-meeting', () => {
          console.log(`[UnifiedVideoRoom] Joining meeting...`);
          setCallState('joining');
        })
        .on('joined-meeting', () => {
          console.log(`[UnifiedVideoRoom] Joined meeting successfully`);
          setCallState('joined');
          setIsJoining(false);
        })
        .on('left-meeting', () => {
          console.log(`[UnifiedVideoRoom] Left meeting`);
          setCallState('left');
          setParticipantCount(0);
        })
        .on('error', (error?: DailyError) => {
          console.error(`[UnifiedVideoRoom] Daily.co error:`, error);
          const errorMsg =
            error?.errorMsg || 
            error?.message || 
            'Video call error';
          setError(errorMsg);
          setIsJoining(false);
          setCallState('error');
        })
        .on('participant-joined', (event?: DailyEvent) => {
          console.log(`[UnifiedVideoRoom] Participant joined:`, event);
          setParticipantCount(prev => prev + 1);
        })
        .on('participant-left', (event?: DailyEvent) => {
          console.log(`[UnifiedVideoRoom] Participant left:`, event);
          setParticipantCount(prev => Math.max(0, prev - 1));
        })
        .on('participant-updated', (event?: DailyEvent) => {
          console.log(`[UnifiedVideoRoom] Participant updated:`, event);
        });

      // Join the meeting
      console.log(`[UnifiedVideoRoom] Joining room at:`, state.videoRoomUrl);
      await (callObject as any).join({
        url: state.videoRoomUrl,
        token,
        userName: userInfo.isObserver ? `${userInfo.userName} (مراقب)` : userInfo.userName,
        startVideoOff: userInfo.isObserver, // Observers start with video off
        startAudioOff: userInfo.isObserver, // Observers start with audio off
      });

      // For observer mode, disable audio output to prevent feedback
      if (userInfo.isObserver) {
        try {
          // Set local audio output volume to 0 for observers
          await (callObject as any).setLocalAudio(false);
          console.log(`[UnifiedVideoRoom] Observer mode: disabled local audio input/output`);
        } catch (audioError) {
          console.warn(`[UnifiedVideoRoom] Could not disable audio for observer:`, audioError);
        }
      }

      // Append iframe to DOM with mobile-optimized styling
      const iframe = (callObject as any).iframe();
      if (callFrameRef.current && iframe) {
        // Clear any existing content
        callFrameRef.current.innerHTML = '';
        
        // Mobile-optimized iframe styling
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.style.minHeight = '300px';
        iframe.style.maxHeight = '80vh'; // Prevent overflow on mobile
        
        // Mobile viewport meta tag support
        iframe.setAttribute('allow', 'camera; microphone; autoplay; display-capture; fullscreen');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals');
        
        callFrameRef.current.appendChild(iframe);
        console.log(`[UnifiedVideoRoom] Iframe appended to DOM with mobile optimizations`);
      } else {
        console.error(`[UnifiedVideoRoom] Failed to get iframe or container not available`);
        throw new Error('Failed to attach video interface');
      }
      
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to join video call';
      console.error(`[UnifiedVideoRoom] Failed to join call:`, error);
      
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        console.log(`[UnifiedVideoRoom] Max retries reached, falling back to iframe approach`);
        setUseFallback(true);
        setError('');
      } else {
        setError(errorMessage);
      }
      
      setIsJoining(false);
      setCallState('error');
    }
  }, [generateDailyToken, gameId, state.videoRoomUrl, getUserInfo]);

  // Join the video call when room is available
  useEffect(() => {
    if (!state.videoRoomCreated || !state.videoRoomUrl || callObjectRef.current) {
      return;
    }

    joinCall();
  }, [state.videoRoomCreated, state.videoRoomUrl, joinCall]);

  const leaveCall = useCallback(async () => {
    if (callObjectRef.current) {
      try {
        console.log(`[UnifiedVideoRoom] Leaving call...`);
        await (callObjectRef.current as any).leave();
        await (callObjectRef.current as any).destroy();
        callObjectRef.current = null;
        setCallState('left');
        setParticipantCount(0);
        
        // Clear the iframe container
        if (callFrameRef.current) {
          callFrameRef.current.innerHTML = '';
        }
        console.log(`[UnifiedVideoRoom] Successfully left call`);
      } catch (error) {
        console.error(`[UnifiedVideoRoom] Error leaving call:`, error);
      }
    }
  }, []);

  // Leave the call if the room is ended remotely
  useEffect(() => {
    if (!state.videoRoomCreated && callObjectRef.current) {
      console.log(`[UnifiedVideoRoom] Room ended remotely, leaving call`);
      leaveCall();
    }
  }, [state.videoRoomCreated, leaveCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`[UnifiedVideoRoom] Component unmounting, cleaning up`);
      leaveCall();
    };
  }, [leaveCall]);

  // If SDK approach failed, use simple iframe fallback
  if (useFallback) {
    const userInfo = getUserInfo();
    return (
      <SimpleVideoFrame
        gameId={gameId}
        className={className}
        userName={userInfo.userName}
        isHost={userInfo.isHost}
        isObserver={userInfo.isObserver}
      />
    );
  }

  if (error) {
    return (
      <div className={`bg-red-500/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold mb-2 font-arabic">
            خطأ في الفيديو
          </div>
          <div className="text-red-300 text-sm mb-4 font-arabic">{error}</div>
          <button
            onClick={() => {
              if (retryCountRef.current >= maxRetries) {
                setUseFallback(true);
                setError('');
              } else {
                joinCall();
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-arabic transition-colors"
          >
            {retryCountRef.current >= maxRetries ? 'استخدام الطريقة البديلة' : 'إعادة المحاولة'}
          </button>
        </div>
      </div>
    );
  }

  if (!state.videoRoomCreated) {
    return (
      <div className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-lg font-bold mb-2 font-arabic">
            غرفة الفيديو غير متاحة
          </div>
          <div className="text-gray-300 text-sm font-arabic">
            في انتظار إنشاء غرفة الفيديو...
          </div>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className={`bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-blue-400 text-lg font-bold mb-2 font-arabic">
            الانضمام للفيديو
          </div>
          <div className="text-blue-300 text-sm font-arabic">
            جاري الاتصال...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={callFrameRef}
        className="w-full h-full min-h-[300px] max-h-[80vh] bg-gray-800 rounded-xl overflow-hidden touch-auto"
        style={{ aspectRatio: '16/9' }}
      />

      {callState === 'joined' && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-arabic z-10">
          متصل ({participantCount} مشارك)
        </div>
      )}

      {/* Instructions overlay - responsive for mobile */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-xs sm:text-sm font-arabic max-w-[200px] sm:max-w-none">
        <div className="leading-tight">جميع المشاركين في غرفة واحدة</div>
        <div className="text-xs text-white/70 leading-tight">
          {observerMode ? 'وضع المراقبة - المقدم + اللاعبان' : 'المقدم + اللاعبان'}
        </div>
      </div>
    </div>
  );
}