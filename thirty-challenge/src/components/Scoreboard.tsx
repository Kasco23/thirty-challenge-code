import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import type { PlayerId } from '../types/game';
import { CLUB_THEMES } from '../themes/clubs';

interface ScoreboardProps {
  className?: string;
  showSpecialButtons?: boolean;
}

export default function Scoreboard({ className = '', showSpecialButtons = true }: ScoreboardProps) {
  const { state } = useGame();

  const getPlayerClubTheme = (playerId: PlayerId) => {
    const player = state.players[playerId];
    if (player.club && player.club in CLUB_THEMES) {
      return CLUB_THEMES[player.club as keyof typeof CLUB_THEMES];
    }
    return {
      primary: 'bg-gray-700',
      accent: 'bg-gray-600',
      text: 'text-white',
      logo: null
    };
  };

  const getStrikeDisplay = (strikes: number) => {
    return Array(strikes).fill(0).map((_, idx) => (
      <motion.span
        key={idx}
        className="text-red-500 text-xl mx-0.5"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: idx * 0.1 }}
      >
        ✗
      </motion.span>
    ));
  };

  const renderSpecialButton = (playerId: PlayerId, buttonType: keyof typeof state.players.playerA.specialButtons) => {
    const player = state.players[playerId];
    const isAvailable = player.specialButtons[buttonType];
    
    const buttonConfig = {
      lockButton: { name: 'قفل', color: 'bg-yellow-500', icon: '🔒' },
      travelerButton: { name: 'مسافر', color: 'bg-blue-500', icon: '✈️' },
      pitButton: { name: 'حفرة', color: 'bg-red-500', icon: '⚡' }
    };

    const config = buttonConfig[buttonType];
    
    return (
      <motion.div
        key={buttonType}
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          isAvailable 
            ? `${config.color} text-white shadow-lg` 
            : 'bg-gray-600 text-gray-400'
        }`}
        animate={isAvailable ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: isAvailable ? Infinity : 0 }}
      >
        <span className="mr-1">{config.icon}</span>
        {config.name}
      </motion.div>
    );
  };

  return (
    <div className={`grid grid-cols-3 gap-4 text-center ${className}`}>
      {(['host', 'playerA', 'playerB'] as PlayerId[]).map((playerId) => {
        const player = state.players[playerId];
        const theme = getPlayerClubTheme(playerId);
        const isCurrentPlayer = state.currentSegment === 'WSHA' && playerId !== 'host';
        
        return (
          <motion.div
            key={playerId}
            className={`rounded-xl p-4 shadow-lg relative overflow-hidden ${theme.primary}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: playerId === 'host' ? 0 : playerId === 'playerA' ? 0.1 : 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-gradient-to-br from-white to-transparent" />
            </div>

            {/* Club logo */}
            {theme.logo && (
              <div className="absolute top-2 right-2 w-8 h-8 opacity-30">
                <img src={theme.logo} alt="Club logo" className="w-full h-full object-contain" />
              </div>
            )}

            {/* Connection status */}
            <div className="absolute top-2 left-2">
              <div className={`w-3 h-3 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {/* Player name */}
            <div className={`font-bold text-lg mb-2 ${theme.text} relative z-10`}>
              {player.name}
              {player.flag && (
                <span className={`fi fi-${player.flag.toLowerCase()} ml-2 text-base`} />
              )}
            </div>

            {/* Score */}
            <motion.div 
              className={`text-3xl font-extrabold mb-2 ${theme.text} relative z-10`}
              key={player.score} // Re-animate when score changes
              initial={{ scale: 1.2, color: '#10b981' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
            >
              {player.score}
              <div className="text-xs text-white/70 font-normal">نقاط</div>
            </motion.div>

            {/* Strikes (only for players, not host) */}
            {playerId !== 'host' && (
              <div className="mb-3 min-h-[1.5rem] relative z-10">
                {getStrikeDisplay(player.strikes)}
                {player.strikes === 0 && (
                  <span className="text-green-400 text-sm">نظيف ✨</span>
                )}
              </div>
            )}

            {/* Special buttons */}
            {showSpecialButtons && playerId !== 'host' && (
              <div className="flex flex-wrap gap-1 justify-center relative z-10">
                {Object.keys(player.specialButtons).map((buttonType) =>
                  renderSpecialButton(playerId, buttonType as keyof typeof player.specialButtons)
                )}
              </div>
            )}

            {/* Current player indicator */}
            {isCurrentPlayer && (
              <motion.div
                className="absolute inset-0 border-4 border-yellow-400 rounded-xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            {/* Segment-specific indicators */}
            {state.currentSegment === 'BELL' && state.bell.clickedBy === playerId && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                🔔
              </motion.div>
            )}

            {/* Auction winner indicator */}
            {state.currentSegment === 'AUCT' && state.auction.winner === playerId && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                👑
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}