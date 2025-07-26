/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { GameState, PlayerId } from '../types/game';

export interface GameSyncCallbacks {
  onGameStateUpdate: (gameState: Partial<GameState>) => void;
  onPlayerJoin: (playerId: PlayerId, playerData: unknown) => void;
  onPlayerLeave: (playerId: PlayerId) => void;
  onHostUpdate: (hostName: string) => void;
  onVideoRoomUpdate: (roomUrl: string, roomCreated: boolean) => void;
}

export class GameSync {
  private gameId: string;
  private channel: unknown = null;
  private callbacks: GameSyncCallbacks;

  constructor(gameId: string, callbacks: GameSyncCallbacks) {
    this.gameId = gameId;
    this.callbacks = callbacks;
  }

  // Initialize real-time subscription
  async connect() {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using local state only');
      return;
    }

    try {
      // Create or join the game channel
      this.channel = supabase.channel(`game:${this.gameId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: 'participants' }
        }
      }) as unknown;

      // Listen for game state broadcasts
      (this.channel as any)?.on('broadcast', { event: 'game_state_update' }, (payload: Record<string, unknown>) => {
        if (payload.gameState) {
          this.callbacks.onGameStateUpdate(payload.gameState as Partial<GameState>);
        }
      });

      (this.channel as any)?.on('broadcast', { event: 'player_join' }, (payload: Record<string, unknown>) => {
        if (payload.playerId && payload.playerData !== undefined) {
          this.callbacks.onPlayerJoin(payload.playerId as PlayerId, payload.playerData);
        }
      });

      (this.channel as any)?.on('broadcast', { event: 'player_leave' }, (payload: Record<string, unknown>) => {
        if (payload.playerId) {
          this.callbacks.onPlayerLeave(payload.playerId as PlayerId);
        }
      });

      (this.channel as any)?.on('broadcast', { event: 'host_update' }, (payload: Record<string, unknown>) => {
        if (payload.hostName) {
          this.callbacks.onHostUpdate(payload.hostName as string);
        }
      });

      (this.channel as any)?.on('broadcast', { event: 'video_room_update' }, (payload: Record<string, unknown>) => {
        if (payload.roomUrl && payload.roomCreated !== undefined) {
          this.callbacks.onVideoRoomUpdate(payload.roomUrl as string, payload.roomCreated as boolean);
        }
      });

      // Handle presence (who's currently in the lobby)
      (this.channel as any)?.on('presence', { event: 'sync' }, () => {
        const newState = (this.channel as any)?.presenceState();
        console.log('Presence sync:', newState);
      });

      (this.channel as any)?.on('presence', { event: 'join' }, (payload: Record<string, unknown>) => {
        console.log('Participant joined:', payload);
      });

      (this.channel as any)?.on('presence', { event: 'leave' }, (payload: Record<string, unknown>) => {
        console.log('Participant left:', payload);
      });

      // Subscribe to the channel
      await (this.channel as any)?.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Connected to game channel: ${this.gameId}`);
        }
      });

    } catch (error) {
      console.error('Failed to connect to game sync:', error);
    }
  }

  // Broadcast game state updates to all participants
  async broadcastGameState(gameState: Partial<GameState>) {
    if (!this.channel) return;

    try {
      await (this.channel as any).send({
        type: 'broadcast',
        event: 'game_state_update',
        gameState
      });
    } catch (error) {
      console.error('Failed to broadcast game state:', error);
    }
  }

  // Broadcast player join
  async broadcastPlayerJoin(playerId: PlayerId, playerData: unknown) {
    if (!this.channel) return;

    try {
      await (this.channel as any).send({
        type: 'broadcast',
        event: 'player_join',
        playerId,
        playerData
      });
    } catch (error) {
      console.error('Failed to broadcast player join:', error);
    }
  }

  // Broadcast player leave
  async broadcastPlayerLeave(playerId: PlayerId) {
    if (!this.channel) return;

    try {
      await (this.channel as any).send({
        type: 'broadcast',
        event: 'player_leave',
        playerId
      });
    } catch (error) {
      console.error('Failed to broadcast player leave:', error);
    }
  }

  // Broadcast host name update
  async broadcastHostUpdate(hostName: string) {
    if (!this.channel) return;

    try {
      await (this.channel as any).send({
        type: 'broadcast',
        event: 'host_update',
        hostName
      });
    } catch (error) {
      console.error('Failed to broadcast host update:', error);
    }
  }

  // Broadcast video room creation
  async broadcastVideoRoomUpdate(roomUrl: string, roomCreated: boolean) {
    if (!this.channel) return;

    try {
      await (this.channel as any).send({
        type: 'broadcast',
        event: 'video_room_update',
        roomUrl,
        roomCreated
      });
    } catch (error) {
      console.error('Failed to broadcast video room update:', error);
    }
  }

  // Track presence (who's currently in the lobby)
  async trackPresence(participantData: {
    id: string;
    name: string;
    type: 'host-pc' | 'host-mobile' | 'player';
    playerId?: PlayerId;
    flag?: string;
    club?: string;
  }) {
    if (!this.channel) return;

    try {
      await (this.channel as any).track(participantData);
    } catch (error) {
      console.error('Failed to track presence:', error);
    }
  }

  // Disconnect from the channel
  async disconnect() {
    if (this.channel) {
      await (this.channel as any).unsubscribe();
      this.channel = null;
    }
  }

  // Get current presence state
  getPresenceState() {
    return this.channel ? (this.channel as any).presenceState() : {};
  }
}

// Utility function to create a GameSync instance
export function createGameSync(gameId: string, callbacks: GameSyncCallbacks): GameSync {
  return new GameSync(gameId, callbacks);
}