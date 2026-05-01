import { beforeEach, describe, expect, it } from "vitest";
import { clearRooms, handleMove, handleRematch, joinRoom, removePlayer } from "./rooms";

beforeEach(() => {
  clearRooms();
});

describe("joinRoom", () => {
  it("creates a room and assigns X to first player", () => {
    const result = joinRoom("room1", "p1");
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.mark).toBe("X");
      expect(result.ok.state.status).toBe("waiting");
    }
  });

  it("assigns O to second player and starts game", () => {
    joinRoom("room1", "p1");
    const result = joinRoom("room1", "p2");
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.mark).toBe("O");
      expect(result.ok.state.status).toBe("playing");
    }
  });

  it("returns ROOM_FULL when third player tries to join", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = joinRoom("room1", "p3");
    expect(result).toEqual({ error: "ROOM_FULL", message: "Room is full" });
  });

  it("allows same player to rejoin", () => {
    joinRoom("room1", "p1");
    const result = joinRoom("room1", "p1");
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.mark).toBe("X");
    }
  });
});

describe("handleMove", () => {
  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = handleMove("unknown", "p1", 0);
    expect(result).toEqual({ error: "ROOM_NOT_FOUND", message: "Room not found" });
  });

  it("returns NOT_YOUR_TURN when player moves out of order", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = handleMove("room1", "p2", 0);
    expect(result).toEqual({ error: "NOT_YOUR_TURN", message: "Not your turn" });
  });

  it("accepts a valid move and updates state", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = handleMove("room1", "p1", 4);
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.board[4]).toBe("X");
      expect(result.ok.turn).toBe("O");
    }
  });

  it("returns INVALID_MOVE for occupied cell", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    handleMove("room1", "p1", 0);
    handleMove("room1", "p2", 3);
    const result = handleMove("room1", "p1", 0);
    expect(result).toEqual({ error: "INVALID_MOVE", message: "Cell is already occupied" });
  });
});

describe("handleRematch", () => {
  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = handleRematch("unknown");
    expect(result).toEqual({ error: "ROOM_NOT_FOUND", message: "Room not found" });
  });

  it("resets state for a full room", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    handleMove("room1", "p1", 0);
    const result = handleRematch("room1");
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.board).toEqual(Array(9).fill(null));
      expect(result.ok.status).toBe("playing");
      expect(result.ok.turn).toBe("X");
    }
  });
});

describe("removePlayer", () => {
  it("returns ROOM_NOT_FOUND for unknown room", () => {
    const result = removePlayer("unknown", "p1");
    expect(result).toEqual({ error: "ROOM_NOT_FOUND", message: "Room not found" });
  });

  it("removes player and keeps room if one player remains", () => {
    joinRoom("room1", "p1");
    joinRoom("room1", "p2");
    const result = removePlayer("room1", "p2");
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.empty).toBe(false);
    }
  });

  it("cleans up room when last player leaves", () => {
    joinRoom("room1", "p1");
    const result = removePlayer("room1", "p1");
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.ok.empty).toBe(true);
    }
  });
});
