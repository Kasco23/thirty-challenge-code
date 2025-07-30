import React, { createContext, useContext, useReducer, ReactNode } from 'react';

/**
 * Basic game context used during early development. Consumers can access
 * the state object and a simple dispatch function to mutate it. Extend the
 * `GameState` interface with any additional properties needed as features
 * are implemented.
 */
export interface GameState {
  // Extend this interface with any state needed for your tests
  playerName?: string;
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Partial<GameState>>;
}

const initialState: GameState = {};

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
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
