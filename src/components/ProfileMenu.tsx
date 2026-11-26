"use client";

import { useEffect, useRef, useState } from "react";

import type { User } from "@/lib/types";

import styles from "./ProfileMenu.module.css";
import SignOutButton from "./SignOutButton";

// The signed-in user at the top right: an avatar that opens who they are (email, role) and Sign out.
export default function ProfileMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.avatar}
        onClick={() => setOpen((now) => !now)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Profile: ${user.email}`}
      >
        {user.email.charAt(0).toUpperCase()}
      </button>
      {open ? (
        <div className={styles.menu} role="menu">
          <div className={styles.who}>
            <span className={styles.big} aria-hidden="true">{user.email.charAt(0).toUpperCase()}</span>
            <div className={styles.text}>
              <b>{user.email.split("@")[0]}</b>
              <small>{user.email}</small>
              <span className={styles.role}>{user.role}</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      ) : null}
    </div>
  );
}
