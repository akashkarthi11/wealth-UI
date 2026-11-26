"use client";

import { useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { RolesOverview, UserAccess } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import Panel from "./Panel";
import StateMessage from "./StateMessage";
import styles from "./UsersPanel.module.css";

// Every user and the role they have. The admin picks another role from the list; that user is signed out so the new menus apply at once.
// Your own role, and the last admin's, cannot be changed (the server refuses them too).
export default function UsersPanel({ currentUserId }: { currentUserId: string }) {
  const users = useApi<UserAccess[]>(ENDPOINTS.admin.usersList, {});
  const roles = useApi<RolesOverview>(ENDPOINTS.admin.rolesList, {});
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function change(user: UserAccess, role: string) {
    setBusyId(user.id);
    setMessage(null);
    const result = await apiPost<UserAccess>(ENDPOINTS.admin.setUserRole, { userId: user.id, role });
    setBusyId("");
    if (result.ok) {
      const label = roles.data?.roles.find((item) => item.role === role)?.label ?? role;
      setMessage({ ok: true, text: `${user.email} is now ${label}. They were signed out.` });
      users.reload();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  if ((users.loading && !users.data) || (roles.loading && !roles.data)) return <StateMessage kind="loading" text="Loading users…" />;
  if (users.error || !users.data) return <StateMessage kind="error" text={users.error || "Users could not be loaded."} onRetry={users.reload} />;
  if (roles.error || !roles.data) return <StateMessage kind="error" text={roles.error || "Roles could not be loaded."} onRetry={roles.reload} />;

  const options = roles.data.roles;
  return (
    <Panel
      title="Users"
      hint="Choose a role for each user. Changing it signs that user out, so the new menus apply as soon as they sign in again."
      aside={<span className={styles.count}>{users.data.length} {users.data.length === 1 ? "user" : "users"}</span>}
    >
      <ul className={styles.list}>
        {users.data.map((user) => {
          const own = user.id.toLowerCase() === currentUserId.toLowerCase();
          return (
            <li key={user.id} className={styles.row}>
              <span className={styles.who}>
                <b>{user.email}</b>
                {own ? <small>You</small> : null}
              </span>
              <label className={styles.pick}>
                <span className={styles.srOnly}>Role of {user.email}</span>
                <select
                  className={styles.select}
                  value={user.role}
                  disabled={own || busyId === user.id}
                  onChange={(event) => void change(user, event.target.value)}
                >
                  {options.map((role) => (
                    <option key={role.role} value={role.role}>{role.label}</option>
                  ))}
                </select>
              </label>
            </li>
          );
        })}
      </ul>
      {message ? <p className={message.ok ? styles.ok : styles.error} role="status">{message.text}</p> : null}
    </Panel>
  );
}
