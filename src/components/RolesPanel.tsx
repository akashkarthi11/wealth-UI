"use client";

import { useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { MenuItem, RoleInfo, RoleMenusSaved, RolesOverview } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import AddRoleForm from "./AddRoleForm";
import { LockIcon } from "./icons";
import Panel from "./Panel";
import styles from "./RolesPanel.module.css";
import StateMessage from "./StateMessage";

type Draft = Record<string, string[]>;

const usersLabel = (count: number) => `${count} ${count === 1 ? "user" : "users"}`;
const sameMenus = (a: string[], b: string[]) => a.length === b.length && a.every((key) => b.includes(key));

// Menus down the left, one column per role, a switch in every cell. A new role is one more column, so the screen stays the same shape.
function Matrix({ roles, menus, onSaved }: { roles: RoleInfo[]; menus: MenuItem[]; onSaved: () => void }) {
  const [draft, setDraft] = useState<Draft>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const groups = Array.from(new Set(menus.map((menu) => menu.group)));
  // The rows a role can be given; the admin-only ones are shown but locked.
  const givable = menus.filter((menu) => !menu.adminOnly).map((menu) => menu.key);
  const menusOf = (role: RoleInfo) => draft[role.role] ?? role.menus;
  const savedOf = (key: string) => roles.find((role) => role.role === key)?.menus ?? [];
  const changedRoles = roles.filter((role) => !role.locked && !sameMenus(menusOf(role), role.menus));
  const emptyRole = changedRoles.find((role) => menusOf(role).length === 0);

  // A submenu cannot be on without its menu: turning one on turns its menu on too, and turning a menu off turns its submenus off.
  const toggle = (role: string, key: string) => {
    setMessage(null);
    const menu = menus.find((item) => item.key === key);
    const submenus = menus.filter((item) => item.parentKey === key).map((item) => item.key);
    setDraft((now) => {
      const current = now[role] ?? savedOf(role);
      if (current.includes(key)) {
        return { ...now, [role]: current.filter((k) => k !== key && !submenus.includes(k)) };
      }
      const turnOn = menu?.parentKey && !current.includes(menu.parentKey) ? [key, menu.parentKey] : [key];
      return { ...now, [role]: [...current, ...turnOn] };
    });
  };
  const setAll = (role: string, on: boolean) => {
    setMessage(null);
    setDraft((now) => ({ ...now, [role]: on ? givable : [] }));
  };
  const discard = () => {
    setMessage(null);
    setDraft({});
  };

  async function save() {
    setBusy(true);
    setMessage(null);
    let failed = "";
    for (const role of changedRoles) {
      const result = await apiPost<RoleMenusSaved>(ENDPOINTS.admin.updateMenus, { role: role.role, menus: menusOf(role) });
      if (!result.ok) {
        failed = `${role.label}: ${result.error}`;
        break;
      }
    }
    setBusy(false);
    if (failed) {
      setMessage({ ok: false, text: failed });
    } else {
      setMessage({ ok: true, text: "Saved." });
      onSaved();
    }
  }

  return (
    <>
      {roles.length > 3 ? <p className={styles.swipe}>Swipe sideways to see every role.</p> : null}
      <div className={styles.scroll}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th scope="col" className={styles.menuHead}>Menu</th>
              {roles.map((role) => (
                <th scope="col" key={role.role} className={styles.roleHead}>
                  <span className={styles.roleName}>
                    {role.locked ? <LockIcon /> : null}
                    {role.label}
                  </span>
                  <small>{usersLabel(role.users)}</small>
                  {role.locked ? (
                    <small className={styles.note}>Sees all</small>
                  ) : (
                    <span className={styles.quick}>
                      <button type="button" onClick={() => setAll(role.role, true)} disabled={menusOf(role).length === givable.length}>All</button>
                      <button type="button" onClick={() => setAll(role.role, false)} disabled={menusOf(role).length === 0}>None</button>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group}>
              <tr>
                <th scope="colgroup" colSpan={roles.length + 1} className={styles.groupRow}>{group}</th>
              </tr>
              {menus.filter((menu) => menu.group === group).map((menu) => (
                <tr key={menu.key}>
                  <th scope="row" className={`${styles.menuCell} ${menu.parentKey ? styles.submenuCell : ""}`}>
                    {menu.label}
                    {menu.adminOnly ? <small className={styles.soon}>admin only</small> : !menu.active ? <small className={styles.soon}>soon</small> : null}
                  </th>
                  {roles.map((role) => {
                    const lockedCell = role.locked || menu.adminOnly;
                    const on = role.locked || (!menu.adminOnly && menusOf(role).includes(menu.key));
                    return (
                      <td key={role.role} className={styles.cell}>
                        <label className={`${styles.tick} ${on ? styles.on : ""} ${lockedCell ? styles.fixed : ""}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            disabled={lockedCell}
                            onChange={() => toggle(role.role, menu.key)}
                            aria-label={`${role.label} can open ${menu.label}`}
                          />
                          <span className={styles.mark} aria-hidden="true" />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      {changedRoles.length > 0 || message ? (
        <div className={styles.bar} role="status">
          {message ? (
            <span className={message.ok ? styles.ok : styles.error}>{message.text}</span>
          ) : (
            <span className={emptyRole ? styles.error : styles.unsaved}>
              {emptyRole ? `${emptyRole.label} needs at least one menu.` : `Unsaved changes for ${changedRoles.map((r) => r.label).join(", ")}`}
            </span>
          )}
          {changedRoles.length > 0 ? (
            <span className={styles.barActions}>
              <button type="button" className={styles.discard} onClick={discard} disabled={busy}>Discard</button>
              <button type="button" className={styles.save} onClick={save} disabled={busy || Boolean(emptyRole)}>
                {busy ? "Saving…" : "Save menus"}
              </button>
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default function RolesPanel() {
  const { data, loading, error, reload } = useApi<RolesOverview>(ENDPOINTS.admin.rolesList, {});
  const [adding, setAdding] = useState(false);
  // Bumped after a save, so the matrix starts again from what is saved. Adding a role does not bump it: unsaved ticks on the other roles are kept.
  const [saves, setSaves] = useState(0);

  if (loading && !data) return <StateMessage kind="loading" text="Loading roles…" />;
  if (error || !data) return <StateMessage kind="error" text={error || "Roles could not be loaded."} onRetry={reload} />;
  return (
    <Panel
      title="Menus by role"
      hint="Tick the menus each role can open. A menu left unticked disappears from the app for that role."
      aside={
        <button type="button" className={styles.addRole} onClick={() => setAdding((now) => !now)} aria-expanded={adding}>
          {adding ? "Close" : "+ Add role"}
        </button>
      }
    >
      {adding ? (
        <AddRoleForm
          onAdded={() => {
            setAdding(false);
            reload();
          }}
        />
      ) : null}
      <Matrix
        key={saves}
        roles={data.roles}
        menus={data.menus}
        onSaved={() => {
          setSaves((now) => now + 1);
          reload();
        }}
      />
    </Panel>
  );
}
