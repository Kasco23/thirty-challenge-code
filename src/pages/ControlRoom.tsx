import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

/**
 * Host control interface shown on the PC. Displays join codes,
 * lets the host create or end the Daily video room, and offers
 * quick controls for starting the game or advancing questions.
 */
export default function ControlRoom() {
  const state = useGameState();
  const { startGame, createVideoRoom, endVideoRoom } = useGameActions();

  const handleCreate = async () => {
    if (!state.gameId) return;
    await createVideoRoom(state.gameId);
  };

  const handleEnd = async () => {
    if (!state.gameId) return;
    await endVideoRoom(state.gameId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-6">
      <h1 className="text-4xl font-bold text-white mb-8 font-arabic text-center">
        غرفة التحكم
      </h1>

      {/* Display session codes */}
      <div className="text-center mb-6 space-y-1">
        <p className="text-accent2 font-arabic">
          رمز اللاعبين: <span className="font-mono">{state.gameId}</span>
        </p>
        <p className="text-accent2 font-arabic">
          رمز المقدم: <span className="font-mono">{state.hostCode}</span>
        </p>
      </div>

      {/* Host actions */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={() => startGame()}
          disabled={state.phase !== 'CONFIG'}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-arabic"
        >
          ابدأ اللعبة
        </button>
        {!state.videoRoomCreated ? (
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-accent2 hover:bg-accent text-white rounded-lg font-arabic"
          >
            إنشاء غرفة الفيديو
          </button>
        ) : (
          <button
            onClick={handleEnd}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-arabic"
          >
            إنهاء غرفة الفيديو
          </button>
        )}
      </div>

      {/* Video tiles grid - Display only, ControlRoom doesn't join video */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(
          [
            {
              id: 'host-mobile',
              label: 'المقدم',
              name: state.hostName ?? 'المقدم',
            },
            {
              id: 'playerA',
              label: 'لاعب 1',
              name: state.players.playerA.name || 'Player A',
            },
            {
              id: 'playerB',
              label: 'لاعب 2',
              name: state.players.playerB.name || 'Player B',
            },
          ] as const
        ).map((p) => (
          <div key={p.id as string}>
            <h3 className="text-center text-white font-arabic mb-2">
              {p.label}
            </h3>
            <div className="aspect-video bg-black/30 rounded-lg overflow-hidden">
              {state.videoRoomCreated ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-sm font-arabic">
                      {p.id === 'host-mobile' ? 'فيديو المقدم' : `فيديو ${p.label}`}
                    </p>
                    <p className="text-xs text-white/30 font-arabic mt-2">
                      يمكنك رؤية الفيديو في Daily.co dashboard
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm font-arabic">
                      أنشئ غرفة الفيديو أولاً
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
