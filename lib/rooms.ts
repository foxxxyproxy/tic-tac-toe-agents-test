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

type Success<T> = { ok: true } & T;
type Failure = { ok: false; code: ErrorCode; message: string };
type Result<T> = Success<T> | Failure;

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(
  roomId: string,
  playerId: string,
): Result<{ mark: Mark; state: GameState }> {
  let room = rooms.get(roomId);

  if (!room) {
    const state = createEmptyState();
    room = { players: [{ id: playerId, mark: "X" }], state };
    rooms.set(roomId, room);
    return { ok: true, mark: "X", state: room.state };
  }

  if (room.players.length >= 2) {
    return { ok: false, code: "ROOM_FULL", message: "Room is full" };
  }

  room.players.push({ id: playerId, mark: "O" });
  room.state = { ...room.state, status: "playing" };
  return { ok: true, mark: "O", state: room.state };
}

export function handleMove(
  roomId: string,
  playerId: string,
  index: number,
): Result<{ state: GameState }> {
  const room = rooms.get(roomId);
  if (!room) {
    return { ok: false, code: "ROOM_NOT_FOUND", message: "Room not found" };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { ok: false, code: "ROOM_NOT_FOUND", message: "Player not in room" };
  }

  if (player.mark !== room.state.turn) {
    return { ok: false, code: "NOT_YOUR_TURN", message: "Not your turn" };
  }

  const result = applyMove(room.state, index, player.mark);
  if ("error" in result) {
    return { ok: false, code: "INVALID_MOVE", message: result.error };
  }

  room.state = result;
  return { ok: true, state: room.state };
}

export function handleRematch(
  roomId: string,
): Result<{ state: GameState }> {
  const room = rooms.get(roomId);
  if (!room) {
    return { ok: false, code: "ROOM_NOT_FOUND", message: "Room not found" };
  }

  room.state = { ...createEmptyState(), status: "playing" };
  return { ok: true, state: room.state };
}

export function removePlayer(
  roomId: string,
  playerId: string,
): { removed: boolean; roomEmpty: boolean } {
  const room = rooms.get(roomId);
  if (!room) {
    return { removed: false, roomEmpty: true };
  }

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return { removed: true, roomEmpty: true };
  }

  return { removed: true, roomEmpty: false };
}

export function clearAllRooms(): void {
  rooms.clear();
}
