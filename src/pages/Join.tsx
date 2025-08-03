import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTeams, searchTeams, searchFlags, type Team } from '@/utils/teamUtils';
import { GameDatabase } from '@/lib/gameDatabase';
import { getSupabase } from '@/lib/supabaseLazy';
import LazyImage from '@/components/LazyImage';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function Join() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [joinType, setJoinType] = useState<'host' | 'player' | ''>('');
  // Session code that players use to join the lobby
  const [gameId, setGameId] = useState('');
  // Separate field for the host code when joining as phone host
  const [hostCode, setHostCode] = useState('');
  const [name, setName] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [flagSearch, setFlagSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playerRole, setPlayerRole] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  // Load teams lazily when component mounts
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teams = await getAllTeams();
        setAllTeams(teams);
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };
    loadTeams();
  }, []);

  // Auto-populate gameId from URL if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('roomId') || urlParams.get('gameId');
    if (roomIdFromUrl && !gameId) {
      setGameId(roomIdFromUrl.toUpperCase());
    }
  }, [gameId]);

  const filteredFlags = searchFlags(flagSearch);
  const filteredTeams = searchTeams(allTeams, teamSearch);

  const handleJoinTypeSelect = (type: 'host' | 'player') => {
    setJoinType(type);
    setStep(2);
  };

  const handleGameIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!gameId.trim()) return;

    if (joinType === 'host') {

      const sessionId = gameId.toUpperCase();
      const code = hostCode.toUpperCase();
      const supabase = await getSupabase();
      const { data } = await supabase
        .from('games')
        .select('id')
        .eq('id', sessionId)
        .eq('host_code', code)


        .single();
      const foundId = data?.id;
      if (!foundId) {
        setErrorMsg('لا توجد جلسة بهذا الرمز');
        return;
      }
      navigate(`/lobby/${foundId}?role=host-mobile`);
    } else {
      const actualGameId = gameId.toUpperCase();
      const existing = await GameDatabase.getGame(actualGameId);
      if (!existing) {
        setErrorMsg('لا توجد جلسة بهذا الرمز');
        return;
      }
      setStep(3);
    }
  };

  const handlePlayerJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedFlag || !selectedTeam) return;

    setErrorMsg('');
    const sessionId = gameId.toUpperCase();

    try {
      // Check existing players to find available slot
      const existingPlayers = await GameDatabase.getGamePlayers(sessionId);
      const takenRoles = existingPlayers.map(p => p.role);
      
      let availableRole: string;
      if (!takenRoles.includes('playerA')) {
        availableRole = 'playerA';
      } else if (!takenRoles.includes('playerB')) {
        availableRole = 'playerB';
      } else {
        setErrorMsg('اللعبة ممتلئة! لا يمكن انضمام المزيد من اللاعبين');
        return;
      }

      // Check if video room exists - just inform, don't offer to create
      const game = await GameDatabase.getGame(sessionId);
      if (!game?.video_room_created) {
        setErrorMsg('لا توجد غرفة فيديو بعد. اتصل بالمقدم لإنشاء الغرفة أولاً.');
        return;
      }

      // Double-check with Daily.co that the room actually exists
      try {
        const checkResult = await fetch(`/.netlify/functions/check-daily-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: sessionId }),
        });
        const data = await checkResult.json();
        
        if (data && !data.exists) {
          setErrorMsg('غرفة الفيديو غير موجودة على Daily.co. اتصل بالمقدم لإعادة إنشائها.');
          return;
        }
      } catch (error) {
        console.warn('Could not verify room exists on Daily.co:', error);
        // Continue anyway since we have it in database
      }

      // Set role and show confirmation modal
      setPlayerRole(availableRole);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error checking game:', error);
      setErrorMsg('حدث خطأ أثناء التحقق من اللعبة');
    }
  };

  const handleConfirmJoin = async () => {
    setIsJoining(true);
    const sessionId = gameId.toUpperCase();

    try {
      const result = await GameDatabase.addPlayer(playerRole, sessionId, {
        name,
        flag: selectedFlag,
        club: selectedTeam,
        role: playerRole,
      });

      if (!result) {
        setErrorMsg('فشل في الانضمام للعبة. حاول مرة أخرى');
        setShowConfirmModal(false);
        setIsJoining(false);
        return;
      }

      // Navigate to lobby
      try {
        navigate(`/lobby/${sessionId}?role=${playerRole}&name=${encodeURIComponent(name)}&flag=${selectedFlag}&club=${encodeURIComponent(selectedTeam)}&autoJoin=true`);
      } catch (navError) {
        console.error('Navigation error:', navError);
        setErrorMsg('فشل في الانتقال إلى الردهة. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setErrorMsg('حدث خطأ أثناء الانضمام للعبة');
      setShowConfirmModal(false);
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#10102a] to-blue-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-arabic">
            انضم للعبة
          </h1>
          <p className="text-white/70 font-arabic">
            {step === 1
              ? 'اختر نوع الانضمام'
              : step === 2
                ? joinType === 'host'
                  ? 'أدخل رمز الجلسة ورمز المقدم'
                  : 'أدخل رمز اللعبة والاسم'
                : 'اختر العلم والفريق'}
          </p>
        </div>

        {step === 1 ? (
          // Step 1: Choose join type
          <div className="space-y-4">
            <motion.button
              onClick={() => handleJoinTypeSelect('host')}
              className="w-full p-6 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-2xl text-white transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🎤</div>
                <h3 className="text-lg font-bold font-arabic mb-2">
                  انضم كمقدم
                </h3>
                <p className="text-sm text-blue-200 font-arabic">
                  للمقدمين الذين يريدون المشاركة بالفيديو من الهاتف
                </p>
                <p className="text-xs text-blue-300 font-arabic mt-1">
                  تحتاج رمز الجلسة ورمز المقدم
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleJoinTypeSelect('player')}
              className="w-full p-6 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-2xl text-white transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🎮</div>
                <h3 className="text-lg font-bold font-arabic mb-2">
                  انضم كلاعب
                </h3>
                <p className="text-sm text-green-200 font-arabic">
                  للاعبين المشاركين في المسابقة
                </p>
                <p className="text-xs text-green-300 font-arabic mt-1">
                  تحتاج رمز اللعبة العادي
                </p>
              </div>
            </motion.button>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 px-4 py-2 text-white/70 hover:text-white font-arabic transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : step === 2 ? (
          // Step 2: Game ID and Name
          <form onSubmit={handleGameIdSubmit} className="space-y-6">
            {joinType === 'host' ? (
              <>
                <div>
                  <label className="block text-white/80 mb-2 font-arabic">
                    رمز الجلسة
                  </label>
                  <input
                    type="text"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value.toUpperCase())}
                    placeholder="مثال: ABC123"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-mono text-center text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 font-arabic">
                    رمز المقدم
                  </label>
                  <input
                    type="text"
                    value={hostCode}
                    onChange={(e) => setHostCode(e.target.value.toUpperCase())}
                    placeholder="مثال: MUSAED"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-mono text-center text-lg"
                    required
                  />
                  <p className="text-xs text-blue-300 mt-1 font-arabic text-center">
                    ستجد رمز المقدم في صفحة إعداد الجلسة
                  </p>
                  {errorMsg && (
                    <p className="text-xs text-red-400 mt-1 font-arabic text-center">
                      {errorMsg}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-white/80 mb-2 font-arabic">
                    رمز اللعبة
                  </label>
                  <input
                    type="text"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value.toUpperCase())}
                    placeholder="مثال: ABC123"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-mono text-center text-lg"
                    required
                  />
                  {errorMsg && (
                    <p className="text-xs text-red-400 mt-1 font-arabic text-center">
                      {errorMsg}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-white/80 mb-2 font-arabic">
                    الاسم
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-arabic text-center"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-arabic transition-colors"
              >
                رجوع
              </button>
              <button
                type="submit"
                disabled={
                  !gameId.trim() ||
                  (joinType === 'host' ? !hostCode.trim() : !name.trim())
                }
                className="flex-1 px-4 py-3 bg-accent2 hover:bg-accent text-white rounded-xl font-arabic transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joinType === 'host' ? 'انضم كمقدم' : 'التالي'}
              </button>
            </div>
          </form>
        ) : (
          // Step 3: Flag and Team Selection (for players only)
          <form onSubmit={handlePlayerJoin} className="space-y-6">
            {/* Flag Selection */}
            <div>
              <label className="block text-white/80 mb-2 font-arabic">
                اختر العلم
              </label>
              <input
                type="text"
                value={flagSearch}
                onChange={(e) => setFlagSearch(e.target.value)}
                placeholder="ابحث عن بلد..."
                className="w-full px-4 py-2 mb-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-arabic"
              />
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {filteredFlags.map((flag: { code: string; name: string }) => (
                  <button
                    key={flag.code}
                    type="button"
                    onClick={() => setSelectedFlag(flag.code)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedFlag === flag.code
                        ? 'border-accent2 bg-accent2/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <span className={`fi fi-${flag.code} text-2xl`}></span>
                    <p className="text-xs text-white/80 mt-1 font-arabic">
                      {flag.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Selection */}
            <div>
              <label className="block text-white/80 mb-2 font-arabic">
                اختر الفريق
              </label>
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="ابحث عن فريق..."
                className="w-full px-4 py-2 mb-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-arabic"
              />
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filteredTeams.map((team: import('@/utils/teamUtils').Team) => (
                  <button
                    key={team.name}
                    type="button"
                    onClick={() => setSelectedTeam(team.name)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      selectedTeam === team.name
                        ? 'border-accent2 bg-accent2/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <LazyImage
                      src={team.logoPath}
                      alt={team.name}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-white font-arabic text-sm">
                      {team.displayName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error message for step 3 */}
            {errorMsg && (
              <div className="text-red-400 text-sm font-arabic text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-arabic transition-colors"
              >
                رجوع
              </button>
              <button
                type="submit"
                disabled={!selectedFlag || !selectedTeam}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-arabic transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                انضم للعبة
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmJoin}
        title="تأكيد الانضمام للعبة"
        message={`أنت على وشك الانضمام للعبة ${gameId} كـ${playerRole === 'playerA' ? 'لاعب أول' : 'لاعب ثاني'}. سيتم نقلك إلى صالة الانتظار لبدء الفيديو والانتظار حتى يبدأ المقدم اللعبة.`}
        confirmText="انضم للعبة"
        cancelText="إلغاء"
        isLoading={isJoining}
      />
    </div>
  );
}
