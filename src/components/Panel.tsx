import type { ReactNode } from "react";

import styles from "./Panel.module.css";

interface PanelProps {
  title: string;
  hint?: string;
  // Content at the right of the heading (a count, a badge, an action).
  aside?: ReactNode;
  children?: ReactNode;
}

// The one card every screen section uses: a heading, an optional hint, then the content.
export default function Panel({ title, hint, aside, children }: PanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 className={styles.title}>{title}</h2>
          {hint ? <p className={styles.hint}>{hint}</p> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}
