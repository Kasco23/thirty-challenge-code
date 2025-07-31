import { useAtomValue, useSetAtom, useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { GameDatabase } from '@/lib/gameDatabase';
import { createAtomGameSync } from '@/lib/atomGameSync';
import type { SegmentCode, PlayerId, Player } from '@/types/game';
import {
  gameStateAtom,
  gameIdAtom,
  phaseAtom,
  initializeGameAtom,
  updateGameStateAtom,
  updatePlayerAtom,
  addPlayerAtom,
  updateScoreAtom,
  currentQuestionIndexAtom,
  gameSyncInstanceAtom,
  myParticipantAtom,
  setMyParticipantAtom,
  type LobbyParticipant,
} from '@/state';

export function useGameActions() {
  const store = useStore();
  const gameId = useAtomValue(gameIdAtom);
  const setPhase = useSetAtom(phaseAtom);
  const updateGameState = useSetAtom(updateGameStateAtom);
  const initializeGame = useSetAtom(initializeGameAtom);
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom);

  const startSession = useCallback(async (
    gameId: string,
    hostCode: string,
    hostName: string | null,
    segmentSettings: Record<SegmentCode, number>,
  ) => {
    try {
      const record = await GameDatabase.createGame(
        gameId,
        hostCode,
        hostName,
        segmentSettings,
      );
      
      if (record) {
        const gameState = {
          gameId: record.id,
          hostCode: record.host_code,
          hostName: record.host_name ?? null,
          phase: record.phase as any,
          currentSegment: record.current_segment as any,
          currentQuestionIndex: record.current_question_index,
          videoRoomUrl: record.video_room_url ?? undefined,
          videoRoomCreated: record.video_room_created,
          timer: record.timer,
          isTimerRunning: record.is_timer_running,
          segmentSettings: record.segment_settings,
          players: {
            playerA: {
              id: 'playerA' as PlayerId,
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
              id: 'playerB' as PlayerId,
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
          },
          scoreHistory: [],
        };
        
        initializeGame(gameState);
        
        // Create game sync connection
        await createAtomGameSync(gameId, store);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [store, initializeGame]);

  const startGame = useCallback(() => {
    setPhase('PLAYING');
    if (gameSyncInstance && gameId) {
      gameSyncInstance.broadcastGameState({ phase: 'PLAYING' });
      GameDatabase.updateGame(gameId, { phase: 'PLAYING' });
    }
  }, [setPhase, gameSyncInstance, gameId]);

  const advanceQuestion = useCallback(() => {
    if (gameSyncInstance && gameId) {
      const currentIndex = store.get(currentQuestionIndexAtom);
      const newIndex = currentIndex + 1;
      updateGameState({ currentQuestionIndex: newIndex });
      gameSyncInstance.broadcastGameState({ currentQuestionIndex: newIndex });
      GameDatabase.updateGame(gameId, { current_question_index: newIndex });
    }
  }, [gameSyncInstance, gameId, store, updateGameState]);

  const createVideoRoom = useCallback(async (gameId: string) => {
    try {
      const result = await fetch(`/.netlify/functions/create-daily-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: gameId }),
      });
      
      const data = await result.json() as { url?: string; error?: string };
      
      if (data.url) {
        await GameDatabase.updateGame(gameId, {
          video_room_url: data.url,
          video_room_created: true,
        });
        
        updateGameState({
          videoRoomUrl: data.url,
          videoRoomCreated: true,
        });
        
        if (gameSyncInstance) {
          gameSyncInstance.broadcastGameState({
            videoRoomUrl: data.url,
            videoRoomCreated: true,
          });
        }
        
        return { success: true, roomUrl: data.url };
      }
      return { success: false, error: data.error || 'create failed' };
    } catch (error) {
      console.error('Failed to create video room:', error);
      return { success: false, error: 'Network error' };
    }
  }, [updateGameState, gameSyncInstance]);

  const endVideoRoom = useCallback(async (gameId: string) => {
    try {
      await fetch(`/.netlify/functions/delete-daily-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: gameId }),
      });
      
      await GameDatabase.updateGame(gameId, {
        video_room_created: false,
        video_room_url: null,
      });
      
      updateGameState({
        videoRoomCreated: false,
        videoRoomUrl: undefined,
      });
      
      if (gameSyncInstance) {
        gameSyncInstance.broadcastGameState({
          videoRoomCreated: false,
          videoRoomUrl: undefined,
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to end video room:', error);
      return { success: false, error: 'Network error' };
    }
  }, [updateGameState, gameSyncInstance]);

  const generateDailyToken = useCallback(async (
    room: string,
    user: string,
    isHost: boolean,
  ): Promise<string | null> => {
    try {
      const res = await fetch('/.netlify/functions/create-daily-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, user, isHost }),
      });
      const json = await res.json() as { token?: string; error?: string };
      if (!json.token) throw new Error(json.error || 'No token');
      return json.token;
    } catch (err) {
      console.error('generateDailyToken error', err);
      return null;
    }
  }, []);

  return {
    startSession,
    startGame,
    advanceQuestion,
    createVideoRoom,
    endVideoRoom,
    generateDailyToken,
  };
}

export function useGameState() {
  return useAtomValue(gameStateAtom);
}

export function useGameField<K extends keyof ReturnType<typeof useGameState>>(
  field: K
): ReturnType<typeof useGameState>[K] {
  const gameState = useGameState();
  return gameState[field];
}

export function usePlayerActions() {
  const updatePlayer = useSetAtom(updatePlayerAtom);
  const addPlayer = useSetAtom(addPlayerAtom);
  const updateScore = useSetAtom(updateScoreAtom);
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom);
  const gameId = useAtomValue(gameIdAtom);

  const joinGame = useCallback(async (playerId: PlayerId, playerData: Partial<Player>) => {
    const player: Player = {
      id: playerId,
      name: playerData.name || '',
      flag: playerData.flag,
      club: playerData.club,
      role: playerData.role || playerId,
      score: 0,
      strikes: 0,
      isConnected: true,
      specialButtons: {
        LOCK_BUTTON: false,
        TRAVELER_BUTTON: false,
        PIT_BUTTON: false,
      },
    };

    addPlayer(player);

    if (gameId) {
      await GameDatabase.addPlayer(playerId, gameId, {
        name: player.name,
        flag: player.flag,
        club: player.club,
        role: player.role,
      });

      if (gameSyncInstance) {
        gameSyncInstance.broadcastPlayerJoin(playerId, player);
      }
    }
  }, [addPlayer, gameId, gameSyncInstance]);

  const leaveGame = useCallback(async (playerId: PlayerId) => {
    updatePlayer({ playerId, update: { isConnected: false } });

    if (gameId) {
      await GameDatabase.updatePlayer(playerId, { is_connected: false });

      if (gameSyncInstance) {
        gameSyncInstance.broadcastPlayerLeave(playerId);
      }
    }
  }, [updatePlayer, gameId, gameSyncInstance]);

  const scorePlayer = useCallback((playerId: PlayerId, points: number) => {
    updateScore({ playerId, points });
    
    if (gameSyncInstance) {
      // Broadcast score update through game state
      const gameState = gameSyncInstance.store.get(gameStateAtom);
      const updatedPlayer = { ...gameState.players[playerId] };
      updatedPlayer.score += points;
      
      gameSyncInstance.broadcastGameState({
        players: {
          ...gameState.players,
          [playerId]: updatedPlayer,
        },
      });
    }
  }, [updateScore, gameSyncInstance]);

  return {
    joinGame,
    leaveGame,
    scorePlayer,
    updatePlayer,
  };
}

export function useLobbyActions() {
  const setMyParticipant = useSetAtom(setMyParticipantAtom);
  const myParticipant = useAtomValue(myParticipantAtom);
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom);

  const setParticipant = useCallback((participant: LobbyParticipant | null) => {
    setMyParticipant(participant);
    
    if (participant && gameSyncInstance) {
      gameSyncInstance.trackPresence(participant);
    }
  }, [setMyParticipant, gameSyncInstance]);

  return {
    myParticipant,
    setParticipant,
  };
}

// Hook to initialize game sync when game ID changes
export function useGameSync() {
  const store = useStore();
  const gameId = useAtomValue(gameIdAtom);
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom);

  useEffect(() => {
    if (gameId && !gameSyncInstance) {
      createAtomGameSync(gameId, store).catch(console.error);
    }

    return () => {
      if (gameSyncInstance) {
        gameSyncInstance.disconnect().catch(console.error);
      }
    };
  }, [gameId, store, gameSyncInstance]);

  return gameSyncInstance;
}