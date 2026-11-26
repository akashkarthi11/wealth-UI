import { NextResponse } from "next/server";

import { bffGet } from "@/lib/bff";
import { BFF_ACTUATOR_HEALTH, BFF_PATHS, HEALTH_TIMEOUT_MS } from "@/lib/constants";
import type { HealthReport } from "@/lib/types";

export const dynamic = "force-dynamic";

// The BFF health API reports bff, bss, db and redis. An older BFF without it falls back to the actuator (BFF only).
interface BffHealthBody {
  bff?: string;
  bss?: string;
  db?: string;
  redis?: string;
  status?: string;
}

const report = (fields: Partial<HealthReport>): HealthReport => ({
  configured: true,
  reachable: false,
  status: null,
  bss: null,
  db: null,
  redis: null,
  ...fields,
});

export async function GET() {
  const full = await bffGet<BffHealthBody>(BFF_PATHS.health, { timeoutMs: HEALTH_TIMEOUT_MS });
  if (full.httpStatus === 503) {
    return NextResponse.json(report({ configured: false }));
  }
  const body = full.body;
  if (full.httpStatus === 200 && body?.bff) {
    return NextResponse.json(report({ reachable: true, status: body.bff, bss: body.bss ?? null, db: body.db ?? null, redis: body.redis ?? null }));
  }
  const actuator = await bffGet<BffHealthBody>(BFF_ACTUATOR_HEALTH, { raw: true, timeoutMs: HEALTH_TIMEOUT_MS });
  const actuatorBody = actuator.body;
  return NextResponse.json(report({ reachable: actuator.httpStatus === 200, status: actuatorBody?.status ?? null }));
}
