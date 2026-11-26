// Splits a pasted connection string into the parts the Environment cards edit. Nothing is sent from here; the card fills its fields and the admin saves.

export type ConnectionKind = "postgres" | "redis" | "kafka";

export interface SplitResult {
  // One entry for Postgres and Redis, several for Kafka.
  hosts: { host: string; port: string }[];
  username: string;
  password: string;
  // Parts of the string that cannot be changed from this screen and stay as deployed.
  ignored: string[];
}

const DEFAULT_PORT: Record<ConnectionKind, string> = { postgres: "5432", redis: "6379", kafka: "9092" };
const HOST_PORT = /^([A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?):(\d{1,5})$/;

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

function splitKafka(text: string): SplitResult | null {
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  const hosts = parts.map((part) => HOST_PORT.exec(part));
  if (parts.length === 0 || hosts.some((match) => match === null)) return null;
  return { hosts: hosts.map((match) => ({ host: match![1], port: match![3] })), username: "", password: "", ignored: [] };
}

// postgresql://user:password@host:5432/db?sslmode=require, postgres://…, jdbc:postgresql://host/db?user=u&password=p, redis://user:password@host:6379, rediss://…
export function splitConnectionString(kind: ConnectionKind, input: string): SplitResult | null {
  const text = input.trim();
  if (!text) return null;
  if (kind === "kafka") return splitKafka(text);

  const withoutJdbc = text.replace(/^jdbc:/i, "");
  const schemes = kind === "postgres" ? /^(postgresql|postgres):\/\//i : /^rediss?:\/\//i;
  if (!schemes.test(withoutJdbc)) return null;
  let url: URL;
  try {
    url = new URL(withoutJdbc);
  } catch {
    return null;
  }
  if (!url.hostname) return null;

  const query = url.searchParams;
  const username = decode(url.username) || query.get("user") || "";
  const password = decode(url.password) || query.get("password") || "";
  const ignored: string[] = [];
  if (kind === "postgres") {
    const database = url.pathname.replace(/^\//, "");
    if (database) ignored.push("the database name");
    const options = Array.from(query.keys()).filter((key) => key !== "user" && key !== "password");
    if (options.length > 0) ignored.push(`the options (${options.join(", ")})`);
  } else {
    if (url.protocol.toLowerCase() === "rediss:") ignored.push("TLS (rediss)");
    if (url.pathname.replace(/^\//, "")) ignored.push("the database number");
  }
  return { hosts: [{ host: url.hostname, port: url.port || DEFAULT_PORT[kind] }], username, password, ignored };
}
