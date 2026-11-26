import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Server-side check: the base URL answers 401, so probe the actuator health path.
export async function GET() {
  const base = (process.env.WEALTH_BFF_URL ?? process.env.NEXT_PUBLIC_WEALTH_BFF_URL ?? "").replace(/\/+$/, "");
  if (!base) {
    return NextResponse.json({ configured: false, reachable: false, status: null, url: null });
  }
  const url = `${base}/actuator/health`;
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = (await response.json().catch(() => null)) as { status?: string } | null;
    return NextResponse.json({
      configured: true,
      reachable: response.ok,
      status: body?.status ?? null,
      httpStatus: response.status,
      url,
    });
  } catch {
    return NextResponse.json({ configured: true, reachable: false, status: null, httpStatus: null, url });
  }
}
