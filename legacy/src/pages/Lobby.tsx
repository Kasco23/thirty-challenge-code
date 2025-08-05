// src/pages/Lobby.tsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../../../thirty-challenge/src/hooks/useGame';
// VideoRoom import removed - using TrueLobby instead
import { CLUB_THEMES } from '../themes/clubs';

type UserRole = 'host' | 'host-mobile' | 'playerA' | 'playerB';

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, actions } = useGame();

  const [userRole, setUserRole] = useState<UserRole>('host');

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

    // Handle host-mobile role - join as host with video capability
    if (role === 'host-mobile' && name) {
      actions.updateHostName(name);
    }

    // Auto-join players directly
    if (
      role &&
      ['playerA', 'playerB'].includes(role) &&
      autoJoin &&
      name &&
      flag &&
      club
    ) {
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
    if (
      (userRole === 'host' || userRole === 'host-mobile') &&
      hostName &&
      hostName !== state.hostName
    ) {
      actions.updateHostName(hostName);
    }
  }, [searchParams, userRole, state.hostName, actions]);

  const handleStartGame = () => {
    if (gameId) {
      navigate(
        `/game/${gameId}?role=${userRole === 'host-mobile' ? 'host' : userRole}`,
      );
    }
  };

  const connectedPlayers = Object.values(state.players).filter(
    (p) => p.isConnected,
  ).length;

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

  // Host Mobile View (when host joins from mobile for video)
  if (userRole === 'host-mobile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2 font-arabic">
              المقدم - الهاتف
            </h1>
            <p className="text-accent2 font-arabic">رمز الجلسة: {gameId}</p>
          </div>

          {/* Host Info */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl">🎤</div>
              <h2 className="text-xl font-bold text-white font-arabic">
                {state.hostName}
              </h2>
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-blue-500 text-white">
              مقدم متصل
            </div>
          </div>

          {/* Video Chat */}
          <div className="mb-6">
            {/* <VideoRoom gameId={gameId} userName={state.hostName} userRole="host-mobile" /> */}
            <div className="bg-gray-800 rounded-lg p-4 text-center text-white/50 font-arabic">
              استخدم TrueLobby للفيديو
            </div>
          </div>

          {/* Game Status */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-white/80 font-arabic mb-2">حالة اللعبة:</p>
            <p className="text-accent2 font-arabic">
              اللاعبون المتصلون: {connectedPlayers}/2
            </p>
            {connectedPlayers >= 2 && (
              <p className="text-green-400 font-arabic mt-2">
                جاهز للبدء! تحكم من الكمبيوتر
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-white/70 font-arabic">
            <p>• تحكم في اللعبة من جهاز الكمبيوتر</p>
            <p>• هذا الجهاز للفيديو فقط</p>
          </div>
        </motion.div>
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
            <h1 className="text-4xl font-bold text-white mb-2 font-arabic">
              صالة الانتظار
            </h1>
            <div className="space-y-2">
              <p className="text-accent2 font-arabic">
                رمز الجلسة: <span className="font-mono text-2xl">{gameId}</span>
              </p>
              <p className="text-blue-300 font-arabic">
                رمز المقدم:{' '}
                <span className="font-mono text-lg">{gameId}-HOST</span>
              </p>
              <p className="text-white/70 font-arabic mt-2">
                اللاعبون المتصلون: {connectedPlayers}/2
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Game Settings Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 font-arabic">
                  إعدادات اللعبة
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-arabic">
                      عدد الأسئلة لكل فقرة:
                    </label>
                    <div className="space-y-2">
                      {Object.entries(state.segments).map(
                        ([segmentCode, segmentData]) => (
                          <div
                            key={segmentCode}
                            className="flex justify-between items-center"
                          >
                            <span className="text-white font-arabic">
                              {segmentCode}
                            </span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={segmentData.questionsPerSegment}
                              className="w-16 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-center"
                              readOnly
                            />
                          </div>
                        ),
                      )}
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
                {connectedPlayers >= 2
                  ? 'بدء اللعبة'
                  : `انتظار اللاعبين (${connectedPlayers}/2)`}
              </motion.button>
            </div>

            {/* Players Status */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-6">
                {/* Host Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white font-arabic">
                      المقدم
                    </h3>
                    <p className="text-accent2 font-arabic">{state.hostName}</p>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 bg-blue-500 text-white">
                      متصل (تحكم)
                    </div>
                  </div>
                  <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                    {/* <VideoRoom gameId={gameId} userName={state.hostName} userRole="host-mobile" /> */}
                    <div className="bg-gray-800 rounded-lg p-4 text-center text-white/50 font-arabic">
                      استخدم TrueLobby للفيديو
                    </div>
                  </div>
                </div>

                {/* Players Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {(['playerA', 'playerB'] as const).map((playerId, index) => {
                    const player = state.players[playerId];
                    const isConnected = player.isConnected;

                    return (
                      <div
                        key={playerId}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-white font-arabic">
                            {isConnected ? player.name : `لاعب ${index + 1}`}
                          </h3>
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                              isConnected
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-gray-300'
                            }`}
                          >
                            {isConnected ? 'متصل' : 'غير متصل'}
                          </div>
                        </div>

                        {/* Player's selected club */}
                        {isConnected && player.club && (
                          <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto mb-2">
                              <img
                                src={
                                  CLUB_THEMES[
                                    player.club as keyof typeof CLUB_THEMES
                                  ]?.logo
                                }
                                alt={player.club}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <p className="text-white/80 text-sm font-arabic capitalize">
                              {player.club}
                            </p>
                          </div>
                        )}

                        {/* Video placeholder */}
                        <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                          <div className="bg-gray-800 rounded-lg p-4 text-center text-white/50 font-arabic">
                            استخدم TrueLobby للفيديو
                          </div>
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
            <h1 className="text-2xl font-bold text-white mb-2 font-arabic">
              في الصالة
            </h1>
            <p className="text-accent2 font-arabic">رمز الجلسة: {gameId}</p>
          </div>

          {/* Player Info */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              {player.flag && (
                <span className={`fi fi-${player.flag} text-3xl`}></span>
              )}
              <h2 className="text-xl font-bold text-white font-arabic">
                {player.name}
              </h2>
            </div>

            {player.club && (
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 mb-2">
                  <img
                    src={
                      CLUB_THEMES[player.club as keyof typeof CLUB_THEMES]?.logo
                    }
                    alt={player.club}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="text-white/80 font-arabic capitalize">
                  {player.club}
                </p>
              </div>
            )}

            <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white">
              متصل
            </div>
          </div>

          {/* Video Chat */}
          <div className="mb-6">
            {/* <VideoRoom gameId={gameId} userName={player.name} userRole="playerA" /> */}
            <div className="bg-gray-800 rounded-lg p-4 text-center text-white/50 font-arabic">
              استخدم TrueLobby للفيديو
            </div>
          </div>

          {/* Waiting Status */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/80 font-arabic mb-2">
              في انتظار بدء اللعبة...
            </p>
            <p className="text-accent2 font-arabic">
              اللاعبون المتصلون: {connectedPlayers}/2
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
      <div className="text-white text-center font-arabic">
        خطأ في تحميل الصفحة
      </div>
    </div>
  );
}
