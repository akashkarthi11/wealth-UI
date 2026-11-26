"use client";

import { FormEvent, useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { RoleInfo } from "@/lib/types";

import styles from "./AddRoleForm.module.css";

const ROLE_NAME_MAX = 40;

// A new role from its name. It starts with the Overview menu only; the admin ticks its other menus in the table, and gives it to users on the Users screen.
export default function AddRoleForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await apiPost<RoleInfo>(ENDPOINTS.admin.createRole, { label: name.trim() });
    setBusy(false);
    if (result.ok) {
      setName("");
      onAdded();
    } else {
      setError(result.error);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="new-role-name">New role name</label>
        <input
          id="new-role-name"
          className={styles.input}
          type="text"
          autoComplete="off"
          maxLength={ROLE_NAME_MAX}
          placeholder="For example Family"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          autoFocus
        />
      </div>
      <button className={styles.button} type="submit" disabled={busy || !name.trim()}>{busy ? "Adding…" : "Add role"}</button>
      {error ? <p className={styles.error} role="alert">{error}</p> : <p className={styles.hint}>It starts with the Overview menu only. Tick its other menus below.</p>}
    </form>
  );
}
