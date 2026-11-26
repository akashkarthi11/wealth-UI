"use client";

import { useState, type ClipboardEvent, type ReactNode } from "react";

import styles from "./Field.module.css";
import { EyeIcon, EyeOffIcon } from "./icons";

interface FieldProps {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  inputMode?: "email" | "text";
  icon: ReactNode;
  autoFocus?: boolean;
  // Small text under the input, for a rule the user should know before typing.
  help?: string;
  // Called with the pasted text before it is typed into the box.
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
}

// One labelled input with a leading icon. Every form uses this, so inputs look and behave the same.
// A password field gets the show / hide button here, so no screen builds its own.
export default function Field({ id, label, type, value, onChange, autoComplete, inputMode, icon, autoFocus, help, onPaste }: FieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <span className={styles.icon}>{icon}</span>
        <input
          id={id}
          className={styles.input}
          type={isPassword && revealed ? "text" : type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          onPaste={onPaste}
          aria-describedby={help ? `${id}-help` : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {isPassword ? (
          <span className={styles.trailing}>
            <button
              className={styles.reveal}
              type="button"
              onClick={() => setRevealed((shown) => !shown)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </span>
        ) : null}
      </div>
      {help ? <p id={`${id}-help`} className={styles.help}>{help}</p> : null}
    </div>
  );
}
