import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllTeams, searchTeams, searchFlags } from "../utils/teamUtils";

export default function Join() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [joinType, setJoinType] = useState<"host" | "player" | "">("");
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [selectedFlag, setSelectedFlag] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [flagSearch, setFlagSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  const allTeams = getAllTeams();
  const filteredFlags = searchFlags(flagSearch);
  const filteredTeams = searchTeams(allTeams, teamSearch);

  const handleJoinTypeSelect = (type: "host" | "player") => {
    setJoinType(type);
    setStep(2);
  };

  const handleGameIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      if (joinType === "host") {
        // Check if it's a host code (ends with -HOST)
        const actualGameId = gameId.toUpperCase().replace("-HOST", "");
        navigate(
          `/lobby/${actualGameId}?role=host-mobile&name=${encodeURIComponent(name)}`,
        );
      } else {
        setStep(3);
      }
    }
  };

  const handlePlayerJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedFlag && selectedTeam) {
      const playerRole = "playerA"; // You might want to make this dynamic based on available slots
      navigate(
        `/lobby/${gameId.toUpperCase()}?role=${playerRole}&name=${encodeURIComponent(name)}&flag=${selectedFlag}&club=${selectedTeam}&autoJoin=true`,
      );
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
              ? "اختر نوع الانضمام"
              : step === 2
                ? "أدخل رمز اللعبة والاسم"
                : "اختر العلم والفريق"}
          </p>
        </div>

        {step === 1 ? (
          // Step 1: Choose join type
          <div className="space-y-4">
            <motion.button
              onClick={() => handleJoinTypeSelect("host")}
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
                  تحتاج رمز المقدم (GAME-HOST)
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleJoinTypeSelect("player")}
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
              onClick={() => navigate("/")}
              className="w-full mt-4 px-4 py-2 text-white/70 hover:text-white font-arabic transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : step === 2 ? (
          // Step 2: Game ID and Name
          <form onSubmit={handleGameIdSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 mb-2 font-arabic">
                {joinType === "host" ? "رمز المقدم" : "رمز اللعبة"}
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder={
                  joinType === "host" ? "مثال: ABC123-HOST" : "مثال: ABC123"
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent2 font-mono text-center text-lg"
                required
              />
              {joinType === "host" && (
                <p className="text-xs text-blue-300 mt-1 font-arabic text-center">
                  ستجد رمز المقدم في صفحة إعداد الجلسة
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
                disabled={!gameId.trim() || !name.trim()}
                className="flex-1 px-4 py-3 bg-accent2 hover:bg-accent text-white rounded-xl font-arabic transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joinType === "host" ? "انضم كمقدم" : "التالي"}
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
                {filteredFlags.map((flag) => (
                  <button
                    key={flag.code}
                    type="button"
                    onClick={() => setSelectedFlag(flag.code)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedFlag === flag.code
                        ? "border-accent2 bg-accent2/20"
                        : "border-white/20 bg-white/5 hover:border-white/40"
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
                {filteredTeams.map((team) => (
                  <button
                    key={team.name}
                    type="button"
                    onClick={() => setSelectedTeam(team.name)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      selectedTeam === team.name
                        ? "border-accent2 bg-accent2/20"
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={team.logoPath}
                      alt={team.name}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                    <span className="text-white font-arabic text-sm">
                      {team.displayName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

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
    </div>
  );
}
