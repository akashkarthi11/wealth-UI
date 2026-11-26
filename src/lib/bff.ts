import { probeBff } from "./connections";
import { BFF_API_PREFIX, BFF_PATHS, BFF_TIMEOUT_MS, HEALTH_TIMEOUT_MS } from "./constants";
import type { ApiResponse } from "./types";

// The one place the BFF address is read. The deployed address is the default; an admin can point it elsewhere from Settings > Connections.
// The change lives in memory on the server (globalThis, so every route sees it) and returns to the default on a restart.
const clean = (url: string) => url.replace(/\/+$/, "");
const DEFAULT_BASE = clean(process.env.WEALTH_BFF_URL ?? "");
const store = globalThis as typeof globalThis & { __wealthBffBase?: string };

export const bffDefaultBase = () => DEFAULT_BASE;
export const bffBase = () => store.__wealthBffBase ?? DEFAULT_BASE;
export const isBffCustomised = () => store.__wealthBffBase !== undefined;
export function setBffBase(url: string | null) {
  store.__wealthBffBase = url === null || clean(url) === DEFAULT_BASE ? undefined : clean(url);
}

// Boot: the table wealth_settings is the source of truth for this address. On the first call in a server instance, the BFF is asked (at the deployed
// address, with the shared service key WEALTH_SERVICE_KEY) for the saved one, which is then held in memory, and the deployed one is saved when there is
// none yet. A saved address is used only when it answers, so a wrong row cannot cut the site off from the BFF. Without the key the deployed one is used.
const SERVICE_KEY = process.env.WEALTH_SERVICE_KEY ?? "";
const pickStore = globalThis as typeof globalThis & { __wealthBffPick?: Promise<void> };

async function pickAtBoot() {
  if (!SERVICE_KEY || !DEFAULT_BASE) return;
  try {
    const response = await fetch(`${DEFAULT_BASE}${BFF_API_PREFIX}${BFF_PATHS.pick}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Service-Key": SERVICE_KEY },
      body: JSON.stringify({ key: "ui_to_bff", url: DEFAULT_BASE }),
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    const body = (await response.json()) as ApiResponse<{ url?: string }>;
    const saved = body.status === 1 ? body.data?.url : undefined;
    if (saved && clean(saved) !== DEFAULT_BASE && (await probeBff(clean(saved))) === "UP") setBffBase(saved);
  } catch {
    // The deployed address stays in use.
  }
}

export const ensureBffPicked = () => (pickStore.__wealthBffPick ??= pickAtBoot());

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
  await ensureBffPicked();
  const BASE = bffBase();
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
