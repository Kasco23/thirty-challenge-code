import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react';
import type { GameState, SegmentCode } from '@/types/game';
import { GameDatabase, type GameRecord } from '@/lib/gameDatabase';
import { attachGameSync } from '@/lib/gameSync';
import { gameReducer, type GameAction } from './gameReducer';
import { initialGameState } from './initialGameState';
import { defaultPlayers } from './defaults';

/** Map a Supabase record to our internal GameState shape */
export function mapRecordToState(record: GameRecord): GameState {
  return {
    ...initialGameState,
    gameId: record.id,
    hostCode: record.host_code,
    hostName: record.host_name ?? null,
    phase: record.phase as GameState['phase'],
    currentSegment: record.current_segment as GameState['currentSegment'],
    currentQuestionIndex: record.current_question_index,
    videoRoomUrl: record.video_room_url ?? undefined,
    videoRoomCreated: record.video_room_created,
    timer: record.timer,
    isTimerRunning: record.is_timer_running,
    segmentSettings: record.segment_settings as Record<SegmentCode, number>,
    players: defaultPlayers,
  };
}

export const GameContext = createContext<
  { state: GameState; dispatch: React.Dispatch<GameAction> } | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  useEffect(() => {
    if (!state.gameId) return;
    const detach = attachGameSync(state.gameId, dispatch);
    return () => detach();
  }, [state.gameId]);
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
    hostName: string | null,
    segmentSettings: Record<SegmentCode, number>,
  ) => {
    const record = await GameDatabase.createGame(
      gameId,
      hostCode,
      hostName,
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
