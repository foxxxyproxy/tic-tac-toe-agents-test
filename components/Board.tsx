// SPEC.md: Phase 3 — Board component (interactive from Phase 5)
"use client";

import type { GameState, Mark } from "../lib/types";
import { Cell } from "./Cell";
import styles from "./Board.module.css";

type BoardProps = {
  state: GameState;
  mark?: Mark | null;
  onMove?: (index: number) => void;
};

export function Board({ state, mark, onMove }: BoardProps) {
  const winningSet = new Set(state.winningLine ?? []);
  const gameOver = state.status !== "playing";
  const isMyTurn = mark != null && state.turn === mark;

  return (
    <div className={styles.board} role="group" aria-label="Tic-tac-toe board">
      {state.board.map((value, index) => {
        const occupied = value !== null;
        const disabled = !onMove || gameOver || !isMyTurn || occupied;

        return (
          <Cell
            key={index}
            value={value}
            index={index}
            isWinning={winningSet.has(index)}
            disabled={disabled}
            onClick={onMove ? () => onMove(index) : undefined}
          />
        );
      })}
    </div>
  );
}
