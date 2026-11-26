"use client";

import { useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { MenuItem, RoleInfo, RoleMenusSaved, RolesOverview } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import Panel from "./Panel";
import styles from "./RolesPanel.module.css";
import StateMessage from "./StateMessage";

// One role: its menus as tick boxes grouped as in the old app. The admin role is locked and shows every menu.
function RoleCard({ role, menus, onSaved }: { role: RoleInfo; menus: MenuItem[]; onSaved: () => void }) {
  const [selected, setSelected] = useState<string[]>(role.menus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = selected.length !== role.menus.length || selected.some((key) => !role.menus.includes(key));
  const groups = Array.from(new Set(menus.map((menu) => menu.group)));

  const toggle = (key: string) => {
    setMessage(null);
    setSelected((now) => (now.includes(key) ? now.filter((k) => k !== key) : [...now, key]));
  };

  async function save() {
    setBusy(true);
    const result = await apiPost<RoleMenusSaved>(ENDPOINTS.admin.updateMenus, { role: role.role, menus: selected });
    setBusy(false);
    if (result.ok) {
      setMessage({ ok: true, text: "Saved." });
      onSaved();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  return (
    <Panel
      title={role.label}
      hint={role.locked ? "The admin role always sees every menu and cannot be changed." : "Choose the menus this role can open. Hiding a menu hides it in the app."}
      aside={<span className={styles.count}>{role.users} {role.users === 1 ? "user" : "users"}</span>}
    >
      {groups.map((group) => (
        <fieldset key={group} className={styles.group} disabled={role.locked}>
          <legend className={styles.legend}>{group}</legend>
          <div className={styles.items}>
            {menus
              .filter((menu) => menu.group === group)
              .map((menu) => {
                const on = selected.includes(menu.key);
                return (
                  <label key={menu.key} className={`${styles.item} ${on ? styles.on : ""}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle(menu.key)} />
                    <span>{menu.label}</span>
                  </label>
                );
              })}
          </div>
        </fieldset>
      ))}
      {role.locked ? null : (
        <div className={styles.actions}>
          <span className={styles.selectedCount}>{selected.length} of {menus.length} selected</span>
          <button className={styles.save} type="button" onClick={save} disabled={busy || !changed}>
            {busy ? "Saving…" : "Save menus"}
          </button>
        </div>
      )}
      {message ? <p className={message.ok ? styles.ok : styles.error} role="status">{message.text}</p> : null}
    </Panel>
  );
}

export default function RolesPanel() {
  const { data, loading, error, reload } = useApi<RolesOverview>(ENDPOINTS.admin.rolesList, {});

  if (loading && !data) return <StateMessage kind="loading" text="Loading roles…" />;
  if (error || !data) return <StateMessage kind="error" text={error || "Roles could not be loaded."} onRetry={reload} />;
  return (
    <div className={styles.roles}>
      {data.roles.map((role) => (
        // The key carries the saved menus, so a reload after Save starts the card from the saved state.
        <RoleCard key={`${role.role}:${role.menus.join(",")}`} role={role} menus={data.menus} onSaved={reload} />
      ))}
    </div>
  );
}
