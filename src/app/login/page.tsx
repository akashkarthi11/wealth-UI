"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        router.replace("/overview");
        router.refresh();
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Sign-in failed. Please try again.");
    } catch {
      setError("The service is not reachable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <section className={styles.card} aria-labelledby="login-heading">
        <div className={styles.brand}>
          <div className={styles.mark} aria-hidden="true">K</div>
          <div>
            <p className={styles.title}>Karthi Portfolio</p>
            <p className={styles.kicker}>Your private wealth ledger</p>
          </div>
        </div>
        <h1 id="login-heading" className={styles.heading}>Sign in</h1>
        <form onSubmit={submit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button className={styles.button} type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
