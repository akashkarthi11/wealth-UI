"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS, ROUTES } from "@/lib/constants";

import styles from "./SignOutButton.module.css";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await apiPost(ENDPOINTS.auth.logout);
    router.replace(ROUTES.login);
    router.refresh();
  }

  return (
    <button className={styles.button} type="button" onClick={signOut} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
