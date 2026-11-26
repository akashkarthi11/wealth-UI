"use client";

import Link from "next/link";

import { ENDPOINTS, ROUTES } from "@/lib/constants";
import { formatDay, formatMoney, formatStamp, humanKey } from "@/lib/format";
import type { AccountDetail, AccountSplit } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import BalanceBadge from "./BalanceBadge";
import styles from "./AccountDetailPanel.module.css";
import Panel from "./Panel";
import Stack from "./Stack";
import StateMessage from "./StateMessage";

function SplitCard({ split, currency }: { split: AccountSplit; currency: string }) {
  const progress = split.goalAmount && split.estimatedBalance !== null ? Math.min(100, Math.round((split.estimatedBalance / split.goalAmount) * 100)) : null;
  return (
    <details className={styles.split}>
      <summary className={styles.splitSummary}>
        <span className={styles.main}>
          <b className={styles.name}>{split.name}</b>
          <small className={styles.meta}>{[split.purpose, split.goalAmount ? `Goal ${formatMoney(split.goalAmount, currency)}` : ""].filter(Boolean).join(" · ")}</small>
        </span>
        <span className={styles.amount}>
          <b>{formatMoney(split.estimatedBalance, currency)}</b>
          <BalanceBadge status={split.balanceStatus} />
        </span>
      </summary>
      {progress !== null ? (
        <div className={styles.bar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${split.name} goal`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {split.moves.length === 0 ? (
        <p className={styles.empty}>No money moved in or out yet.</p>
      ) : (
        <ul className={styles.rows}>
          {split.moves.slice(0, 8).map((move) => (
            <li key={`${move.occurredAt}-${move.amount}`}>
              <span>{formatStamp(move.occurredAt)}{move.note ? ` · ${move.note}` : ""}</span>
              <b>{formatMoney(move.amount, currency)}</b>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

// One account: its balance and status, fixed-deposit terms, balance history and the splits inside it.
export default function AccountDetailPanel({ accountId }: { accountId: string }) {
  const { data, loading, error, reload } = useApi<AccountDetail>(ENDPOINTS.accounts.detail, { id: accountId });

  if (loading && !data) return <StateMessage kind="loading" text="Loading the account…" />;
  if (error || !data) return <StateMessage kind="error" text={error || "The account could not be loaded."} onRetry={reload} />;

  const { account, balances, splits } = data;
  const isFixedDeposit = account.fdPrincipal !== null || account.fdMaturityOn !== null;
  return (
    <Stack>
      <Link href={ROUTES.banks} className={styles.back}>‹ All accounts</Link>
      <Panel
        title={account.accountName}
        hint={[account.bankName, account.maskedIdentifier ? `••${account.maskedIdentifier}` : "", account.currency].filter(Boolean).join(" · ")}
        aside={<BalanceBadge status={account.balanceStatus} />}
      >
        <p className={styles.balance}>{formatMoney(account.balance, account.currency)}</p>
        {account.balanceAsOf ? <p className={styles.meta}>As of {formatStamp(account.balanceAsOf)}</p> : <p className={styles.meta}>No balance recorded yet.</p>}
        {isFixedDeposit ? (
          <dl className={styles.terms}>
            <div><dt>Principal</dt><dd>{formatMoney(account.fdPrincipal, account.currency)}</dd></div>
            <div><dt>Booked on</dt><dd>{formatDay(account.fdBookedOn) || "—"}</dd></div>
            <div><dt>Matures on</dt><dd>{formatDay(account.fdMaturityOn) || "—"}</dd></div>
            <div><dt>Interest payout</dt><dd>{account.fdPayout ? humanKey(account.fdPayout) : "—"}</dd></div>
            <div><dt>Compounding</dt><dd>{account.fdCompounding ? humanKey(account.fdCompounding) : "—"}</dd></div>
          </dl>
        ) : null}
      </Panel>
      {splits.length > 0 ? (
        <Panel title="Splits" hint="Pots inside this account. They are part of its balance, not added to it.">
          <div className={styles.list}>
            {splits.map((split) => (
              <SplitCard key={split.id} split={split} currency={account.currency} />
            ))}
          </div>
        </Panel>
      ) : null}
      <Panel title="Balance history" hint="The latest saved balances, newest first.">
        {balances.length === 0 ? (
          <StateMessage kind="empty" text="No balances saved yet." />
        ) : (
          <ul className={styles.rows}>
            {balances.map((row) => (
              <li key={row.asOf}>
                <span>
                  {formatStamp(row.asOf)} <BalanceBadge status={row.status} />
                  {row.note ? <small className={styles.meta}> · {row.note}</small> : null}
                </span>
                <b>{formatMoney(row.balance, account.currency)}</b>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </Stack>
  );
}
