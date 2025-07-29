import React, { createContext, useContext, useReducer, ReactNode } from 'react';

/**
 * Minimal game context used for the Test_arena branch.  The full game
 * logic is retained in the `main` branch but removed here to focus on
 * testing Supabase and Daily APIs.  Consumers can access the state
 * object and a dispatch function but should not rely on detailed
 * actions in this stripped‑down version.
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

const GameContext = createContext<GameContextValue | undefined>(undefined);

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
