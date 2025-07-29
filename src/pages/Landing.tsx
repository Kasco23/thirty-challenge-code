import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { actions } = useGame();
  const [isCreating, setIsCreating] = useState(false);
  const [customGameId, setCustomGameId] = useState('');
  const [useCustomId, setUseCustomId] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      // Use custom game ID or generate a random one
      const gameId =
        useCustomId && customGameId.trim()
          ? customGameId.trim().toUpperCase()
          : Math.random().toString(36).substring(2, 8).toUpperCase();

      // Initialize the game
      actions.startGame(gameId);

      // Navigate to host setup page
      navigate(`/host-setup/${gameId}`, { replace: true });
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    navigate('/join');
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <motion.h1
        className="text-5xl sm:text-7xl font-extrabold mb-6 text-accent glow font-arabic text-center"
        style={{
          textShadow: '0 0 30px #7c3aed, 0 0 20px #38bdf8',
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        تحدي الثلاثين
      </motion.h1>

      <motion.p
        className="mb-10 text-accent2 text-lg font-arabic text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        !ابدأ التحدي مع أصدقائك الآن
      </motion.p>

      <motion.div
        className="flex flex-col gap-6 items-center w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {/* Custom Game ID Option */}
        <div className="w-full">
          <label className="flex items-center gap-2 text-white/80 text-sm font-arabic mb-3">
            <input
              type="checkbox"
              checked={useCustomId}
              onChange={(e) => setUseCustomId(e.target.checked)}
              className="rounded"
            />
            استخدام رمز جلسة مخصص
          </label>

          {useCustomId && (
            <motion.input
              type="text"
              value={customGameId}
              onChange={(e) =>
                setCustomGameId(
                  e.target.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 8),
                )
              }
              placeholder="ادخل رمز الجلسة (حروف وأرقام فقط)"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 font-mono text-center uppercase"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              maxLength={8}
            />
          )}
        </div>

        <button
          onClick={handleCreateSession}
          disabled={isCreating || (useCustomId && !customGameId.trim())}
          className="w-full px-10 py-4 text-xl rounded-2xl font-bold bg-accent2 hover:bg-accent shadow-lg transition-all border border-accent glow disabled:opacity-50 disabled:cursor-not-allowed font-arabic"
        >
          {isCreating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              إنشاء الجلسة...
            </div>
          ) : (
            'إنشاء جلسة جديدة'
          )}
        </button>

        <button
          onClick={handleJoinGame}
          className="w-full px-6 py-3 text-lg rounded-xl font-bold bg-transparent hover:bg-white/10 text-white/80 hover:text-accent2 border border-white/20 hover:border-accent2 transition-all font-arabic"
        >
          الانضمام لجلسة
        </button>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="mt-12 text-center text-white/60 text-sm max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="font-arabic">
          إنشاء جلسة جديدة: ستصبح المقدم وتتحكم في اللعبة
        </p>
        <p className="font-arabic mt-1">
          الانضمام لجلسة: ادخل كلاعب في جلسة موجودة
        </p>
      </motion.div>
    </motion.div>
  );
}
