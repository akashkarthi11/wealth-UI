import type { ReactNode } from "react";

import styles from "./Field.module.css";

interface FieldProps {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  inputMode?: "email" | "text";
  icon: ReactNode;
  // Optional control at the right edge, for example show or hide password.
  trailing?: ReactNode;
  autoFocus?: boolean;
}

// One labelled input with a leading icon. Every form uses this, so inputs look and behave the same.
export default function Field({ id, label, type, value, onChange, autoComplete, inputMode, icon, trailing, autoFocus }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <span className={styles.icon}>{icon}</span>
        <input
          id={id}
          className={styles.input}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
      </div>
    </div>
  );
}
