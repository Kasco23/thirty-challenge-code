import React, { useReducer, useEffect, useMemo } from 'react';
import type { GameState, GameAction, PlayerId, SegmentCode } from '../types/game';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_GAME_STATE } from '../constants/gameState';
import { GameContext } from './GameContextDefinition';

// Using imported initial state

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { gameId } = action.payload;
      return {
        ...INITIAL_GAME_STATE,
        gameId,
        phase: 'LOBBY',
      };
    }

    case 'JOIN_GAME': {
      const { playerId, playerData } = action.payload;
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            ...playerData,
            name: playerData.name || state.players[playerId].name,
            isConnected: true,
          },
        },
      };
    }

    case 'UPDATE_HOST_NAME': {
      const { hostName } = action.payload;
      return {
        ...state,
        hostName,
      };
    }

    case 'UPDATE_SEGMENT_SETTINGS': {
      const { settings } = action.payload;
      const updatedSegments = { ...state.segments };
      
      // Update questionsPerSegment for each segment
      Object.entries(settings).forEach(([segmentCode, questionsCount]) => {
        if (updatedSegments[segmentCode as SegmentCode]) {
          updatedSegments[segmentCode as SegmentCode] = {
            ...updatedSegments[segmentCode as SegmentCode],
            questionsPerSegment: questionsCount,
          };
        }
      });
      
      return {
        ...state,
        segments: updatedSegments,
      };
    }

    case 'NEXT_QUESTION': {
      const currentSegmentState = state.segments[state.currentSegment];
      const nextQuestionIndex = currentSegmentState.currentQuestionIndex + 1;
      
      if (nextQuestionIndex >= currentSegmentState.questionsPerSegment) {
        return {
          ...state,
          segments: {
            ...state.segments,
            [state.currentSegment]: {
              ...currentSegmentState,
              isComplete: true,
            },
          },
        };
      }
      
      return {
        ...state,
        segments: {
          ...state.segments,
          [state.currentSegment]: {
            ...currentSegmentState,
            currentQuestionIndex: nextQuestionIndex,
          },
        },
      };
    }

    case 'NEXT_SEGMENT': {
      const segmentOrder: Array<keyof GameState['segments']> = ['WSHA', 'AUCT', 'BELL', 'SING', 'REMO'];
      const currentIndex = segmentOrder.indexOf(state.currentSegment);
      const nextSegment = segmentOrder[currentIndex + 1];
      
      if (!nextSegment) {
        return {
          ...state,
          phase: 'FINAL_SCORES',
        };
      }
      
      return {
        ...state,
        currentSegment: nextSegment,
        segments: {
          ...state.segments,
          [state.currentSegment]: {
            ...state.segments[state.currentSegment],
            isComplete: true,
          },
        },
      };
    }

    case 'UPDATE_SCORE': {
      const { playerId, points } = action.payload;
      const newScore = Math.max(0, state.players[playerId].score + points);
      
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            score: newScore,
          },
        },
        scoreHistory: [
          ...state.scoreHistory,
          {
            playerId,
            points,
            timestamp: Date.now(),
            segment: state.currentSegment,
            questionIndex: state.segments[state.currentSegment].currentQuestionIndex,
          },
        ],
      };
    }

    case 'ADD_STRIKE': {
      const { playerId } = action.payload;
      const newStrikes = Math.min(3, state.players[playerId].strikes + 1);
      
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            strikes: newStrikes,
          },
        },
      };
    }

    case 'USE_SPECIAL_BUTTON': {
      const { playerId, buttonType } = action.payload;
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            specialButtons: {
              ...state.players[playerId].specialButtons,
              [buttonType]: false,
            },
          },
        },
      };
    }

    case 'START_TIMER': {
      const { duration } = action.payload;
      return {
        ...state,
        timer: duration,
        isTimerRunning: true,
      };
    }

    case 'STOP_TIMER':
      return {
        ...state,
        isTimerRunning: false,
      };

    case 'TICK_TIMER':
      if (!state.isTimerRunning || state.timer <= 0) {
        return state;
      }
      return {
        ...state,
        timer: state.timer - 1,
      };

    case 'RESET_GAME':
      return INITIAL_GAME_STATE;

    default:
      return state;
  }
}



export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

  // Real-time synchronization with Supabase (if configured)
  useEffect(() => {
    if (!isSupabaseConfigured() || !state.gameId) return;

    const channel = supabase.channel(`game-${state.gameId}`)
      .on('broadcast', { event: 'game-update' }, ({ payload }) => {
        // Handle incoming game state updates
        console.log('Received game update:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.gameId]);

  // Timer effect
  useEffect(() => {
    if (!state.isTimerRunning) return;

    const interval = setInterval(() => {
              dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  const actions = useMemo(() => ({
    startGame: (gameId: string) => {
      dispatch({ type: 'START_GAME', payload: { gameId } });
    },
    joinGame: (playerId: PlayerId, playerData: Partial<GameState['players'][PlayerId]>) => {
      dispatch({ type: 'JOIN_GAME', payload: { playerId, playerData } });
    },
    updateHostName: (hostName: string) => {
      dispatch({ type: 'UPDATE_HOST_NAME', payload: { hostName } });
    },
    updateSegmentSettings: (settings: Record<SegmentCode, number>) => {
      dispatch({ type: 'UPDATE_SEGMENT_SETTINGS', payload: { settings } });
    },
    nextQuestion: () => {
      dispatch({ type: 'NEXT_QUESTION' });
    },
    nextSegment: () => {
      dispatch({ type: 'NEXT_SEGMENT' });
    },
    updateScore: (playerId: PlayerId, points: number) => {
      dispatch({ type: 'UPDATE_SCORE', payload: { playerId, points } });
    },
    addStrike: (playerId: PlayerId) => {
      dispatch({ type: 'ADD_STRIKE', payload: { playerId } });
    },
    useSpecialButton: (playerId: PlayerId, buttonType: keyof GameState['players'][PlayerId]['specialButtons']) => {
      dispatch({ type: 'USE_SPECIAL_BUTTON', payload: { playerId, buttonType } });
    },
    startTimer: (duration: number) => {
      dispatch({ type: 'START_TIMER', payload: { duration } });
    },
    stopTimer: () => {
      dispatch({ type: 'STOP_TIMER' });
    },
    tickTimer: () => {
      dispatch({ type: 'TICK_TIMER' });
    },
    resetGame: () => {
      dispatch({ type: 'RESET_GAME' });
    },
  }), []);

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}