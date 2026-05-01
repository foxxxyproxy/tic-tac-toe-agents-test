import { describe, expect, it } from "vitest";
import { applyMove, checkWinner, createEmptyState } from "./game";
import type { Cell } from "./types";

describe("createEmptyState", () => {
  it("returns correct initial state", () => {
    const state = createEmptyState();
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.turn).toBe("X");
    expect(state.status).toBe("waiting");
    expect(state.winningLine).toBeNull();
  });
});

describe("applyMove", () => {
  it("places mark in empty cell and flips turn", () => {
    const state = { ...createEmptyState(), status: "playing" as const };
    const result = applyMove(state, 0, "X");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.board[0]).toBe("X");
      expect(result.turn).toBe("O");
      expect(result.status).toBe("playing");
    }
  });

  it("errors on occupied cell", () => {
    const state = { ...createEmptyState(), status: "playing" as const };
    state.board = ["X", null, null, null, null, null, null, null, null] as Cell[];
    const result = applyMove(state, 0, "X");
    expect(result).toEqual({ error: "Cell is already occupied" });
  });

  it("errors when wrong mark plays", () => {
    const state = { ...createEmptyState(), status: "playing" as const };
    const result = applyMove(state, 0, "O");
    expect(result).toEqual({ error: "Not your turn" });
  });

  it("errors when game is already over (won)", () => {
    const state = createEmptyState();
    state.status = "won_X";
    const result = applyMove(state, 4, "X");
    expect(result).toEqual({ error: "Game is already over" });
  });

  it("errors when game is already over (draw)", () => {
    const state = createEmptyState();
    state.status = "draw";
    const result = applyMove(state, 0, "X");
    expect(result).toEqual({ error: "Game is already over" });
  });
});

describe("checkWinner", () => {
  it("detects win by row", () => {
    const board: Cell[] = ["X", "X", "X", null, "O", "O", null, null, null];
    expect(checkWinner(board)).toEqual({ winner: "X", line: [0, 1, 2] });
  });

  it("detects win by column", () => {
    const board: Cell[] = ["O", "X", null, "O", "X", null, "O", null, null];
    expect(checkWinner(board)).toEqual({ winner: "O", line: [0, 3, 6] });
  });

  it("detects win by diagonal", () => {
    const board: Cell[] = ["X", "O", null, null, "X", "O", null, null, "X"];
    expect(checkWinner(board)).toEqual({ winner: "X", line: [0, 4, 8] });
  });

  it("detects draw", () => {
    const board: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(checkWinner(board)).toEqual({ winner: "draw", line: null });
  });

  it("returns null when game is in progress", () => {
    const board: Cell[] = ["X", null, null, null, "O", null, null, null, null];
    expect(checkWinner(board)).toEqual({ winner: null, line: null });
  });
});

describe("applyMove — winning and draw transitions", () => {
  it("transitions to won_X on winning move", () => {
    const state = {
      board: ["X", "X", null, "O", "O", null, null, null, null] as Cell[],
      turn: "X" as const,
      status: "playing" as const,
      winningLine: null,
    };
    const result = applyMove(state, 2, "X");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.status).toBe("won_X");
      expect(result.winningLine).toEqual([0, 1, 2]);
    }
  });

  it("transitions to draw when board fills with no winner", () => {
    // Board before last move:
    // X O X
    // X O O
    // O X _
    const state = {
      board: ["X", "O", "X", "X", "O", "O", "O", "X", null] as Cell[],
      turn: "X" as const,
      status: "playing" as const,
      winningLine: null,
    };
    const result = applyMove(state, 8, "X");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.status).toBe("draw");
      expect(result.winningLine).toBeNull();
    }
  });
});
