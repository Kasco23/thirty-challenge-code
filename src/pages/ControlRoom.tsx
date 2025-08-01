import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameState, useGameActions, useGameSync } from '@/hooks/useGameAtoms';

/**
 * Host control interface shown on the PC. Displays join codes and offers
 * quick controls for starting the game or advancing questions.
 * This is a control-only interface without video broadcast functionality.
 * Video functionality is handled exclusively by the Lobby component.
 */
export default function ControlRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = useGameState();
  const { loadGameState, startGame, setHostConnected } = useGameActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize game sync to receive real-time updates
  useGameSync();

  // Get game ID from location state or navigate to lobby
  useEffect(() => {
    const locationState = location.state as { gameId?: string; hostCode?: string; hostName?: string } | null;
    
    if (locationState?.gameId) {
      // Load game state if we have a game ID
      setIsLoading(true);
      loadGameState(locationState.gameId)
        .then((result) => {
          if (!result.success) {
            setError(result.error || 'Failed to load game');
          } else {
            // Mark host as connected when control room loads
            setHostConnected(true);
          }
        })
        .catch((err) => {
          console.error('Failed to load game state:', err);
          setError('خطأ في تحميل بيانات الجلسة');
        })
        .finally(() => setIsLoading(false));
    } else if (state.gameId) {
      // If we have gameId in state, mark host as connected and redirect to lobby
      setHostConnected(true);
      navigate(`/lobby/${state.gameId}?role=host&hostName=${encodeURIComponent(state.hostName || 'المقدم')}`);
    } else {
      // No game ID available, redirect to home
      navigate('/');
    }
  }, [location.state, state.gameId, state.hostName, loadGameState, setHostConnected, navigate]);

  // Mark host as disconnected when leaving control room
  useEffect(() => {
    return () => {
      if (state.gameId) {
        setHostConnected(false);
      }
    };
  }, [state.gameId, setHostConnected]);

  // Host control functions
  const handleStartGame = () => {
    startGame();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-arabic">جاري تحميل بيانات الجلسة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-lg font-arabic mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-arabic"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-6">
      <h1 className="text-4xl font-bold text-white mb-8 font-arabic text-center">
        غرفة التحكم
      </h1>

      {/* Enhanced Status Display */}
      <div className="text-center mb-6 space-y-1">
        <p className="text-accent2 font-arabic">
          رمز اللاعبين: <span className="font-mono">{state.gameId}</span>
        </p>
        <p className="text-accent2 font-arabic">
          رمز المقدم: <span className="font-mono">{state.hostCode}</span>
        </p>
        <p className="text-white/70 font-arabic">
          المرحلة الحالية: <span className="font-mono">{state.phase}</span>
        </p>
        
        {/* Host Connection Status */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-arabic ${
            state.hostIsConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${state.hostIsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {state.hostIsConnected ? 'المقدم متصل' : 'المقدم غير متصل'}
          </div>

          {/* Controller (PC) Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-arabic bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            تحكم PC نشط
          </div>

          {/* Real-time sync indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-arabic bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            متصل بالخادم
          </div>
        </div>
      </div>

      {/* Host actions */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={handleStartGame}
          disabled={state.phase !== 'LOBBY'}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-arabic"
        >
          {state.phase === 'LOBBY' ? 'ابدأ اللعبة' : state.phase === 'CONFIG' ? 'في انتظار تأكيد البيانات...' : 'اللعبة بدأت فعلاً'}
        </button>
        
        {/* Control panel redirect to lobby for video management */}
        <div className={`px-6 py-3 rounded-lg font-arabic ${
          state.videoRoomCreated 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-600 text-white/70'
        }`}>
          {state.videoRoomCreated ? '✓ غرفة الفيديو جاهزة' : 'لا توجد غرفة فيديو'}
        </div>
        
        <button
          onClick={() => {
            navigate(`/lobby/${state.gameId}?role=host&hostName=${encodeURIComponent(state.hostName || 'المقدم')}`);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-arabic transition-colors"
        >
          إدارة الفيديو في الصالة
        </button>
      </div>

      {/* Instructions for using lobby for video management */}
      <div className="mb-8 bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-300 mb-4 font-arabic text-center">
          معلومات هامة - التحكم في الفيديو
        </h3>
        <div className="text-center text-white">
          <p className="font-arabic mb-3">
            هذه غرفة التحكم للعبة فقط - لا تحتوي على إعدادات الفيديو
          </p>
          <p className="font-arabic mb-4">
            لإدارة الفيديو والمشاركة مع اللاعبين، يرجى استخدام صالة الانتظار
          </p>
          <button
            onClick={() => {
              navigate(`/lobby/${state.gameId}?role=host&hostName=${encodeURIComponent(state.hostName || 'المقدم')}`);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-arabic transition-colors"
          >
            الذهاب لصالة الانتظار
          </button>
        </div>
      </div>

      {/* Legacy information for developers */}
      <details className="mb-6">
        <summary className="text-white/70 font-arabic cursor-pointer hover:text-white mb-4">
          عرض معلومات المشاركين (للمرجع)
        </summary>
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-white/60 font-arabic">
          <p className="mb-2">معلومات المشاركين:</p>
          <div className="space-y-1">
            <div>المقدم: {state.hostName ?? 'غير محدد'}</div>
            <div>اللاعب الأول: {state.players.playerA.name || 'لم ينضم بعد'}</div>
            <div>اللاعب الثاني: {state.players.playerB.name || 'لم ينضم بعد'}</div>
          </div>
          <div className="mt-3 text-xs text-yellow-400">
            💡 للتفاعل مع الفيديو والمشاركين، استخدم صالة الانتظار
          </div>
        </div>
      </details>
    </div>
  );
}
