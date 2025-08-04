import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useGameState, useGameActions, useLobbyActions, useGameSync } from '@/hooks/useGameAtoms';
import { gameSyncInstanceAtom, lobbyParticipantsAtom } from '@/state';
import SimpleKitchenSinkVideo from '@/components/SimpleKitchenSinkVideo';
import AlertBanner from '@/components/AlertBanner';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { debugLog } from '@/utils/debugLog';
import type { LobbyParticipant } from '@/state';

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const state = useGameState();
  const { loadGameState, setHostConnected, startSession } = useGameActions();
  const { myParticipant, setParticipant } = useLobbyActions();
  const { t, language } = useTranslation();
  
  debugLog('Lobby', 'component_render', { gameId, players: Object.keys(state.players) });
  
  // Initialize game sync
  useGameSync();
  
  // Get sync instance for cleanup
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom);

  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [showAlert, setShowAlert] = useState(false);

  // Get lobby participants to properly count connections
  const lobbyParticipants = useAtomValue(lobbyParticipantsAtom);
  
  const connectedPlayers = useMemo(() => {
    const gamePlayersCount = Object.values(state.players).filter(
      (p) => p.isConnected && (p.id === 'playerA' || p.id === 'playerB'),
    ).length;
    
    const lobbyPlayersCount = lobbyParticipants.filter(
      (p) => p.isConnected && p.type === 'player'
    ).length;
    
    return Math.max(gamePlayersCount, lobbyPlayersCount);
  }, [state.players, lobbyParticipants]);

  // Function to show alerts
  const showAlertMessage = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  }, []);

  // Memoize search params to avoid re-parsing on every render
  const searchParamsObj = useMemo(() => ({
    role: searchParams.get('role'),
    name: searchParams.get('name'),
    flag: searchParams.get('flag'),
    club: searchParams.get('club'),
    hostName: searchParams.get('hostName'),
  }), [searchParams]);

  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;

    // Load game state from database if needed, or create if not exists
    const initializeGameState = async () => {
      if (state.gameId !== gameId) {
        console.log('Loading game state for:', gameId);
        try {
          const result = await loadGameState(gameId);
          if (!isMounted) return;
          
          if (!result.success) {
            // If game doesn't exist and we have host parameters, try to create it
            const { role, hostName: urlHostName } = searchParamsObj;
            if (role === 'host') {
              console.log('Game not found, attempting to create new game for host:', gameId);
              try {
                // Create a new game with basic settings
                await startSession(
                  gameId,
                  'HOST', // Default host code
                  urlHostName || (language === 'ar' ? 'المقدم' : 'Host'), // Use URL host name or default
                  {
                    WSHA: 4,
                    AUCT: 4, 
                    BELL: 10,
                    SING: 10,
                    REMO: 4
                  }
                );
                showAlertMessage(t('sessionCreatedSuccessfully'), 'success');
              } catch (createError) {
                console.error('Failed to create new game:', createError);
                showAlertMessage(t('failedCreateSession'), 'error');
              }
            } else {
              console.error('Failed to load game state:', result.error);
              showAlertMessage(`${t('failedLoadSessionData')}: ${result.error}`, 'error');
            }
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('Error loading game state:', error);
          showAlertMessage('خطأ في تحميل بيانات الجلسة', 'error');
        }
      }
    };

    initializeGameState();

    // Determine my role from URL parameters
    const { role, name, flag, club, hostName } = searchParamsObj;

    let participant: LobbyParticipant | null = null;

    if (role === 'controller') {
      participant = {
        id: 'controller',
        name: hostName || state.hostName || 'Controller',
        type: 'controller',
        isConnected: true,
      };
      setHostConnected(true);
    } else if (role === 'host') {
      participant = {
        id: 'host',
        name: hostName || state.hostName || 'Host',
        type: 'host',
        isConnected: true,
      };
      setHostConnected(true);
    } else if (role === 'playerA' || role === 'playerB') {
      participant = {
        id: role,
        name: name || 'لاعب',
        type: 'player',
        playerId: role,
        flag: flag || undefined,
        club: club || undefined,
        isConnected: true,
      };
    }

    if (participant && isMounted) {
      setParticipant(participant);
    }
    
    return () => {
      isMounted = false;
    };
  }, [gameId, searchParamsObj, state.gameId, state.hostName, loadGameState, setHostConnected, setParticipant, showAlertMessage, startSession, language, t]);

  // Set up cleanup when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (myParticipant && gameSyncInstance && typeof gameSyncInstance === 'object' && 'disconnect' in gameSyncInstance) {
        (gameSyncInstance as { disconnect: () => Promise<void> }).disconnect().catch(console.error);
        
        if (myParticipant.type === 'controller' || myParticipant.type === 'host') {
          setHostConnected(false);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (myParticipant && (myParticipant.type === 'controller' || myParticipant.type === 'host')) {
        setHostConnected(false);
      }
    };
  }, [myParticipant, gameSyncInstance, setHostConnected]);

  if (!myParticipant || !gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className={`text-white text-center ${language === 'ar' ? 'font-arabic' : ''}`}>
          <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg mb-2">{language === 'ar' ? t('loadingLobby') : 'Loading lobby...'}</p>
          {!gameId && <p className="text-sm text-white/70">{language === 'ar' ? t('noGameIdFound') : 'No game ID found'}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-4">
      {/* Language Toggle */}
      <LanguageToggle />
      
      {/* Alert Banner */}
      <AlertBanner
        message={alertMessage}
        type={alertType}
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold text-white mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('waitingLobby')}
          </h1>
          <div className="space-y-2">
            <p className={`text-accent2 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('lobbySessionCode')}: <span className="font-mono text-2xl">{gameId}</span>
            </p>
            <p className={`text-white/70 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('connectedPlayers')}: {connectedPlayers}/2
            </p>

          </div>
        </div>

        {/* User Info - Compact */}
        <div className="mb-6 bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className={`text-white bg-blue-600/30 px-3 py-1 rounded-full ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('participantType')}: {myParticipant.type}
            </span>
            <span className={`text-white bg-blue-600/30 px-3 py-1 rounded-full ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('participantName')}: {myParticipant.name}
            </span>
            <span className={`text-white bg-blue-600/30 px-3 py-1 rounded-full ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('participantId')}: {myParticipant.id}
            </span>
          </div>
        </div>

        {/* Simple Kitchen Sink Video - Optimized for mobile */}
        <div className="mb-6">
          <SimpleKitchenSinkVideo
            gameId={gameId!}
            myParticipant={myParticipant}
            showAlertMessage={showAlertMessage}
            className="w-full"
          />
        </div>

      </div>
    </div>
  );
}
