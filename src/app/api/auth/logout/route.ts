import { NextResponse } from "next/server";

import { bffPost } from "@/lib/bff";
import { clearToken, clientIp, getToken } from "@/lib/session";

export async function POST(request: Request) {
  const token = await getToken();
  if (token) {
    // Drops the cached user; the cookie is cleared even if the call fails.
    await bffPost<boolean>("customers/users/logout", undefined, { token, ip: clientIp(request) });
  }
  await clearToken();
  return NextResponse.json({ ok: true });
}
