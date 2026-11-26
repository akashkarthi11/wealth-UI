"use client";

import { useState } from "react";

import { apiGet } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { HealthReport } from "@/lib/types";

import { PulseIcon } from "./icons";
import styles from "./HealthCheck.module.css";

type Level = "up" | "down" | "unknown";
type State =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "failed"; message: string }
  | { phase: "done"; report: HealthReport; at: string };

const LEVEL_TEXT: Record<Level, string> = { up: "Up", down: "Down", unknown: "Not reported" };

function level(value: string | null, reachable: boolean): Level {
  if (!reachable || !value || value === "UNKNOWN") return "unknown";
  return value === "UP" ? "up" : "down";
}

function summary(levels: Level[]): { tone: Level; text: string } {
  if (levels.every((l) => l === "up")) return { tone: "up", text: "All systems operational" };
  if (levels.some((l) => l === "down")) return { tone: "down", text: "Something is down" };
  return { tone: "unknown", text: "Some status is not reported" };
}

// A "System status" panel: one button asks our /api/health route, which asks the BFF health API.
export default function HealthCheck() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const busy = state.phase === "checking";

  async function check() {
    setState({ phase: "checking" });
    const result = await apiGet<HealthReport>(ENDPOINTS.health);
    if (!result.ok || !result.data) {
      setState({ phase: "failed", message: result.error });
      return;
    }
    setState({ phase: "done", report: result.data, at: new Date().toLocaleTimeString() });
  }

  const report = state.phase === "done" && state.report.configured ? state.report : null;
  const checkedAt = state.phase === "done" ? state.at : "";
  const rows = report
    ? [
        { label: "BFF", tone: level(report.status, report.reachable) },
        { label: "BSS", tone: level(report.bss, report.reachable) },
        { label: "Database", tone: level(report.db, report.reachable) },
        { label: "Redis", tone: level(report.redis, report.reachable) },
      ]
    : [];
  const overall = summary(rows.map((row) => row.tone));

  return (
    <section className={styles.box} aria-labelledby="status-heading">
      <div className={styles.head}>
        <span className={styles.headIcon}><PulseIcon /></span>
        <div className={styles.headText}>
          <h2 id="status-heading" className={styles.title}>System status</h2>
          <p className={styles.hint}>Check that the services behind this app are running.</p>
        </div>
      </div>

      <button className={styles.button} type="button" onClick={check} disabled={busy} data-health-button>
        {busy ? <span className={styles.spinner} aria-hidden="true" /> : null}
        {busy ? "Checking…" : state.phase === "idle" ? "Check health" : "Check again"}
      </button>

      <div aria-live="polite">
        {state.phase === "failed" ? <p className={styles.error}>{state.message}</p> : null}
        {state.phase === "done" && !state.report.configured ? (
          <p className={styles.note}>The BFF address is not set on the server.</p>
        ) : null}
        {report ? (
          <div className={styles.result}>
            <p className={`${styles.summary} ${styles[overall.tone]}`}>
              <span className={styles.summaryDot} aria-hidden="true" />
              {overall.text}
            </p>
            <ul className={styles.grid}>
              {rows.map((row) => (
                <li key={row.label} className={styles.chip}>
                  <span className={`${styles.dot} ${styles[row.tone]}`} aria-hidden="true" />
                  <span className={styles.chipLabel}>{row.label}</span>
                  <span className={`${styles.chipState} ${styles[row.tone]}`}>{LEVEL_TEXT[row.tone]}</span>
                </li>
              ))}
            </ul>
            <p className={styles.time}>Checked at {checkedAt}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
