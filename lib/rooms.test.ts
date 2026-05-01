import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAllRooms,
  getRoom,
  handleMove,
  handleRematch,
  isError,
  joinRoom,
  removePlayer,
} from "./rooms";

beforeEach(() => {
  clearAllRooms();
});

describe("joinRoom", () => {
  it("creates a room and assigns X to first player", () => {
    const result = joinRoom("room1", "player1");
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.mark).toBe("X");
      expect(result.room.state.status).toBe("waiting");
    }
  });

  it("assigns O to second player and starts playing", () => {
    joinRoom("room1", "player1");
    const result = joinRoom("room1", "player2");
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.mark).toBe("O");
      expect(result.room.state.status).toBe("playing");
    }
  });

  it("returns ROOM_FULL when third player tries to join", () => {
    joinRoom("room1", "player1");
    joinRoom("room1", "player2");
    const result = joinRoom("room1", "player3");
    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe("ROOM_FULL");
    }
  });

  it("allows same player to rejoin", () => {
    joinRoom("room1", "player1");
    const result = joinRoom("room1", "player1");
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.mark).toBe("X");
    }
  });
});

describe("handleMove", () => {
  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = handleMove("nonexistent", "player1", 0);
    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe("ROOM_NOT_FOUND");
    }
  });

  it("returns NOT_YOUR_TURN when player moves out of order", () => {
    joinRoom("room1", "player1");
    joinRoom("room1", "player2");
    // It's X's turn (player1), but player2 (O) tries to move
    const result = handleMove("room1", "player2", 0);
    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe("NOT_YOUR_TURN");
    }
  });

  it("accepts valid move and updates state", () => {
    joinRoom("room1", "player1");
    joinRoom("room1", "player2");
    const result = handleMove("room1", "player1", 4);
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.board[4]).toBe("X");
      expect(result.turn).toBe("O");
    }
  });

  it("returns INVALID_MOVE for occupied cell", () => {
    joinRoom("room1", "player1");
    joinRoom("room1", "player2");
    handleMove("room1", "player1", 0);
    handleMove("room1", "player2", 1);
    const result = handleMove("room1", "player1", 0);
    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe("INVALID_MOVE");
    }
  });
});

describe("handleRematch", () => {
  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = handleRematch("nonexistent");
    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe("ROOM_NOT_FOUND");
    }
  });

  it("resets game state to playing when two players present", () => {
    joinRoom("room1", "player1");
    joinRoom("room1", "player2");
    handleMove("room1", "player1", 0);
    const result = handleRematch("room1");
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.board).toEqual(Array(9).fill(null));
      expect(result.status).toBe("playing");
      expect(result.turn).toBe("X");
    }
  });
});

describe("removePlayer", () => {
  it("removes player from room", () => {
    joinRoom("room1", "player1");
    joinRoom("room1", "player2");
    const result = removePlayer("room1", "player1");
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.removed).toBe(true);
      expect(result.roomEmpty).toBe(false);
    }
    const room = getRoom("room1");
    expect(room).toBeDefined();
    expect(room!.players).toHaveLength(1);
    expect(room!.players[0].id).toBe("player2");
  });

  it("deletes room when last player leaves", () => {
    joinRoom("room1", "player1");
    const result = removePlayer("room1", "player1");
    expect(isError(result)).toBe(false);
    if (!isError(result)) {
      expect(result.removed).toBe(true);
      expect(result.roomEmpty).toBe(true);
    }
    expect(getRoom("room1")).toBeUndefined();
  });

  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = removePlayer("nonexistent", "player1");
    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe("ROOM_NOT_FOUND");
    }
  });
});
