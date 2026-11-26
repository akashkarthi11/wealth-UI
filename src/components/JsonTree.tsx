import { humanKey } from "@/lib/format";

import styles from "./JsonTree.module.css";

const MAX_ITEMS = 50;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function Scalar({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className={styles.empty}>—</span>;
  if (typeof value === "number") return <span className={styles.num}>{value.toLocaleString("en-IN")}</span>;
  return <span>{String(value)}</span>;
}

// Shows saved JSON (a statement, a report) as labelled rows. Read only; long lists are cut at 50 items.
export default function JsonTree({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ol className={styles.list}>
        {value.slice(0, MAX_ITEMS).map((item, index) => (
          <li key={index}>
            <JsonTree value={item} />
          </li>
        ))}
        {value.length > MAX_ITEMS ? <li className={styles.more}>… {value.length - MAX_ITEMS} more</li> : null}
      </ol>
    );
  }
  if (isObject(value)) {
    return (
      <dl className={styles.rows}>
        {Object.entries(value).map(([key, child]) => (
          <div key={key} className={styles.row}>
            <dt>{humanKey(key)}</dt>
            <dd>
              {typeof child === "object" && child !== null ? <JsonTree value={child} /> : <Scalar value={child} />}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <Scalar value={value} />;
}
