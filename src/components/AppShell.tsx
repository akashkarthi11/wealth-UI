"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { NavMenu, User } from "@/lib/types";

import styles from "./AppShell.module.css";
import ProfileMenu from "./ProfileMenu";

function Brand() {
  return (
    <div className={styles.brand}>
      <div className={styles.mark} aria-hidden="true">K</div>
      <div className={styles.brandText}>
        <p className={styles.title}>Karthi Portfolio</p>
      </div>
    </div>
  );
}

// The frame of every signed-in screen. A wide screen: the menu on the left with the sub-menu of the open item under it, and a top bar with
// where you are and the profile menu at the right. A phone: the profile in the header, the menu as a row of tabs and the sub-menu as a second row.
export default function AppShell({ user, nav, children }: { user: User; nav: NavMenu[]; children: ReactNode }) {
  const pathname = usePathname();
  const items = nav;
  const isHere = (route: string) => pathname === route || pathname.startsWith(`${route}/`);
  const open: NavMenu | undefined = items.find((item) => item.children.length > 0 && isHere(item.route));
  const here = items.find((item) => isHere(item.route));
  const hereChild = here?.children.find((child) => pathname === child.route);
  const crumb = [here?.label, hereChild?.label].filter(Boolean).join(" / ");

  const itemLink = (item: { label: string; route: string }, className: string, activeClass: string, exact = false) => {
    const active = exact ? pathname === item.route : isHere(item.route);
    return (
      <Link key={item.route} href={item.route} className={`${className} ${active ? activeClass : ""}`} aria-current={active ? "page" : undefined}>
        {item.label}
      </Link>
    );
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Brand />
        <nav className={styles.side} aria-label="Main">
          {items.map((item) => (
            <div key={item.route}>
              {itemLink(item, styles.sideLink, styles.sideActive)}
              {item.children.length > 0 && isHere(item.route) ? (
                <div className={styles.subList}>{item.children.map((child) => itemLink(child, styles.subLink, styles.subActive, true))}</div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>
      <div className={styles.main}>
        <div className={styles.topbar}>
          <p className={styles.crumb}>{crumb}</p>
          <ProfileMenu user={user} />
        </div>
        <header className={styles.header}>
          <Brand />
          <ProfileMenu user={user} />
        </header>
        <nav className={styles.tabs} aria-label="Main">
          {items.map((item) => itemLink(item, styles.link, styles.active))}
        </nav>
        {open ? (
          <nav className={styles.subTabs} aria-label={`${open.label} sub-menu`}>
            {open.children.map((child) => itemLink(child, styles.subTab, styles.subTabActive, true))}
          </nav>
        ) : null}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
