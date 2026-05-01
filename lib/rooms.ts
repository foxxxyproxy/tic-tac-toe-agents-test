// SPEC.md: Phase 7 — room manager
import { applyMove, createEmptyState } from "./game";
import type { ErrorCode, GameState, Mark } from "./types";

type Player = {
  id: string;
  mark: Mark;
};

export type Room = {
  id: string;
  players: Player[];
  state: GameState;
};

type RoomError = { error: ErrorCode; message: string };
type RoomResult<T> = T | RoomError;

export function isError(result: RoomResult<unknown>): result is RoomError {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    "message" in result
  );
}

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(
  roomId: string,
  playerId: string,
): RoomResult<{ room: Room; mark: Mark }> {
  let room = rooms.get(roomId);

  if (!room) {
    room = {
      id: roomId,
      players: [],
      state: createEmptyState(),
    };
    rooms.set(roomId, room);
  }

  const existing = room.players.find((p) => p.id === playerId);
  if (existing) {
    return { room, mark: existing.mark };
  }

  if (room.players.length >= 2) {
    return { error: "ROOM_FULL", message: "Room is full" };
  }

  const mark: Mark = room.players.length === 0 ? "X" : "O";
  room.players.push({ id: playerId, mark });

  if (room.players.length === 2) {
    room.state = { ...room.state, status: "playing" };
  }

  return { room, mark };
}

export function handleMove(
  roomId: string,
  playerId: string,
  index: number,
): RoomResult<GameState> {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "ROOM_NOT_FOUND", message: "Room not found" };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { error: "ROOM_NOT_FOUND", message: "Player not in room" };
  }

  if (player.mark !== room.state.turn) {
    return { error: "NOT_YOUR_TURN", message: "Not your turn" };
  }

  const result = applyMove(room.state, index, player.mark);
  if ("error" in result) {
    return { error: "INVALID_MOVE", message: result.error };
  }

  room.state = result;
  return result;
}

export function handleRematch(
  roomId: string,
): RoomResult<GameState> {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "ROOM_NOT_FOUND", message: "Room not found" };
  }

  room.state = { ...createEmptyState(), status: room.players.length === 2 ? "playing" : "waiting" };
  return room.state;
}

export function removePlayer(
  roomId: string,
  playerId: string,
): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
  }
}

export function clearAllRooms(): void {
  rooms.clear();
}
