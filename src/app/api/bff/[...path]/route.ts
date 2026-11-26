import { NextResponse } from "next/server";

import { bffPost } from "@/lib/bff";
import { BFF_PATHS, MESSAGES } from "@/lib/constants";
import { clearToken, clientIp, getToken } from "@/lib/session";

// Pass-through for the modules built later: adds the Bearer token from the cookie, forwards one JSON POST to the BFF.
// Login and register have their own handlers (they set the cookie), so they are not reachable here.
const BLOCKED = new Set<string>([BFF_PATHS.login, BFF_PATHS.register]);
const SAFE_SEGMENT = /^[a-z0-9-]+$/;

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path.length || !path.every((segment) => SAFE_SEGMENT.test(segment)) || BLOCKED.has(path.join("/"))) {
    return NextResponse.json({ error: MESSAGES.notFound }, { status: 404 });
  }
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: MESSAGES.signInRequired }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = undefined;
  }
  const result = await bffPost<unknown>(path.join("/"), payload, { token, ip: clientIp(request) });
  if (result.httpStatus === 401) {
    await clearToken();
  }
  return NextResponse.json(result.body ?? { error: MESSAGES.notReachable }, { status: result.httpStatus });
}
