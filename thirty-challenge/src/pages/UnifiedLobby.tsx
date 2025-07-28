import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../hooks/useGame';
// VideoRoom import removed - using TrueLobby instead
import { CLUB_THEMES } from '../themes/clubs';

interface ParticipantInfo {
  type: 'host-pc' | 'host-mobile' | 'player';
  name: string;
  flag?: string;
  club?: string;
  playerId?: 'playerA' | 'playerB';
}

export default function UnifiedLobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, actions } = useGame();

  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game and determine participant type
  useEffect(() => {
    if (!gameId) return;

    // Initialize game if needed
    if (state.gameId !== gameId) {
      actions.startGame(gameId);
    }

    // Determine participant type from URL parameters
    const role = searchParams.get('role');
    const name = searchParams.get('name');
    const flag = searchParams.get('flag');
    const club = searchParams.get('club');
    const hostName = searchParams.get('hostName');
    const autoJoin = searchParams.get('autoJoin') === 'true';

    let participantInfo: ParticipantInfo | null = null;

    if (role === 'host') {
      // Host PC (control only)
      participantInfo = {
        type: 'host-pc',
        name: hostName || state.hostName || 'المقدم',
      };
      if (hostName) actions.updateHostName(hostName);
    } else if (role === 'host-mobile') {
      // Host Mobile (with video)
      participantInfo = {
        type: 'host-mobile',
        name: name || state.hostName || 'المقدم',
      };
      if (name) actions.updateHostName(name);
    } else if (
      (role === 'playerA' || role === 'playerB') &&
      name &&
      flag &&
      club
    ) {
      // Player
      participantInfo = {
        type: 'player',
        name,
        flag,
        club,
        playerId: role,
      };

      if (autoJoin) {
        actions.joinGame(role, {
          name,
          flag,
          club,
          isConnected: true,
        });
      }
    }

    setParticipant(participantInfo);
    setIsLoading(false);
  }, [gameId, searchParams, state.gameId, state.hostName, actions]);

  const handleStartGame = () => {
    navigate(`/game/${gameId}?role=host`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-white text-center font-arabic">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          جاري تحميل الصالة...
        </div>
      </div>
    );
  }

  if (!participant || !gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-white text-center font-arabic">
          خطأ: معلومات المشارك غير صحيحة
        </div>
      </div>
    );
  }

  const connectedPlayers = Object.values(state.players).filter(
    (p) => p.isConnected,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Same for everyone */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-arabic">
            صالة الانتظار
          </h1>
          <div className="space-y-2">
            <p className="text-accent2 font-arabic">
              رمز الجلسة: <span className="font-mono text-2xl">{gameId}</span>
            </p>
            {participant.type === 'host-pc' && (
              <p className="text-blue-300 font-arabic">
                رمز المقدم (للهاتف):{' '}
                <span className="font-mono text-lg">{gameId}-HOST</span>
              </p>
            )}
            <p className="text-white/70 font-arabic">
              اللاعبون المتصلون: {connectedPlayers}/2
            </p>
          </div>
        </div>

        {/* Unified Participant Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Host Section */}
          <div className="bg-gradient-to-br from-blue-800/30 to-purple-800/30 rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-300 mb-4 font-arabic text-center">
              المقدم
            </h3>

            <div className="aspect-video bg-black/30 rounded-lg mb-4 overflow-hidden">
              <div className="bg-gray-800 rounded-lg p-4 text-center text-white/50 font-arabic">
                استخدم TrueLobby للفيديو
              </div>
            </div>

            <div className="text-center">
              <p className="text-white font-arabic text-lg">{state.hostName}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    participant.type !== 'player'
                      ? 'bg-green-500'
                      : 'bg-gray-500'
                  }`}
                />
                <span className="text-white/70 text-sm font-arabic">
                  {participant.type === 'host-pc'
                    ? 'متصل (تحكم)'
                    : participant.type === 'host-mobile'
                      ? 'متصل (فيديو)'
                      : 'غير متصل'}
                </span>
              </div>
            </div>

            {/* Host Controls - Only for host PC */}
            {participant.type === 'host-pc' && (
              <div className="mt-6 space-y-3">
                <div className="text-sm text-white/70 font-arabic">
                  <p>إعدادات الأسئلة:</p>
                  {Object.entries(state.segments).map(
                    ([segmentCode, segment]) => (
                      <div key={segmentCode} className="flex justify-between">
                        <span>{segmentCode}:</span>
                        <span>{segment.questionsPerSegment} سؤال</span>
                      </div>
                    ),
                  )}
                </div>

                <button
                  onClick={handleStartGame}
                  disabled={connectedPlayers < 2}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-arabic transition-colors"
                >
                  {connectedPlayers < 2
                    ? 'في انتظار اللاعبين...'
                    : 'بدء اللعبة'}
                </button>
              </div>
            )}
          </div>

          {/* Players Section */}
          {(['playerA', 'playerB'] as const).map((playerId, index) => {
            const player = state.players[playerId];
            const isCurrentPlayer =
              participant.type === 'player' &&
              participant.playerId === playerId;
            const clubTheme =
              CLUB_THEMES[player.club as keyof typeof CLUB_THEMES] ||
              CLUB_THEMES.liverpool;

            return (
              <div
                key={playerId}
                className={`bg-gradient-to-br rounded-xl p-6 border ${
                  isCurrentPlayer
                    ? 'from-green-800/40 to-blue-800/40 border-green-500/50'
                    : 'from-gray-800/30 to-gray-700/30 border-gray-500/30'
                }`}
              >
                <h3
                  className="text-xl font-bold text-center mb-4 font-arabic"
                  style={{ color: clubTheme.primary }}
                >
                  لاعب {index + 1} {isCurrentPlayer && '(أنت)'}
                </h3>

                <div className="aspect-video bg-black/30 rounded-lg mb-4 overflow-hidden">
                  {player.isConnected ? (
                    <div className="bg-gray-800 rounded-lg p-4 text-center text-white/50 font-arabic">
                      استخدم TrueLobby للفيديو
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white/50">
                        <div className="text-4xl mb-2">👤</div>
                        <p className="text-sm font-arabic">
                          في انتظار الاتصال...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {player.isConnected ? (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`fi fi-${player.flag} w-6 h-4 rounded`}
                      ></span>
                      <p className="text-white font-arabic text-lg">
                        {player.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={`/src/assets/logos/${player.club}.svg`}
                        alt={player.club}
                        className="w-6 h-6"
                        loading="lazy"
                      />
                      <p className="text-white/70 text-sm font-arabic capitalize">
                        {player.club?.replace('-', ' ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-green-400 text-sm font-arabic">
                        متصل
                      </span>
                    </div>

                    <div className="text-white/60 text-sm font-arabic">
                      النقاط: {player.score} | الأخطاء: {player.strikes}/3
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/50 font-arabic">لم ينضم بعد</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <span className="text-gray-400 text-sm font-arabic">
                        غير متصل
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <motion.div
          className="text-center text-white/60 text-sm max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <p className="font-arabic mb-2">💡 تعليمات:</p>
            <div className="text-right space-y-1 font-arabic">
              {participant.type === 'host-pc' && (
                <>
                  <p>• هذا الجهاز للتحكم في اللعبة فقط</p>
                  <p>• للمشاركة بالفيديو، انضم من هاتفك برمز المقدم</p>
                  <p>• انتظر انضمام اللاعبين ثم اضغط "بدء اللعبة"</p>
                </>
              )}
              {participant.type === 'host-mobile' && (
                <>
                  <p>• أنت متصل كمقدم بالفيديو</p>
                  <p>• يمكنك رؤية جميع المشاركين</p>
                </>
              )}
              {participant.type === 'player' && (
                <>
                  <p>• أنت متصل كلاعب</p>
                  <p>• انتظر بدء اللعبة من المقدم</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
