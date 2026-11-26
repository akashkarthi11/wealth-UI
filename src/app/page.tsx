"use client";

import { useEffect, useState } from "react";

type SimpleStatus = "checking" | "ok" | "unreachable" | "not-configured";
type ComponentStatus = "checking" | "up" | "down" | "unknown" | "not-configured";

interface HealthComponent {
  status?: string;
  details?: Record<string, unknown>;
}

function Dot({ status }: { status: ComponentStatus | SimpleStatus }) {
  const cls = status === "ok" || status === "up" ? "ok" : status === "unreachable" || status === "down" ? "err" : "";
  return <span className={`dot ${cls}`} />;
}

export default function Home() {
  const [bffStatus, setBffStatus] = useState<SimpleStatus>("checking");
  const [dbStatus, setDbStatus] = useState<ComponentStatus>("checking");
  const [dbDetail, setDbDetail] = useState<string>("");
  const [redisStatus, setRedisStatus] = useState<ComponentStatus>("checking");
  const [redisDetail, setRedisDetail] = useState<string>("");

  const [bffUrl, setBffUrl] = useState<string>("");
  const [bffState, setBffState] = useState<string>("");
  const bssUrl = process.env.NEXT_PUBLIC_WEALTH_BSS_URL;

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { configured: boolean; reachable: boolean; status: string | null; url: string | null }) => {
        setBffUrl(body.url ?? "");
        setBffState(body.status ?? "");
        setBffStatus(!body.configured ? "not-configured" : body.reachable ? "ok" : "unreachable");
      })
      .catch(() => setBffStatus("unreachable"));
  }, []);

  useEffect(() => {
    if (!bssUrl) {
      setDbStatus("not-configured");
      setRedisStatus("not-configured");
      return;
    }
    fetch(`${bssUrl}/actuator/health`)
      .then((r) => r.json())
      .then((body: { components?: Record<string, HealthComponent> }) => {
        const components = body.components ?? {};
        const db = components.db;
        const redis = components.redis;
        setDbStatus(db ? (db.status === "UP" ? "up" : "down") : "unknown");
        setDbDetail(db?.details ? JSON.stringify(db.details) : "");
        setRedisStatus(redis ? (redis.status === "UP" ? "up" : "down") : "unknown");
        setRedisDetail(redis?.details ? JSON.stringify(redis.details) : "");
      })
      .catch(() => {
        setDbStatus("down");
        setRedisStatus("down");
      });
  }, [bssUrl]);

  return (
    <main>
      <h1>wealth-ui</h1>
      <p>Sample starter scaffold. Nothing here is real product UI yet.</p>

      <div className="card">
        <h2>wealth-bff connectivity</h2>
        <p className="status">
          <Dot status={bffStatus} />
          {bffStatus === "checking" && "Checking..."}
          {bffStatus === "not-configured" && "WEALTH_BFF_URL is not set"}
          {bffStatus === "ok" && `Reachable at ${bffUrl}${bffState ? " — " + bffState : ""}`}
          {bffStatus === "unreachable" && `Could not reach ${bffUrl}`}
        </p>
      </div>

      <div className="card">
        <h2>wealth-bss: database + cache</h2>
        <p className="status">
          <Dot status={dbStatus} />
          {dbStatus === "checking" && "Checking database..."}
          {dbStatus === "not-configured" && "NEXT_PUBLIC_WEALTH_BSS_URL is not set"}
          {dbStatus === "up" && `Database up${dbDetail ? " — " + dbDetail : ""}`}
          {dbStatus === "down" && "Database unreachable"}
          {dbStatus === "unknown" && "Database status unknown (set MANAGEMENT_HEALTH_SHOW_DETAILS=always on wealth-bss)"}
        </p>
        <p className="status">
          <Dot status={redisStatus} />
          {redisStatus === "checking" && "Checking cache..."}
          {redisStatus === "not-configured" && "NEXT_PUBLIC_WEALTH_BSS_URL is not set"}
          {redisStatus === "up" && `Cache up${redisDetail ? " — " + redisDetail : ""}`}
          {redisStatus === "down" && "Cache unreachable"}
          {redisStatus === "unknown" && "Cache status unknown (set MANAGEMENT_HEALTH_SHOW_DETAILS=always on wealth-bss)"}
        </p>
      </div>
    </main>
  );
}
