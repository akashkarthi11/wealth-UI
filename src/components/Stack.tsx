import type { ReactNode } from "react";

import styles from "./Stack.module.css";

// Sections of a screen, one under the other with the same gap everywhere.
export default function Stack({ children }: { children: ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}
