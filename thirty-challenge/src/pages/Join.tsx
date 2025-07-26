import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTeams, searchTeams, COMMON_FLAGS, searchFlags } from '../utils/teamUtils';

export default function Join() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [selectedFlag, setSelectedFlag] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [step, setStep] = useState(1); // 1: Game ID, 2: Player Info
  const [flagSearch, setFlagSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  // Get all available teams
  const allTeams = getAllTeams();
  const filteredFlags = searchFlags(flagSearch);
  const filteredTeams = searchTeams(allTeams, teamSearch);

  const handleGameIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim()) return;
    setStep(2);
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedFlag || !selectedTeam) return;

    // For now, assign playerA role (in real implementation, check available slots)
    const playerRole = 'playerA';
    
    // Join the host's lobby directly, not a separate player page
    navigate(`/lobby/${gameId.toUpperCase()}?role=${playerRole}&name=${encodeURIComponent(name)}&flag=${selectedFlag}&club=${selectedTeam}&autoJoin=true`);
  };

  // Step 1: Enter Game ID
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-arabic">الانضمام لجلسة</h1>
            <p className="text-white/70 font-arabic">أدخل رمز الجلسة للانضمام</p>
          </div>

          <form onSubmit={handleGameIdSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 mb-2 font-arabic">رمز الجلسة</label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="مثال: ABC123"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 font-mono text-center text-xl tracking-wider focus:outline-none focus:border-accent2"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-accent2 hover:bg-accent text-white font-bold rounded-xl transition-colors font-arabic"
            >
              متابعة
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 py-2 text-white/60 hover:text-white transition-colors font-arabic"
          >
            العودة للرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  // Step 2: Player Information
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2 font-arabic">معلومات اللاعب</h1>
          <p className="text-accent2 font-arabic">الانضمام للجلسة: <span className="font-mono">{gameId}</span></p>
        </motion.div>

        <form onSubmit={handleJoinGame} className="space-y-8">
          {/* Name Input */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-white/80 mb-4 font-arabic text-lg">اسم اللاعب</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-arabic"
              required
            />
          </motion.div>

          {/* Flag Selection */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-white/80 mb-4 font-arabic text-lg">اختر علم بلدك</label>
            
            {/* Flag Search */}
            <div className="mb-4">
              <input
                type="text"
                value={flagSearch}
                onChange={(e) => setFlagSearch(e.target.value)}
                placeholder="ابحث عن البلد..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-arabic text-sm"
              />
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
              {filteredFlags.map((flag) => (
                <button
                  key={flag.code}
                  type="button"
                  onClick={() => {
                    setSelectedFlag(flag.code);
                    setFlagSearch('');
                  }}
                  className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedFlag === flag.code
                      ? 'border-accent2 bg-accent2/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-center">
                    <span className={`fi fi-${flag.code} text-2xl mb-1 block`}></span>
                    <span className="text-white text-xs font-arabic">{flag.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedFlag && (
              <div className="mt-4 text-center">
                <span className="text-accent2 font-arabic">البلد المختار: </span>
                <span className={`fi fi-${selectedFlag} text-lg mr-2`}></span>
                <span className="text-white font-arabic">
                  {COMMON_FLAGS.find(f => f.code === selectedFlag)?.name}
                </span>
              </div>
            )}
          </motion.div>

          {/* Team Selection */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-white/80 mb-4 font-arabic text-lg">اختر فريقك المفضل</label>
            
            {/* Team Search */}
            <div className="mb-4">
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="ابحث عن الفريق... (مثال: Real Madrid, Barcelona, Liverpool)"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-accent2 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    setSelectedTeam(team.id);
                    setTeamSearch('');
                  }}
                  className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedTeam === team.id
                      ? 'border-accent2 bg-accent2/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  title={team.name}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-1">
                      <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-white text-xs block truncate">{team.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {filteredTeams.length === 0 && teamSearch && (
              <div className="text-center text-white/70 py-8 font-arabic">
                لم يتم العثور على فرق تطابق البحث "{teamSearch}"
              </div>
            )}

            {selectedTeam && (
              <div className="mt-4 text-center">
                <span className="text-accent2 font-arabic">الفريق المختار: </span>
                <div className="inline-flex items-center gap-2 mt-2">
                  <img 
                    src={allTeams.find(t => t.id === selectedTeam)?.logo} 
                    alt={selectedTeam}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-white font-bold">
                    {allTeams.find(t => t.id === selectedTeam)?.name}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors font-arabic"
            >
              رجوع
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !selectedFlag || !selectedTeam}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors font-arabic"
            >
              انضمام للجلسة
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}