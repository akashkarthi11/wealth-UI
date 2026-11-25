"use client";

import { useEffect, useState } from "react";

type BffStatus = "checking" | "ok" | "unreachable" | "not-configured";

export default function Home() {
  const [status, setStatus] = useState<BffStatus>("checking");
  const bffUrl = process.env.NEXT_PUBLIC_WEALTH_BFF_URL;

  useEffect(() => {
    if (!bffUrl) {
      setStatus("not-configured");
      return;
    }
    fetch(`${bffUrl}/actuator/health`)
      .then((r) => setStatus(r.ok ? "ok" : "unreachable"))
      .catch(() => setStatus("unreachable"));
  }, [bffUrl]);

  return (
    <main>
      <h1>wealth-ui</h1>
      <p>Sample starter scaffold. Nothing here is real product UI yet.</p>

      <div className="card">
        <h2>wealth-bff connectivity</h2>
        <p className="status">
          <span
            className={`dot ${
              status === "ok" ? "ok" : status === "unreachable" ? "err" : ""
            }`}
          />
          {status === "checking" && "Checking..."}
          {status === "not-configured" &&
            "NEXT_PUBLIC_WEALTH_BFF_URL is not set"}
          {status === "ok" && `Reachable at ${bffUrl}`}
          {status === "unreachable" && `Could not reach ${bffUrl}`}
        </p>
      </div>
    </main>
  );
}
