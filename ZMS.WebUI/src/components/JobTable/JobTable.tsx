import { Link } from "react-router-dom";
import { formatDate, formatJobStatus } from "../../utils/formatters";
import { MigrationJob } from "../../utils/models";
import ProgressBar from "../ProgressBar/ProgressBar";
import EmptyState from "../EmptyState/EmptyState";
import styles from "./JobTable.module.css";

interface JobTableProps {
  jobs: MigrationJob[];
  onStart: (id: string) => void;
  onPause: (id: string) => void;
}

export default function JobTable({ jobs, onStart, onPause }: JobTableProps): JSX.Element {
  if (jobs.length === 0) {
    return <EmptyState title="No migration jobs yet" description="Create a job to see it appear in the execution table." />;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Migration</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Target</th>
            <th>Updated</th>
            <th>Control</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <strong>{job.name}</strong>
                <span className={styles.subtle}>
                  {job.sourcePath} to {job.targetLibrary}
                </span>
              </td>
              <td>
                <span className={`status-chip ${job.status.toLowerCase()}`}>{formatJobStatus(job.status)}</span>
              </td>
              <td>
                <ProgressBar value={job.progress} />
                <span className={styles.subtle}>
                  {job.migratedFiles} of {job.totalFiles} files
                </span>
              </td>
              <td>
                <span>{job.targetSite}</span>
                <span className={styles.subtle}>{job.targetLibrary}</span>
              </td>
              <td>{formatDate(job.updatedAt)}</td>
              <td className={styles.actions}>
                <Link to={`/migrations/${job.id}`}>Open</Link>
                {job.status === "Running" ? (
                  <button type="button" onClick={() => onPause(job.id)}>
                    Pause
                  </button>
                ) : (
                  <button type="button" onClick={() => onStart(job.id)} disabled={job.status === "Completed"}>
                    Start
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
