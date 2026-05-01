// SPEC.md: Phase 8 — Real socket hook (same signature as useMockGame)
"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";
import type { GameState, Mark, ErrorCode } from "../lib/types";

type State = {
  state: GameState | null;
  mark: Mark | null;
  playerId: string | null;
  error: { code: ErrorCode; message: string } | null;
  connected: boolean;
  opponentLeft: boolean;
};

type Action =
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "ASSIGNED"; mark: Mark; playerId: string }
  | { type: "STATE"; state: GameState }
  | { type: "ERROR"; code: ErrorCode; message: string }
  | { type: "OPPONENT_LEFT" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CONNECTED":
      return { ...state, connected: true };
    case "DISCONNECTED":
      return { ...state, connected: false };
    case "ASSIGNED":
      return { ...state, mark: action.mark, playerId: action.playerId, error: null };
    case "STATE":
      return { ...state, state: action.state };
    case "ERROR":
      return { ...state, error: { code: action.code, message: action.message } };
    case "OPPONENT_LEFT":
      return { ...state, opponentLeft: true };
  }
}

const initialState: State = {
  state: null,
  mark: null,
  playerId: null,
  error: null,
  connected: false,
  opponentLeft: false,
};

export function useGameSocket(roomId: string): {
  state: GameState | null;
  mark: Mark | null;
  playerId: string | null;
  error: { code: ErrorCode; message: string } | null;
  connected: boolean;
  opponentLeft: boolean;
  sendMove: (index: number) => void;
  sendRematch: () => void;
} {
  const [hookState, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<import("socket.io-client").Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    import("socket.io-client").then(({ io }) => {
      if (!mounted) return;

      const socket = io();
      socketRef.current = socket;

      socket.on("connect", () => {
        if (mounted) {
          dispatch({ type: "CONNECTED" });
          socket.emit("join", { roomId });
        }
      });

      socket.on("disconnect", () => {
        if (mounted) dispatch({ type: "DISCONNECTED" });
      });

      socket.on("assigned", (data: { mark: Mark; playerId: string }) => {
        if (mounted) dispatch({ type: "ASSIGNED", mark: data.mark, playerId: data.playerId });
      });

      socket.on("state", (data: GameState) => {
        if (mounted) dispatch({ type: "STATE", state: data });
      });

      socket.on("error_msg", (data: { code: ErrorCode; message: string }) => {
        if (mounted) dispatch({ type: "ERROR", code: data.code, message: data.message });
      });

      socket.on("opponent_left", () => {
        if (mounted) dispatch({ type: "OPPONENT_LEFT" });
      });
    });

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  const sendMove = useCallback((index: number) => {
    socketRef.current?.emit("move", { roomId, index });
  }, [roomId]);

  const sendRematch = useCallback(() => {
    socketRef.current?.emit("rematch", { roomId });
  }, [roomId]);

  return {
    state: hookState.state,
    mark: hookState.mark,
    playerId: hookState.playerId,
    error: hookState.error,
    connected: hookState.connected,
    opponentLeft: hookState.opponentLeft,
    sendMove,
    sendRematch,
  };
}
