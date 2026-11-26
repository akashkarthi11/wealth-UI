"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { visibleNav } from "@/lib/nav";
import type { User } from "@/lib/types";

import styles from "./AppShell.module.css";
import SignOutButton from "./SignOutButton";

// The frame of every signed-in screen: brand, the user's navigation, who is signed in, sign out.
export default function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const pathname = usePathname();
  const items = visibleNav(user);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.mark} aria-hidden="true">K</div>
          <div className={styles.brandText}>
            <p className={styles.title}>Karthi Portfolio</p>
            <p className={styles.kicker}>{user.email} · {user.role}</p>
          </div>
        </div>
        <SignOutButton />
      </header>
      <nav className={styles.nav} aria-label="Main">
        {items.map((item) => (
          <Link
            key={item.route}
            href={item.route}
            className={`${styles.link} ${pathname === item.route ? styles.active : ""}`}
            aria-current={pathname === item.route ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
