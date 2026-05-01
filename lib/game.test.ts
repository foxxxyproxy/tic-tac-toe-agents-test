import { describe, it, expect } from "vitest";
import { createEmptyState, applyMove, checkWinner } from "./game";

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

  it("errors when cell is occupied", () => {
    const state = { ...createEmptyState(), status: "playing" as const };
    const after = applyMove(state, 0, "X");
    expect("error" in after).toBe(false);
    if (!("error" in after)) {
      const result = applyMove(after, 0, "O");
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Cell is already occupied");
      }
    }
  });

  it("errors when wrong mark plays", () => {
    const state = { ...createEmptyState(), status: "playing" as const };
    const result = applyMove(state, 0, "O");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toBe("Not your turn");
    }
  });

  it("blocks moves after a win", () => {
    // X wins on top row
    const board = ["X", "X", "X", "O", "O", null, null, null, null] as const;
    const state = {
      board: [...board],
      turn: "O" as const,
      status: "won_X" as const,
      winningLine: [0, 1, 2],
    };
    const result = applyMove(state, 5, "O");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toBe("Game is already over");
    }
  });
});

describe("checkWinner", () => {
  it("detects win by row", () => {
    const board = ["X", "X", "X", "O", "O", null, null, null, null] as const;
    const result = checkWinner([...board]);
    expect(result.winner).toBe("X");
    expect(result.line).toEqual([0, 1, 2]);
  });

  it("detects win by column", () => {
    const board = ["O", "X", null, "O", "X", null, "O", null, null] as const;
    const result = checkWinner([...board]);
    expect(result.winner).toBe("O");
    expect(result.line).toEqual([0, 3, 6]);
  });

  it("detects win by diagonal", () => {
    const board = ["X", "O", null, null, "X", "O", null, null, "X"] as const;
    const result = checkWinner([...board]);
    expect(result.winner).toBe("X");
    expect(result.line).toEqual([0, 4, 8]);
  });

  it("detects draw", () => {
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"] as const;
    const result = checkWinner([...board]);
    expect(result.winner).toBe("draw");
    expect(result.line).toBeNull();
  });

  it("returns null when game is in progress", () => {
    const board = ["X", "O", null, null, null, null, null, null, null] as const;
    const result = checkWinner([...board]);
    expect(result.winner).toBeNull();
    expect(result.line).toBeNull();
  });
});
