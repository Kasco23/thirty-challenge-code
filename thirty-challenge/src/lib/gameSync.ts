import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { GameState, PlayerId } from '../types/game';

export interface GameSyncCallbacks {
  onGameStateUpdate: (gameState: Partial<GameState>) => void;
  onPlayerJoin: (playerId: PlayerId, playerData: any) => void;
  onPlayerLeave: (playerId: PlayerId) => void;
  onHostUpdate: (hostName: string) => void;
  onVideoRoomUpdate: (roomUrl: string, roomCreated: boolean) => void;
}

export class GameSync {
  private gameId: string;
  private channel: any = null;
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
      });

      // Listen for game state broadcasts
      this.channel.on('broadcast', { event: 'game_state_update' }, (payload: any) => {
        this.callbacks.onGameStateUpdate(payload.gameState);
      });

      this.channel.on('broadcast', { event: 'player_join' }, (payload: any) => {
        this.callbacks.onPlayerJoin(payload.playerId, payload.playerData);
      });

      this.channel.on('broadcast', { event: 'player_leave' }, (payload: any) => {
        this.callbacks.onPlayerLeave(payload.playerId);
      });

      this.channel.on('broadcast', { event: 'host_update' }, (payload: any) => {
        this.callbacks.onHostUpdate(payload.hostName);
      });

      this.channel.on('broadcast', { event: 'video_room_update' }, (payload: any) => {
        this.callbacks.onVideoRoomUpdate(payload.roomUrl, payload.roomCreated);
      });

      // Handle presence (who's currently in the lobby)
      this.channel.on('presence', { event: 'sync' }, () => {
        const newState = this.channel.presenceState();
        console.log('Presence sync:', newState);
      });

      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('Participant joined:', key, newPresences);
      });

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('Participant left:', key, leftPresences);
      });

      // Subscribe to the channel
      await this.channel.subscribe(async (status: string) => {
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
      await this.channel.send({
        type: 'broadcast',
        event: 'game_state_update',
        gameState
      });
    } catch (error) {
      console.error('Failed to broadcast game state:', error);
    }
  }

  // Broadcast player join
  async broadcastPlayerJoin(playerId: PlayerId, playerData: any) {
    if (!this.channel) return;

    try {
      await this.channel.send({
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
      await this.channel.send({
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
      await this.channel.send({
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
      await this.channel.send({
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
      await this.channel.track(participantData);
    } catch (error) {
      console.error('Failed to track presence:', error);
    }
  }

  // Disconnect from the channel
  async disconnect() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
  }

  // Get current presence state
  getPresenceState() {
    return this.channel ? this.channel.presenceState() : {};
  }
}

// Utility function to create a GameSync instance
export function createGameSync(gameId: string, callbacks: GameSyncCallbacks): GameSync {
  return new GameSync(gameId, callbacks);
}