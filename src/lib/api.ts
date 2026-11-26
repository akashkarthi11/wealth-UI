import { API_BASE, MESSAGES } from "./constants";

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  // Ready to show: the message from our route, or a generic one.
  error: string;
}

async function request<T>(method: "GET" | "POST", endpoint: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? "" : (data?.error ?? MESSAGES.somethingWrong),
    };
  } catch {
    return { ok: false, status: 0, data: null, error: MESSAGES.notReachable };
  }
}

// The one way a screen calls the backend: our own /api routes, which forward to the BFF.
export const apiGet = <T>(endpoint: string) => request<T>("GET", endpoint);
export const apiPost = <T>(endpoint: string, body?: unknown) => request<T>("POST", endpoint, body);
