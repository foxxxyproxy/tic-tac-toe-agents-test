// SPEC.md: Phase 8 — Socket.IO event handlers
import type { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod/v4";
import { joinRoom, handleMove, handleRematch, removePlayer, isError } from "./rooms";

const joinSchema = z.object({
  roomId: z.string().min(1),
});

const moveSchema = z.object({
  roomId: z.string().min(1),
  index: z.number().int().min(0).max(8),
});

const rematchSchema = z.object({
  roomId: z.string().min(1),
});

export function registerSocketHandlers(io: SocketIOServer): void {
  io.on("connection", (socket: Socket) => {
    let currentRoomId: string | null = null;

    socket.on("join", (data: unknown) => {
      const parsed = joinSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit("error_msg", { code: "ROOM_NOT_FOUND", message: "Invalid join payload" });
        return;
      }

      const { roomId } = parsed.data;
      const result = joinRoom(roomId, socket.id);

      if (isError(result)) {
        socket.emit("error_msg", { code: result.error, message: result.message });
        return;
      }

      currentRoomId = roomId;
      socket.join(roomId);
      socket.emit("assigned", { mark: result.mark, playerId: socket.id });
      io.to(roomId).emit("state", result.room.state);
    });

    socket.on("move", (data: unknown) => {
      const parsed = moveSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit("error_msg", { code: "INVALID_MOVE", message: "Invalid move payload" });
        return;
      }

      const { roomId, index } = parsed.data;
      const result = handleMove(roomId, socket.id, index);

      if (isError(result)) {
        socket.emit("error_msg", { code: result.error, message: result.message });
        return;
      }

      io.to(roomId).emit("state", result);
    });

    socket.on("rematch", (data: unknown) => {
      const parsed = rematchSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit("error_msg", { code: "ROOM_NOT_FOUND", message: "Invalid rematch payload" });
        return;
      }

      const { roomId } = parsed.data;
      const result = handleRematch(roomId);

      if (isError(result)) {
        socket.emit("error_msg", { code: result.error, message: result.message });
        return;
      }

      io.to(roomId).emit("state", result);
    });

    socket.on("disconnect", () => {
      if (currentRoomId) {
        const result = removePlayer(currentRoomId, socket.id);
        if (!isError(result)) {
          socket.to(currentRoomId).emit("opponent_left");
        }
      }
    });
  });
}
