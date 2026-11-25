import type { ApiResponse } from "./types";

const BASE = (process.env.WEALTH_BFF_URL ?? "").replace(/\/+$/, "");
const API = "/wealth/api/v1/";

export interface BffResult<T> {
  httpStatus: number;
  body: ApiResponse<T> | null;
}

// Server-side only: the browser never sees the BFF address.
export async function bffPost<T>(
  path: string,
  payload: unknown,
  options: { token?: string; ip?: string } = {},
): Promise<BffResult<T>> {
  if (!BASE) {
    return { httpStatus: 503, body: null };
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.ip) headers["X-Forwarded-For"] = options.ip;
  try {
    const response = await fetch(`${BASE}${API}${path}`, {
      method: "POST",
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const text = await response.text();
    let body: ApiResponse<T> | null = null;
    try {
      body = text ? (JSON.parse(text) as ApiResponse<T>) : null;
    } catch {
      body = null;
    }
    return { httpStatus: response.status, body };
  } catch {
    return { httpStatus: 502, body: null };
  }
}
