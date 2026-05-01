// SPEC.md: Phase 4 — StatusBar component (static)

import type { GameState, Mark } from "../lib/types";
import styles from "./StatusBar.module.css";

type StatusBarProps = {
  state: GameState;
  mark: Mark | null;
};

function getMessage(state: GameState, mark: Mark | null): { text: string; modifier: string } {
  switch (state.status) {
    case "waiting":
      return { text: "Waiting for opponent", modifier: "" };
    case "playing":
      return state.turn === mark
        ? { text: "Your turn", modifier: "my-turn" }
        : { text: "Opponent's turn", modifier: "" };
    case "won_X":
      return mark === "X"
        ? { text: "You win!", modifier: "win" }
        : { text: "X wins", modifier: "" };
    case "won_O":
      return mark === "O"
        ? { text: "You win!", modifier: "win" }
        : { text: "O wins", modifier: "" };
    case "draw":
      return { text: "Draw", modifier: "draw" };
  }
}

export function StatusBar({ state, mark }: StatusBarProps) {
  const { text, modifier } = getMessage(state, mark);

  const className = [
    styles["status-bar__text"],
    modifier && styles[`status-bar__text--${modifier}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles["status-bar"]} role="status" aria-live="polite">
      <span className={className}>{text}</span>
    </div>
  );
}
