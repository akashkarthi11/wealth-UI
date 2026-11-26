import { formatMoney } from "@/lib/format";
import type { AccountTotals } from "@/lib/types";

import styles from "./TotalsHero.module.css";

// Net worth with its three parts. Used by every screen that shows the user's totals, so the numbers look the same everywhere.
export default function TotalsHero({ totals, eyebrow = "Net worth · from your accounts" }: { totals: AccountTotals; eyebrow?: string }) {
  return (
    <section className={styles.hero} aria-label="Totals">
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <p className={styles.total}>{formatMoney(totals.netWorth)}</p>
        <p className={styles.equation}>Cash and deposits + investments − amount owed</p>
      </div>
      <dl className={styles.kpis}>
        <div><dt>Cash and deposits</dt><dd>{formatMoney(totals.casa)}</dd></div>
        <div><dt>Investments</dt><dd>{formatMoney(totals.investment)}</dd></div>
        <div><dt>Amount owed</dt><dd className={styles.owed}>{formatMoney(totals.liability)}</dd></div>
      </dl>
    </section>
  );
}
