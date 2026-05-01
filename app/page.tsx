// SPEC.md: Phase 5 — Interactive main screen with lobby/game switching
"use client";

import { useState } from "react";
import { Lobby } from "../components/Lobby";
import { Board } from "../components/Board";
import { StatusBar } from "../components/StatusBar";
import { useMockGame } from "../hooks/useMockGame";
import styles from "./page.module.css";

function Game({ roomId }: { roomId: string }) {
  const { state, mark, sendMove } = useMockGame(roomId);

  if (!state) return null;

  return (
    <div className={styles.page__game}>
      <StatusBar state={state} mark={mark} />
      <Board state={state} mark={mark} onMove={sendMove} />
    </div>
  );
}

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);

  return (
    <main className={styles.page}>
      <h1 className={styles.page__title}>Tic-tac-toe</h1>
      {roomId ? (
        <Game roomId={roomId} />
      ) : (
        <Lobby onCreateRoom={() => setRoomId("mock-room")} />
      )}
    </main>
  );
}
