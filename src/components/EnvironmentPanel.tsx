import { ENDPOINTS } from "@/lib/constants";

import ConnectionCard from "./ConnectionCard";
import styles from "./EnvironmentPanel.module.css";
import Panel from "./Panel";

// Environment config: where each part of the app finds the next one. Every setting is one row; open it to change it.
// A change is saved only when the new one answers, is used at once, and returns to the deployed setting when that service restarts.
// Passwords and other secrets stay in the server environment and are never shown here.
export default function EnvironmentPanel() {
  return (
    <Panel title="Environment config" hint="Open a setting to change it. A change is used at once and goes back to the deployed setting when that service restarts.">
      <h3 className={styles.group}>Service addresses</h3>
      <div className={styles.list}>
        <ConnectionCard
          title="UI to BFF"
          hint="Where this website calls"
          mode="urlparts"
          example="172.27.99.226"
          endpoints={ENDPOINTS.connections.bff}
        />
        <ConnectionCard
          title="BFF to BSS"
          hint="Where the BFF calls"
          mode="urlparts"
          example="172.27.99.226"
          endpoints={ENDPOINTS.connections.bss}
        />
      </div>

      <h3 className={styles.group}>Data services</h3>
      <div className={styles.list}>
        <ConnectionCard
          title="Postgres"
          hint="The database"
          mode="hostport"
          credentials
          paste="postgres"
          example="db.example.com"
          endpoints={ENDPOINTS.environment.postgres}
        />
        <ConnectionCard
          title="Redis"
          hint="Cache and limits"
          mode="hostport"
          credentials
          paste="redis"
          example="redis.example.com"
          endpoints={ENDPOINTS.environment.redis}
        />
        <ConnectionCard
          title="Kafka"
          hint="Event stream"
          mode="hostports"
          credentials
          paste="kafka"
          example="broker.example.com"
          endpoints={ENDPOINTS.environment.kafka}
        />
      </div>
      <p className={styles.note}>For the data services you can change the host, port, username and password. The database name and other options stay as deployed.</p>
    </Panel>
  );
}
