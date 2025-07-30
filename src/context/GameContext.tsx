import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { GameState } from '@/types/game';

/**
 * Basic game context used during early development. Consumers can access
 * the state object and a simple dispatch function to mutate it. Extend the
 * `GameState` interface with any additional properties needed as features
 * are implemented.
 */
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Partial<GameState>>;
  // Placeholder until real actions are implemented
  actions: Record<string, (...args: unknown[]) => unknown>;
}

const initialState: GameState = {
  gameId: '',
  hostCode: '',
  hostName: '',
  phase: 'CONFIG',
  currentSegment: null,
  currentQuestionIndex: 0,
  videoRoomCreated: false,
  timer: 0,
  isTimerRunning: false,
  segmentSettings: {
    WSHA: 0,
    AUCT: 0,
    BELL: 0,
    SING: 0,
    REMO: 0,
  },
  players: {
    playerA: {
      id: 'playerA',
      name: '',
      score: 0,
      isConnected: false,
      specialButtons: {
        LOCK_BUTTON: false,
        TRAVELER_BUTTON: false,
        PIT_BUTTON: false,
      },
    },
    playerB: {
      id: 'playerB',
      name: '',
      score: 0,
      isConnected: false,
      specialButtons: {
        LOCK_BUTTON: false,
        TRAVELER_BUTTON: false,
        PIT_BUTTON: false,
      },
    },
  },
  scoreHistory: [],
};

// Export the context so hooks importing from this module share the same
// instance provided by `GameProvider`. Creating a second context would
// cause `useGame` to throw an error that it is not inside a provider.
export const GameContext = createContext<GameContextValue | undefined>(
  undefined,
);

function reducer(state: GameState, update: Partial<GameState>): GameState {
  return { ...state, ...update };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch, actions: {} }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
