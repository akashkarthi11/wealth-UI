"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import Panel from "./Panel";
import StateMessage from "./StateMessage";
import styles from "./FinvuConnectPanel.module.css";

type Json = Record<string, unknown>;
type StepResult = { ok: boolean; data: unknown; error: string };

const field = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Json;
  if (key in obj) return obj[key];
  if (obj.body && typeof obj.body === "object") return field(obj.body, key);
  if (obj.data && typeof obj.data === "object") return field(obj.data, key);
  return undefined;
};
const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export default function FinvuConnectPanel() {
  const [config, setConfig] = useState<Json | null>(null);
  const [custId, setCustId] = useState("");
  const [template, setTemplate] = useState("ONETIME_DEV_TEMPLATE");
  const [description, setDescription] = useState("Wealth personal finance aggregation");
  const [handle, setHandle] = useState("");
  const [consentId, setConsentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 6);
  const [from, setFrom] = useState(defaultFrom.toISOString());
  const [to, setTo] = useState(defaultTo.toISOString());
  const [busy, setBusy] = useState("");
  const [last, setLast] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiPost<Json>(ENDPOINTS.finvu.config, {}).then(result => {
      if (result.ok && result.data) setConfig(result.data);
      else setError(result.error || "Finvu configuration could not be loaded.");
    });
  }, []);

  const run = async (action: string, endpoint: string, body: Json) => {
    setBusy(action); setError(""); setLast(null);
    const result = await apiPost<unknown>(endpoint, body);
    if (!result.ok) setError(result.error || "Request failed.");
    else setLast(result.data);
    setBusy("");
    return result as StepResult;
  };
  const requestConsent = async () => {
    const result = await run("consent", ENDPOINTS.finvu.consentRequest, { custId: custId.trim(), templateName: template, consentDescription: description });
    if (result.ok) {
      const newHandle = field(result.data, "consentHandle");
      if (typeof newHandle === "string") setHandle(newHandle);
    }
  };
  const checkConsent = async () => {
    const result = await run("consent-status", ENDPOINTS.finvu.consentStatus, { custId: custId.trim(), consentHandleId: handle.trim() });
    if (result.ok) {
      const id = field(result.data, "consentId");
      if (typeof id === "string") setConsentId(id);
    }
  };
  const requestFi = async () => {
    const result = await run("fi-request", ENDPOINTS.finvu.fiRequest, { custId: custId.trim(), consentHandleId: handle.trim(), consentId: consentId.trim(), dateTimeRangeFrom: from, dateTimeRangeTo: to });
    if (result.ok) { const id = field(result.data, "sessionId"); if (typeof id === "string") setSessionId(id); }
  };
  const checkFi = async () => {
    const result = await run("fi-status", ENDPOINTS.finvu.fiStatus, { custId: custId.trim(), consentHandleId: handle.trim(), consentId: consentId.trim(), sessionId: sessionId.trim() });
    if (result.ok) {
      const id = field(result.data, "sessionId");
      if (typeof id === "string") setSessionId(id);
    }
  };
  const fetchFi = async () => {
    await run("fetch", ENDPOINTS.finvu.fiFetch, { custId: custId.trim(), consentId: consentId.trim(), sessionId: sessionId.trim() });
  };

  const configured = config?.configured === true;
  return (
    <Panel title="Connect bank through Finvu" aside={<span className={styles.badge}>{configured ? "Sandbox ready" : "Not configured"}</span>}>
      <div className={styles.intro}>
        Connect an Account Aggregator consent to import bank data. This is a Finvu FIU sandbox flow; real production connections require Finvu onboarding and credentials.
      </div>
      {!configured ? <StateMessage kind="empty" text="Finvu sandbox credentials are not configured on the BSS server. Set WEALTH_FINVU_FIU_TOKEN to enable this integration." /> : null}
      <div className={styles.form}>
        <label>Finvu AA handle / customer ID<input value={custId} onChange={e => setCustId(e.target.value)} placeholder="your-handle@finvu" autoComplete="off" /></label>
        <label>Consent template<select value={template} onChange={e => setTemplate(e.target.value)}><option value="ONETIME_DEV_TEMPLATE">One-time development (6 months)</option><option value="PERIODIC_DEV_TEMPLATE">Periodic development</option></select></label>
        <label>Consent description<input value={description} onChange={e => setDescription(e.target.value)} maxLength={160} /></label>
        <button disabled={!configured || !custId.trim() || !!busy} onClick={requestConsent}>{busy === "consent" ? "Requesting…" : "1 · Request consent"}</button>
      </div>
      <p className={styles.intro}><a href="https://aaweb.finvu.in/home" target="_blank" rel="noreferrer">Open Finvu AA web app to approve the consent ↗</a></p>
      <div className={styles.form}>
        <label>Consent handle<input value={handle} onChange={e => setHandle(e.target.value)} placeholder="Returned consentHandle" /></label>
        <button disabled={!configured || !custId.trim() || !handle.trim() || !!busy} onClick={checkConsent}>{busy === "consent-status" ? "Checking…" : "2 · Check consent status"}</button>
      </div>
      <div className={styles.form}>
        <label>Consent ID<input value={consentId} onChange={e => setConsentId(e.target.value)} placeholder="Generated after acceptance" /></label>
        <label>Data from<input value={from} onChange={e => setFrom(e.target.value)} placeholder="2026-05-28T00:00:00+05:30" /></label>
        <label>Data to<input value={to} onChange={e => setTo(e.target.value)} placeholder="2026-11-28T23:59:59+05:30" /></label>
        <button disabled={!configured || !custId.trim() || !handle.trim() || !consentId.trim() || !from || !to || !!busy} onClick={requestFi}>{busy === "fi-request" ? "Requesting data…" : "3 · Request financial data"}</button>
      </div>
      <div className={styles.form}>
        <label>Session ID<input value={sessionId} onChange={e => setSessionId(e.target.value)} placeholder="Returned FI session ID" /></label>
        <button disabled={!configured || !custId.trim() || !handle.trim() || !consentId.trim() || !sessionId.trim() || !!busy} onClick={checkFi}>{busy === "fi-status" ? "Checking…" : "4 · Check data status"}</button>
        <button className={styles.secondary} disabled={!configured || !custId.trim() || !consentId.trim() || !sessionId.trim() || !!busy} onClick={fetchFi}>{busy === "fetch" ? "Fetching…" : "5 · Fetch data"}</button>
      </div>
      {error ? <StateMessage kind="error" text={error} /> : null}
      {last !== null ? <details className={styles.result} open><summary>Latest response</summary><pre>{pretty(last)}</pre></details> : null}
      <small className={styles.note}>Consent must be approved in Finvu before checking acceptance or requesting financial data. Wealth does not store the returned sandbox data yet; it is shown only in this session.</small>
    </Panel>
  );
}
