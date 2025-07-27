import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import type { SegmentCode } from '../types/game';

export default function HostSetup() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { actions } = useGame();
  const [hostName, setHostName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Segment settings state
  const [segmentSettings, setSegmentSettings] = useState<Record<SegmentCode, number>>({
    WSHA: 10,
    AUCT: 8,
    BELL: 12,
    SING: 6,
    REMO: 5,
  });

  const handleCreateLobby = async () => {
    if (!hostName.trim()) {
      alert('يرجى إدخال اسمك أولاً');
      return;
    }

    setIsCreating(true);
    try {
      // Update host name and segment settings
      actions.updateHostName(hostName);
      actions.updateSegmentSettings(segmentSettings);
      
      // Navigate to lobby as host
      navigate(`/lobby/${gameId}?role=host&hostName=${encodeURIComponent(hostName)}`, { replace: true });
    } catch (error) {
      console.error('Failed to create lobby:', error);
      setIsCreating(false);
    }
  };

  const updateSegmentQuestions = (segment: keyof typeof segmentSettings, value: number) => {
    setSegmentSettings(prev => ({
      ...prev,
      [segment]: Math.max(1, Math.min(20, value))
    }));
  };

  if (!gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center">
        <div className="text-white text-center font-arabic">خطأ: لم يتم العثور على معرف الجلسة</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-full max-w-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-arabic">إعداد الجلسة</h1>
          <p className="text-accent2 font-arabic">رمز الجلسة: <span className="font-mono text-xl">{gameId}</span></p>
        </div>

        <div className="space-y-6">
          {/* Host Name Input */}
          <div>
            <label className="block text-white/80 mb-2 font-arabic">اسم المقدم</label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-arabic"
              required
            />
          </div>

          {/* Game Settings */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 font-arabic">إعدادات اللعبة</h2>
            <div className="bg-white/5 rounded-xl p-4">
              <label className="block text-white/80 mb-3 font-arabic">عدد الأسئلة لكل فقرة:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(segmentSettings).map(([segmentCode, questions]) => (
                  <div key={segmentCode} className="flex justify-between items-center">
                    <span className="text-white font-arabic font-bold">{segmentCode}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSegmentQuestions(segmentCode as keyof typeof segmentSettings, questions - 1)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-white font-mono">{questions}</span>
                      <button
                        onClick={() => updateSegmentQuestions(segmentCode as keyof typeof segmentSettings, questions + 1)}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Host Device Instructions */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2 font-arabic">📱 ملاحظة مهمة للمقدم</h3>
            <div className="text-blue-200 text-sm space-y-1 font-arabic">
              <p>• هذا الجهاز (الكمبيوتر) سيكون للتحكم في اللعبة فقط</p>
              <p>• لن يظهر الكاميرا أو الصوت من هذا الجهاز</p>
              <p>• للمشاركة بالفيديو، انضم كلاعب من هاتفك المحمول</p>
              <p>• رمز المقدم: <span className="font-mono bg-blue-600 px-2 py-1 rounded">{gameId}-HOST</span></p>
            </div>
          </div>

          {/* Create Lobby Button */}
          <motion.button
            onClick={handleCreateLobby}
            disabled={isCreating || !hostName.trim()}
            className="w-full py-4 px-6 rounded-2xl font-bold text-xl font-arabic transition-all bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isCreating && hostName.trim() ? { scale: 1.02 } : {}}
            whileTap={!isCreating && hostName.trim() ? { scale: 0.98 } : {}}
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                إنشاء الصالة...
              </div>
            ) : (
              "إنشاء صالة الانتظار"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}