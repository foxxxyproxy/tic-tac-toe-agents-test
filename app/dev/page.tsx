// SPEC.md: Phase 3 — DevPage with Board fixtures

import type { GameState } from "../../lib/types";
import { Board } from "../../components/Board";
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
      <h1 className={styles.dev__title}>Dev — Board Fixtures</h1>
      <div className={styles.dev__grid}>
        {fixtures.map((fixture) => (
          <section key={fixture.label} className={styles.dev__fixture}>
            <h2 className={styles["dev__fixture-label"]}>{fixture.label}</h2>
            <Board state={fixture.state} />
          </section>
        ))}
      </div>
    </main>
  );
}
