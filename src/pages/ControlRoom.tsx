import { useGameState, useGameActions } from '@/hooks/useGameAtoms';
import UnifiedVideoRoom from '@/components/UnifiedVideoRoom';

/**
 * Host control interface shown on the PC. Displays join codes,
 * lets the host create or end the Daily video room, and offers
 * quick controls for starting the game or advancing questions.
 */
export default function ControlRoom() {
  const state = useGameState();
  const { startGame } = useGameActions();



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
        
        {/* Video room status display only */}
        <div className={`px-6 py-3 rounded-lg font-arabic ${
          state.videoRoomCreated 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-600 text-white/70'
        }`}>
          {state.videoRoomCreated ? '✓ غرفة الفيديو جاهزة' : 'لا توجد غرفة فيديو'}
        </div>
        
        <div className="px-6 py-3 bg-blue-600/20 border border-blue-600/30 rounded-lg font-arabic text-blue-300 text-sm">
          💡 غرفة الفيديو معروضة أدناه في وضع المراقبة
        </div>
      </div>

      {/* Unified Video Room - Observer Mode for Host PC */}
      {state.videoRoomCreated && (
        <div className="mb-8 bg-gradient-to-br from-blue-800/30 to-purple-800/30 rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-300 mb-4 font-arabic text-center">
            غرفة الفيديو - وضع المراقبة
          </h3>
          <div className="mb-4">
            <UnifiedVideoRoom 
              gameId={state.gameId}
              className="w-full aspect-video"
              observerMode={true}
            />
          </div>
          <div className="text-center text-sm text-white/70 font-arabic">
            أنت تراقب غرفة الفيديو بدون إظهار كاميرا أو صوت
          </div>
        </div>
      )}

      {/* Video room status when not created */}
      {!state.videoRoomCreated && (
        <div className="mb-8 bg-gray-500/20 border border-gray-500/30 rounded-xl p-6">
          <div className="text-center">
            <div className="text-gray-400 text-lg font-bold mb-2 font-arabic">
              غرفة الفيديو غير متاحة
            </div>
            <div className="text-gray-300 text-sm font-arabic mb-4">
              اذهب إلى صالة الانتظار لإنشاء غرفة الفيديو
            </div>
          </div>
        </div>
      )}

      {/* Legacy video tiles grid for reference - kept as fallback */}
      <details className="mb-6">
        <summary className="text-white/70 font-arabic cursor-pointer hover:text-white mb-4">
          عرض إطارات الفيديو المنفصلة (قديم)
        </summary>
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
      </details>
    </div>
  );
}
