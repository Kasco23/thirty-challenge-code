import { useContext } from 'react';
// Import the context definition from the same file that exports
// `GameProvider` to ensure both share the exact context instance.
import { GameContext } from '@/context/GameContext';

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
