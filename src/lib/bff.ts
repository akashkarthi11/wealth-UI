import { BFF_API_PREFIX, BFF_TIMEOUT_MS } from "./constants";
import type { ApiResponse } from "./types";

// The one place the BFF address is read.
const BASE = (process.env.WEALTH_BFF_URL ?? "").replace(/\/+$/, "");

export interface BffResult<B> {
  httpStatus: number;
  body: B | null;
}

interface BffOptions {
  token?: string;
  ip?: string;
  timeoutMs?: number;
  // true: path is used as given, without the API prefix (for example the actuator).
  raw?: boolean;
}

async function call<B>(method: "GET" | "POST", path: string, payload: unknown, options: BffOptions): Promise<BffResult<B>> {
  if (!BASE) {
    return { httpStatus: 503, body: null };
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.ip) headers["X-Forwarded-For"] = options.ip;
  try {
    const response = await fetch(`${BASE}${options.raw ? "" : BFF_API_PREFIX}${path}`, {
      method,
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(options.timeoutMs ?? BFF_TIMEOUT_MS),
    });
    const text = await response.text();
    let body: B | null = null;
    try {
      body = text ? (JSON.parse(text) as B) : null;
    } catch {
      body = null;
    }
    return { httpStatus: response.status, body };
  } catch {
    return { httpStatus: 502, body: null };
  }
}

// Server-side only: the browser never sees the BFF address.
export const bffPost = <T>(path: string, payload: unknown, options: BffOptions = {}) =>
  call<ApiResponse<T>>("POST", path, payload, options);
export const bffGet = <T>(path: string, options: BffOptions = {}) => call<T>("GET", path, undefined, options);
