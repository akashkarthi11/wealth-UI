import { API_BASE, MESSAGES } from "./constants";
import { messageFor } from "./errors";

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  // The payload: for a BFF answer, the envelope's data.
  data: T | null;
  // Ready to show: the message from our route or the BFF error code, or a generic one.
  error: string;
}

interface Envelope {
  status: number;
  errorCode: string | null;
  data: unknown;
}

// A BFF answer is { data, status (1 ok, 0 refused), errorCode }; our own routes answer a plain object.
const isEnvelope = (body: unknown): body is Envelope =>
  typeof body === "object" && body !== null && typeof (body as Envelope).status === "number" && "errorCode" in body;

async function request<T>(method: "GET" | "POST", endpoint: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const parsed = (await response.json().catch(() => null)) as unknown;
    if (isEnvelope(parsed)) {
      const accepted = response.ok && parsed.status === 1;
      return {
        ok: accepted,
        status: response.status,
        data: accepted ? (parsed.data as T | null) : null,
        error: accepted ? "" : messageFor(parsed.errorCode),
      };
    }
    const plain = parsed as (T & { error?: string }) | null;
    return {
      ok: response.ok,
      status: response.status,
      data: plain,
      error: response.ok ? "" : (plain?.error ?? MESSAGES.somethingWrong),
    };
  } catch {
    return { ok: false, status: 0, data: null, error: MESSAGES.notReachable };
  }
}

// The one way a screen calls the backend: our own /api routes, which forward to the BFF.
export const apiGet = <T>(endpoint: string) => request<T>("GET", endpoint);
export const apiPost = <T>(endpoint: string, body?: unknown) => request<T>("POST", endpoint, body);
