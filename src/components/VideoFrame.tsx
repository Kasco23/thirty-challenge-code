import { useEffect, useRef, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  sharedDailyCallAtom,
  sharedMeetingStateAtom,
  sharedCallErrorAtom,
  isSharedCallActiveAtom,
  attachCallToElementAtom,
  initializeSharedCallAtom,
} from '@/state/sharedVideoAtoms';
import { useGameActions } from '@/hooks/useGameAtoms';

interface VideoFrameProps {
  gameId: string;
  userName: string;
  userRole: 'host-mobile' | 'playerA' | 'playerB';
  className?: string;
  /** Whether this frame should initialize the shared call */
  shouldInitialize?: boolean;
}

export default function VideoFrame({
  gameId,
  userName,
  userRole,
  className = '',
  shouldInitialize = false,
}: VideoFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAttached, setHasAttached] = useState(false);
  
  const sharedCall = useAtomValue(sharedDailyCallAtom);
  const meetingState = useAtomValue(sharedMeetingStateAtom);
  const callError = useAtomValue(sharedCallErrorAtom);
  const isCallActive = useAtomValue(isSharedCallActiveAtom);
  
  const initializeSharedCall = useSetAtom(initializeSharedCallAtom);
  const attachCallToElement = useSetAtom(attachCallToElementAtom);
  const { generateDailyToken } = useGameActions();

  // Initialize the shared call if this frame is responsible for it
  useEffect(() => {
    if (!shouldInitialize || sharedCall || isInitializing) return;

    const initCall = async () => {
      setIsInitializing(true);
      try {
        console.log(`[VideoFrame:${userRole}] Initializing shared call...`);
        
        // Generate token for this user
        const token = await generateDailyToken(gameId, userName, userRole === 'host-mobile');
        if (!token) {
          throw new Error('Failed to generate access token');
        }

        // Get room URL from game state (this should be passed as prop ideally)
        const roomUrl = `https://quiz.daily.co/${gameId}`;
        
        await initializeSharedCall({ roomUrl, token, userName });
        console.log(`[VideoFrame:${userRole}] Shared call initialized successfully`);
        
      } catch (error) {
        console.error(`[VideoFrame:${userRole}] Failed to initialize shared call:`, error);
      } finally {
        setIsInitializing(false);
      }
    };

    initCall();
  }, [shouldInitialize, sharedCall, isInitializing, gameId, userName, userRole, generateDailyToken, initializeSharedCall]);

  // Attach the call iframe to this frame's container
  useEffect(() => {
    if (!containerRef.current || !isCallActive || hasAttached) return;

    const attachIframe = async () => {
      try {
        console.log(`[VideoFrame:${userRole}] Attaching shared call iframe...`);
        await attachCallToElement(containerRef.current!);
        setHasAttached(true);
        console.log(`[VideoFrame:${userRole}] Successfully attached iframe`);
      } catch (error) {
        console.error(`[VideoFrame:${userRole}] Failed to attach iframe:`, error);
      }
    };

    attachIframe();
  }, [isCallActive, hasAttached, userRole, attachCallToElement]);

  // Reset attachment state when call is no longer active
  useEffect(() => {
    if (!isCallActive && hasAttached) {
      setHasAttached(false);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [isCallActive, hasAttached]);

  if (callError) {
    return (
      <div className={`bg-red-500/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold mb-2 font-arabic">
            خطأ في الفيديو
          </div>
          <div className="text-red-300 text-sm mb-4 font-arabic">{callError}</div>
        </div>
      </div>
    );
  }

  if (isInitializing || meetingState === 'joining') {
    return (
      <div className={`bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-blue-400 text-lg font-bold mb-2 font-arabic">
            {isInitializing ? 'جاري الإعداد...' : 'الانضمام للفيديو'}
          </div>
          <div className="text-blue-300 text-sm font-arabic">
            جاري الاتصال...
          </div>
        </div>
      </div>
    );
  }

  if (!isCallActive) {
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

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[300px] bg-gray-800 rounded-xl overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      />

      {isCallActive && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-arabic">
          متصل
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-arabic">
        {userName} ({userRole})
      </div>

      {/* Debug info overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        <div>State: {meetingState}</div>
        <div>Role: {userRole}</div>
        <div>Init: {shouldInitialize ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}