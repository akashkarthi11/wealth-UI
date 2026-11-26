"use client";

import { FormEvent, useState } from "react";

import { apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { Provider } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import cardStyles from "./ConnectionCard.module.css";
import Panel from "./Panel";
import ProviderCard from "./ProviderCard";
import styles from "./ProviderCard.module.css";
import StateMessage from "./StateMessage";
import envStyles from "./EnvironmentPanel.module.css";

const NAME_MAX = 40;

// A key for the provider from its name: "My Bank" to "my-bank".
const keyFrom = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, NAME_MAX);

// Third-party services (Gemini, Angel One, Yahoo, Anthropic and any other): each with an address, an encrypted API key, on/off, priority and Test connection.
export default function ProvidersPanel() {
  const { data, loading, error, reload } = useApi<Provider[]>(ENDPOINTS.admin.providersList, {});
  const [adding, setAdding] = useState(false);

  if (loading && !data) return <StateMessage kind="loading" text="Loading connections…" />;
  if (error || !data) return <StateMessage kind="error" text={error || "Connections could not be loaded."} onRetry={reload} />;
  return (
    <Panel
      title="Connections"
      hint="The third-party services the app talks to. Open one to set its address and API key, switch it on, and test it. Keys are stored encrypted and never shown again."
      aside={
        <button type="button" className={cardStyles.secondary} onClick={() => setAdding((now) => !now)} aria-expanded={adding}>
          {adding ? "Close" : "+ Add provider"}
        </button>
      }
    >
      {adding ? (
        <AddProvider
          taken={data.map((provider) => provider.provider)}
          onAdded={() => {
            setAdding(false);
            reload();
          }}
        />
      ) : null}
      <div className={envStyles.list}>
        {data.length === 0 ? <p className={styles.empty}>No providers yet. Add one above.</p> : null}
        {data.map((provider) => (
          <ProviderCard key={provider.provider} provider={provider} onChanged={reload} />
        ))}
      </div>
    </Panel>
  );
}

function AddProvider({ taken, onAdded }: { taken: string[]; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = keyFrom(name);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (taken.includes(key)) {
      setError("A provider with that name already exists.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await apiPost<Provider>(ENDPOINTS.admin.providersSave, { provider: key, label: name.trim(), baseUrl: address.trim(), apiKey: "", enabled: false, priority: 1 });
    setBusy(false);
    if (result.ok) {
      onAdded();
    } else {
      setError(result.error);
    }
  }

  return (
    <form className={styles.add} onSubmit={submit} noValidate>
      <div>
        <label className={cardStyles.label} htmlFor="new-provider-name">Name</label>
        <input id="new-provider-name" className={cardStyles.input} type="text" autoComplete="off" maxLength={NAME_MAX} placeholder="For example My bank API" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} autoFocus />
      </div>
      <div>
        <label className={cardStyles.label} htmlFor="new-provider-address">Address</label>
        <input id="new-provider-address" className={cardStyles.input} type="text" inputMode="url" autoComplete="off" spellCheck={false} placeholder="https://api.example.com" value={address} onChange={(event) => { setAddress(event.target.value); setError(""); }} />
      </div>
      <button className={cardStyles.primary} type="submit" disabled={busy || key.length < 2 || !address.trim()}>{busy ? "Adding…" : "Add provider"}</button>
      {error ? <p className={styles.addError} role="alert">{error}</p> : <p className={styles.addHint}>{key.length >= 2 ? `Saved as “${key}”, switched off. Add its key and switch it on after.` : "Give it a name of at least 2 letters or digits."}</p>}
    </form>
  );
}
