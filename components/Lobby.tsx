// SPEC.md: Phase 4 — Lobby component (static)

import styles from "./Lobby.module.css";

type LobbyProps = {
  roomCode?: string;
};

export function Lobby({ roomCode }: LobbyProps) {
  return (
    <div className={styles.lobby}>
      <h2 className={styles.lobby__title}>Tic-Tac-Toe</h2>

      <div className={styles.lobby__form}>
        <button type="button" className={[styles.lobby__button, styles["lobby__button--primary"]].join(" ")}>
          Create room
        </button>
      </div>

      <div className={styles.lobby__form}>
        <input
          type="text"
          className={styles.lobby__input}
          placeholder="Room code"
          aria-label="Room code"
        />
        <button type="button" className={styles.lobby__button}>
          Join
        </button>
      </div>

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
