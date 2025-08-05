import { useAtomValue, useSetAtom, useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { GameDatabase } from '@/lib/gameDatabase';
import { createAtomGameSync, type AtomGameSync } from '@/lib/atomGameSync';
import { isDevelopmentMode, getDailyDomain } from '@/lib/dailyConfig';
import type { SegmentCode, PlayerId, Player, GameState } from '@/types/game';

// Helper function to map player records (copied from atomGameSync)
function mapPlayerRecord(record: { id: string; name: string; flag?: string | null; club?: string | null; role: string; score: number; strikes: number; is_connected: boolean; special_buttons: Record<string, boolean> }): Player {
  return {
    id: record.id as PlayerId,
    name: record.name,
    flag: record.flag ?? undefined,
    club: record.club ?? undefined,
    role: record.role,
    score: record.score,
    strikes: record.strikes,
    isConnected: record.is_connected,
    specialButtons: record.special_buttons as Player['specialButtons'],
  };
}
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
  playersAtom,
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
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom) as AtomGameSync | null;

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
          hostIsConnected: record.host_is_connected ?? false,
          phase: record.phase as GameState['phase'],
          currentSegment: record.current_segment as GameState['currentSegment'],
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

  const updateToLobbyPhase = useCallback(async (
    gameId: string,
    hostCode: string,
    hostName: string,
    segmentSettings: Record<SegmentCode, number>,
  ) => {
    try {
      // Update database first with host details and LOBBY phase
      const updatedGame = await GameDatabase.updateGame(gameId, {
        host_code: hostCode,
        host_name: hostName,
        phase: 'LOBBY',
        segment_settings: segmentSettings,
      });
      
      if (!updatedGame) {
        throw new Error('Failed to update game to LOBBY phase');
      }
      
      // Update local state
      updateGameState({
        hostCode,
        hostName,
        phase: 'LOBBY',
        segmentSettings,
      });
      
      // Broadcast the change
      if (gameSyncInstance) {
        await gameSyncInstance.broadcastGameState({
          hostCode,
          hostName,
          phase: 'LOBBY',
          segmentSettings,
        });
      }
      
      console.log('Game updated to LOBBY phase:', updatedGame);
    } catch (error) {
      console.error('Failed to update to LOBBY phase:', error);
      throw error;
    }
  }, [updateGameState, gameSyncInstance]);

  const startGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      // Update database first to PLAYING phase
      const updatedGame = await GameDatabase.updateGame(gameId, { 
        phase: 'PLAYING',
        current_segment: 'WSHA', // Start with first segment
        current_question_index: 0,
      });
      
      if (!updatedGame) {
        throw new Error('Failed to update game to PLAYING phase');
      }
      
      // Update local state
      setPhase('PLAYING');
      updateGameState({
        phase: 'PLAYING',
        currentSegment: 'WSHA',
        currentQuestionIndex: 0,
      });
      
      // Broadcast the change
      if (gameSyncInstance) {
        await gameSyncInstance.broadcastGameState({ 
          phase: 'PLAYING',
          currentSegment: 'WSHA',
          currentQuestionIndex: 0,
        });
      }
      
      console.log('Game started and moved to PLAYING phase:', updatedGame);
    } catch (error) {
      console.error('Failed to start game:', error);
      // Revert local state on error
      setPhase('LOBBY');
      throw error;
    }
  }, [setPhase, gameSyncInstance, gameId, updateGameState]);

  const advanceQuestion = useCallback(async () => {
    if (!gameSyncInstance || !gameId) return;
    
    try {
      const currentIndex = store.get(currentQuestionIndexAtom);
      const newIndex = currentIndex + 1;
      
      // Update database first
      await GameDatabase.updateGame(gameId, { current_question_index: newIndex });
      
      // Update local state
      updateGameState({ currentQuestionIndex: newIndex });
      
      // Broadcast the change
      await gameSyncInstance.broadcastGameState({ currentQuestionIndex: newIndex });
    } catch (error) {
      console.error('Failed to advance question:', error);
    }
  }, [gameSyncInstance, gameId, store, updateGameState]);

  const createVideoRoom = useCallback(async (gameId: string) => {
    try {
      // Development mode: use mock video room
      if (isDevelopmentMode()) {
        console.log('[DEV] Creating mock video room for gameId:', gameId);
        
        const dailyDomain = getDailyDomain();
        const mockUrl = `https://${dailyDomain}/${gameId}`;
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update database first (if available)
        try {
          await GameDatabase.updateGame(gameId, {
            video_room_url: mockUrl,
            video_room_created: true,
          });
        } catch (dbError) {
          console.warn('[DEV] Database update failed, continuing with local state only:', dbError);
        }
        
        // Update local state
        updateGameState({
          videoRoomUrl: mockUrl,
          videoRoomCreated: true,
        });
        
        // Broadcast the change
        if (gameSyncInstance) {
          await gameSyncInstance.broadcastGameState({
            videoRoomUrl: mockUrl,
            videoRoomCreated: true,
          });
        }
        
        console.log('[DEV] Mock video room created successfully:', mockUrl);
        return { success: true, roomUrl: mockUrl };
      }

      // Production mode: use real Daily.co API
      const result = await fetch(`/.netlify/functions/create-daily-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: gameId }),
      });
      
      const data = await result.json() as { url?: string; error?: string };
      
      if (data.url) {
        // Update database first
        await GameDatabase.updateGame(gameId, {
          video_room_url: data.url,
          video_room_created: true,
        });
        
        // Update local state
        updateGameState({
          videoRoomUrl: data.url,
          videoRoomCreated: true,
        });
        
        // Broadcast the change
        if (gameSyncInstance) {
          await gameSyncInstance.broadcastGameState({
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
      // Development mode: mock deletion
      if (isDevelopmentMode()) {
        console.log('[DEV] Ending mock video room for gameId:', gameId);
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update database first (if available)
        try {
          await GameDatabase.updateGame(gameId, {
            video_room_created: false,
            video_room_url: null,
          });
        } catch (dbError) {
          console.warn('[DEV] Database update failed, continuing with local state only:', dbError);
        }
        
        // Update local state
        updateGameState({
          videoRoomCreated: false,
          videoRoomUrl: undefined,
        });
        
        // Broadcast the change
        if (gameSyncInstance) {
          await gameSyncInstance.broadcastGameState({
            videoRoomCreated: false,
            videoRoomUrl: undefined,
          });
        }
        
        console.log('[DEV] Mock video room ended successfully');
        return { success: true };
      }

      // Production mode: use real Daily.co API
      await fetch(`/.netlify/functions/delete-daily-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: gameId }),
      });
      
      // Update database first
      await GameDatabase.updateGame(gameId, {
        video_room_created: false,
        video_room_url: null,
      });
      
      // Update local state
      updateGameState({
        videoRoomCreated: false,
        videoRoomUrl: undefined,
      });
      
      // Broadcast the change
      if (gameSyncInstance) {
        await gameSyncInstance.broadcastGameState({
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

  const checkVideoRoomExists = useCallback(async (roomName: string) => {
    try {
      // Development mode: mock room check
      if (isDevelopmentMode()) {
        console.log('[DEV] Checking mock video room for roomName:', roomName);
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock response: assume room exists if it matches current game state
        const currentState = store.get(gameStateAtom);
        const exists = currentState.videoRoomCreated;
        const dailyDomain = getDailyDomain();
        const url = exists ? `https://${dailyDomain}/mock-room-${roomName}` : undefined;
        
        return { 
          success: true, 
          exists,
          roomName: exists ? roomName : undefined,
          url,
          created: exists ? new Date().toISOString() : undefined,
          participants: []
        };
      }

      // Production mode: use real Daily.co API
      const result = await fetch(`/.netlify/functions/check-daily-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });
      
      const data = await result.json() as { 
        exists: boolean; 
        roomName?: string; 
        url?: string; 
        created?: string;
        participants?: unknown[];
        error?: string; 
      };
      
      if (data.error) {
        console.error('Error checking room:', data.error);
        return { success: false, error: data.error };
      }
      
      return { 
        success: true, 
        exists: data.exists,
        roomName: data.roomName,
        url: data.url,
        created: data.created,
        participants: data.participants || []
      };
    } catch (error) {
      console.error('Failed to check video room:', error);
      return { success: false, error: 'Network error' };
    }
  }, [store]);

  const generateDailyToken = useCallback(async (
    room: string,
    user: string,
    isHost: boolean,
    isObserver: boolean = false,
  ): Promise<string | null> => {
    try {
      // Development mode: generate mock token
      if (isDevelopmentMode()) {
        console.log('[DEV] Generating mock Daily token for:', { room, user, isHost, isObserver });
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Generate mock token
        const mockToken = `mock-token-${room}-${user}-${Date.now()}`;
        console.log('[DEV] Mock token generated:', mockToken);
        return mockToken;
      }

      // Production mode: use real Daily.co API
      const res = await fetch('/.netlify/functions/create-daily-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, user, isHost, isObserver }),
      });
      const json = await res.json() as { token?: string; error?: string };
      if (!json.token) throw new Error(json.error || 'No token');
      return json.token;
    } catch (err) {
      console.error('generateDailyToken error', err);
      return null;
    }
  }, []);

  const setHostConnected = useCallback(async (isConnected: boolean) => {
    if (!gameId) return { success: false, error: 'No game ID' };
    
    try {
      // Update database
      await GameDatabase.updateGame(gameId, {
        host_is_connected: isConnected,
      });
      
      // Update local state
      updateGameState({
        hostIsConnected: isConnected,
      });
      
      // Broadcast the change
      if (gameSyncInstance) {
        await gameSyncInstance.broadcastGameState({
          hostIsConnected: isConnected,
        });
      }
      
      console.log(`Host connection status updated to: ${isConnected}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to update host connection status:', error);
      return { success: false, error: 'Network error' };
    }
  }, [gameId, updateGameState, gameSyncInstance]);

  const loadGameState = useCallback(async (gameId: string) => {
    try {
      // Load game data from database
      const gameRecord = await GameDatabase.getGame(gameId);
      if (!gameRecord) {
        console.error('Game not found:', gameId);
        return { success: false, error: 'Game not found' };
      }

      // Convert to game state format
      const gameState = {
        gameId: gameRecord.id,
        hostCode: gameRecord.host_code,
        hostName: gameRecord.host_name ?? null,
        hostIsConnected: gameRecord.host_is_connected ?? false,
        phase: gameRecord.phase as GameState['phase'],
        currentSegment: gameRecord.current_segment as GameState['currentSegment'],
        currentQuestionIndex: gameRecord.current_question_index,
        videoRoomUrl: gameRecord.video_room_url ?? undefined,
        videoRoomCreated: gameRecord.video_room_created,
        timer: gameRecord.timer,
        isTimerRunning: gameRecord.is_timer_running,
        segmentSettings: gameRecord.segment_settings,
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

      // Load players from database
      const players = await GameDatabase.getPlayers(gameId);
      players.forEach(playerRecord => {
        const player = mapPlayerRecord(playerRecord);
        if (player.id === 'playerA' || player.id === 'playerB') {
          gameState.players[player.id] = {
            ...player,
            strikes: player.strikes ?? 0, // Ensure strikes is defined
          };
        }
      });

      // Initialize game state
      initializeGame(gameState);

      return { success: true, gameState };
    } catch (error) {
      console.error('Failed to load game state:', error);
      return { success: false, error: 'Failed to load game' };
    }
  }, [initializeGame]);

  return {
    startSession,
    updateToLobbyPhase,
    startGame,
    advanceQuestion,
    createVideoRoom,
    endVideoRoom,
    checkVideoRoomExists,
    generateDailyToken,
    setHostConnected,
    loadGameState,
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
  const store = useStore();
  const updatePlayer = useSetAtom(updatePlayerAtom);
  const addPlayer = useSetAtom(addPlayerAtom);
  const updateScore = useSetAtom(updateScoreAtom);
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom) as AtomGameSync | null;
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

    try {
      if (gameId) {
        // Add to database first
        await GameDatabase.addPlayer(playerId, gameId, {
          name: player.name,
          flag: player.flag,
          club: player.club,
          role: player.role,
        });

        // Update local state
        addPlayer(player);

        // Broadcast the change
        if (gameSyncInstance) {
          await gameSyncInstance.broadcastPlayerJoin(playerId, player);
        }
      } else {
        // No gameId, just update local state
        addPlayer(player);
      }
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }, [addPlayer, gameId, gameSyncInstance]);

  const leaveGame = useCallback(async (playerId: PlayerId) => {
    try {
      if (gameId) {
        // Update database first
        await GameDatabase.updatePlayer(playerId, { 
          is_connected: false,
          last_active: new Date().toISOString()
        });

        // Update local state
        updatePlayer({ playerId, update: { isConnected: false } });

        // Broadcast the change
        if (gameSyncInstance) {
          await gameSyncInstance.broadcastPlayerLeave(playerId);
        }
      } else {
        // No gameId, just update local state
        updatePlayer({ playerId, update: { isConnected: false } });
      }
    } catch (error) {
      console.error('Failed to leave game:', error);
    }
  }, [updatePlayer, gameId, gameSyncInstance]);

  const scorePlayer = useCallback(async (playerId: PlayerId, points: number) => {
    try {
      // Update local state first for immediate feedback
      updateScore({ playerId, points });
      
      if (gameSyncInstance && gameId) {
        // Get the current player to calculate new total score
        const currentPlayers = store.get(playersAtom);
        const player = currentPlayers[playerId];
        if (player) {
          const newTotalScore = player.score + points;
          
          // Update database with the new total score
          await GameDatabase.updatePlayer(playerId, { 
            score: newTotalScore,
            last_active: new Date().toISOString()
          });
          
          // Broadcast the updated player data
          await gameSyncInstance.broadcastGameState({
            players: {
              ...currentPlayers,
              [playerId]: {
                ...player,
                score: newTotalScore
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to update player score:', error);
    }
  }, [updateScore, gameSyncInstance, gameId, store]);

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
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom) as AtomGameSync | null;

  const setParticipant = useCallback(async (participant: LobbyParticipant | null) => {
    setMyParticipant(participant);
    
    if (participant && gameSyncInstance) {
      try {
        // Track presence in real-time
        await gameSyncInstance.trackPresence(participant);
        
        // If this is a player, also update their database record
        if (participant.playerId && participant.type === 'player') {
          await GameDatabase.updatePlayer(participant.playerId, {
            is_connected: true,
            last_active: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to set participant presence:', error);
      }
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
  const gameSyncInstance = useAtomValue(gameSyncInstanceAtom) as AtomGameSync | null;

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