import { useGame } from '@/hooks/useGame';
import VideoRoom from '@/components/VideoRoom';

/**
 * Dedicated page for quiz hosts to control the game flow.
 * Provides Arabic UI text and shows session codes for players
 * and hosts. The host can start the game or advance to the
 * next question. If a Daily video room has been created, the
 * host's mobile device will join via the VideoRoom component.
 */
export default function ControlRoom() {
  const { state, startGame, advanceQuestion } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-6">
      <h1 className="text-4xl font-bold text-white mb-8 font-arabic text-center">
        غرفة التحكم
      </h1>

      {/* Display the session codes for players and host */}
      <div className="text-center mb-6">
        <p className="text-accent2 font-arabic">
          رمز اللاعبين: <span className="font-mono">{state.gameId}</span>
        </p>
        <p className="text-accent2 font-arabic">
          رمز المقدم: <span className="font-mono">{state.hostCode}</span>
        </p>
      </div>

      {/* Host actions */}
      <div className="flex gap-4 justify-center mb-8">
        <button
          onClick={() => startGame()}
          disabled={state.phase !== 'CONFIG'}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-arabic"
        >
          ابدأ اللعبة
        </button>
        <button
          onClick={() => advanceQuestion()}
          disabled={state.phase !== 'PLAYING'}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-arabic"
        >
          السؤال التالي
        </button>
      </div>

      {/* Show mobile video room when available */}
      {state.videoRoomCreated && state.videoRoomUrl && (
        <VideoRoom
          gameId={state.gameId}
          userName={state.hostName ?? 'المقدم'}
          userRole="host-mobile"
        />
      )}
    </div>
  );
}
