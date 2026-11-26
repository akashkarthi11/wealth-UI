"use client";

import { FormEvent, useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS, PASSWORD_MIN_LENGTH } from "@/lib/constants";

import Field from "./Field";
import { LockIcon, MailIcon } from "./icons";
import Panel from "./Panel";
import styles from "./PasswordResetPanel.module.css";

// Admin sets a new password for an account. The BSS signs that account out everywhere.
export default function PasswordResetPanel() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await apiPost(ENDPOINTS.users.passwordReset, { email, newPassword });
    setBusy(false);
    if (result.ok) {
      setNewPassword("");
      setMessage({ ok: true, text: "Password reset. Every older session of that account was signed out." });
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  return (
    <Panel title="Reset a password" hint={`Sets a new password for an account. It must be at least ${PASSWORD_MIN_LENGTH} characters.`}>
      <form onSubmit={submit} noValidate className={styles.form}>
        <Field id="reset-email" label="Account email" type="email" inputMode="email" autoComplete="off" icon={<MailIcon />} value={email} onChange={setEmail} />
        <Field id="reset-password" label="New password" type="password" autoComplete="new-password" icon={<LockIcon />} value={newPassword} onChange={setNewPassword} />
        {message ? <p className={message.ok ? styles.ok : styles.error} role="status">{message.text}</p> : null}
        <button className={styles.button} type="submit" disabled={busy}>{busy ? "Resetting…" : "Reset password"}</button>
      </form>
    </Panel>
  );
}
