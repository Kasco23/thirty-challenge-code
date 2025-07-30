import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
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
 * number of questions for each segment. After submission the
 * user is taken to the control room.
 */
export default function CreateSession() {
  const nav = useNavigate();
  const { startSession } = useGame();

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

  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startSession(sessionId, hostCode, hostName, segmentSettings);
    nav('/control-room');
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

        <div>
          <label className="block text-white/80 mb-1 font-arabic">
            اسم المقدم
          </label>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white"
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
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white font-mono"
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
              className="w-20 px-2 py-1 rounded bg-white/10 text-white text-center"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-3 bg-accent2 hover:bg-accent text-white rounded-xl font-arabic"
        >
          إنشاء الجلسة — {sessionId}
        </button>
      </form>
    </div>
  );
}
