import { useState, useEffect } from 'react';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

interface SimpleVideoFrameProps {
  gameId: string;
  className?: string;
  userName?: string;
  isHost?: boolean;
  isObserver?: boolean;
}

/**
 * Simple iframe-based video component as fallback for Daily.co integration.
 * Uses the same pattern as the working legacy TestAPI.tsx.
 */
export default function SimpleVideoFrame({
  gameId,
  className = '',
  userName = 'مستخدم',
  isHost = false,
  isObserver = false,
}: SimpleVideoFrameProps) {
  const state = useGameState();
  const { generateDailyToken } = useGameActions();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate token when component mounts and video room is available
  useEffect(() => {
    if (state.videoRoomCreated && state.videoRoomUrl && !token && !isLoading) {
      setIsLoading(true);
      setError('');
      
      generateDailyToken(gameId, userName, isHost, isObserver)
        .then((generatedToken) => {
          if (generatedToken) {
            setToken(generatedToken);
          } else {
            setError('فشل في إنشاء رمز الوصول للفيديو');
          }
        })
        .catch((err) => {
          console.error('Error generating token:', err);
          setError('خطأ في إنشاء رمز الوصول للفيديو');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [state.videoRoomCreated, state.videoRoomUrl, token, isLoading, generateDailyToken, gameId, userName, isHost, isObserver]);

  if (!state.videoRoomCreated || !state.videoRoomUrl) {
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

  if (isLoading) {
    return (
      <div className={`bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-blue-400 text-lg font-bold mb-2 font-arabic">
            تحضير الفيديو
          </div>
          <div className="text-blue-300 text-sm font-arabic">
            جاري إنشاء رمز الوصول...
          </div>
        </div>
      </div>
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
              setError('');
              setToken(null);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-arabic transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-yellow-400 text-lg font-bold mb-2 font-arabic">
            رمز الوصول غير متوفر
          </div>
          <div className="text-yellow-300 text-sm font-arabic">
            يرجى المحاولة مرة أخرى
          </div>
        </div>
      </div>
    );
  }

  // Use the simple iframe approach that worked in legacy TestAPI
  const videoUrl = `${state.videoRoomUrl}?t=${token}&embed=true`;

  return (
    <div className={`relative ${className}`}>
      <iframe
        title="Daily Video Conference"
        src={videoUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        className="w-full h-full min-h-[300px] max-h-[80vh] bg-gray-800 rounded-xl border-none"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-xs sm:text-sm font-arabic max-w-[200px] sm:max-w-none">
        <div className="leading-tight">
          {isObserver ? 'وضع المراقبة' : 'غرفة الفيديو المباشرة'}
        </div>
        <div className="text-xs text-white/70 leading-tight">
          {isObserver ? 'مراقبة بدون ظهور' : 'جميع المشاركين معاً'}
        </div>
      </div>
    </div>
  );
}