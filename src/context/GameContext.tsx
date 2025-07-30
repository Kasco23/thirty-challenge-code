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

  // ================= Daily.co video helpers =================
  const callFn = async (name: string, payload: unknown) => {
    const res = await fetch(`/.netlify/functions/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const createVideoRoom = async (gameId: string) => {
    const result = (await callFn('create-daily-room', {
      roomName: gameId,
    })) as {
      url?: string;
      error?: string;
    };
    if (result.url) {
      await GameDatabase.updateGame(gameId, {
        video_room_url: result.url,
        video_room_created: true,
      });
      return { success: true, roomUrl: result.url };
    }
    return { success: false, error: result.error || 'create failed' };
  };

  const endVideoRoom = async (gameId: string) => {
    await callFn('delete-daily-room', { roomName: gameId });
    await GameDatabase.updateGame(gameId, {
      video_room_created: false,
      video_room_url: null,
    });
    return { success: true };
  };

  const generateDailyToken = async (
    room: string,
    user: string,
    isHost: boolean,
  ) => {
    const result = (await callFn('create-daily-token', {
      room,
      user,
      isHost,
    })) as { token?: string; error?: string };
    if (result.token) return { success: true, token: result.token };
    return { success: false, error: result.error || 'token failed' };
  };

  // Return legacy actions object for backward compatibility
  const actions: Record<string, (...args: unknown[]) => unknown> = {};
  return {
    state,
    dispatch,
    startSession,
    startGame,
    advanceQuestion,
    createVideoRoom,
    endVideoRoom,
    generateDailyToken,
    actions,
  };
}
