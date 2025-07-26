import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { 
  GameState, 
  GameAction, 
  GameActionType, 
  PlayerId, 
  Player,
  Question 
} from '../types/game';

// Initial game state
const initialGameState: GameState = {
  gameId: '',
  phase: 'lobby',
  currentSegment: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  players: {
    host: {
      id: 'host',
      name: 'المقدم',
      score: 0,
      strikes: 0,
      isConnected: false,
      specialButtons: {
        lockButton: false,
        travelerButton: false,
        pitButton: false,
      }
    },
    playerA: {
      id: 'playerA',
      name: 'لاعب أ',
      score: 0,
      strikes: 0,
      isConnected: false,
      specialButtons: {
        lockButton: false,
        travelerButton: true,
        pitButton: true,
      }
    },
    playerB: {
      id: 'playerB',
      name: 'لاعب ب',
      score: 0,
      strikes: 0,
      isConnected: false,
      specialButtons: {
        lockButton: false,
        travelerButton: true,
        pitButton: true,
      }
    }
  },
  host: 'host',
  segments: [
    {
      code: 'WSHA',
      name: 'وش تعرف',
      maxQuestions: 10,
      description: 'قائمة متناوبة حتى 3 أخطاء',
      rules: ['تناوب بين اللاعبين', 'تكرار الإجابة = خطأ', '3 أخطاء = نقطة للخصم']
    },
    {
      code: 'AUCT',
      name: 'المزاد',
      maxQuestions: 8,
      description: 'مزايدة على عدد العناصر',
      rules: ['مزايدة على العدد', 'يجب تحقيق 50% من الوعد', 'زر القفل متاح عند 40 نقطة']
    },
    {
      code: 'BELL',
      name: 'فقرة الجرس',
      maxQuestions: 12,
      description: 'أسرع في الضغط على الجرس',
      rules: ['أول من يضغط الجرس يجيب', 'زر المسافر متاح مرة واحدة', 'لا توجد أخطاء']
    },
    {
      code: 'SING',
      name: 'سين & جيم',
      maxQuestions: 4,
      description: 'أسئلة صعبة مع زر الحفرة',
      rules: ['4 أسئلة صعبة', 'زر الحفرة: +2 لك و -2 للخصم', 'استخدام واحد لكل لاعب']
    },
    {
      code: 'REMO',
      name: 'التعويض',
      maxQuestions: 6,
      description: 'تخمين المهنة من الأدلة',
      rules: ['أدلة متدرجة عن المهنة', 'أول إجابة صحيحة تفوز', 'فرصة للعودة']
    }
  ],
  completedSegments: [],
  timer: {
    isActive: false,
    timeLeft: 0,
    duration: 30,
  },
  bell: {
    isActive: false,
    clickedBy: null,
    clickTime: null,
  },
  auction: {
    isActive: false,
    bids: { host: 0, playerA: 0, playerB: 0 },
    winner: null,
    targetCount: 0,
    correctCount: 0,
  },
  settings: {
    questionsPerSegment: {
      WSHA: 10,
      AUCT: 8,
      BELL: 12,
      SING: 4,
      REMO: 6,
    },
    enabledSegments: ['WSHA', 'AUCT', 'BELL', 'SING', 'REMO'],
    timePerQuestion: 30,
  }
};

// Game reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type as GameActionType) {
    case 'PLAYER_JOIN':
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.playerId]: {
            ...state.players[action.payload.playerId as PlayerId],
            name: action.payload.name,
            flag: action.payload.flag,
            club: action.payload.club,
            isConnected: true,
          }
        }
      };

    case 'START_GAME':
      return {
        ...state,
        phase: 'segment-intro',
        currentSegment: state.settings.enabledSegments[0],
        gameId: action.payload.gameId,
      };

    case 'NEXT_SEGMENT':
      const currentIndex = state.settings.enabledSegments.indexOf(state.currentSegment!);
      const nextSegment = state.settings.enabledSegments[currentIndex + 1];
      
      return {
        ...state,
        phase: nextSegment ? 'segment-intro' : 'final',
        currentSegment: nextSegment || null,
        currentQuestionIndex: 0,
        currentQuestion: null,
        completedSegments: state.currentSegment 
          ? [...state.completedSegments, state.currentSegment]
          : state.completedSegments,
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        phase: 'playing',
        currentQuestionIndex: state.currentQuestionIndex + 1,
        currentQuestion: action.payload.question,
        timer: {
          ...state.timer,
          isActive: true,
          timeLeft: state.settings.timePerQuestion,
        },
        bell: {
          isActive: state.currentSegment === 'BELL',
          clickedBy: null,
          clickTime: null,
        }
      };

    case 'BELL_CLICK':
      if (state.currentSegment === 'BELL' && state.bell.isActive) {
        return {
          ...state,
          bell: {
            isActive: false,
            clickedBy: action.playerId!,
            clickTime: action.timestamp,
          },
          timer: {
            ...state.timer,
            isActive: true,
            timeLeft: 10, // 10 seconds to answer after bell click
          }
        };
      }
      return state;

    case 'ADD_STRIKE':
      const playerId = action.playerId!;
      const newStrikes = state.players[playerId].strikes + 1;
      
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            strikes: newStrikes,
          }
        }
      };

    case 'UPDATE_SCORE':
      const scorePlayerId = action.payload.playerId as PlayerId;
      return {
        ...state,
        players: {
          ...state.players,
          [scorePlayerId]: {
            ...state.players[scorePlayerId],
            score: state.players[scorePlayerId].score + action.payload.points,
          }
        }
      };

    case 'USE_SPECIAL_BUTTON':
      const { playerId: buttonPlayerId, buttonType } = action.payload;
      const targetPlayerId = buttonPlayerId as PlayerId;
      return {
        ...state,
        players: {
          ...state.players,
          [targetPlayerId]: {
            ...state.players[targetPlayerId],
            specialButtons: {
              ...state.players[targetPlayerId].specialButtons,
              [buttonType]: false, // Disable after use
            }
          }
        }
      };

    case 'START_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          isActive: true,
          timeLeft: action.payload.duration || state.settings.timePerQuestion,
          duration: action.payload.duration || state.settings.timePerQuestion,
        }
      };

    case 'STOP_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          isActive: false,
        }
      };

    case 'PLACE_BID':
      return {
        ...state,
        auction: {
          ...state.auction,
          bids: {
            ...state.auction.bids,
            [action.playerId!]: action.payload.bidAmount,
          }
        }
      };

    default:
      return state;
  }
}

// Context types
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  actions: {
    joinGame: (playerId: PlayerId, playerData: Partial<Player>) => void;
    startGame: (gameId: string) => void;
    nextSegment: () => void;
    nextQuestion: (question: Question) => void;
    clickBell: (playerId: PlayerId) => void;
    addStrike: (playerId: PlayerId) => void;
    updateScore: (playerId: PlayerId, points: number, reason: string) => void;
    useSpecialButton: (playerId: PlayerId, buttonType: string) => void;
    startTimer: (duration?: number) => void;
    stopTimer: () => void;
    placeBid: (playerId: PlayerId, amount: number) => void;
  };
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Action creators
  const actions = {
    joinGame: (playerId: PlayerId, playerData: Partial<Player>) => {
      dispatch({
        type: 'PLAYER_JOIN',
        payload: { playerId, ...playerData },
        timestamp: Date.now(),
      });
    },

    startGame: (gameId: string) => {
      dispatch({
        type: 'START_GAME',
        payload: { gameId },
        timestamp: Date.now(),
      });
    },

    nextSegment: () => {
      dispatch({
        type: 'NEXT_SEGMENT',
        timestamp: Date.now(),
      });
    },

    nextQuestion: (question: Question) => {
      dispatch({
        type: 'NEXT_QUESTION',
        payload: { question },
        timestamp: Date.now(),
      });
    },

    clickBell: (playerId: PlayerId) => {
      dispatch({
        type: 'BELL_CLICK',
        playerId,
        timestamp: Date.now(),
      });
    },

    addStrike: (playerId: PlayerId) => {
      dispatch({
        type: 'ADD_STRIKE',
        playerId,
        timestamp: Date.now(),
      });
    },

    updateScore: (playerId: PlayerId, points: number, reason: string) => {
      dispatch({
        type: 'UPDATE_SCORE',
        payload: { playerId, points, reason },
        timestamp: Date.now(),
      });
    },

    useSpecialButton: (playerId: PlayerId, buttonType: string) => {
      dispatch({
        type: 'USE_SPECIAL_BUTTON',
        payload: { playerId, buttonType },
        timestamp: Date.now(),
      });
    },

    startTimer: (duration?: number) => {
      dispatch({
        type: 'START_TIMER',
        payload: { duration },
        timestamp: Date.now(),
      });
    },

    stopTimer: () => {
      dispatch({
        type: 'STOP_TIMER',
        timestamp: Date.now(),
      });
    },

    placeBid: (playerId: PlayerId, amount: number) => {
      dispatch({
        type: 'PLACE_BID',
        playerId,
        payload: { bidAmount: amount },
        timestamp: Date.now(),
      });
    },
  };

  // Real-time synchronization with Supabase (optional)
  useEffect(() => {
    if (state.gameId) {
      // Set up real-time listeners here
      const channel = supabase.channel(`game:${state.gameId}`)
        .on('broadcast', { event: 'game-action' }, (payload) => {
          dispatch(payload.action);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [state.gameId]);

  return (
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}