"use client";

import { useEffect, useMemo, useState } from "react";

import { ENDPOINTS, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { formatDay, formatMonth } from "@/lib/format";
import type { RecordItem } from "@/lib/types";
import { useApi } from "@/lib/useApi";

import JsonTree from "./JsonTree";
import Panel from "./Panel";
import styles from "./RecordsPanel.module.css";
import StateMessage from "./StateMessage";

function parsePayload(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function RecordCard({ record }: { record: RecordItem }) {
  return (
    <details className={styles.card}>
      <summary className={styles.summary}>
        <span className={styles.main}>
          <b className={styles.name}>{record.sourceName}</b>
          <small className={styles.meta}>{[formatDay(record.snapshotDate), record.sourceKey].filter(Boolean).join(" · ")}</small>
        </span>
        <i className={styles.chevron} aria-hidden="true">›</i>
      </summary>
      <div className={styles.body}>
        <JsonTree value={parsePayload(record.payload)} />
      </div>
    </details>
  );
}

// Statements, screenshots and reports the owner shared, newest first, read only. The search runs on the server.
export default function RecordsPanel() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const { data, loading, error, reload } = useApi<RecordItem[]>(ENDPOINTS.admin.recordsList, { q: query });

  const groups = useMemo(() => {
    const byMonth = new Map<string, RecordItem[]>();
    for (const record of data ?? []) {
      const month = formatMonth(record.snapshotDate);
      byMonth.set(month, [...(byMonth.get(month) ?? []), record]);
    }
    return Array.from(byMonth.entries());
  }, [data]);

  return (
    <Panel
      title="Statements and records"
      hint="Everything shared with the app, with the data saved from each. Read only: totals come from your accounts and holdings, not from here."
      aside={data ? <span className={styles.count}>{data.length} {data.length === 1 ? "record" : "records"}</span> : null}
    >
      <label className={styles.search}>
        <span className={styles.searchLabel}>Search records</span>
        <input
          id="records-search"
          className={styles.input}
          type="search"
          placeholder="Name or key, for example Slice"
          autoComplete="off"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      {loading && !data ? <StateMessage kind="loading" text="Loading records…" /> : null}
      {error ? <StateMessage kind="error" text={error} onRetry={reload} /> : null}
      {!loading && !error && groups.length === 0 ? (
        <StateMessage kind="empty" text={query ? "No records match that search." : "No records saved yet."} />
      ) : null}
      {groups.map(([month, items]) => (
        <section key={month} className={styles.group}>
          <h3 className={styles.month}>{month} <em>{items.length}</em></h3>
          {items.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </section>
      ))}
    </Panel>
  );
}
