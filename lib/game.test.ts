import { describe, expect, it } from "vitest";
import { applyMove, checkWinner, createEmptyState } from "./game";
import type { GameState } from "./types";

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
  const playing: GameState = {
    board: Array(9).fill(null),
    turn: "X",
    status: "playing",
    winningLine: null,
  };

  it("places mark in empty cell and flips turn", () => {
    const result = applyMove(playing, 0, "X");
    expect("error" in result).toBe(false);
    const s = result as GameState;
    expect(s.board[0]).toBe("X");
    expect(s.turn).toBe("O");
    expect(s.status).toBe("playing");
  });

  it("errors on occupied cell", () => {
    const state: GameState = {
      ...playing,
      board: ["X", null, null, null, null, null, null, null, null],
    };
    const result = applyMove(state, 0, "X");
    expect(result).toEqual({ error: "Cell is already occupied" });
  });

  it("errors when wrong mark plays", () => {
    const result = applyMove(playing, 0, "O");
    expect(result).toEqual({ error: "Not your turn" });
  });

  it("errors when game is not in progress", () => {
    const won: GameState = {
      board: ["X", "X", "X", "O", "O", null, null, null, null],
      turn: "O",
      status: "won_X",
      winningLine: [0, 1, 2],
    };
    const result = applyMove(won, 5, "O");
    expect(result).toEqual({ error: "Game is not in progress" });
  });

  it("detects row win", () => {
    // X has [0,1], place X at 2
    const state: GameState = {
      ...playing,
      board: ["X", "X", null, "O", "O", null, null, null, null],
    };
    const result = applyMove(state, 2, "X");
    expect("error" in result).toBe(false);
    const s = result as GameState;
    expect(s.status).toBe("won_X");
    expect(s.winningLine).toEqual([0, 1, 2]);
  });

  it("detects column win", () => {
    // O has [1,4], place O at 7
    const state: GameState = {
      board: ["X", "O", null, "X", "O", null, null, null, "X"],
      turn: "O",
      status: "playing",
      winningLine: null,
    };
    const result = applyMove(state, 7, "O");
    expect("error" in result).toBe(false);
    const s = result as GameState;
    expect(s.status).toBe("won_O");
    expect(s.winningLine).toEqual([1, 4, 7]);
  });

  it("detects diagonal win", () => {
    // X has [0,4], place X at 8
    const state: GameState = {
      board: ["X", "O", null, null, "X", "O", null, null, null],
      turn: "X",
      status: "playing",
      winningLine: null,
    };
    const result = applyMove(state, 8, "X");
    expect("error" in result).toBe(false);
    const s = result as GameState;
    expect(s.status).toBe("won_X");
    expect(s.winningLine).toEqual([0, 4, 8]);
  });

  it("detects draw", () => {
    // One cell left, no winner possible
    const state: GameState = {
      board: ["X", "O", "X", "X", "O", "O", "O", "X", null],
      turn: "X",
      status: "playing",
      winningLine: null,
    };
    const result = applyMove(state, 8, "X");
    expect("error" in result).toBe(false);
    const s = result as GameState;
    expect(s.status).toBe("draw");
    expect(s.winningLine).toBeNull();
  });
});

describe("checkWinner", () => {
  it("returns null for empty board", () => {
    const result = checkWinner(Array(9).fill(null));
    expect(result).toEqual({ winner: null, line: null });
  });

  it("returns draw when board is full with no winner", () => {
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"] as const;
    const result = checkWinner([...board]);
    expect(result).toEqual({ winner: "draw", line: null });
  });
});
