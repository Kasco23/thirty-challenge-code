// src/pages/Lobby.tsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import VideoRoom from "../components/VideoRoom";
import { CLUB_THEMES } from "../themes/clubs";

type UserRole = 'host' | 'playerA' | 'playerB';

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const [userRole, setUserRole] = useState<UserRole>('host');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  // Determine user role from URL parameters
  useEffect(() => {
    const role = searchParams.get('role') as UserRole;
    const name = searchParams.get('name');
    const flag = searchParams.get('flag');
    const club = searchParams.get('club');
    
    if (role && ['host', 'playerA', 'playerB'].includes(role)) {
      setUserRole(role);
      
      // If player data is in URL, join the game immediately
      if (role !== 'host' && name && flag && club) {
        actions.joinGame(role, { 
          name: decodeURIComponent(name),
          flag: flag,
          club: club 
        });
        setSelectedClub(club);
        setIsReady(true);
      }
    }
  }, [searchParams, actions]);

  // Initialize game if host or if game doesn't exist
  useEffect(() => {
    if (gameId && state.gameId !== gameId) {
      actions.startGame(gameId);
    }
  }, [gameId, state.gameId, actions]);

  const handleClubSelection = (clubKey: string) => {
    setSelectedClub(clubKey);
    if (userRole !== 'host') {
      actions.joinGame(userRole, { 
        name: state.players[userRole].name,
        club: clubKey 
      });
    }
  };

  const handleStartGame = () => {
    if (userRole === 'host') {
      navigate(`/game/${gameId}?role=host`);
    }
  };

  const handlePlayerReady = () => {
    setIsReady(!isReady);
    // Update player ready status
    actions.joinGame(userRole, { 
      name: state.players[userRole].name,
      club: selectedClub,
      isConnected: !isReady 
    });
  };

  const connectedPlayers = Object.values(state.players).filter(p => p.isConnected && p.id !== 'host').length;
  const canStartGame = userRole === 'host' && connectedPlayers >= 1; // At least 1 player to start

  // Show loading if game is not initialized
  if (!gameId || !state.gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Host PC View
  if (userRole === 'host') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2 font-arabic">غرفة الانتظار</h1>
            <p className="text-accent2 font-arabic">رمز الجلسة: <span className="font-mono text-2xl">{gameId}</span></p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Host Controls */}
            <motion.div
              className="lg:col-span-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 font-arabic">إعدادات المقدم</h2>
              
              {/* Game Settings */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white/80 mb-2 font-arabic">عدد الأسئلة لكل فقرة</label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {state.segments.map((segment) => (
                      <div key={segment.code} className="bg-white/5 rounded-lg p-2">
                        <span className="text-white/70 font-arabic">{segment.name}</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          defaultValue={state.settings.questionsPerSegment[segment.code]}
                          className="w-full mt-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Game Button */}
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors font-arabic"
              >
                {canStartGame ? 'بدء اللعبة' : `انتظار اللاعبين (${connectedPlayers}/2)`}
              </button>
            </motion.div>

            {/* Players Status */}
            <motion.div
              className="lg:col-span-2 grid md:grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {(['playerA', 'playerB'] as const).map((playerId, index) => {
                const player = state.players[playerId];
                const isConnected = player.isConnected;
                
                return (
                  <div key={playerId} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-white font-arabic">
                        {isConnected ? player.name : `لاعب ${index + 1}`}
                      </h3>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                        isConnected ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'
                      }`}>
                        {isConnected ? 'متصل' : 'غير متصل'}
                      </div>
                    </div>

                    {/* Player's selected club */}
                    {isConnected && player.club && (
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2">
                          <img 
                            src={CLUB_THEMES[player.club as keyof typeof CLUB_THEMES]?.logo} 
                            alt={player.club}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-white/80 text-sm font-arabic capitalize">{player.club}</p>
                      </div>
                    )}

                    {/* Video placeholder */}
                    <div className="mt-4 aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                      <VideoRoom />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Instructions for players */}
          <motion.div
            className="mt-8 text-center bg-blue-500/20 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-white font-arabic">
              شارك رمز الجلسة <span className="font-mono font-bold">{gameId}</span> مع اللاعبين للانضمام
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Player Mobile View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2 font-arabic">انضمام للجلسة</h1>
          <p className="text-accent2 font-arabic">رمز الجلسة: <span className="font-mono">{gameId}</span></p>
          <p className="text-white/70 text-sm font-arabic mt-2">مرحبا {state.players[userRole].name}</p>
        </motion.div>

        {/* Club Selection - only show if not already selected */}
        {!selectedClub && (
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 text-center font-arabic">اختر فريقك</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(CLUB_THEMES).map(([clubKey, theme]) => (
                <button
                  key={clubKey}
                  onClick={() => handleClubSelection(clubKey)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedClub === clubKey
                      ? 'border-accent2 bg-accent2/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2">
                    <img src={theme.logo} alt={clubKey} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-white text-sm font-arabic capitalize">{clubKey}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selected Club Display */}
        {selectedClub && (
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 font-arabic">فريقك المختار</h2>
            <div className="w-20 h-20 mx-auto mb-2">
              <img 
                src={CLUB_THEMES[selectedClub as keyof typeof CLUB_THEMES]?.logo} 
                alt={selectedClub}
                className="w-full h-full object-contain" 
              />
            </div>
            <p className="text-accent2 font-bold font-arabic capitalize">{selectedClub}</p>
          </motion.div>
        )}

        {/* Ready Button */}
        <motion.button
          onClick={handlePlayerReady}
          disabled={!selectedClub}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all font-arabic ${
            isReady
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-accent2 hover:bg-accent text-white'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isReady ? 'جاهز ✓' : 'أنا جاهز'}
        </motion.button>

        {/* Status */}
        <motion.div
          className="mt-6 text-center text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-arabic">انتظار بدء اللعبة من المقدم...</p>
        </motion.div>
      </div>
    </div>
  );
}
