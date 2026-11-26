import type { BalanceStatus } from "@/lib/types";

import styles from "./BalanceBadge.module.css";

const LABELS: Record<string, string> = {
  verified: "Verified",
  reported: "Reported",
  estimated: "Estimate",
  stale: "Stale",
  unknown: "Not recorded",
  pending_reconciliation: "Waiting",
};

// The status of a money value, so an estimate is never read as a verified figure.
export default function BalanceBadge({ status }: { status: BalanceStatus | null | undefined }) {
  const key = status ?? "unknown";
  return <span className={`${styles.badge} ${styles[key] ?? styles.unknown}`}>{LABELS[key] ?? key}</span>;
}
