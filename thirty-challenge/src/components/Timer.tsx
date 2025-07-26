import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

interface TimerProps {
  onTimeUp?: () => void;
  className?: string;
}

export default function Timer({ onTimeUp, className = '' }: TimerProps) {
  const { state, actions } = useGame();
  const [localTime, setLocalTime] = useState(state.timer.timeLeft);

  useEffect(() => {
    setLocalTime(state.timer.timeLeft);
  }, [state.timer.timeLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.timer.isActive && localTime > 0) {
      interval = setInterval(() => {
        setLocalTime((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            actions.stopTimer();
            onTimeUp?.();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timer.isActive, localTime, actions, onTimeUp]);

  const progress = state.timer.duration > 0 ? (localTime / state.timer.duration) * 100 : 0;
  const isLowTime = localTime <= 10;
  const isVeryLowTime = localTime <= 5;

  if (!state.timer.isActive && localTime === 0) {
    return null;
  }

  return (
    <motion.div
      className={`relative flex flex-col items-center ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      {/* Circular Timer */}
      <div className="relative w-20 h-20 mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isVeryLowTime ? '#ef4444' : isLowTime ? '#f59e0b' : '#10b981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            animate={{
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-xl font-bold ${
              isVeryLowTime 
                ? 'text-red-400' 
                : isLowTime 
                ? 'text-yellow-400' 
                : 'text-green-400'
            }`}
            animate={isVeryLowTime ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isVeryLowTime ? Infinity : 0 }}
          >
            {localTime}
          </motion.span>
        </div>
      </div>

      {/* Timer label */}
      <span className="text-sm text-white/70 font-arabic">الوقت المتبقي</span>

      {/* Warning indicators */}
      {isLowTime && (
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
