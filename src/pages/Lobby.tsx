import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useGameState, useGameActions, useLobbyActions, useGameSync } from '@/hooks/useGameAtoms';
import { gameSyncInstanceAtom, lobbyParticipantsAtom } from '@/state';
import SimpleKitchenSinkVideo from '@/components/SimpleKitchenSinkVideo';
import AlertBanner from '@/components/AlertBanner';
import type { LobbyParticipant } from '@/state';

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const state = useGameState();
  const { loadGameState, setHostConnected } = useGameActions();
  const { myParticipant, setParticipant } = useLobbyActions();
  
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

    // Load game state from database if needed
    const initializeGameState = async () => {
      if (state.gameId !== gameId) {
        console.log('Loading game state for:', gameId);
        try {
          const result = await loadGameState(gameId);
          if (!isMounted) return;
          
          if (!result.success) {
            console.error('Failed to load game state:', result.error);
            showAlertMessage(`فشل في تحميل بيانات الجلسة: ${result.error}`, 'error');
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

    if (role === 'host') {
      participant = {
        id: 'host-pc',
        name: hostName || state.hostName || 'المقدم',
        type: 'host-pc',
        isConnected: true,
      };
      setHostConnected(true);
    } else if (role === 'host-mobile') {
      participant = {
        id: 'host-mobile',
        name: name || state.hostName || 'المقدم',
        type: 'host-mobile',
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
  }, [gameId, searchParamsObj, state.gameId, state.hostName, loadGameState, setHostConnected, setParticipant, showAlertMessage]);

  // Set up cleanup when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (myParticipant && gameSyncInstance && typeof gameSyncInstance === 'object' && 'disconnect' in gameSyncInstance) {
        (gameSyncInstance as { disconnect: () => Promise<void> }).disconnect().catch(console.error);
        
        if (myParticipant.type === 'host-pc' || myParticipant.type === 'host-mobile') {
          setHostConnected(false);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (myParticipant && (myParticipant.type === 'host-pc' || myParticipant.type === 'host-mobile')) {
        setHostConnected(false);
      }
    };
  }, [myParticipant, gameSyncInstance, setHostConnected]);

  if (!myParticipant || !gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-white text-center font-arabic">
          <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg mb-2">جاري تحميل الصالة...</p>
          {!gameId && <p className="text-sm text-white/70">لا يوجد معرف للعبة</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-4">
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
          <h1 className="text-4xl font-bold text-white mb-2 font-arabic">
            صالة الانتظار
          </h1>
          <div className="space-y-2">
            <p className="text-accent2 font-arabic">
              رمز الجلسة: <span className="font-mono text-2xl">{gameId}</span>
            </p>
            <p className="text-white/70 font-arabic">
              اللاعبون المتصلون: {connectedPlayers}/2
            </p>
            <p className="text-blue-300 font-arabic text-sm">
              نظام الفيديو المحدث مع عرض أسماء اللاعبين
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-8 bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-300 mb-4 font-arabic text-center">
            معلومات المستخدم
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white font-arabic">النوع: {myParticipant.type}</p>
            </div>
            <div>
              <p className="text-white font-arabic">الاسم: {myParticipant.name}</p>
            </div>
            <div>
              <p className="text-white font-arabic">المعرف: {myParticipant.id}</p>
            </div>
          </div>
        </div>

        {/* Simple Kitchen Sink Video - with proper room name using session ID */}
        <div className="mb-8">
          <SimpleKitchenSinkVideo
            gameId={gameId!}
            myParticipant={myParticipant}
            showAlertMessage={showAlertMessage}
            className="w-full"
          />
        </div>

        {/* Instructions */}
        <motion.div
          className="text-center text-white/60 text-sm max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <p className="font-arabic mb-2">✅ نظام الفيديو المحدث:</p>
            <div className="text-right space-y-1 font-arabic">
              <p>• رابط الغرفة يتم تحميله تلقائياً من معرف الجلسة</p>
              <p>• أسماء اللاعبين تظهر أسفل مقاطع الفيديو</p>
              <p>• غرفة الفيديو تستخدم معرف الجلسة مباشرة</p>
              <p>• تحكم في الكاميرا والميكروفون</p>
              <p>• تطبيق Daily.co Kitchen Sink المطور</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
