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
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
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

// Specific action interfaces
export interface PlayerJoinAction {
  type: 'PLAYER_JOIN';
  payload: {
    playerId: PlayerId;
    name: string;
    flag?: string;
    club?: string;
  };
  timestamp: number;
}

export interface StartGameAction {
  type: 'START_GAME';
  payload: {
    gameId: string;
  };
  timestamp: number;
}

export interface NextSegmentAction {
  type: 'NEXT_SEGMENT';
  timestamp: number;
}

export interface NextQuestionAction {
  type: 'NEXT_QUESTION';
  payload: {
    question: Question;
  };
  timestamp: number;
}

export interface BellClickAction {
  type: 'BELL_CLICK';
  playerId: PlayerId;
  timestamp: number;
}

export interface AddStrikeAction {
  type: 'ADD_STRIKE';
  playerId: PlayerId;
  timestamp: number;
}

export interface UpdateScoreAction {
  type: 'UPDATE_SCORE';
  payload: {
    playerId: PlayerId;
    points: number;
    reason: string;
  };
  timestamp: number;
}

export interface UseSpecialButtonAction {
  type: 'USE_SPECIAL_BUTTON';
  payload: {
    playerId: PlayerId;
    buttonType: string;
  };
  timestamp: number;
}

export interface StartTimerAction {
  type: 'START_TIMER';
  payload: {
    duration?: number;
  };
  timestamp: number;
}

export interface StopTimerAction {
  type: 'STOP_TIMER';
  timestamp: number;
}

export interface PlaceBidAction {
  type: 'PLACE_BID';
  playerId: PlayerId;
  payload: {
    bidAmount: number;
  };
  timestamp: number;
}

// Union type for all actions
export type GameAction = 
  | PlayerJoinAction
  | StartGameAction
  | NextSegmentAction
  | NextQuestionAction
  | BellClickAction
  | AddStrikeAction
  | UpdateScoreAction
  | UseSpecialButtonAction
  | StartTimerAction
  | StopTimerAction
  | PlaceBidAction;

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

export interface ScoreEvent {
  playerId: PlayerId;
  points: number;
  reason: string;
  timestamp: number;
  segmentCode: SegmentCode;
}