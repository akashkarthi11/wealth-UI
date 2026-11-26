import { NextResponse } from "next/server";

import { bffBase, bffDefaultBase, bffPost, isBffCustomised, setBffBase } from "@/lib/bff";
import { cleanOrigin, probeBff } from "@/lib/connections";
import { BFF_PATHS, MESSAGES, ROLE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/currentUser";
import { messageFor } from "@/lib/errors";
import { clientIp, getToken } from "@/lib/session";
import type { ConnectionInfo } from "@/lib/types";

// The UI to BFF address, for the admin's Settings > Environment. The BFF to BSS address is changed in the BFF itself (admin/connections/bss/…).
// Admin only. A new address is saved only when its BFF and the BSS behind it answer UP. The table wealth_settings is the source of truth: the address
// is saved there (through the BFF and BSS) before it is used, and picked from it when the site starts (lib/bff.ts).
async function describe(): Promise<ConnectionInfo> {
  return { url: bffBase(), defaultUrl: bffDefaultBase(), customised: isBffCustomised(), status: await probeBff(bffBase()) };
}

const fail = (code: string | null, status: number) => NextResponse.json({ error: code ? messageFor(code) : MESSAGES.somethingWrong }, { status });

// Saves the address in the table; returns null when it was saved, or the error code that refused it.
async function saveToTable(request: Request, url: string): Promise<string | null> {
  const token = await getToken();
  const result = await bffPost<unknown>(BFF_PATHS.addressSave, { key: "ui_to_bff", url }, { token: token ?? undefined, ip: clientIp(request) });
  if (result.httpStatus === 200 && result.body?.status === 1) return null;
  return result.body?.errorCode ?? "";
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: MESSAGES.signInRequired }, { status: 401 });
  if (user.role !== ROLE.admin) return fail("6004", 403);

  if (action === "get") {
    return NextResponse.json(await describe());
  }
  if (action === "reset") {
    const refused = await saveToTable(request, bffDefaultBase());
    if (refused !== null) return fail(refused, 400);
    setBffBase(null);
    return NextResponse.json(await describe());
  }
  if (action === "update") {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
    const origin = cleanOrigin(body?.url);
    if (!origin) return fail("6010", 400);
    if ((await probeBff(origin)) !== "UP") return fail("6011", 400);
    const refused = await saveToTable(request, origin);
    if (refused !== null) return fail(refused, 400);
    setBffBase(origin);
    return NextResponse.json(await describe());
  }
  return NextResponse.json({ error: MESSAGES.notFound }, { status: 404 });
}
