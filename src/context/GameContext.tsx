import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { GameState, SegmentCode, Player, PlayerId } from '@/types/game';
import { GameDatabase, type GameRecord } from '@/lib/gameDatabase';
import { gameReducer, type GameAction } from './gameReducer';

/** Default player objects used when initializing game state */
const defaultPlayers: Record<PlayerId, Player> = {
  playerA: {
    id: 'playerA',
    name: '',
    score: 0,
    strikes: 0,
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
    strikes: 0,
    isConnected: false,
    specialButtons: {
      LOCK_BUTTON: false,
      TRAVELER_BUTTON: false,
      PIT_BUTTON: false,
    },
  },
};

/** Initial in-memory game state */
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
  players: defaultPlayers,
  scoreHistory: [],
};

/** Map a Supabase record to our internal GameState shape */
function mapRecordToState(record: GameRecord): GameState {
  return {
    ...initialState,
    gameId: record.id,
    hostCode: record.host_code,
    hostName: record.host_name ?? '',
    phase: record.phase as GameState['phase'],
    currentSegment: record.current_segment as GameState['currentSegment'],
    currentQuestionIndex: record.current_question_index,
    videoRoomUrl: record.video_room_url ?? undefined,
    videoRoomCreated: record.video_room_created,
    timer: record.timer,
    isTimerRunning: record.is_timer_running,
    segmentSettings: record.segment_settings as Record<SegmentCode, number>,
  };
}

export const GameContext = createContext<
  { state: GameState; dispatch: React.Dispatch<GameAction> } | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  const { state, dispatch } = ctx;

  // ================ Helper actions =================

  const startSession = async (
    gameId: string,
    hostCode: string,
    segmentSettings: Record<SegmentCode, number>,
    hostName?: string,
  ) => {
    const record = await GameDatabase.createGame(
      gameId,
      hostCode,
      hostName ?? null,
      segmentSettings,
    );
    if (record) dispatch({ type: 'INIT', payload: mapRecordToState(record) });
  };

  const startGame = () => dispatch({ type: 'SET_PHASE', phase: 'PLAYING' });

  const advanceQuestion = () => dispatch({ type: 'ADVANCE_QUESTION' });

  // Return legacy actions object for backward compatibility
  const actions: Record<string, (...args: unknown[]) => unknown> = {};

  return { state, dispatch, startSession, startGame, advanceQuestion, actions };
}
