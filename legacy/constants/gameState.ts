import type { GameState } from '../../thirty-challenge/src/types/game';

export const INITIAL_GAME_STATE: GameState = {
  gameId: '',
  phase: 'LOBBY',
  currentSegment: 'WSHA',
  currentQuestionIndex: 0,
  timer: 0,
  isTimerRunning: false,
  players: {
    playerA: {
      id: 'playerA',
      name: 'لاعب أ',
      score: 0,
      strikes: 0,
      isConnected: false,
      specialButtons: {
        LOCK_BUTTON: true,
        TRAVELER_BUTTON: true,
        PIT_BUTTON: true,
      },
      club: 'liverpool',
      flag: 'sa',
    },
    playerB: {
      id: 'playerB',
      name: 'لاعب ب',
      score: 0,
      strikes: 0,
      isConnected: false,
      specialButtons: {
        LOCK_BUTTON: true,
        TRAVELER_BUTTON: true,
        PIT_BUTTON: true,
      },
      club: 'real-madrid',
      flag: 'ae',
    },
  },
  hostName: 'المقدم',
  segments: {
    WSHA: {
      questionsPerSegment: 10,
      currentQuestionIndex: 0,
      isComplete: false,
    },
    AUCT: {
      questionsPerSegment: 8,
      currentQuestionIndex: 0,
      isComplete: false,
    },
    BELL: {
      questionsPerSegment: 12,
      currentQuestionIndex: 0,
      isComplete: false,
    },
    SING: {
      questionsPerSegment: 6,
      currentQuestionIndex: 0,
      isComplete: false,
    },
    REMO: {
      questionsPerSegment: 5,
      currentQuestionIndex: 0,
      isComplete: false,
    },
  },
  scoreHistory: [],
};
