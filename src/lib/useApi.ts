"use client";

import { useCallback, useEffect, useState } from "react";

import { apiPost } from "./api";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

// The one hook a screen uses to load its data: calls the endpoint when the screen opens and again when `body` changes or reload() is called.
export function useApi<T>(endpoint: string, body?: unknown): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(body ?? null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiPost<T>(endpoint, key === "null" ? undefined : JSON.parse(key)).then((result) => {
      if (cancelled) return;
      setData(result.ok ? result.data : null);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [endpoint, key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
