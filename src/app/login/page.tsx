"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import Field from "@/components/Field";
import HealthCheck from "@/components/HealthCheck";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";
import { apiPost } from "@/lib/api";
import { ENDPOINTS, ROUTES } from "@/lib/constants";

import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await apiPost(ENDPOINTS.auth.login, { email, password });
    setBusy(false);
    if (result.ok) {
      router.replace(ROUTES.overview);
      router.refresh();
      return;
    }
    setError(result.error);
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

        <h1 id="login-heading" className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to open your accounts, balances and interest.</p>

        <form onSubmit={submit} noValidate>
          <Field
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="username"
            icon={<MailIcon />}
            value={email}
            onChange={setEmail}
            autoFocus
          />
          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            icon={<LockIcon />}
            value={password}
            onChange={setPassword}
            trailing={
              <button
                className={styles.reveal}
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
          {error ? (
            <p className={styles.error} role="alert">
              <AlertIcon />
              <span>{error}</span>
            </p>
          ) : null}
          <button className={styles.button} type="submit" disabled={busy}>
            {busy ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <HealthCheck />
      </section>
    </main>
  );
}
