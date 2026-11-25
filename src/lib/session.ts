import { cookies } from "next/headers";

// The JWT lives only in this httpOnly cookie; no script in the browser can read it.
export const TOKEN_COOKIE = "wealth_token";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string, maxAgeSeconds: number): Promise<void> {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearToken(): Promise<void> {
  (await cookies()).delete(TOKEN_COOKIE);
}

// The first address of x-forwarded-for is the caller; the BFF and BSS use it for the login limits.
export function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || undefined;
}
