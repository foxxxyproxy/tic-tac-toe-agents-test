// SPEC.md: Phase 5 — Interactive main screen with lobby/game switching
"use client";

import { useState } from "react";
import { Lobby } from "../components/Lobby";
import { Board } from "../components/Board";
import { StatusBar } from "../components/StatusBar";
import { ErrorBanner } from "../components/ErrorBanner";
import { useMockGame } from "../hooks/useMockGame";
import styles from "./page.module.css";

function Game({ roomId, onBackToLobby }: { roomId: string; onBackToLobby: () => void }) {
  const { state, mark, sendMove, sendRematch, error, opponentLeft } = useMockGame(roomId);

  if (error && (error.code === "ROOM_FULL" || error.code === "ROOM_NOT_FOUND")) {
    return (
      <div className={styles.page__game}>
        <ErrorBanner message={error.message} severe />
        <button type="button" className={styles.page__button} onClick={onBackToLobby}>
          Back to lobby
        </button>
      </div>
    );
  }

  if (!state) return null;

  const isGameOver = state.status === "won_X" || state.status === "won_O" || state.status === "draw";

  return (
    <div className={styles.page__game}>
      {opponentLeft && <ErrorBanner message="Your opponent has left the game" />}
      {error && <ErrorBanner message={error.message} />}
      <StatusBar state={state} mark={mark} />
      <Board state={state} mark={mark} onMove={sendMove} />
      {isGameOver && !opponentLeft && (
        <button type="button" className={styles.page__button} onClick={sendRematch}>
          Play again
        </button>
      )}
      {opponentLeft && (
        <button type="button" className={styles.page__button} onClick={onBackToLobby}>
          Back to lobby
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [lobbyError, setLobbyError] = useState<string | null>(null);

  const handleJoinRoom = (code: string) => {
    if (!code.trim()) {
      setLobbyError("Please enter a room code");
      return;
    }
    setLobbyError(null);
    setRoomId(code);
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.page__title}>Tic-tac-toe</h1>
      {roomId ? (
        <Game roomId={roomId} onBackToLobby={() => setRoomId(null)} />
      ) : (
        <Lobby
          onCreateRoom={() => setRoomId("mock-room")}
          onJoinRoom={handleJoinRoom}
          error={lobbyError ?? undefined}
        />
      )}
    </main>
  );
}
