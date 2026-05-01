import { describe, it, expect, beforeEach } from "vitest";
import {
  joinRoom,
  handleMove,
  handleRematch,
  removePlayer,
  clearAllRooms,
} from "./rooms";

beforeEach(() => {
  clearAllRooms();
});

describe("joinRoom", () => {
  it("creates a room for the first player", () => {
    const result = joinRoom("room1", "p1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mark).toBe("X");
      expect(result.state.status).toBe("waiting");
    }
  });

  it("assigns O to the second player and starts playing", () => {
    joinRoom("room1", "p1");
    const result = joinRoom("room1", "p2");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mark).toBe("O");
      expect(result.state.status).toBe("playing");
    }
  });

  it("returns ROOM_FULL when a third player tries to join", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = joinRoom("room1", "p3");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("ROOM_FULL");
    }
  });
});

describe("handleMove", () => {
  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = handleMove("nonexistent", "p1", 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("ROOM_NOT_FOUND");
    }
  });

  it("returns NOT_YOUR_TURN when player moves out of order", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    // O tries to move first (X's turn)
    const result = handleMove("room1", "p2", 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_YOUR_TURN");
    }
  });

  it("accepts a valid move", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = handleMove("room1", "p1", 4);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.board[4]).toBe("X");
      expect(result.state.turn).toBe("O");
    }
  });

  it("returns INVALID_MOVE for occupied cell", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    handleMove("room1", "p1", 0);
    handleMove("room1", "p2", 1);
    const result = handleMove("room1", "p1", 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("INVALID_MOVE");
    }
  });
});

describe("handleRematch", () => {
  it("resets the game state", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    handleMove("room1", "p1", 0);
    const result = handleRematch("room1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.board).toEqual(Array(9).fill(null));
      expect(result.state.status).toBe("playing");
    }
  });

  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = handleRematch("nonexistent");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("ROOM_NOT_FOUND");
    }
  });
});

describe("removePlayer", () => {
  it("cleans up room when last player leaves", () => {
    joinRoom("room1", "p1");
    const result = removePlayer("room1", "p1");
    expect(result.removed).toBe(true);
    expect(result.roomEmpty).toBe(true);
    // Room should be gone; joining creates a new one
    const rejoin = joinRoom("room1", "p1");
    expect(rejoin.ok).toBe(true);
    if (rejoin.ok) {
      expect(rejoin.mark).toBe("X");
    }
  });

  it("keeps room when one player remains", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = removePlayer("room1", "p1");
    expect(result.removed).toBe(true);
    expect(result.roomEmpty).toBe(false);
  });

  it("handles removal from nonexistent room", () => {
    const result = removePlayer("nonexistent", "p1");
    expect(result.removed).toBe(false);
    expect(result.roomEmpty).toBe(true);
  });
});
