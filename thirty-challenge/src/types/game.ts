// Game Types for Thirty Challenge Quiz
export type PlayerId = 'playerA' | 'playerB';
export type SegmentCode = 'WSHA' | 'AUCT' | 'BELL' | 'SING' | 'REMO';
export type GamePhase = 'LOBBY' | 'PLAYING' | 'FINAL_SCORES';

export interface Player {
  id: PlayerId;
  name: string;
  flag?: string;
  club?: string;
  score: number;
  strikes: number;
  isConnected: boolean;
  specialButtons: {
    LOCK_BUTTON: boolean; // AUCT segment - available at 40 points
    TRAVELER_BUTTON: boolean; // BELL segment - one use per player
    PIT_BUTTON: boolean; // SING segment - one use per player
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

export interface SegmentState {
  questionsPerSegment: number;
  currentQuestionIndex: number;
  isComplete: boolean;
}

export interface ScoreEvent {
  playerId: PlayerId;
  points: number;
  timestamp: number;
  segment: SegmentCode;
  questionIndex: number;
}

export interface GameState {
  gameId: string;
  phase: GamePhase;
  currentSegment: SegmentCode;
  currentQuestionIndex: number;
  timer: number;
  isTimerRunning: boolean;
  videoRoomUrl?: string;
  videoRoomCreated?: boolean;
  players: Record<PlayerId, Player>;
  hostName: string;
  segments: Record<SegmentCode, SegmentState>;
  scoreHistory: ScoreEvent[];
}

// Action interfaces
export interface StartGameAction {
  type: 'START_GAME';
  payload: {
    gameId: string;
  };
}

export interface JoinGameAction {
  type: 'JOIN_GAME';
  payload: {
    playerId: PlayerId;
    playerData: Partial<Player>;
  };
}

export interface UpdateHostNameAction {
  type: 'UPDATE_HOST_NAME';
  payload: {
    hostName: string;
  };
}

export interface UpdateSegmentSettingsAction {
  type: 'UPDATE_SEGMENT_SETTINGS';
  payload: {
    settings: Record<SegmentCode, number>;
  };
}

export interface NextQuestionAction {
  type: 'NEXT_QUESTION';
}

export interface NextSegmentAction {
  type: 'NEXT_SEGMENT';
}

export interface UpdateScoreAction {
  type: 'UPDATE_SCORE';
  payload: {
    playerId: PlayerId;
    points: number;
  };
}

export interface AddStrikeAction {
  type: 'ADD_STRIKE';
  payload: {
    playerId: PlayerId;
  };
}

export interface UseSpecialButtonAction {
  type: 'USE_SPECIAL_BUTTON';
  payload: {
    playerId: PlayerId;
    buttonType: keyof Player['specialButtons'];
  };
}

export interface StartTimerAction {
  type: 'START_TIMER';
  payload: {
    duration: number;
  };
}

export interface StopTimerAction {
  type: 'STOP_TIMER';
}

export interface TickTimerAction {
  type: 'TICK_TIMER';
}

export interface ResetGameAction {
  type: 'RESET_GAME';
}

// Union type for all actions
export type GameAction =
  | StartGameAction
  | JoinGameAction
  | UpdateHostNameAction
  | UpdateSegmentSettingsAction
  | NextQuestionAction
  | NextSegmentAction
  | UpdateScoreAction
  | AddStrikeAction
  | UseSpecialButtonAction
  | StartTimerAction
  | StopTimerAction
  | TickTimerAction
  | ResetGameAction;

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
