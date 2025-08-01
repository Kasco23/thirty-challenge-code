import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameActions } from '@/hooks/useGameAtoms';
import { GameDatabase } from '@/lib/gameDatabase';
import { getConfigurationError } from '@/lib/supabaseClient';
import type { SegmentCode } from '@/types/game';

const SEGMENTS: Record<SegmentCode, string> = {
  WSHA: 'وش تعرف',
  AUCT: 'المزاد',
  BELL: 'فقرة الجرس',
  SING: 'سين وجيم',
  REMO: 'التعويض',
};

/**
 * Enhanced session creation page with improved error handling and user feedback.
 * Validates environment configuration and provides clear error messages.
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

  // Check configuration on mount
  useEffect(() => {
    const configError = getConfigurationError();
    if (configError) {
      setError(`تحذير: ${configError}. قد لا تعمل بعض الميزات بشكل صحيح.`);
    }
  }, []);

  // Generate session ID on component mount
  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(sessionId);
  }, []); // Empty dependency array - we only want this to run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId) {
      setError('لم يتم إنشاء معرف الجلسة بعد. يرجى الانتظار.');
      return;
    }

    // Check for configuration issues before attempting to create
    const configError = getConfigurationError();
    if (configError) {
      setError(`لا يمكن إنشاء جلسة: ${configError}. يرجى التحقق من إعدادات النظام.`);
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      // Create game record and update to LOBBY phase in one step
      const result = await GameDatabase.createGame(
        gameId,
        hostCode,
        hostName,
        segmentSettings
      );
      
      if (!result) {
        throw new Error('Failed to create game record');
      }
      
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
      console.error('Failed to create and setup session:', err);
      
      // Provide specific error messages based on error type
      let errorMessage = 'فشل في إنشاء الجلسة. يرجى المحاولة مرة أخرى.';
      
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
        } else if (err.message.includes('duplicate')) {
          errorMessage = 'معرف الجلسة مستخدم بالفعل. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
        }
      }
      
      setError(errorMessage);
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
        {gameId && !isCreating && (
          <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <p className="text-green-300 font-arabic text-sm mb-1">معرف الجلسة جاهز</p>
            <p className="text-white font-mono text-lg">{gameId}</p>
            <p className="text-green-200 font-arabic text-xs mt-1">املأ البيانات واضغط تأكيد لإنشاء الجلسة</p>
          </div>
        )}

        {/* Enhanced Error Display */}
        {error && (
          <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-red-300 font-arabic text-sm">{error}</p>
            {error.includes('تحذير') && (
              <div className="mt-2 text-xs text-red-200 font-arabic">
                يمكنك المتابعة ولكن قد تواجه مشاكل في المزامنة
              </div>
            )}
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
            maxLength={50}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent2"
            placeholder="أدخل اسم المقدم"
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
            maxLength={20}
            pattern="[A-Z0-9]+"
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white font-mono disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent2"
          />
          <p className="text-xs text-white/60 mt-1 font-arabic">
            استخدم أحرف إنجليزية وأرقام فقط
          </p>
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
                  [code]: Math.max(1, Math.min(20, Number(e.target.value))),
                })
              }
              disabled={isCreating}
              className="w-20 px-2 py-1 rounded bg-white/10 text-white text-center disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent2"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isCreating || !gameId || !hostName.trim() || !hostCode.trim()}
          className="w-full py-3 bg-accent2 hover:bg-accent disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-arabic transition-colors focus:outline-none focus:ring-2 focus:ring-accent2"
        >
          {isCreating ? 'جاري التحديث...' : gameId ? `تأكيد الجلسة — ${gameId}` : 'انتظار إنشاء الجلسة...'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => nav('/')}
            className="text-white/70 hover:text-white text-sm font-arabic underline"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </form>
    </div>
  );
}
