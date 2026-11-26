import { NextResponse } from "next/server";

import { bffPost } from "@/lib/bff";
import { BFF_PATHS, ERROR_CODE, MESSAGES } from "@/lib/constants";
import { httpStatusFor, messageFor } from "@/lib/errors";
import { clientIp, setToken } from "@/lib/session";
import type { LoginResponse } from "@/lib/types";

export async function POST(request: Request) {
  let input: { email?: unknown; password?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: messageFor(ERROR_CODE.invalidRequest) }, { status: 400 });
  }
  const email = typeof input.email === "string" ? input.email : "";
  const password = typeof input.password === "string" ? input.password : "";

  const result = await bffPost<LoginResponse>(BFF_PATHS.login, { email, password }, { ip: clientIp(request) });
  const data = result.body?.data;
  if (result.body?.status === 1 && data?.token) {
    await setToken(data.token, data.expiresIn);
    // The token itself is never sent to the browser.
    return NextResponse.json({ user: data.user });
  }
  if (!result.body) {
    return NextResponse.json({ error: MESSAGES.notReachable }, { status: 502 });
  }
  const code = result.body.errorCode;
  return NextResponse.json({ errorCode: code, error: messageFor(code) }, { status: httpStatusFor(code) });
}
