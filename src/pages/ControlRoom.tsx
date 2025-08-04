import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameState, useGameActions, useGameSync } from '@/hooks/useGameAtoms';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t, language } = useTranslation();

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
      navigate(`/lobby/${state.gameId}?role=host&hostName=${encodeURIComponent(state.hostName || (language === 'ar' ? 'المقدم' : 'Host'))}`);
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
          <p className={`text-lg ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'جاري تحميل بيانات الجلسة...' : 'Loading session data...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className={`text-lg mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg ${language === 'ar' ? 'font-arabic' : ''}`}
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-6">
      {/* Language Toggle */}
      <LanguageToggle />
      
      <h1 className={`text-4xl font-bold text-white mb-8 text-center ${language === 'ar' ? 'font-arabic' : ''}`}>
        {t('controlRoom')}
      </h1>

      {/* Enhanced Status Display */}
      <div className="text-center mb-6 space-y-1">
        <p className={`text-accent2 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('playersCode')}: <span className="font-mono">{state.gameId}</span>
        </p>
        <p className={`text-accent2 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('controlRoomHostCode')}: <span className="font-mono">{state.hostCode}</span>
        </p>
        <p className={`text-white/70 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('currentStage')}: <span className="font-mono">{state.phase}</span>
        </p>
        
        {/* Host Connection Status */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${language === 'ar' ? 'font-arabic' : ''} ${
            state.hostIsConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${state.hostIsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {state.hostIsConnected ? t('hostConnected') : t('hostDisconnected')}
          </div>

          {/* Controller (PC) Status */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${language === 'ar' ? 'font-arabic' : ''} bg-blue-500/20 text-blue-400 border border-blue-500/30`}>
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            {t('controllerActive')}
          </div>

          {/* Real-time sync indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${language === 'ar' ? 'font-arabic' : ''} bg-purple-500/20 text-purple-400 border border-purple-500/30`}>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            {t('connectedToServer')}
          </div>
        </div>
      </div>

      {/* Host actions */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={handleStartGame}
          disabled={state.phase !== 'LOBBY'}
          className={`px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg ${language === 'ar' ? 'font-arabic' : ''}`}
        >
          {state.phase === 'LOBBY' ? t('controlRoomStartGame') : state.phase === 'CONFIG' ? t('waitingConfig') : t('gameAlreadyStarted')}
        </button>
        
        {/* Control panel redirect to lobby for video management */}
        <div className={`px-6 py-3 rounded-lg ${language === 'ar' ? 'font-arabic' : ''} ${
          state.videoRoomCreated 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-600 text-white/70'
        }`}>
          {state.videoRoomCreated ? t('videoRoomReady') : t('noVideoRoom')}
        </div>
        
        <button
          onClick={() => {
            navigate(`/lobby/${state.gameId}?role=host&hostName=${encodeURIComponent(state.hostName || 'Host')}`);
          }}
          className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${language === 'ar' ? 'font-arabic' : ''}`}
        >
          {t('manageVideoLobby')}
        </button>
      </div>

      {/* Instructions for using lobby for video management */}
      <div className="mb-8 bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
        <h3 className={`text-xl font-bold text-blue-300 mb-4 text-center ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('importantVideoInfo')}
        </h3>
        <div className="text-center text-white">
          <p className={`mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('controlRoomGameOnly')}
          </p>
          <p className={`mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('videoManagementInLobby')}
          </p>
          <button
            onClick={() => {
              navigate(`/lobby/${state.gameId}?role=host&hostName=${encodeURIComponent(state.hostName || 'Host')}`);
            }}
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${language === 'ar' ? 'font-arabic' : ''}`}
          >
            {t('goToLobby')}
          </button>
        </div>
      </div>

      {/* Legacy information for developers */}
      <details className="mb-6">
        <summary className={`text-white/70 cursor-pointer hover:text-white mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('showParticipantInfo')}
        </summary>
        <div className={`bg-gray-800/50 rounded-lg p-4 text-sm text-white/60 ${language === 'ar' ? 'font-arabic' : ''}`}>
          <p className="mb-2">{t('participantInfo')}</p>
          <div className="space-y-1">
            <div>{t('controlRoomHost')}: {state.hostName ?? (language === 'ar' ? 'غير محدد' : 'Not specified')}</div>
            <div>{t('controlRoomFirstPlayer')}: {state.players.playerA.name || t('notJoinedYet')}</div>
            <div>{t('controlRoomSecondPlayer')}: {state.players.playerB.name || t('notJoinedYet')}</div>
          </div>
          <div className="mt-3 text-xs text-yellow-400">
            {t('videoInteractionTip')}
          </div>
        </div>
      </details>
    </div>
  );
}
