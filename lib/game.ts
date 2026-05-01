// SPEC.md: Phase 7 — game logic
import type { Cell, GameState, Mark } from "./types";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function createEmptyState(): GameState {
  return {
    board: Array<Cell>(9).fill(null),
    turn: "X",
    status: "waiting",
    winningLine: null,
  };
}

export function checkWinner(board: Cell[]): {
  winner: Mark | "draw" | null;
  line: number[] | null;
} {
  for (const [a, b, c] of LINES) {
    if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: "draw", line: null };
  }
  return { winner: null, line: null };
}

export function applyMove(
  state: GameState,
  index: number,
  mark: Mark,
): GameState | { error: string } {
  if (state.status !== "playing") {
    return { error: "Game is not in progress" };
  }
  if (mark !== state.turn) {
    return { error: "Not your turn" };
  }
  if (index < 0 || index > 8) {
    return { error: "Invalid cell index" };
  }
  if (state.board[index] !== null) {
    return { error: "Cell is already occupied" };
  }

  const newBoard = [...state.board];
  newBoard[index] = mark;

  const { winner, line } = checkWinner(newBoard);

  if (winner === "X" || winner === "O") {
    return {
      board: newBoard,
      turn: state.turn,
      status: winner === "X" ? "won_X" : "won_O",
      winningLine: line,
    };
  }
  if (winner === "draw") {
    return {
      board: newBoard,
      turn: state.turn,
      status: "draw",
      winningLine: null,
    };
  }

  return {
    board: newBoard,
    turn: mark === "X" ? "O" : "X",
    status: "playing",
    winningLine: null,
  };
}
