"use client";

import { FormEvent, useState } from "react";

import { apiPost } from "@/lib/api";
import { splitConnectionString, type ConnectionKind } from "@/lib/connectionString";
import type { ConnectionInfo } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import Field from "./Field";
import { LinkIcon, LockIcon, UserIcon } from "./icons";

import styles from "./ConnectionCard.module.css";
import StateMessage from "./StateMessage";

const STATUS_TEXT: Record<ConnectionInfo["status"], string> = { UP: "Answering", DOWN: "Not answering", NOT_CONFIGURED: "Not configured" };
const MAX_ROWS = 5;
const MAX_PORT_DIGITS = 5;

// text: one box with the full address. urlparts: a web address split into Scheme, Host and Port. hostport: a Host box and a Port box.
// hostports: a list of Host and Port rows (for example Kafka brokers).
export type AddressMode = "text" | "urlparts" | "hostport" | "hostports";

interface ConnectionEndpoints {
  get: string;
  update: string;
  reset: string;
}

interface ConnectionCardProps {
  title: string;
  // What this address is, in one line.
  hint: string;
  endpoints: ConnectionEndpoints;
  mode?: AddressMode;
  // Also show Username and Password (the data services). A blank password keeps the current one.
  credentials?: boolean;
  // Offer a box to paste a full connection string, which is split into the fields (Postgres, Redis, Kafka).
  paste?: ConnectionKind;
  // An example for the empty box, and the box label (text mode).
  label?: string;
  example?: string;
}

interface Row {
  host: string;
  port: string;
}

const emptyRow = (): Row => ({ host: "", port: "" });

// "a:1,b:2" to rows; the port is what follows the last colon.
function toRows(value: string): Row[] {
  const rows = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const at = part.lastIndexOf(":");
      return at < 0 ? { host: part, port: "" } : { host: part.slice(0, at), port: part.slice(at + 1) };
    });
  return rows.length > 0 ? rows : [emptyRow()];
}

// "http://host:8080" into its parts; anything that is not a web address gives an empty host.
function parseWebAddress(value: string): { scheme: string; row: Row } {
  try {
    const url = new URL(value);
    return { scheme: url.protocol === "https:" ? "https" : "http", row: { host: url.hostname, port: url.port } };
  } catch {
    return { scheme: "http", row: emptyRow() };
  }
}

const isBlank = (row: Row) => !row.host.trim() && !row.port.trim();
const isComplete = (row: Row) => Boolean(row.host.trim()) && Boolean(row.port.trim());
const toValue = (rows: Row[]) => rows.filter((row) => !isBlank(row)).map((row) => `${row.host.trim()}:${row.port.trim()}`).join(",");

// One address: the current one is shown, the admin can change it (saved only if it answers UP) or go back to the deployed one.
export default function ConnectionCard(props: ConnectionCardProps) {
  const { title, hint, endpoints } = props;
  const { data, loading, error, reload } = useApi<ConnectionInfo>(endpoints.get, {});
  const [open, setOpen] = useState(false);
  const panelId = `connection-panel-${title.replace(/\W+/g, "-").toLowerCase()}`;

  if (loading && !data) return <div className={styles.item}><StateMessage kind="loading" text={`Checking ${title}…`} /></div>;
  if (error || !data) return <div className={styles.item}><StateMessage kind="error" text={error || `${title} could not be loaded.`} onRetry={reload} /></div>;
  const value = [data.url || "Not set", data.username].filter(Boolean).join("  ·  ");
  return (
    <section className={`${styles.item} ${open ? styles.open : ""}`}>
      <button type="button" className={styles.summary} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((now) => !now)}>
        <span className={styles.name}>
          <b>{title}</b>
          <small>{hint}</small>
        </span>
        <span className={styles.value}>{value}</span>
        <span className={`${styles.status} ${data.status === "UP" ? styles.up : data.status === "DOWN" ? styles.down : ""}`}>{STATUS_TEXT[data.status]}</span>
        <span className={styles.edit}>{open ? "Close" : "Edit"}</span>
      </button>
      {/* Kept mounted while closed, so what was typed is not lost. The key carries what is saved, so the fields start from it after a change or a reset. */}
      <div id={panelId} hidden={!open}>
        <Editor key={`${data.url}|${data.status}`} {...props} info={data} onChanged={reload} />
      </div>
    </section>
  );
}

function Editor({ title, hint, endpoints, mode = "text", credentials = false, paste, label = "Address", example, info, onChanged }: ConnectionCardProps & { info: ConnectionInfo; onChanged: () => void }) {
  const [text, setText] = useState(info.url);
  const [scheme, setScheme] = useState(() => parseWebAddress(info.url).scheme);
  const [rows, setRows] = useState<Row[]>(() => (mode === "urlparts" ? [parseWebAddress(info.url).row] : toRows(info.url)));
  const [username, setUsername] = useState(info.username ?? "");
  const [password, setPassword] = useState("");
  const [pasted, setPasted] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const split = mode !== "text";
  const urlParts = mode === "urlparts";
  const webValue = `${scheme}://${rows[0].host.trim()}${rows[0].port.trim() ? `:${rows[0].port.trim()}` : ""}`;
  const value = urlParts ? (rows[0].host.trim() ? webValue : "") : split ? toValue(rows) : text.trim();
  const complete = urlParts ? Boolean(rows[0].host.trim()) : split ? rows.every((row) => isBlank(row) || isComplete(row)) : true;
  const loginChanged = credentials && (username.trim() !== (info.username ?? "") || password !== "");
  const canSave = !busy && (value !== info.url || loginChanged) && value !== "" && complete;

  const touch = () => setMessage(null);

  // Fills the fields from a full connection string. The string itself is not kept; what cannot be changed here is named.
  function fillFromString(text: string) {
    if (!paste) return;
    setShowPaste(false);
    const parts = splitConnectionString(paste, text);
    setPasted("");
    if (!parts) {
      setMessage({ ok: false, text: "That does not look like a connection string for this service." });
      return;
    }
    setRows(parts.hosts.map((one) => ({ ...one })));
    if (credentials) {
      setUsername(parts.username);
      setPassword(parts.password);
    }
    const kept = parts.ignored.length > 0 ? ` Kept as deployed: ${parts.ignored.join(", ")}.` : "";
    setMessage({ ok: true, text: `Split into the fields below. Check them, then save.${kept}` });
  }
  const editRow = (index: number, change: Partial<Row>) => {
    touch();
    setRows((now) => now.map((row, i) => (i === index ? { ...row, ...change } : row)));
  };

  async function send(endpoint: string, body: unknown, done: string) {
    setBusy(true);
    setMessage(null);
    const result = await apiPost<ConnectionInfo>(endpoint, body);
    setBusy(false);
    if (result.ok) {
      setMessage({ ok: true, text: done });
      onChanged();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      const body: { url: string; username?: string; password?: string } = { url: value };
      if (credentials && username.trim() !== (info.username ?? "")) body.username = username.trim();
      if (credentials && password !== "") body.password = password;
      void send(endpoints.update, body, "Saved. These settings are used now.");
    }
  };
  const reset = () => void send(endpoints.reset, {}, "Back to the deployed setting.");

  const id = `connection-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <form className={styles.body} onSubmit={save} noValidate>
      {paste && !showPaste ? (
        <button type="button" className={styles.pasteLink} onClick={() => setShowPaste(true)}>Paste a full connection string instead</button>
      ) : null}
      {paste && showPaste ? (
        <div className={styles.paste}>
          <Field
            id={`${id}-paste`}
            label="Paste a full connection string"
            type="password"
            autoComplete="off"
            icon={<LinkIcon />}
            value={pasted}
            onChange={setPasted}
            onPaste={(event) => {
              event.preventDefault();
              fillFromString(event.clipboardData.getData("text"));
            }}
            help="It is split into the fields below and not kept. Or type the parts yourself."
          />
          <button type="button" className={styles.splitButton} onClick={() => fillFromString(pasted)} disabled={!pasted.trim()}>Split</button>
        </div>
      ) : null}

      {split ? (
        <div className={styles.rows}>
          {rows.map((row, index) => (
            <div key={index} className={styles.row}>
              {urlParts ? (
                <div className={styles.schemeBox}>
                  <label className={styles.label} htmlFor={`${id}-scheme`}>Scheme</label>
                  <select
                    id={`${id}-scheme`}
                    className={styles.input}
                    value={scheme}
                    onChange={(event) => {
                      touch();
                      setScheme(event.target.value);
                    }}
                  >
                    <option value="http">http</option>
                    <option value="https">https</option>
                  </select>
                </div>
              ) : null}
              <div className={styles.hostBox}>
                <label className={styles.label} htmlFor={`${id}-host-${index}`}>{mode === "hostports" ? `Broker ${index + 1} host` : "Host"}</label>
                <input
                  id={`${id}-host-${index}`}
                  className={styles.input}
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={example}
                  value={row.host}
                  onChange={(event) => editRow(index, { host: event.target.value.replace(/\s+/g, "") })}
                />
              </div>
              <div className={styles.portBox}>
                <label className={styles.label} htmlFor={`${id}-port-${index}`}>Port</label>
                <input
                  id={`${id}-port-${index}`}
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={row.port}
                  onChange={(event) => editRow(index, { port: event.target.value.replace(/\D/g, "").slice(0, MAX_PORT_DIGITS) })}
                />
              </div>
              {mode === "hostports" && rows.length > 1 ? (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => {
                    touch();
                    setRows((now) => now.filter((_, i) => i !== index));
                  }}
                  aria-label={`Remove broker ${index + 1}`}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          {mode === "hostports" && rows.length < MAX_ROWS ? (
            <button
              type="button"
              className={styles.add}
              onClick={() => {
                touch();
                setRows((now) => [...now, emptyRow()]);
              }}
            >
              + Add another broker
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <label className={styles.label} htmlFor={id}>{label}</label>
          <input
            id={id}
            className={styles.input}
            type="text"
            inputMode="url"
            placeholder={example}
            autoComplete="off"
            spellCheck={false}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              touch();
            }}
          />
        </>
      )}

      {credentials ? (
        <div className={styles.login}>
          <Field id={`${id}-username`} label="Username" type="text" autoComplete="off" icon={<UserIcon />} value={username} onChange={(next) => { setUsername(next); touch(); }} />
          <Field
            id={`${id}-password`}
            label="Password"
            type="password"
            autoComplete="new-password"
            icon={<LockIcon />}
            value={password}
            onChange={(next) => { setPassword(next); touch(); }}
            help={info.passwordSet ? "A password is set. Leave empty to keep it." : "No password is set."}
          />
        </div>
      ) : null}

      <p className={styles.default}>
        Deployed setting: <code>{info.defaultUrl || "not set"}</code>
        {info.customised ? <b className={styles.custom}> · changed</b> : null}
      </p>
      <div className={styles.actions}>
        {message ? <span className={message.ok ? styles.ok : styles.error} role="status">{message.text}</span> : <span />}
        <span className={styles.buttons}>
          <button type="button" className={styles.secondary} onClick={reset} disabled={busy || !info.customised}>Reset to default</button>
          <button type="submit" className={styles.primary} disabled={!canSave}>{busy ? "Checking…" : "Check and save"}</button>
        </span>
      </div>
    </form>
  );
}
