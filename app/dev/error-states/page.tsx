// SPEC.md: Phase 6 — Error states dev page for visual + a11y testing
"use client";

import { useState } from "react";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { Board } from "../../../components/Board";
import { StatusBar } from "../../../components/StatusBar";
import { Lobby } from "../../../components/Lobby";
import type { GameState } from "../../../lib/types";
import styles from "./page.module.css";

const midGameState: GameState = {
  board: ["X", null, "O", null, "X", null, null, null, null],
  turn: "O",
  status: "playing",
  winningLine: null,
};

export default function ErrorStatesPage() {
  const [showOpponentLeft, setShowOpponentLeft] = useState(true);

  return (
    <main className={styles.dev}>
      <h1 className={styles.dev__title}>Dev — Error States</h1>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>ErrorBanner</h2>
        <div className={styles.dev__grid}>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Default</h3>
            <ErrorBanner message="Something went wrong. Please try again." />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Severe</h3>
            <ErrorBanner message="Connection lost. Please refresh the page." severe />
          </section>
        </div>
      </section>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>Opponent Left</h2>
        <div className={styles.dev__grid}>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>
              Opponent left during game
            </h3>
            <button
              type="button"
              className={styles.dev__toggle}
              onClick={() => setShowOpponentLeft((v) => !v)}
            >
              {showOpponentLeft ? "Hide" : "Show"}
            </button>
            {showOpponentLeft && (
              <div className={styles.dev__demo}>
                <ErrorBanner message="Your opponent has left the game" />
                <StatusBar state={midGameState} mark="X" />
                <Board state={midGameState} />
              </div>
            )}
          </section>
        </div>
      </section>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>Room Full</h2>
        <div className={styles.dev__grid}>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Room is full</h3>
            <ErrorBanner message="This room is full. Please try another room." severe />
          </section>
        </div>
      </section>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>Invalid Room Code</h2>
        <div className={styles.dev__grid}>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Lobby with error</h3>
            <Lobby error="Room not found. Check your code and try again." />
          </section>
        </div>
      </section>
    </main>
  );
}
