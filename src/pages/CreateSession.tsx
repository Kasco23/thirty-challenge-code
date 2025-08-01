import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameActions } from '@/hooks/useGameAtoms';
import { GameDatabase } from '@/lib/gameDatabase';
import type { SegmentCode } from '@/types/game';

const SEGMENTS: Record<SegmentCode, string> = {
  WSHA: 'وش تعرف',
  AUCT: 'المزاد',
  BELL: 'فقرة الجرس',
  SING: 'سين وجيم',
  REMO: 'التعويض',
};

/**
 * Page for creating a new game session. Allows the host to
 * choose a host name, optional host code, and customize the
 * number of questions for each segment. Creates initial game
 * record in CONFIG phase, then updates to LOBBY after confirmation.
 */
export default function CreateSession() {
  const nav = useNavigate();
  const { updateToLobbyPhase } = useGameActions();

  const [hostName, setHostName] = useState('');
  const [hostCode, setHostCode] = useState('');
  const [segmentSettings, setSegmentSettings] = useState<
    Record<SegmentCode, number>
  >({
    WSHA: 4,
    AUCT: 4,
    BELL: 10,
    SING: 10,
    REMO: 4,
  });
  const [gameId, setGameId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate session ID and create initial game record in CONFIG phase
  useEffect(() => {
    const createInitialSession = async () => {
      const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGameId(sessionId);
      
      try {
        setIsCreating(true);
        setError('');
        
        // Create initial game record in CONFIG phase
        const result = await GameDatabase.createGame(
          sessionId,
          '', // Host code will be set later
          null, // Host name will be set later
          segmentSettings
        );
        
        if (!result) {
          setError('فشل في إنشاء الجلسة. يرجى المحاولة مرة أخرى.');
          return;
        }
        
        console.log('Initial game session created:', result);
      } catch (err) {
        console.error('Error creating initial session:', err);
        setError('خطأ في إنشاء الجلسة. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsCreating(false);
      }
    };

    createInitialSession();
  }, []); // Empty dependency array - we only want this to run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId) {
      setError('لم يتم إنشاء معرف الجلسة بعد. يرجى الانتظار.');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      // Update game to LOBBY phase with host details
      await updateToLobbyPhase(gameId, hostCode, hostName, segmentSettings);
      
      // Navigate to control room
      nav('/control-room', { 
        state: { 
          gameId, 
          hostCode, 
          hostName 
        } 
      });
    } catch (err) {
      console.error('Failed to finalize session:', err);
      setError('فشل في إنهاء إعداد الجلسة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-white text-center font-arabic">
          إنشاء جلسة جديدة
        </h1>

        {/* Session Creation Status */}
        {isCreating && !gameId && (
          <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-blue-300 font-arabic text-sm">جاري إنشاء الجلسة...</p>
          </div>
        )}

        {/* Session ID Display */}
        {gameId && (
          <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <p className="text-green-300 font-arabic text-sm mb-1">تم إنشاء الجلسة بنجاح</p>
            <p className="text-white font-mono text-lg">{gameId}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-red-300 font-arabic text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-white/80 mb-1 font-arabic">
            اسم المقدم
          </label>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            required
            disabled={isCreating}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-white/80 mb-1 font-arabic">
            رمز المقدم (اختره بنفسك)
          </label>
          <input
            value={hostCode}
            onChange={(e) => setHostCode(e.target.value.toUpperCase())}
            placeholder="مثال: MUSAED"
            required
            disabled={isCreating}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white font-mono disabled:opacity-50"
          />
        </div>

        {Object.entries(SEGMENTS).map(([code, label]) => (
          <div key={code} className="flex items-center justify-between">
            <span className="text-white font-arabic">{label}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={segmentSettings[code as SegmentCode]}
              onChange={(e) =>
                setSegmentSettings({
                  ...segmentSettings,
                  [code]: Number(e.target.value),
                })
              }
              disabled={isCreating}
              className="w-20 px-2 py-1 rounded bg-white/10 text-white text-center disabled:opacity-50"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isCreating || !gameId || !hostName.trim() || !hostCode.trim()}
          className="w-full py-3 bg-accent2 hover:bg-accent disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-arabic transition-colors"
        >
          {isCreating ? 'جاري التحديث...' : gameId ? `تأكيد الجلسة — ${gameId}` : 'انتظار إنشاء الجلسة...'}
        </button>
      </form>
    </div>
  );
}
