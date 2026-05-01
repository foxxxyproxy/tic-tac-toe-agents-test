// SPEC.md: Phase 4 — Lobby component (interactive from Phase 5)
"use client";

import { useState } from "react";
import styles from "./Lobby.module.css";

type LobbyProps = {
  roomCode?: string;
  onCreateRoom?: () => void;
  onJoinRoom?: (code: string) => void;
  error?: string;
};

export function Lobby({ roomCode, onCreateRoom, onJoinRoom, error }: LobbyProps) {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className={styles.lobby}>
      <h2 className={styles.lobby__title}>Tic-Tac-Toe</h2>

      <div className={styles.lobby__form}>
        <button type="button" className={[styles.lobby__button, styles["lobby__button--primary"]].join(" ")} onClick={onCreateRoom}>
          Create room
        </button>
      </div>

      <div className={styles.lobby__form}>
        <input
          type="text"
          className={styles.lobby__input}
          placeholder="Room code"
          aria-label="Room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button type="button" className={styles.lobby__button} onClick={() => onJoinRoom?.(joinCode)}>
          Join
        </button>
      </div>

      {error && (
        <p className={styles.lobby__error} role="alert">{error}</p>
      )}

      {roomCode && (
        <div className={styles["lobby__room-code"]}>
          <span>Your room code: <strong>{roomCode}</strong></span>
          <button type="button" className={styles.lobby__button}>
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
