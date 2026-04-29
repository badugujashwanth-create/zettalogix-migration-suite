import { formatConnectionType, formatDate } from "../../utils/formatters";
import { ConnectionRecord } from "../../utils/models";
import styles from "./ConnectionCard.module.css";

interface ConnectionCardProps {
  connection: ConnectionRecord;
  onTest: (id: string) => void;
}

export default function ConnectionCard({ connection, onTest }: ConnectionCardProps): JSX.Element {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.type}>{formatConnectionType(connection.type)}</span>
          <h3>{connection.name}</h3>
        </div>
        <span className={`status-chip ${connection.status.toLowerCase()}`}>{connection.status}</span>
      </div>

      <p className={styles.description}>{connection.summary}</p>

      <dl className={styles.details}>
        <div>
          <dt>Endpoint</dt>
          <dd>{connection.url}</dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd>{connection.rootPath || "Default root"}</dd>
        </div>
        <div>
          <dt>Last checked</dt>
          <dd>{formatDate(connection.lastChecked)}</dd>
        </div>
      </dl>

      <button type="button" className="ghost-button" onClick={() => onTest(connection.id)}>
        <span className="material-symbols-outlined">bolt</span>
        Test connection
      </button>
    </article>
  );
}
