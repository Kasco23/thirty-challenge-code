import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

interface UnifiedVideoRoomProps {
  gameId: string;
  className?: string;
}

export default function UnifiedVideoRoom({
  gameId,
  className = '',
}: UnifiedVideoRoomProps) {
  const state = useGameState();
  const { generateDailyToken } = useGameActions();
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<unknown>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [callState, setCallState] = useState<string>('new');
  const [error, setError] = useState<string>('');
  const [participantCount, setParticipantCount] = useState(0);

  // Determine user role and info from current context
  // This could be passed as props or derived from URL/state
  const getUserInfo = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const name = urlParams.get('name') || 'مستخدم';
    
    if (role === 'host' || role === 'host-mobile') {
      return {
        userName: state.hostName || name,
        isHost: true,
        userRole: 'host-mobile'
      };
    } else if (role === 'playerA' || role === 'playerB') {
      return {
        userName: name,
        isHost: false,
        userRole: role
      };
    }
    
    return {
      userName: name,
      isHost: false,
      userRole: 'guest'
    };
  }, [state.hostName]);

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
      );
      if (!token) {
        throw new Error('Failed to get access token');
      }
      console.log(`[UnifiedVideoRoom] Token generated successfully`);

      // Lazy load Daily.co SDK
      console.log(`[UnifiedVideoRoom] Loading Daily.co SDK...`);
      const DailyIframe = await import('@daily-co/daily-js');
      
      // Create Daily call object optimized for multiple participants
      const callObject = DailyIframe.default.createCallObject({
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: '#1f2937', // gray-800
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: true,
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
        .on('error', (error: unknown) => {
          console.error(`[UnifiedVideoRoom] Daily.co error:`, error);
          const errorMsg =
            (error as { errorMsg?: string })?.errorMsg || 
            (error as { message?: string })?.message || 
            'Video call error';
          setError(errorMsg);
          setIsJoining(false);
          setCallState('error');
        })
        .on('participant-joined', (event: unknown) => {
          console.log(`[UnifiedVideoRoom] Participant joined:`, event);
          setParticipantCount(prev => prev + 1);
        })
        .on('participant-left', (event: unknown) => {
          console.log(`[UnifiedVideoRoom] Participant left:`, event);
          setParticipantCount(prev => Math.max(0, prev - 1));
        })
        .on('participant-updated', (event: unknown) => {
          console.log(`[UnifiedVideoRoom] Participant updated:`, event);
        });

      // Join the meeting
      console.log(`[UnifiedVideoRoom] Joining room at:`, state.videoRoomUrl);
      await (callObject as any).join({
        url: state.videoRoomUrl,
        token,
        userName: userInfo.userName,
        startVideoOff: false,
        startAudioOff: false,
      });

      // Append iframe to DOM
      const iframe = (callObject as any).iframe();
      if (callFrameRef.current && iframe) {
        // Clear any existing content
        callFrameRef.current.innerHTML = '';
        
        // Style the iframe
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        
        callFrameRef.current.appendChild(iframe);
        console.log(`[UnifiedVideoRoom] Iframe appended to DOM`);
      } else {
        console.error(`[UnifiedVideoRoom] Failed to get iframe or container not available`);
        throw new Error('Failed to attach video interface');
      }
      
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to join video call';
      console.error(`[UnifiedVideoRoom] Failed to join call:`, error);
      setError(errorMessage);
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

  if (error) {
    return (
      <div className={`bg-red-500/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold mb-2 font-arabic">
            خطأ في الفيديو
          </div>
          <div className="text-red-300 text-sm mb-4 font-arabic">{error}</div>
          <button
            onClick={joinCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-arabic transition-colors"
          >
            إعادة المحاولة
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
        className="w-full h-full min-h-[400px] bg-gray-800 rounded-xl overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      />

      {callState === 'joined' && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-arabic">
          متصل ({participantCount} مشارك)
        </div>
      )}

      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-sm font-arabic">
        <div>جميع المشاركين في غرفة واحدة</div>
        <div className="text-xs text-white/70">المقدم + اللاعبان</div>
      </div>
    </div>
  );
}