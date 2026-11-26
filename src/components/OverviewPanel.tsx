"use client";

import Link from "next/link";

import { bankRoute, ENDPOINTS, ROUTES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { Account, AccountsOverview } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import BalanceBadge from "./BalanceBadge";
import styles from "./OverviewPanel.module.css";
import Panel from "./Panel";
import Stack from "./Stack";
import StateMessage from "./StateMessage";
import TotalsHero from "./TotalsHero";

const ATTENTION_LIMIT = 5;
// A reported balance (from a screenshot or statement) is normal; these are the ones worth a look.
const needsAttention = (account: Account) =>
  account.balance === null || account.balanceStatus === "estimated" || account.balanceStatus === "stale" || account.balanceStatus === "unknown";

// The first Overview: the user's totals and where the money sits. It grows as the transactions, investments and interest modules land.
export default function OverviewPanel({ name }: { name: string }) {
  const { data, loading, error, reload } = useApi<AccountsOverview>(ENDPOINTS.accounts.list);

  if (loading && !data) return <StateMessage kind="loading" text="Loading your overview…" />;
  if (error || !data) return <StateMessage kind="error" text={error || "The overview could not be loaded."} onRetry={reload} />;

  const accounts = data.banks.flatMap((bank) => bank.accounts);
  const attention = accounts.filter(needsAttention);
  return (
    <Stack>
      <header className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {name}</h1>
        <p className={styles.sub}>Here is where your money stands.</p>
      </header>
      <TotalsHero totals={data.totals} />
      {data.banks.length === 0 ? (
        <StateMessage kind="empty" text="No accounts yet. They appear here once they are added." />
      ) : (
        <Panel
          title="Your banks"
          hint={`${accounts.length} ${accounts.length === 1 ? "account" : "accounts"} in ${data.banks.length} ${data.banks.length === 1 ? "bank" : "banks"}`}
          aside={<Link href={ROUTES.banks} className={styles.more}>See all ›</Link>}
        >
          <ul className={styles.rows}>
            {data.banks.map((bank) => (
              <li key={bank.name}>
                <Link href={ROUTES.banks} className={styles.row}>
                  <span className={styles.main}>
                    <b>{bank.name}</b>
                    <small>{bank.accounts.length} {bank.accounts.length === 1 ? "account" : "accounts"}</small>
                  </span>
                  <b className={styles.amount}>{formatMoney(bank.totals.netWorth)}</b>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {attention.length > 0 ? (
        <Panel title="Worth a look" hint="These balances are missing, estimated or out of date.">
          <ul className={styles.rows}>
            {attention.slice(0, ATTENTION_LIMIT).map((account) => (
              <li key={account.id}>
                <Link href={bankRoute(account.id)} className={styles.row}>
                  <span className={styles.main}>
                    <b>{account.accountName}</b>
                    <small>{account.bankName}</small>
                  </span>
                  <BalanceBadge status={account.balanceStatus} />
                </Link>
              </li>
            ))}
          </ul>
          {attention.length > ATTENTION_LIMIT ? <p className={styles.rest}>and {attention.length - ATTENTION_LIMIT} more</p> : null}
        </Panel>
      ) : null}
    </Stack>
  );
}
