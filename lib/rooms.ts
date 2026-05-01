// SPEC.md: Phase 7 — room manager

import type { ErrorCode, GameState, Mark } from "./types";
import { applyMove, createEmptyState } from "./game";

type Player = {
  id: string;
  mark: Mark;
};

export type Room = {
  players: Player[];
  state: GameState;
};

type RoomResult<T> = { ok: T } | { error: ErrorCode; message: string };

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(
  roomId: string,
  playerId: string,
): RoomResult<{ mark: Mark; state: GameState }> {
  let room = rooms.get(roomId);

  if (!room) {
    room = { players: [], state: createEmptyState() };
    rooms.set(roomId, room);
  }

  // Already in the room — rejoin
  const existing = room.players.find((p) => p.id === playerId);
  if (existing) {
    return { ok: { mark: existing.mark, state: room.state } };
  }

  if (room.players.length >= 2) {
    return { error: "ROOM_FULL", message: "Room is full" };
  }

  const mark: Mark = room.players.length === 0 ? "X" : "O";
  room.players.push({ id: playerId, mark });

  if (room.players.length === 2) {
    room.state = { ...room.state, status: "playing" };
  }

  return { ok: { mark, state: room.state } };
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
  return { ok: room.state };
}

export function handleRematch(
  roomId: string,
): RoomResult<GameState> {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "ROOM_NOT_FOUND", message: "Room not found" };
  }

  room.state = {
    ...createEmptyState(),
    status: room.players.length === 2 ? "playing" : "waiting",
  };

  return { ok: room.state };
}

export function removePlayer(
  roomId: string,
  playerId: string,
): RoomResult<{ empty: boolean }> {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "ROOM_NOT_FOUND", message: "Room not found" };
  }

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return { ok: { empty: true } };
  }

  return { ok: { empty: false } };
}

/** For testing — clears all rooms */
export function clearRooms(): void {
  rooms.clear();
}
