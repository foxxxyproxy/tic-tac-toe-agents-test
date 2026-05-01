// SPEC.md: Phase 5 — useMockGame hook (mock local game with auto bot)
"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { GameState, Mark, ErrorCode, Cell } from "../lib/types";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Mark | "draw" | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: "draw", line: null };
  }
  return { winner: null, line: null };
}

type State = {
  gameState: GameState;
};

type Action =
  | { type: "MOVE"; index: number; mark: Mark }
  | { type: "REMATCH" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "MOVE": {
      const { gameState } = state;
      if (gameState.status !== "playing") return state;
      if (gameState.turn !== action.mark) return state;
      if (gameState.board[action.index] !== null) return state;

      const newBoard = [...gameState.board];
      newBoard[action.index] = action.mark;

      const { winner, line } = checkWinner(newBoard);
      const nextTurn: Mark = action.mark === "X" ? "O" : "X";

      let status: GameState["status"];
      if (winner === "X") status = "won_X";
      else if (winner === "O") status = "won_O";
      else if (winner === "draw") status = "draw";
      else status = "playing";

      return {
        gameState: {
          board: newBoard,
          turn: nextTurn,
          status,
          winningLine: line,
        },
      };
    }
    case "REMATCH":
      return {
        gameState: {
          board: Array(9).fill(null),
          turn: "X",
          status: "playing",
          winningLine: null,
        },
      };
  }
}

const INITIAL_STATE: State = {
  gameState: {
    board: Array(9).fill(null),
    turn: "X",
    status: "playing",
    winningLine: null,
  },
};

export function useMockGame(roomId: string): {
  state: GameState | null;
  mark: Mark | null;
  playerId: string | null;
  error: { code: ErrorCode; message: string } | null;
  connected: boolean;
  sendMove: (index: number) => void;
  sendRematch: () => void;
} {
  const [{ gameState }, dispatch] = useReducer(reducer, INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bot plays O after 800ms when it's O's turn
  useEffect(() => {
    if (gameState.status !== "playing" || gameState.turn !== "O") return;

    const emptyCells = gameState.board
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);

    if (emptyCells.length === 0) return;

    timerRef.current = setTimeout(() => {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      dispatch({ type: "MOVE", index: randomIndex, mark: "O" });
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState.status, gameState.turn, gameState.board]);

  const sendMove = useCallback(
    (index: number) => {
      dispatch({ type: "MOVE", index, mark: "X" });
    },
    [],
  );

  const sendRematch = useCallback(() => {
    dispatch({ type: "REMATCH" });
  }, []);

  // Suppress unused variable warning — roomId is part of the shared hook signature
  void roomId;

  return {
    state: gameState,
    mark: "X",
    playerId: "mock-player",
    error: null,
    connected: true,
    sendMove,
    sendRematch,
  };
}
