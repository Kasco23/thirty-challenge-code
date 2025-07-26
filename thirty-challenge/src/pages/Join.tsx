import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTeams, searchTeams, COMMON_FLAGS, searchFlags, type Team } from '../utils/teamUtils';

export default function Join() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [selectedFlag, setSelectedFlag] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [flagSearch, setFlagSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const allTeams = getAllTeams();
  const filteredFlags = searchFlags(flagSearch);
  const filteredTeams = searchTeams(allTeams, teamSearch);

  const handleGameIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      setStep(2);
    }
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedFlag && selectedTeam) {
      const playerRole = 'playerA'; // You might want to make this dynamic
      navigate(`/lobby/${gameId.toUpperCase()}?role=${playerRole}&name=${encodeURIComponent(name)}&flag=${selectedFlag}&club=${selectedTeam}&autoJoin=true`);
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
          <h1 className="text-3xl font-bold text-white mb-2 font-arabic">انضم للعبة</h1>
          <p className="text-white/70 font-arabic">
            {step === 1 ? 'أدخل رمز اللعبة' : 'أدخل معلوماتك'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleGameIdSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-bold mb-2 font-arabic">
                رمز اللعبة
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-center text-2xl font-bold tracking-widest"
                placeholder="ABC123"
                maxLength={6}
                required
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-arabic"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              التالي
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleJoinGame} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-white text-sm font-bold mb-2 font-arabic">
                اسمك
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50"
                placeholder="أدخل اسمك"
                required
              />
            </div>

            {/* Flag Selection */}
            <div>
              <label className="block text-white text-sm font-bold mb-2 font-arabic">
                اختر علمك
              </label>
              
              {/* Flag Search */}
              <input
                type="text"
                value={flagSearch}
                onChange={(e) => setFlagSearch(e.target.value)}
                className="w-full px-4 py-2 mb-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm"
                placeholder="ابحث عن بلدك..."
              />

              {/* Selected Flag Display */}
              {selectedFlag && (
                <div className="mb-3 p-2 bg-white/20 rounded-lg flex items-center gap-2">
                  <span className={`fi fi-${selectedFlag} text-2xl`}></span>
                  <span className="text-white font-arabic">
                    {COMMON_FLAGS.find(f => f.code === selectedFlag)?.name}
                  </span>
                </div>
              )}

              {/* Flag Grid */}
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {filteredFlags.map((flag) => (
                  <button
                    key={flag.code}
                    type="button"
                    onClick={() => setSelectedFlag(flag.code)}
                    className={`p-2 rounded-lg transition-all ${
                      selectedFlag === flag.code
                        ? 'bg-blue-500 ring-2 ring-blue-300'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className={`fi fi-${flag.code} text-2xl`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Selection */}
            <div>
              <label className="block text-white text-sm font-bold mb-2 font-arabic">
                اختر فريقك
              </label>
              
              {/* Team Search */}
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full px-4 py-2 mb-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm"
                placeholder="ابحث عن فريقك..."
              />

              {/* Selected Team Display */}
              {selectedTeam && (
                <div className="mb-3 p-2 bg-white/20 rounded-lg flex items-center gap-2">
                  <img 
                    src={allTeams.find(t => t.name === selectedTeam)?.logoPath} 
                    alt={selectedTeam}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-white font-arabic">
                    {allTeams.find(t => t.name === selectedTeam)?.displayName}
                  </span>
                </div>
              )}

              {/* Team Grid */}
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team: Team) => (
                    <button
                      key={team.name}
                      type="button"
                      onClick={() => setSelectedTeam(team.name)}
                      className={`p-3 rounded-lg transition-all ${
                        selectedTeam === team.name
                          ? 'bg-blue-500 ring-2 ring-blue-300'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <img 
                        src={team.logoPath} 
                        alt={team.displayName}
                        className="w-12 h-12 object-contain mx-auto"
                      />
                      <p className="text-xs text-white mt-1 font-arabic truncate">
                        {team.displayName}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-white/70 py-4 font-arabic">
                    لم يتم العثور على فرق
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-all duration-300 font-arabic"
              >
                رجوع
              </button>
              
              <motion.button
                type="submit"
                disabled={!name.trim() || !selectedFlag || !selectedTeam}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-arabic"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                انضم للعبة
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}