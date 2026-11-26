import styles from "./StateMessage.module.css";

interface StateMessageProps {
  kind: "loading" | "empty" | "error";
  text: string;
  // Shown on an error: asks the screen to load again.
  onRetry?: () => void;
}

// The loading, empty and error states of every screen, in one place.
export default function StateMessage({ kind, text, onRetry }: StateMessageProps) {
  return (
    <div className={`${styles.box} ${styles[kind]}`} role={kind === "error" ? "alert" : "status"}>
      {kind === "loading" ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span>{text}</span>
      {kind === "error" && onRetry ? (
        <button className={styles.retry} type="button" onClick={onRetry}>Try again</button>
      ) : null}
    </div>
  );
}
