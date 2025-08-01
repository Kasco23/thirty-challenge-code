import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

interface SimpleVideoRoomProps {
  gameId: string;
  className?: string;
  observerMode?: boolean;
}

export default function SimpleVideoRoom({
  gameId,
  className = '',
  observerMode = false,
}: SimpleVideoRoomProps) {
  const state = useGameState();
  const { generateDailyToken } = useGameActions();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Get user info from URL parameters
  const getUserInfo = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const name = urlParams.get('name') || 'مستخدم';
    
    if (observerMode) {
      return {
        userName: state.hostName || name,
        isHost: true,
        isObserver: true
      };
    }
    
    if (role === 'host' || role === 'host-mobile') {
      return {
        userName: state.hostName || name,
        isHost: true,
        isObserver: false
      };
    } else if (role === 'playerA' || role === 'playerB') {
      return {
        userName: name,
        isHost: false,
        isObserver: false
      };
    }
    
    return {
      userName: name,
      isHost: false,
      isObserver: false
    };
  }, [state.hostName, observerMode]);

  // Create video URL with token
  const createVideoUrl = useCallback(async () => {
    if (!state.videoRoomUrl) return;

    setIsLoading(true);
    setError('');

    try {
      const userInfo = getUserInfo();
      console.log('[SimpleVideoRoom] Creating video URL for:', userInfo);

      // Generate token for this user
      const token = await generateDailyToken(
        gameId,
        userInfo.userName,
        userInfo.isHost,
        userInfo.isObserver
      );

      if (!token) {
        throw new Error('Failed to get access token');
      }

      // Create the complete video URL with token
      const videoUrl = `${state.videoRoomUrl}?t=${token}&userName=${encodeURIComponent(userInfo.userName)}`;
      setVideoUrl(videoUrl);
      console.log('[SimpleVideoRoom] Video URL created successfully');

    } catch (error) {
      console.error('[SimpleVideoRoom] Failed to create video URL:', error);
      setError(error instanceof Error ? error.message : 'Failed to join video');
    } finally {
      setIsLoading(false);
    }
  }, [state.videoRoomUrl, generateDailyToken, gameId, getUserInfo]);

  // Create video URL when room is available
  useEffect(() => {
    if (state.videoRoomCreated && state.videoRoomUrl && !videoUrl) {
      createVideoUrl();
    }
  }, [state.videoRoomCreated, state.videoRoomUrl, videoUrl, createVideoUrl]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('[SimpleVideoRoom] Video iframe loaded successfully');
    setIsLoading(false);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('[SimpleVideoRoom] Video iframe failed to load');
    setError('Failed to load video interface');
    setIsLoading(false);
  }, []);

  if (error) {
    return (
      <div className={`bg-red-500/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold mb-2 font-arabic">
            خطأ في الفيديو
          </div>
          <div className="text-red-300 text-sm mb-4 font-arabic">{error}</div>
          <button
            onClick={createVideoUrl}
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

  if (isLoading || !videoUrl) {
    return (
      <div className={`bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-blue-400 text-lg font-bold mb-2 font-arabic">
            تحضير الفيديو
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
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className="w-full h-full min-h-[300px] max-h-[80vh] bg-gray-800 rounded-xl border-none"
        style={{ aspectRatio: '16/9' }}
        allow="camera; microphone; autoplay; display-capture; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Video Conference"
      />

      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-xs sm:text-sm font-arabic max-w-[200px] sm:max-w-none">
        <div className="leading-tight">جميع المشاركين في غرفة واحدة</div>
        <div className="text-xs text-white/70 leading-tight">
          {observerMode ? 'وضع المراقبة - المقدم + اللاعبان' : 'المقدم + اللاعبان'}
        </div>
      </div>
    </div>
  );
}