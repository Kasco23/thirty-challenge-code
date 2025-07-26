// src/pages/Lobby.tsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import VideoRoom from '../components/VideoRoom';
import { CLUB_THEMES } from '../themes/clubs';

type UserRole = 'host' | 'playerA' | 'playerB';

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, actions } = useGame();

  const [userRole, setUserRole] = useState<UserRole>('host');
  const [selectedClub, setSelectedClub] = useState('liverpool');

  // Extract URL parameters
  useEffect(() => {
    const role = searchParams.get('role') as UserRole;
    const name = searchParams.get('name');
    const flag = searchParams.get('flag');
    const club = searchParams.get('club');
    const autoJoin = searchParams.get('autoJoin') === 'true';
    const hostName = searchParams.get('hostName');

    if (role) {
      setUserRole(role);
    }

    // Auto-join players directly
    if (role && role !== 'host' && autoJoin && name && flag && club) {
      actions.joinGame(role as 'playerA' | 'playerB', {
        name,
        flag,
        club,
        isConnected: true,
      });
    }

    // Update host name if provided
    if (hostName) {
      actions.updateHostName(hostName);
    }
  }, [searchParams, actions]);

  // Initialize game if needed
  useEffect(() => {
    if (gameId && state.gameId !== gameId) {
      actions.startGame(gameId);
    }
  }, [gameId, state.gameId, actions]);

  // Update host name when it changes
  useEffect(() => {
    const hostName = searchParams.get('hostName');
    if (userRole === 'host' && hostName && hostName !== state.hostName) {
      actions.updateHostName(hostName);
    }
  }, [searchParams, userRole, state.hostName, actions]);

  const handleClubSelection = (club: string) => {
    setSelectedClub(club);
    if (userRole !== 'host') {
      actions.joinGame(userRole as 'playerA' | 'playerB', {
        name: state.players[userRole as 'playerA' | 'playerB']?.name || 'لاعب',
        club,
        isConnected: true,
      });
    }
  };

  const handleStartGame = () => {
    if (gameId) {
      navigate(`/game/${gameId}?role=host`);
    }
  };

  const connectedPlayers = Object.values(state.players).filter(p => p.isConnected).length;

  if (!gameId || !state.gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-white text-center font-arabic">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl mb-4">جاري التحميل...</h1>
        </div>
      </div>
    );
  }

  // Host PC View
  if (userRole === 'host') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 font-arabic">صالة الانتظار</h1>
            <p className="text-accent2 font-arabic">رمز الجلسة: <span className="font-mono text-2xl">{gameId}</span></p>
            <p className="text-white/70 font-arabic mt-2">اللاعبون المتصلون: {connectedPlayers}/2</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Game Settings Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 font-arabic">إعدادات اللعبة</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-arabic">عدد الأسئلة لكل فقرة:</label>
                    <div className="space-y-2">
                      {Object.entries(state.segments).map(([segmentCode, segmentData]) => (
                        <div key={segmentCode} className="flex justify-between items-center">
                          <span className="text-white font-arabic">{segmentCode}</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={segmentData.questionsPerSegment}
                            className="w-16 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-center"
                            readOnly
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Game Button */}
              <motion.button
                onClick={handleStartGame}
                disabled={connectedPlayers < 2}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-xl font-arabic transition-all ${
                  connectedPlayers >= 2
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                whileHover={connectedPlayers >= 2 ? { scale: 1.02 } : {}}
                whileTap={connectedPlayers >= 2 ? { scale: 0.98 } : {}}
              >
                {connectedPlayers >= 2 ? 'بدء اللعبة' : `انتظار اللاعبين (${connectedPlayers}/2)`}
              </motion.button>
            </div>

            {/* Players Status */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-6">
                {/* Host Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white font-arabic">المقدم</h3>
                    <p className="text-accent2 font-arabic">{state.hostName}</p>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 bg-blue-500 text-white">
                      متصل
                    </div>
                  </div>
                  <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                    <VideoRoom roomName={gameId} userName={state.hostName} />
                  </div>
                </div>

                {/* Players Grid */}
                <div className="grid md:grid-cols-2 gap-6">
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
                          <div className="text-center mb-4">
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
                        <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                          <VideoRoom 
                            roomName={gameId} 
                            userName={isConnected ? player.name : `لاعب ${index + 1}`} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Player Mobile View - Auto-joined
  const autoJoin = searchParams.get('autoJoin') === 'true';
  if (autoJoin) {
    const player = state.players[userRole as 'playerA' | 'playerB'];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2 font-arabic">في الصالة</h1>
            <p className="text-accent2 font-arabic">رمز الجلسة: {gameId}</p>
          </div>

          {/* Player Info */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              {player.flag && (
                <span className={`fi fi-${player.flag} text-3xl`}></span>
              )}
              <h2 className="text-xl font-bold text-white font-arabic">{player.name}</h2>
            </div>

            {player.club && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-2">
                  <img 
                    src={CLUB_THEMES[player.club as keyof typeof CLUB_THEMES]?.logo} 
                    alt={player.club}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-white/80 font-arabic capitalize">{player.club}</p>
              </div>
            )}
          </div>

          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 mb-6">
            <p className="text-green-300 font-bold font-arabic">تم الانضمام بنجاح!</p>
            <p className="text-white/70 text-sm font-arabic mt-1">انتظر المقدم لبدء اللعبة</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-white/70 text-sm font-arabic">متصل</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Player Mobile View - Manual Club Selection (fallback)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-arabic">اختر فريقك</h1>
          <p className="text-accent2 font-arabic">رمز الجلسة: {gameId}</p>
        </div>

        {/* Club Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Object.entries(CLUB_THEMES).map(([clubKey, theme]) => (
            <motion.button
              key={clubKey}
              onClick={() => handleClubSelection(clubKey)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedClub === clubKey
                  ? 'border-accent2 bg-accent2/20'
                  : 'border-white/20 bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 mx-auto mb-2">
                <img src={theme.logo} alt={clubKey} className="w-full h-full object-contain" />
              </div>
              <p className="text-white text-sm font-arabic capitalize">{clubKey}</p>
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={() => navigate(`/game/${gameId}?role=${userRole}`)}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl font-arabic"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          جاهز للعب
        </motion.button>
      </div>
    </div>
  );
}
