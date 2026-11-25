import { redirect } from "next/navigation";

import { bffPost } from "@/lib/bff";
import { getToken } from "@/lib/session";
import type { User } from "@/lib/types";

import SignOutButton from "./SignOutButton";
import styles from "./overview.module.css";

export const dynamic = "force-dynamic";

// Placeholder landing page: proves the session works. The real Overview is the dashboard module.
export default async function OverviewPage() {
  const token = await getToken();
  if (!token) {
    redirect("/login");
  }
  const result = await bffPost<User>("customers/users/me", undefined, { token });
  const user = result.body?.status === 1 ? result.body.data : null;
  if (!user) {
    redirect("/login");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.mark} aria-hidden="true">K</div>
        <div>
          <p className={styles.title}>Karthi Portfolio</p>
          <p className={styles.kicker}>Your private wealth ledger</p>
        </div>
        <SignOutButton />
      </header>
      <section className={styles.card}>
        <h1>Signed in</h1>
        <p className={styles.muted}>
          {user.email} · {user.role}
        </p>
        <p className={styles.muted}>The dashboard arrives with the next module.</p>
      </section>
    </main>
  );
}
