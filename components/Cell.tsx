// SPEC.md: Phase 3 — Cell component (static)

import type { Cell as CellType } from "../lib/types";
import styles from "./Cell.module.css";

type CellProps = {
  value: CellType;
  index: number;
  isWinning: boolean;
};

export function Cell({ value, index, isWinning }: CellProps) {
  const cellNumber = index + 1;

  let ariaLabel = `Cell ${cellNumber}, `;
  if (value === null) {
    ariaLabel += "empty";
  } else {
    ariaLabel += value;
  }
  if (isWinning) {
    ariaLabel += ", winning line";
  }

  const className = [
    styles.cell,
    value === "X" && styles["cell--x"],
    value === "O" && styles["cell--o"],
    value === null && styles["cell--empty"],
    isWinning && styles["cell--winning"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={className} aria-label={ariaLabel}>
      {value ?? ""}
    </button>
  );
}
