import { BFF_API_PREFIX, BFF_PATHS, CONNECTION_URL_MAX_LENGTH, HEALTH_TIMEOUT_MS } from "./constants";

// Server side only. A service address is an origin: http or https, a host, an optional port, nothing else (same rule as the BFF).
export function cleanOrigin(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const value = text.trim();
  if (!value || value.length > CONNECTION_URL_MAX_LENGTH) return null;
  try {
    const url = new URL(value);
    const plain = (url.pathname === "" || url.pathname === "/") && !url.search && !url.hash && !url.username && !url.password;
    const scheme = url.protocol === "http:" || url.protocol === "https:";
    if (!scheme || !plain || !url.hostname || url.hostname.startsWith("169.254.")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export type HealthStatus = "UP" | "DOWN";

// Asks a BFF address for its health. UP only when the BFF and the BSS behind it both answer UP, because a BFF without its BSS cannot sign anyone in.
export async function probeBff(base: string): Promise<HealthStatus> {
  try {
    const response = await fetch(`${base}${BFF_API_PREFIX}${BFF_PATHS.health}`, { cache: "no-store", signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) });
    const body = (await response.json()) as { bff?: string; bss?: string };
    return response.ok && body.bff === "UP" && body.bss === "UP" ? "UP" : "DOWN";
  } catch {
    return "DOWN";
  }
}
