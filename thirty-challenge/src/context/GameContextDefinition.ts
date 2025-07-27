import { createContext } from 'react';
import type { GameState, PlayerId, SegmentCode } from '../types/game';

interface GameContextType {
  state: GameState;
  actions: {
    startGame: (gameId: string) => void;
    joinGame: (playerId: PlayerId, playerData: Partial<GameState['players'][PlayerId]>) => void;
    updateHostName: (hostName: string) => void;
    updateSegmentSettings: (settings: Record<SegmentCode, number>) => void;
    createVideoRoom: (gameId: string) => Promise<{ success: boolean; roomUrl?: string; error?: string }>;
    generateDailyToken: (gameId: string, userName: string, userRole: string) => Promise<{ success: boolean; token?: string; error?: string }>;
    trackPresence: (participantData: {
      id: string;
      name: string;
      type: 'host-pc' | 'host-mobile' | 'player';
      playerId?: PlayerId;
      flag?: string;
      club?: string;
    }) => void;
    nextQuestion: () => void;
    nextSegment: () => void;
    updateScore: (playerId: PlayerId, points: number) => void;
    addStrike: (playerId: PlayerId) => void;
    useSpecialButton: (playerId: PlayerId, buttonType: keyof GameState['players'][PlayerId]['specialButtons']) => void;
    startTimer: (duration: number) => void;
    stopTimer: () => void;
    tickTimer: () => void;
    resetGame: () => void;
  };
}

export const GameContext = createContext<GameContextType | undefined>(undefined);
export type { GameContextType };