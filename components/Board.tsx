// SPEC.md: Phase 3 — Board component (static)

import type { GameState } from "../lib/types";
import { Cell } from "./Cell";
import styles from "./Board.module.css";

type BoardProps = {
  state: GameState;
};

export function Board({ state }: BoardProps) {
  const winningSet = new Set(state.winningLine ?? []);

  return (
    <div className={styles.board} role="group" aria-label="Tic-tac-toe board">
      {state.board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          isWinning={winningSet.has(index)}
        />
      ))}
    </div>
  );
}
