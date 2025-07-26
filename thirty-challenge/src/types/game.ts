// Game Types for Thirty Challenge Quiz
export type PlayerId = 'host' | 'playerA' | 'playerB';
export type SegmentCode = 'WSHA' | 'AUCT' | 'BELL' | 'SING' | 'REMO';
export type GamePhase = 'lobby' | 'segment-intro' | 'playing' | 'scoring' | 'final';

export interface Player {
  id: PlayerId;
  name: string;
  flag?: string;
  club?: string;
  score: number;
  strikes: number;
  isConnected: boolean;
  specialButtons: {
    lockButton: boolean;      // AUCT segment - available at 40 points
    travelerButton: boolean;  // BELL segment - one use per player
    pitButton: boolean;       // SING segment - one use per player
  };
}

export interface Question {
  id: string;
  text: string;
  answers: string[];
  correctAnswer?: string;
  segmentCode: SegmentCode;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SegmentConfig {
  code: SegmentCode;
  name: string;
  maxQuestions: number;
  description: string;
  rules: string[];
}

export interface GameState {
  gameId: string;
  phase: GamePhase;
  currentSegment: SegmentCode | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  players: Record<PlayerId, Player>;
  host: PlayerId;
  segments: SegmentConfig[];
  completedSegments: SegmentCode[];
  timer: {
    isActive: boolean;
    timeLeft: number;
    duration: number;
  };
  bell: {
    isActive: boolean;
    clickedBy: PlayerId | null;
    clickTime: number | null;
  };
  auction: {
    isActive: boolean;
    bids: Record<PlayerId, number>;
    winner: PlayerId | null;
    targetCount: number;
    correctCount: number;
  };
  settings: {
    questionsPerSegment: Record<SegmentCode, number>;
    enabledSegments: SegmentCode[];
    timePerQuestion: number;
  };
}

export interface GameAction {
  type: string;
  payload?: any;
  playerId?: PlayerId;
  timestamp: number;
}

// Segment-specific types
export interface WSHAState {
  currentPlayer: PlayerId;
  itemsNamed: string[];
  strikeCount: number;
}

export interface AUCTState {
  biddingPhase: boolean;
  bids: Record<PlayerId, number>;
  winner: PlayerId | null;
  itemsToName: number;
  itemsNamed: string[];
}

export interface BELLState {
  bellClicked: boolean;
  clickedBy: PlayerId | null;
  questionRevealed: boolean;
}

export interface SINGState {
  questionNumber: number;
  pitButtonUsed: Record<PlayerId, boolean>;
}

export interface REMOState {
  cluesRevealed: number;
  totalClues: number;
  careerClues: string[];
}

// Action types
export type GameActionType = 
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE' 
  | 'START_GAME'
  | 'NEXT_SEGMENT'
  | 'NEXT_QUESTION'
  | 'ANSWER_QUESTION'
  | 'BELL_CLICK'
  | 'ADD_STRIKE'
  | 'UPDATE_SCORE'
  | 'USE_SPECIAL_BUTTON'
  | 'START_TIMER'
  | 'STOP_TIMER'
  | 'PLACE_BID'
  | 'REVEAL_ANSWER'
  | 'END_GAME';

export interface ScoreEvent {
  playerId: PlayerId;
  points: number;
  reason: string;
  timestamp: number;
  segmentCode: SegmentCode;
}