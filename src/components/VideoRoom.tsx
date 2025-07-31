/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

interface VideoRoomProps {
  gameId: string;
  userName: string;
  userRole: 'host-mobile' | 'playerA' | 'playerB';
  className?: string;
  /** If true, this will show all participants instead of just local user */
  showAllParticipants?: boolean;
}

export default function VideoRoom({
  gameId,
  userName,
  userRole,
  className = '',
  showAllParticipants = false,
}: VideoRoomProps) {
  const state = useGameState();
  const { generateDailyToken } = useGameActions();
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<unknown>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [callState, setCallState] = useState<string>('new');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Force re-join when room URL changes (room recreation scenario)
  const [lastRoomUrl, setLastRoomUrl] = useState<string>('');

  const joinCall = useCallback(async (forceRejoin = false) => {
    if (!callFrameRef.current) return;
    
    console.log(`[VideoRoom:${userRole}] Attempting to join call`, {
      forceRejoin,
      currentCall: !!callObjectRef.current,
      roomUrl: state.videoRoomUrl,
      userName
    });

    // If force rejoin, cleanup existing call first
    if (forceRejoin && callObjectRef.current) {
      try {
        await (callObjectRef.current as any).leave();
        await (callObjectRef.current as any).destroy();
        callObjectRef.current = null;
        setCallState('left');
        if (callFrameRef.current) {
          callFrameRef.current.innerHTML = '';
        }
      } catch (e) {
        console.log(`[VideoRoom:${userRole}] Error during cleanup for rejoin:`, e);
      }
    }
    
    // Prevent duplicate call creation
    if (callObjectRef.current && !forceRejoin) {
      console.log(`[VideoRoom:${userRole}] Call already exists, skipping creation`);
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Get Daily.co token for this user
      console.log(`[VideoRoom:${userRole}] Generating token...`);
      const token = await generateDailyToken(
        gameId,
        userName,
        userRole === 'host-mobile',
      );
      if (!token) {
        throw new Error('Failed to get access token');
      }
      console.log(`[VideoRoom:${userRole}] Token generated successfully`);

      // Lazy load Daily.co SDK when video is actually needed
      console.log(`[VideoRoom:${userRole}] Loading Daily.co SDK...`);
      const DailyIframe = await import('@daily-co/daily-js');
      
      // Create Daily call object with better iframe options
      const callObject = DailyIframe.default.createCallObject({
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: '#1f2937', // gray-800
        },
        showLeaveButton: false,
        showFullscreenButton: true,
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
          console.log(`[VideoRoom:${userRole}] Joining meeting...`);
          setCallState('joining');
        })
        .on('joined-meeting', () => {
          console.log(`[VideoRoom:${userRole}] Joined meeting successfully`);
          setCallState('joined');
          setIsJoining(false);
          setRetryCount(0); // Reset retry count on success
        })
        .on('left-meeting', () => {
          console.log(`[VideoRoom:${userRole}] Left meeting`);
          setCallState('left');
        })
        .on('error', (error: unknown) => {
          console.error(`[VideoRoom:${userRole}] Daily.co error:`, error);
          const errorMsg =
            (error as { errorMsg?: string })?.errorMsg || 
            (error as { message?: string })?.message || 
            'Video call error';
          setError(errorMsg);
          setIsJoining(false);
          setCallState('error');
        })
        .on('participant-joined', (event: unknown) => {
          console.log(
            `[VideoRoom:${userRole}] Participant joined:`,
            (event as { participant?: unknown })?.participant,
          );
        })
        .on('participant-left', (event: unknown) => {
          console.log(
            `[VideoRoom:${userRole}] Participant left:`,
            (event as { participant?: unknown })?.participant,
          );
        })
        .on('camera-error', (event: unknown) => {
          console.error(`[VideoRoom:${userRole}] Camera error:`, event);
          setError('خطأ في الكاميرا - تحقق من إعدادات المتصفح');
        })
        .on('nonfatal-error', (event: unknown) => {
          console.warn(`[VideoRoom:${userRole}] Non-fatal error:`, event);
        });

      // Join the meeting with better options
      console.log(`[VideoRoom:${userRole}] Joining room at:`, state.videoRoomUrl);
      await (callObject as any).join({
        url: state.videoRoomUrl,
        token,
        userName,
        startVideoOff: false,
        startAudioOff: false,
      });

      // Append to DOM more safely
      const iframe = (callObject as any).iframe();
      if (callFrameRef.current && iframe) {
        // Clear any existing content first
        callFrameRef.current.innerHTML = '';
        
        // Ensure iframe has proper styling
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        
        callFrameRef.current.appendChild(iframe);
        console.log(`[VideoRoom:${userRole}] Iframe appended to DOM`);
      } else {
        console.error(`[VideoRoom:${userRole}] Failed to get iframe or container not available`);
        throw new Error('Failed to attach video interface');
      }

      // Track room URL for change detection
      setLastRoomUrl(state.videoRoomUrl || '');
      
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to join video call';
      console.error(`[VideoRoom:${userRole}] Failed to join call:`, error);
      setError(errorMessage);
      setIsJoining(false);
      setCallState('error');
    }
  }, [generateDailyToken, gameId, userName, userRole, state.videoRoomUrl]);

  // Join the video call when room is available
  useEffect(() => {
    if (
      !state.videoRoomCreated ||
      !state.videoRoomUrl
    ) {
      console.log(`[VideoRoom:${userRole}] Room not ready yet`, {
        created: state.videoRoomCreated,
        url: state.videoRoomUrl
      });
      return;
    }

    // Check if room URL changed (recreation scenario)
    const roomUrlChanged = lastRoomUrl && lastRoomUrl !== state.videoRoomUrl;
    if (roomUrlChanged) {
      console.log(`[VideoRoom:${userRole}] Room URL changed, forcing rejoin`, {
        old: lastRoomUrl,
        new: state.videoRoomUrl
      });
      joinCall(true); // Force rejoin
    } else if (!callObjectRef.current) {
      console.log(`[VideoRoom:${userRole}] Initial join`);
      joinCall(false);
    }
  }, [state.videoRoomCreated, state.videoRoomUrl, joinCall, lastRoomUrl, userRole]);

  const leaveCall = useCallback(async () => {
    if (callObjectRef.current) {
      try {
        console.log(`[VideoRoom:${userRole}] Leaving call...`);
        await (callObjectRef.current as any).leave();
        await (callObjectRef.current as any).destroy();
        callObjectRef.current = null;
        setCallState('left');
        setLastRoomUrl('');
        
        // Clear the iframe container
        if (callFrameRef.current) {
          callFrameRef.current.innerHTML = '';
        }
        console.log(`[VideoRoom:${userRole}] Successfully left call`);
      } catch (error) {
        console.error(`[VideoRoom:${userRole}] Error leaving call:`, error);
      }
    }
  }, [userRole]);

  // Leave the call if the room is ended remotely
  useEffect(() => {
    if (!state.videoRoomCreated && callObjectRef.current) {
      console.log(`[VideoRoom:${userRole}] Room ended remotely, leaving call`);
      leaveCall();
    }
  }, [state.videoRoomCreated, userRole, leaveCall]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (retryCount < 3) {
      console.log(`[VideoRoom:${userRole}] Retrying join (attempt ${retryCount + 1})`);
      joinCall(true); // Force rejoin on retry
    } else {
      setError('فشل في الاتصال بعد عدة محاولات - جرب إعادة تحميل الصفحة');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`[VideoRoom:${userRole}] Component unmounting, cleaning up`);
      leaveCall();
    };
  }, [leaveCall, userRole]);

  if (error) {
    return (
      <div
        className={`bg-red-500/20 border border-red-500/30 rounded-xl p-6 ${className}`}
      >
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold mb-2 font-arabic">
            خطأ في الفيديو
          </div>
          <div className="text-red-300 text-sm mb-4 font-arabic">{error}</div>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              disabled={retryCount >= 3}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-arabic transition-colors mr-2"
            >
              {retryCount >= 3 ? 'تم استنفاد المحاولات' : `إعادة المحاولة (${retryCount + 1}/3)`}
            </button>
            <div className="text-xs text-red-200 font-arabic">
              آخر محاولة: {retryCount + 1} | الحالة: {callState}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.videoRoomCreated) {
    return (
      <div
        className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${className}`}
      >
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
      <div
        className={`bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 ${className}`}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-blue-400 text-lg font-bold mb-2 font-arabic">
            الانضمام للفيديو
          </div>
          <div className="text-blue-300 text-sm font-arabic">
            جاري الاتصال...
          </div>
          <div className="text-xs text-blue-200 font-arabic mt-2">
            الحالة: {callState} | المحاولة: {retryCount + 1}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={callFrameRef}
        className="w-full h-full min-h-[300px] bg-gray-800 rounded-xl overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      />

      {callState === 'joined' && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-arabic">
          متصل
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-arabic">
        {userName} ({userRole})
      </div>

      {/* Debug info overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        <div>State: {callState}</div>
        <div>Retries: {retryCount}</div>
      </div>
    </div>
  );
}
