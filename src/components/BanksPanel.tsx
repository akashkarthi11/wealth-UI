"use client";

import Link from "next/link";

import { bankRoute, ENDPOINTS } from "@/lib/constants";
import { formatMoney, formatStamp } from "@/lib/format";
import type { Account, AccountsOverview } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import BalanceBadge from "./BalanceBadge";
import styles from "./BanksPanel.module.css";
import Panel from "./Panel";
import Stack from "./Stack";
import StateMessage from "./StateMessage";
import TotalsHero from "./TotalsHero";
import FinvuConnectPanel from "./FinvuConnectPanel";

const CATEGORY_LABELS: Record<string, string> = { CASA: "Cash and deposits", INVESTMENT: "Investment", LIABILITY: "Amount owed" };

function AccountCard({ account }: { account: Account }) {
  const owed = account.category === "LIABILITY";
  return (
    <Link href={bankRoute(account.id)} className={styles.card}>
      <span className={styles.main}>
        <b className={styles.name}>{account.accountName}</b>
        <small className={styles.meta}>
          {[CATEGORY_LABELS[account.category ?? ""], account.maskedIdentifier ? `••${account.maskedIdentifier}` : ""].filter(Boolean).join(" · ")}
        </small>
      </span>
      <span className={styles.amount}>
        <b className={owed ? styles.owed : undefined}>{formatMoney(account.balance, account.currency)}</b>
        <BalanceBadge status={account.balanceStatus} />
        {account.balanceAsOf ? <small className={styles.meta}>{formatStamp(account.balanceAsOf)}</small> : null}
      </span>
      <i className={styles.chevron} aria-hidden="true">›</i>
    </Link>
  );
}

// Every account the user has, grouped by bank, with the totals at the top. Rupee balances only are added up.
export default function BanksPanel() {
  const { data, loading, error, reload } = useApi<AccountsOverview>(ENDPOINTS.accounts.list);

  if (loading && !data) return <StateMessage kind="loading" text="Loading your accounts…" />;
  if (error || !data) return <StateMessage kind="error" text={error || "Accounts could not be loaded."} onRetry={reload} />;

  const { totals, banks } = data;
  return (
    <Stack>
      <FinvuConnectPanel />
      <TotalsHero totals={totals} />
      {banks.length === 0 ? <StateMessage kind="empty" text="No accounts yet." /> : null}
      {banks.map((bank) => (
        <Panel
          key={bank.name}
          title={bank.name}
          aside={<span className={styles.bankTotal}>{formatMoney(bank.totals.netWorth)}</span>}
        >
          <div className={styles.list}>
            {bank.accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </Panel>
      ))}
    </Stack>
  );
}
