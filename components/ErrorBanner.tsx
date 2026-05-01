// SPEC.md: Phase 6 — ErrorBanner component for error states
import styles from "./ErrorBanner.module.css";

type ErrorBannerProps = {
  message: string;
  severe?: boolean;
};

export function ErrorBanner({ message, severe }: ErrorBannerProps) {
  const className = [
    styles["error-banner"],
    severe && styles["error-banner--severe"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} role="alert">
      <span className={styles["error-banner__icon"]} aria-hidden="true">
        &#x26A0;
      </span>
      <span className={styles["error-banner__message"]}>{message}</span>
    </div>
  );
}
