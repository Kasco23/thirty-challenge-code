import { motion } from "framer-motion";
import { useGame } from "../hooks/useGame";
import { CLUB_THEMES } from "../themes/clubs";
import type { PlayerId } from "../types/game";

export default function Scoreboard() {
  const { state } = useGame();

  // Special button configurations
  const buttonConfig = {
    LOCK_BUTTON: {
      name: "القفل",
      color: "bg-yellow-500",
      icon: "🔒",
    },
    TRAVELER_BUTTON: {
      name: "المسافر",
      color: "bg-blue-500",
      icon: "✈️",
    },
    PIT_BUTTON: {
      name: "الحفرة",
      color: "bg-red-500",
      icon: "🕳️",
    },
  };

  const renderPlayer = (playerId: PlayerId) => {
    const player = state.players[playerId];
    if (!player) return null;

    const clubTheme = player.club
      ? CLUB_THEMES[player.club as keyof typeof CLUB_THEMES]
      : null;
    const playerIndex = playerId === "playerA" ? 0 : 1;

    return (
      <motion.div
        key={playerId}
        className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 ${
          clubTheme
            ? `border-[${clubTheme.primary}] bg-gradient-to-br from-[${clubTheme.primary}]/20 to-transparent`
            : "border-white/20"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: playerIndex * 0.1 }}
      >
        {/* Player Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Flag */}
            {player.flag && (
              <span className={`fi fi-${player.flag} text-2xl`}></span>
            )}

            {/* Player Name */}
            <div>
              <h3 className="text-white font-bold font-arabic">
                {player.name}
              </h3>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  player.isConnected
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {player.isConnected ? "متصل" : "غير متصل"}
              </div>
            </div>
          </div>

          {/* Club Logo */}
          {clubTheme && (
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={clubTheme.logo}
                alt={player.club}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="text-center mb-3">
          <motion.div
            className="text-3xl font-bold text-white mb-1"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            key={player.score}
          >
            {player.score}
          </motion.div>
          <p className="text-white/70 text-sm font-arabic">النقاط</p>
        </div>

        {/* Strikes */}
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < player.strikes ? "bg-red-500" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Special Buttons */}
        <div className="space-y-2">
          {Object.entries(player.specialButtons).map(
            ([buttonType, available]) => {
              const config =
                buttonConfig[buttonType as keyof typeof buttonConfig];
              if (!config) return null;

              return (
                <div
                  key={buttonType}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    available ? config.color + "/20" : "bg-gray-500/20"
                  }`}
                >
                  <span className="text-white/80 text-xs font-arabic">
                    {config.name}
                  </span>
                  <span
                    className={`text-lg ${available ? "" : "grayscale opacity-50"}`}
                  >
                    {config.icon}
                  </span>
                </div>
              );
            },
          )}
        </div>

        {/* Connection Status Indicator */}
        <div className="absolute top-2 right-2">
          <div
            className={`w-3 h-3 rounded-full ${
              player.isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center mb-4 font-arabic">
        لوحة النتائج
      </h2>

      <div className="grid gap-4">
        {(["playerA", "playerB"] as const).map(renderPlayer)}
      </div>

      {/* Current Segment Info */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <h3 className="text-white font-bold mb-2 font-arabic">
          الفقرة الحالية
        </h3>
        <div className="text-accent2 font-arabic text-lg">
          {state.currentSegment}
        </div>
        <div className="text-white/70 text-sm font-arabic">
          السؤال {state.segments[state.currentSegment].currentQuestionIndex + 1}{" "}
          من {state.segments[state.currentSegment].questionsPerSegment}
        </div>
      </div>
    </div>
  );
}
