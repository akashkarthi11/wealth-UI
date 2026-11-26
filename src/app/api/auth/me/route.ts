import { NextResponse } from "next/server";

import { bffPost } from "@/lib/bff";
import { BFF_PATHS } from "@/lib/constants";
import { clearToken, clientIp, getToken } from "@/lib/session";
import type { User } from "@/lib/types";

export async function GET(request: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const result = await bffPost<User>(BFF_PATHS.me, undefined, { token, ip: clientIp(request) });
  if (result.httpStatus === 401 || result.httpStatus === 403) {
    await clearToken();
    return NextResponse.json({ user: null }, { status: 401 });
  }
  if (result.body?.status === 1 && result.body.data) {
    return NextResponse.json({ user: result.body.data });
  }
  return NextResponse.json({ user: null }, { status: result.httpStatus === 200 || result.httpStatus === 202 ? 401 : 502 });
}
