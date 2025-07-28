import React, { useReducer, useEffect, useMemo, useRef } from "react";
import { GameDatabase } from "../lib/gameDatabase";
import type {
  GameState,
  GameAction,
  PlayerId,
  SegmentCode,
} from "../types/game";
// Removed unused imports - using gameSync for real-time functionality
import { INITIAL_GAME_STATE } from "../constants/gameState";
import { GameContext } from "./GameContextDefinition";
import {
  createGameSync,
  GameSync,
  type GameSyncCallbacks,
} from "../lib/gameSync";
// Using imported initial state

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const { gameId } = action.payload;
      return {
        ...INITIAL_GAME_STATE,
        gameId,
        phase: "LOBBY",
      };
    }

    case "JOIN_GAME": {
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

    case "UPDATE_HOST_NAME": {
      const { hostName } = action.payload;
      return {
        ...state,
        hostName,
      };
    }

    case "UPDATE_SEGMENT_SETTINGS": {
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

    case "NEXT_QUESTION": {
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

    case "NEXT_SEGMENT": {
      const segmentOrder: Array<keyof GameState["segments"]> = [
        "WSHA",
        "AUCT",
        "BELL",
        "SING",
        "REMO",
      ];
      const currentIndex = segmentOrder.indexOf(state.currentSegment);
      const nextSegment = segmentOrder[currentIndex + 1];

      if (!nextSegment) {
        return {
          ...state,
          phase: "FINAL_SCORES",
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

    case "UPDATE_SCORE": {
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
            questionIndex:
              state.segments[state.currentSegment].currentQuestionIndex,
          },
        ],
      };
    }

    case "ADD_STRIKE": {
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

    case "USE_SPECIAL_BUTTON": {
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

    case "START_TIMER": {
      const { duration } = action.payload;
      return {
        ...state,
        timer: duration,
        isTimerRunning: true,
      };
    }

    case "STOP_TIMER":
      return {
        ...state,
        isTimerRunning: false,
      };

    case "TICK_TIMER":
      if (!state.isTimerRunning || state.timer <= 0) {
        return state;
      }
      return {
        ...state,
        timer: state.timer - 1,
      };

    case "RESET_GAME":
      return INITIAL_GAME_STATE;

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
  const gameSyncRef = useRef<GameSync | null>(null);
  const [videoRoomUrl, setVideoRoomUrl] = React.useState<string>("");
  const [videoRoomCreated, setVideoRoomCreated] =
    React.useState<boolean>(false);

  // Initialize real-time synchronization when game starts
  useEffect(() => {
    if (state.gameId && !gameSyncRef.current) {
      const callbacks: GameSyncCallbacks = {
        onGameStateUpdate: (gameState) => {
          // Update local state with remote changes
          if (gameState.hostName) {
            dispatch({
              type: "UPDATE_HOST_NAME",
              payload: { hostName: gameState.hostName },
            });
          }
          if (gameState.players) {
            Object.entries(gameState.players).forEach(
              ([playerId, playerData]) => {
                dispatch({
                  type: "JOIN_GAME",
                  payload: { playerId: playerId as PlayerId, playerData },
                });
              },
            );
          }
        },
        onPlayerJoin: (playerId, playerData) => {
          dispatch({
            type: "JOIN_GAME",
            payload: {
              playerId,
              playerData: playerData as Partial<GameState["players"][PlayerId]>,
            },
          });
        },
        onPlayerLeave: (playerId) => {
          // Mark player as disconnected instead of removing
          dispatch({
            type: "JOIN_GAME",
            payload: { playerId, playerData: { isConnected: false } },
          });
        },
        onHostUpdate: (hostName) => {
          dispatch({ type: "UPDATE_HOST_NAME", payload: { hostName } });
        },
        onVideoRoomUpdate: (roomUrl, roomCreated) => {
          setVideoRoomUrl(roomUrl);
          setVideoRoomCreated(roomCreated);
        },
        onPresenceStateChange: (presence: Record<string, unknown>) => {
          // Cast to expected shape: { participants: Array<{ playerId?: string }> }
          const typedPresence = presence as Record<
            string,
            { participants?: Array<{ playerId?: string }> }
          >;
          const connected = new Set<PlayerId>();
          Object.values(typedPresence).forEach((entry) => {
            entry.participants?.forEach((p) => {
              if (p.playerId === "playerA" || p.playerId === "playerB") {
                connected.add(p.playerId as PlayerId);
              }
            });
          });
          (["playerA", "playerB"] as const).forEach((pid) => {
            dispatch({
              type: "JOIN_GAME",
              payload: {
                playerId: pid,
                playerData: { isConnected: connected.has(pid) },
              },
            });
          });
        },
      };

      gameSyncRef.current = createGameSync(state.gameId, callbacks);
      gameSyncRef.current.connect();
    }

    // Cleanup on unmount or game change
    return () => {
      if (gameSyncRef.current) {
        gameSyncRef.current.disconnect();
        gameSyncRef.current = null;
      }
    };
  }, [state.gameId]);

  // Timer effect
  useEffect(() => {
    if (!state.isTimerRunning) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  const actions = useMemo(
    () => ({
      startGame: async (gameId: string) => {
        // 1) Update client state
        dispatch({ type: "START_GAME", payload: { gameId } });
        // 2) Persist in Supabase
        try {
          await GameDatabase.createGame(gameId, state.hostName);
        } catch (err) {
          console.error("⚠️ Failed to persist new game:", err);
        }
      },
      joinGame: async (
        playerId: PlayerId,
        playerData: Partial<GameState["players"][PlayerId]>,
      ) => {
        // 1) Update client state & broadcast
        dispatch({ type: "JOIN_GAME", payload: { playerId, playerData } });
        gameSyncRef.current?.broadcastPlayerJoin(playerId, playerData);

        // 2) Persist player join in Supabase
        try {
          await GameDatabase.addPlayer(playerId, state.gameId!, {
            name: playerData.name!,
            flag: playerData.flag,
            club: playerData.club,
          });
        } catch (err) {
          console.error("⚠️ Failed to persist player join:", err);
        }
      },
      updateHostName: (hostName: string) => {
        dispatch({ type: "UPDATE_HOST_NAME", payload: { hostName } });
        // Broadcast to other participants
        gameSyncRef.current?.broadcastHostUpdate(hostName);
      },
      updateSegmentSettings: (settings: Record<SegmentCode, number>) => {
        dispatch({ type: "UPDATE_SEGMENT_SETTINGS", payload: { settings } });
        // Broadcast to other participants
        gameSyncRef.current?.broadcastGameState({ segments: state.segments });
      },
      createVideoRoom: async (gameId: string) => {
        try {
          const response = await fetch(
            "/.netlify/functions/create-daily-room",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomName: gameId }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            // Function returns `{ url }`, older code expected `data.room.url`.
            const roomUrl = data.url || data.room?.url;
            setVideoRoomUrl(roomUrl);
            setVideoRoomCreated(true);
            // Broadcast to other participants
            gameSyncRef.current?.broadcastVideoRoomUpdate(roomUrl, true);
            // Persist the video_room_created event
            try {
              await fetch("/.netlify/functions/game-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  game_id: gameId,
                  event_type: "video_room_created",
                  event_data: { url: roomUrl },
                }),
              });
            } catch (e) {
              console.error("⚠️ Failed to record video_room_created:", e);
            }
            return { success: true, roomUrl };
          } else {
            console.error("Failed to create room");
            return { success: false, error: "Failed to create room" };
          }
        } catch (error) {
          console.error("Error creating room:", error);
          return { success: false, error: "Network error" };
        }
      },
      endVideoRoom: async (gameId: string) => {
        try {
          await fetch("/.netlify/functions/delete-daily-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: gameId }),
          });
        } catch (error) {
          console.error("Error deleting room:", error);
        }

        setVideoRoomUrl("");
        setVideoRoomCreated(false);
        gameSyncRef.current?.broadcastVideoRoomUpdate("", false);
        return { success: true };
      },
      // Request a Daily.co meeting token for a user
      generateDailyToken: async (
        room: string,
        user: string,
        isHost: boolean,
      ) => {
        try {
          const response = await fetch(
            "/.netlify/functions/create-daily-token",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              // Backend expects { room, user, isHost }
              body: JSON.stringify({ room, user, isHost }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            return { success: true, token: data.token };
          } else {
            console.error("Failed to create token");
            return { success: false, error: "Failed to create token" };
          }
        } catch (error) {
          console.error("Error creating token:", error);
          return { success: false, error: "Network error" };
        }
      },
      trackPresence: (participantData: {
        id: string;
        name: string;
        type: "host-pc" | "host-mobile" | "player";
        playerId?: PlayerId;
        flag?: string;
        club?: string;
      }) => {
        gameSyncRef.current?.trackPresence(participantData);
      },
      nextQuestion: () => {
        dispatch({ type: "NEXT_QUESTION" });
      },
      nextSegment: () => {
        dispatch({ type: "NEXT_SEGMENT" });
      },
      updateScore: (playerId: PlayerId, points: number) => {
        dispatch({ type: "UPDATE_SCORE", payload: { playerId, points } });
      },
      addStrike: (playerId: PlayerId) => {
        dispatch({ type: "ADD_STRIKE", payload: { playerId } });
      },
      useSpecialButton: (
        playerId: PlayerId,
        buttonType: keyof GameState["players"][PlayerId]["specialButtons"],
      ) => {
        dispatch({
          type: "USE_SPECIAL_BUTTON",
          payload: { playerId, buttonType },
        });
      },
      startTimer: (duration: number) => {
        dispatch({ type: "START_TIMER", payload: { duration } });
      },
      stopTimer: () => {
        dispatch({ type: "STOP_TIMER" });
      },
      tickTimer: () => {
        dispatch({ type: "TICK_TIMER" });
      },
      resetGame: () => {
        dispatch({ type: "RESET_GAME" });
      },
    }),
    [gameSyncRef, state.segments],
  );

  return (
    <GameContext.Provider
      value={{
        state: {
          ...state,
          videoRoomUrl,
          videoRoomCreated,
        },
        actions,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
