// SPEC.md: Phase 4 — DevPage with Board, StatusBar, and Lobby fixtures

import type { GameState } from "../../lib/types";
import { Board } from "../../components/Board";
import { StatusBar } from "../../components/StatusBar";
import { Lobby } from "../../components/Lobby";
import styles from "./page.module.css";

const fixtures: { label: string; state: GameState }[] = [
  {
    label: "Empty board (waiting)",
    state: {
      board: [null, null, null, null, null, null, null, null, null],
      turn: "X",
      status: "waiting",
      winningLine: null,
    },
  },
  {
    label: "Mid-game (playing)",
    state: {
      board: ["X", null, "O", null, "X", null, null, null, null],
      turn: "O",
      status: "playing",
      winningLine: null,
    },
  },
  {
    label: "X wins — row [0,1,2]",
    state: {
      board: ["X", "X", "X", "O", "O", null, null, null, null],
      turn: "O",
      status: "won_X",
      winningLine: [0, 1, 2],
    },
  },
  {
    label: "O wins — diagonal [0,4,8]",
    state: {
      board: ["O", "X", "X", null, "O", null, "X", null, "O"],
      turn: "X",
      status: "won_O",
      winningLine: [0, 4, 8],
    },
  },
  {
    label: "X wins — column [0,3,6]",
    state: {
      board: ["X", "O", null, "X", "O", null, "X", null, null],
      turn: "O",
      status: "won_X",
      winningLine: [0, 3, 6],
    },
  },
  {
    label: "Draw",
    state: {
      board: ["X", "O", "X", "X", "O", "O", "O", "X", "X"],
      turn: "X",
      status: "draw",
      winningLine: null,
    },
  },
];

export default function DevPage() {
  return (
    <main className={styles.dev}>
      <h1 className={styles.dev__title}>Dev — Component Fixtures</h1>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>Board</h2>
        <div className={styles.dev__grid}>
          {fixtures.map((fixture) => (
            <section key={fixture.label} className={styles.dev__fixture}>
              <h3 className={styles["dev__fixture-label"]}>{fixture.label}</h3>
              <Board state={fixture.state} />
            </section>
          ))}
        </div>
      </section>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>StatusBar</h2>
        <div className={styles.dev__grid}>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Waiting (as X)</h3>
            <StatusBar state={fixtures[0].state} mark="X" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>My turn (as O)</h3>
            <StatusBar state={fixtures[1].state} mark="O" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Opponent&apos;s turn (as X)</h3>
            <StatusBar state={fixtures[1].state} mark="X" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>X wins (as X — You win)</h3>
            <StatusBar state={fixtures[2].state} mark="X" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>X wins (as O)</h3>
            <StatusBar state={fixtures[2].state} mark="O" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>O wins (as O — You win)</h3>
            <StatusBar state={fixtures[3].state} mark="O" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>O wins (as X)</h3>
            <StatusBar state={fixtures[3].state} mark="X" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Draw</h3>
            <StatusBar state={fixtures[5].state} mark="X" />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>No mark (spectator)</h3>
            <StatusBar state={fixtures[1].state} mark={null} />
          </section>
        </div>
      </section>

      <section className={styles.dev__section}>
        <h2 className={styles.dev__subtitle}>Lobby</h2>
        <div className={styles.dev__grid}>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>Initial (no room code)</h3>
            <Lobby />
          </section>
          <section className={styles.dev__fixture}>
            <h3 className={styles["dev__fixture-label"]}>With room code</h3>
            <Lobby roomCode="A3X7" />
          </section>
        </div>
      </section>
    </main>
  );
}
