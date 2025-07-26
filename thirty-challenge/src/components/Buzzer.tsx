import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import type { PlayerId } from '../types/game';

interface BuzzerProps {
  playerId: PlayerId;
  disabled?: boolean;
  className?: string;
}

export default function Buzzer({ playerId, disabled = false, className = '' }: BuzzerProps) {
  const { state, actions } = useGame();
  const [isPressed, setIsPressed] = useState(false);
  
  const isBellActive = state.bell.isActive;
  const hasBeenClicked = state.bell.clickedBy !== null;
  const clickedByThisPlayer = state.bell.clickedBy === playerId;
  
  const handleBellClick = () => {
    if (!isBellActive || hasBeenClicked || disabled) return;
    
    setIsPressed(true);
    actions.clickBell(playerId);
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 200);
  };

  const getBellState = () => {
    if (!isBellActive) return 'inactive';
    if (hasBeenClicked) {
      return clickedByThisPlayer ? 'winner' : 'loser';
    }
    return 'active';
  };

  const bellState = getBellState();
  
  const bellStyles = {
    inactive: {
      bg: 'bg-gray-600',
      border: 'border-gray-500',
      text: 'text-gray-400',
      shadow: 'shadow-md'
    },
    active: {
      bg: 'bg-red-500 hover:bg-red-400',
      border: 'border-red-400',
      text: 'text-white',
      shadow: 'shadow-lg shadow-red-500/30'
    },
    winner: {
      bg: 'bg-green-500',
      border: 'border-green-400',
      text: 'text-white',
      shadow: 'shadow-lg shadow-green-500/30'
    },
    loser: {
      bg: 'bg-gray-700',
      border: 'border-gray-600',
      text: 'text-gray-400',
      shadow: 'shadow-md'
    }
  };

  const currentStyle = bellStyles[bellState];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Bell Button */}
      <motion.button
        onClick={handleBellClick}
        disabled={disabled || !isBellActive || hasBeenClicked}
        className={`
          relative w-32 h-32 rounded-full border-4 font-bold text-lg
          ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} ${currentStyle.shadow}
          ${!disabled && isBellActive && !hasBeenClicked ? 'cursor-pointer' : 'cursor-not-allowed'}
          transition-all duration-200 transform-gpu
        `}
        whileHover={isBellActive && !hasBeenClicked ? { scale: 1.05 } : {}}
        whileTap={isBellActive && !hasBeenClicked ? { scale: 0.95 } : {}}
        animate={
          isPressed 
            ? { scale: 0.9, rotate: [0, -5, 5, 0] }
            : bellState === 'active'
            ? { scale: [1, 1.02, 1] }
            : { scale: 1 }
        }
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 0.3 },
          repeat: bellState === 'active' ? Infinity : 0,
          repeatDelay: 1
        }}
      >
        {/* Bell Icon */}
        <motion.div
          className="text-4xl"
          animate={
            isPressed 
              ? { rotate: [0, -10, 10, -5, 5, 0] }
              : bellState === 'active'
              ? { rotate: [0, 2, -2, 0] }
              : { rotate: 0 }
          }
          transition={{
            duration: 0.5,
            repeat: bellState === 'active' ? Infinity : 0,
            repeatDelay: 2
          }}
        >
          🔔
        </motion.div>

        {/* Ripple effect when clicked */}
        {isPressed && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Winner glow effect */}
        {clickedByThisPlayer && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-400"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Status Text */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {bellState === 'inactive' && (
          <span className="text-gray-400 text-sm">انتظر تفعيل الجرس</span>
        )}
        {bellState === 'active' && (
          <motion.span
            className="text-red-400 text-sm font-bold"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            اضغط الجرس بسرعة!
          </motion.span>
        )}
        {bellState === 'winner' && (
          <motion.span
            className="text-green-400 text-sm font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🎉 أنت الأسرع!
          </motion.span>
        )}
        {bellState === 'loser' && (
          <span className="text-gray-400 text-sm">فات الأوان</span>
        )}
      </motion.div>

      {/* Traveler Button (if available) */}
      {state.players[playerId]?.specialButtons.travelerButton && bellState === 'inactive' && (
        <motion.button
          onClick={() => actions.useSpecialButton(playerId, 'travelerButton')}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-bold text-sm shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          ✈️ استخدم زر المسافر
        </motion.button>
      )}

      {/* Sound effect indicator */}
      {isPressed && (
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-2xl"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          🔊
        </motion.div>
      )}
    </div>
  );
}