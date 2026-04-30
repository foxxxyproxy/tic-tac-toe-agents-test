// SPEC.md: Phase 0 — Event contract types

export type Mark = "X" | "O";
export type Cell = null | Mark;

export type GameState = {
  board: Cell[];
  turn: Mark;
  status: "waiting" | "playing" | "won_X" | "won_O" | "draw";
  winningLine: number[] | null;
};

export type ErrorCode =
  | "ROOM_FULL"
  | "INVALID_MOVE"
  | "NOT_YOUR_TURN"
  | "ROOM_NOT_FOUND";
