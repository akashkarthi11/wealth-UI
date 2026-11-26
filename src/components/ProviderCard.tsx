"use client";

import { FormEvent, useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import { formatStamp } from "@/lib/format";
import type { Provider } from "@/lib/types";

import cardStyles from "./ConnectionCard.module.css";
import Field from "./Field";
import { LockIcon } from "./icons";
import styles from "./ProviderCard.module.css";

const PRIORITY_MAX = 99;
const BROKER = "angel-one";

// The Angel One login values besides the API key; kept encrypted on the server and never shown again.
const LOGIN_FIELDS: { name: string; label: string; secret: boolean; help: string }[] = [
  { name: "clientCode", label: "Client code", secret: false, help: "Your Angel One login id, for example A123456." },
  { name: "pin", label: "PIN", secret: true, help: "Your Angel One trading PIN." },
  { name: "totpSecret", label: "TOTP secret", secret: true, help: "The base32 secret shown when the authenticator was set up, not the 6-digit code." },
  { name: "macAddress", label: "MAC address", secret: false, help: "Any MAC address you registered with the API app, for example 00:1A:2B:3C:4D:5E." },
];

function statusOf(provider: Provider): { text: string; tone: "up" | "down" | "idle" } {
  if (provider.status === "ok") return { text: "Connected", tone: "up" };
  if (provider.status === "failed") return { text: "Failed", tone: "down" };
  return { text: "Not tested", tone: "idle" };
}

// One third-party service as a compact row; its form opens under it: address, API key (kept encrypted, never shown), on/off, priority, Test connection.
export default function ProviderCard({ provider, onChanged }: { provider: Provider; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const status = statusOf(provider);
  const panelId = `provider-${provider.provider}`;
  return (
    <section className={`${cardStyles.item} ${open ? cardStyles.open : ""}`}>
      <button type="button" className={cardStyles.summary} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((now) => !now)}>
        <span className={cardStyles.name}>
          <b>{provider.label}</b>
          <small>{provider.provider} · priority {provider.priority}</small>
        </span>
        <span className={cardStyles.value}>{provider.keySet ? `key ••••${provider.keyHint ?? ""} · ` : "no key · "}{provider.baseUrl}</span>
        {!provider.enabled ? <span className={cardStyles.status}>Off</span> : null}
        <span className={`${cardStyles.status} ${status.tone === "up" ? cardStyles.up : status.tone === "down" ? cardStyles.down : ""}`}>{status.text}</span>
        <span className={cardStyles.edit}>{open ? "Close" : "Edit"}</span>
      </button>
      {provider.provider === BROKER ? <FetchRow provider={provider} onChanged={onChanged} /> : null}
      {/* Kept mounted while closed, so what was typed is not lost; the key carries what is saved, so the fields start from it after a save. */}
      <div id={panelId} hidden={!open}>
        <Editor
          key={`${provider.label}|${provider.baseUrl}|${provider.enabled}|${provider.priority}|${provider.keyHint}|${provider.autoFetch}|${(provider.extraSet ?? []).join(",")}`}
          provider={provider}
          onChanged={onChanged}
        />
      </div>
    </section>
  );
}

// The manual refresh for the broker: always visible under the row, even with the form closed or edited. It uses what is saved, not unsaved edits.
function FetchRow({ provider, onChanged }: { provider: Provider; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function fetchNow() {
    setBusy(true);
    setMessage(null);
    const result = await apiPost<Provider>(ENDPOINTS.admin.providersFetch, { provider: provider.provider });
    setBusy(false);
    setMessage(result.ok ? { ok: true, text: `Fetched: ${result.data?.lastFetchNote ?? "done"}.` } : { ok: false, text: result.error });
    onChanged();
  }

  return (
    <div className={styles.fetchRow}>
      <button type="button" className={cardStyles.secondary} onClick={fetchNow} disabled={busy} title="Fetches with the saved settings, not unsaved edits">
        {busy ? "Fetching…" : "Fetch now"}
      </button>
      {message ? (
        <span className={message.ok ? cardStyles.ok : cardStyles.error} role="status">{message.text}</span>
      ) : (
        <span className={styles.checked}>{provider.lastFetchAt ? `Last fetch ${formatStamp(provider.lastFetchAt)}: ${provider.lastFetchNote ?? ""}` : "No fetch yet."}</span>
      )}
    </div>
  );
}

function Editor({ provider, onChanged }: { provider: Provider; onChanged: () => void }) {
  const [label, setLabel] = useState(provider.label);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl);
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(provider.enabled);
  const [priority, setPriority] = useState(String(provider.priority));
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [autoFetch, setAutoFetch] = useState(provider.autoFetch);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const broker = provider.provider === BROKER;
  const entered = Object.fromEntries(Object.entries(extra).filter(([, value]) => value.trim() !== ""));

  const changed =
    label.trim() !== provider.label ||
    baseUrl.trim() !== provider.baseUrl ||
    apiKey !== "" ||
    enabled !== provider.enabled ||
    priority !== String(provider.priority) ||
    Object.keys(entered).length > 0 ||
    autoFetch !== provider.autoFetch;
  const valid = label.trim() !== "" && baseUrl.trim() !== "" && Number(priority) >= 1 && Number(priority) <= PRIORITY_MAX;

  async function run(kind: string, endpoint: string, body: unknown, done: string) {
    setBusy(kind);
    setMessage(null);
    const result = await apiPost<Provider>(endpoint, body);
    setBusy("");
    if (result.ok) {
      setMessage({ ok: true, text: done });
      onChanged();
    } else {
      setMessage({ ok: false, text: result.error });
    }
    return result;
  }

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!changed || !valid || busy) return;
    const body = { provider: provider.provider, label: label.trim(), baseUrl: baseUrl.trim(), apiKey, enabled, priority: Number(priority), ...(broker ? { extra: entered, autoFetch } : {}) };
    void run("save", ENDPOINTS.admin.providersSave, body, "Saved.");
  };

  async function test() {
    const result = await run("test", ENDPOINTS.admin.providersTest, { provider: provider.provider }, "");
    if (result.ok) {
      setMessage(result.data?.status === "ok" ? { ok: true, text: "Connected: the service answered." } : { ok: false, text: "Failed: the service did not accept the request. Check the address and the key." });
    }
  }

  async function remove() {
    const result = await run("remove", ENDPOINTS.admin.providersRemove, { provider: provider.provider }, "Removed.");
    if (!result.ok) setConfirmRemove(false);
  }

  const id = `provider-${provider.provider}`;
  return (
    <form className={cardStyles.body} onSubmit={save} noValidate>
      <div className={styles.grid}>
        <div>
          <label className={cardStyles.label} htmlFor={`${id}-label`}>Name</label>
          <input id={`${id}-label`} className={cardStyles.input} type="text" autoComplete="off" value={label} onChange={(event) => { setLabel(event.target.value); setMessage(null); }} />
        </div>
        <div className={styles.priority}>
          <label className={cardStyles.label} htmlFor={`${id}-priority`}>Priority</label>
          <input
            id={`${id}-priority`}
            className={cardStyles.input}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={priority}
            onChange={(event) => { setPriority(event.target.value.replace(/\D/g, "").slice(0, 2)); setMessage(null); }}
          />
        </div>
      </div>
      <label className={cardStyles.label} htmlFor={`${id}-url`}>Address</label>
      <input id={`${id}-url`} className={cardStyles.input} type="text" inputMode="url" autoComplete="off" spellCheck={false} value={baseUrl} onChange={(event) => { setBaseUrl(event.target.value); setMessage(null); }} />
      <div className={styles.keyRow}>
        <Field
          id={`${id}-key`}
          label="API key"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon />}
          value={apiKey}
          onChange={(next) => { setApiKey(next); setMessage(null); }}
          help={provider.keySet ? `A key is saved (ends ${provider.keyHint ?? "…"}). Leave empty to keep it.` : "No key saved. It is stored encrypted and never shown again."}
        />
      </div>
      {broker ? (
        <div className={styles.login}>
          {LOGIN_FIELDS.map((field) => {
            const saved = (provider.extraSet ?? []).includes(field.name);
            return (
              <Field
                key={field.name}
                id={`${id}-${field.name}`}
                label={field.label}
                type={field.secret ? "password" : "text"}
                autoComplete="off"
                icon={field.secret ? <LockIcon /> : undefined}
                value={extra[field.name] ?? ""}
                onChange={(next) => { setExtra((now) => ({ ...now, [field.name]: next })); setMessage(null); }}
                help={saved ? `Saved. Leave empty to keep it. ${field.help}` : field.help}
              />
            );
          })}
        </div>
      ) : null}
      <label className={styles.switch}>
        <input type="checkbox" checked={enabled} onChange={(event) => { setEnabled(event.target.checked); setMessage(null); }} />
        <span>Use this provider</span>
      </label>
      {broker ? (
        <>
          <label className={styles.switch}>
            <input type="checkbox" checked={autoFetch} onChange={(event) => { setAutoFetch(event.target.checked); setMessage(null); }} />
            <span>Fetch holdings every weekday evening (18:30 IST)</span>
          </label>
          <p className={styles.checked}>
            {provider.lastFetchAt ? `Last fetch ${formatStamp(provider.lastFetchAt)}: ${provider.lastFetchNote ?? ""}` : "No fetch yet."}
          </p>
        </>
      ) : null}
      <p className={styles.checked}>
        {provider.checkedAt ? `Last tested ${formatStamp(provider.checkedAt)}.` : "Not tested since it was last changed."}
        {changed ? " Save your changes before testing." : ""}
      </p>
      <div className={cardStyles.actions}>
        {message ? <span className={message.ok ? cardStyles.ok : cardStyles.error} role="status">{message.text}</span> : <span />}
        <span className={cardStyles.buttons}>
          {confirmRemove ? (
            <>
              <button type="button" className={styles.danger} onClick={remove} disabled={Boolean(busy)}>{busy === "remove" ? "Removing…" : "Yes, remove"}</button>
              <button type="button" className={cardStyles.secondary} onClick={() => setConfirmRemove(false)}>Keep</button>
            </>
          ) : (
            <button type="button" className={cardStyles.secondary} onClick={() => setConfirmRemove(true)} disabled={Boolean(busy)}>Remove</button>
          )}
          <button type="button" className={cardStyles.secondary} onClick={test} disabled={Boolean(busy) || changed}>{busy === "test" ? "Testing…" : "Test connection"}</button>
          <button type="submit" className={cardStyles.primary} disabled={Boolean(busy) || !changed || !valid}>{busy === "save" ? "Saving…" : "Save"}</button>
        </span>
      </div>
    </form>
  );
}
