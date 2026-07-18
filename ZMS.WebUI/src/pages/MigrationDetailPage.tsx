import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon/AppIcon";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import EmptyState from "../components/EmptyState/EmptyState";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import { useAppStore } from "../hooks/useAppStore";
import { useJobsPolling } from "../hooks/useJobsPolling";
import { api } from "../services/api";
import { isDemoMode } from "../services/demoMode";
import { getErrorGuidance } from "../utils/errorHelp";
import { formatDate, formatJobStatus } from "../utils/formatters";
import { assessMigrationReadiness } from "../utils/readiness";

export default function MigrationDetailPage(): JSX.Element {
  const demoMode = isDemoMode();
  const { id } = useParams();
  const navigate = useNavigate();
  const jobs = useAppStore((state) => state.jobs);
  const connections = useAppStore((state) => state.connections);
  const startJob = useAppStore((state) => state.startJob);
  const pauseJob = useAppStore((state) => state.pauseJob);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useJobsPolling(true);

  const job = useMemo(() => jobs.find((item) => item.id === id), [id, jobs]);
  const readiness = useMemo(
    () => job ? assessMigrationReadiness(job, connections) : null,
    [connections, job]
  );

  if (!job) {
    return (
      <EmptyState
        title="Migration not found"
        description="The selected migration does not exist in the current dataset."
        action={
          <button type="button" className="primary-button" onClick={() => navigate("/migrations")}>
            Back to monitor
          </button>
        }
      />
    );
  }

  return (
    <>
      <section className="page-stack">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Active Job</span>
              <h2>{job.name}</h2>
              <p>
                {demoMode
                  ? "This detail combines deterministic synthetic progress, local event history, and reversible demo controls."
                  : "This detail combines progress and event history reported by the configured external API."}
              </p>
            </div>
            <div className="action-group">
              <button type="button" className="primary-button" onClick={() => void startJob(job.id)} disabled={job.status === "Completed"}>
                Start
              </button>
              <button type="button" className="ghost-button" onClick={() => setConfirmOpen(true)} disabled={job.status !== "Running"}>
                Pause
              </button>
              <button type="button" className="ghost-button" onClick={() => void api.downloadReport(`/jobs/${job.id}/summary.csv`)}>
                Summary CSV
              </button>
              <button type="button" className="ghost-button" onClick={() => void api.downloadReport(`/jobs/${job.id}/items.csv`)}>
                Items CSV
              </button>
              <button type="button" className="ghost-button" onClick={() => void api.downloadReport(`/jobs/${job.id}/logs.csv`)}>
                Logs CSV
              </button>
            </div>
          </div>

          <div className="page-stack">
            <div className="metric-box">
              <span>Pipeline progress</span>
              <strong>{job.progress}%</strong>
              <p>
                {job.migratedFiles} of {job.totalFiles} files migrated with {job.failedFiles} failures recorded.
              </p>
              <div style={{ marginTop: 14 }}>
                <ProgressBar value={job.progress} />
              </div>
            </div>
            <div className="detail-list">
            <div>
              <span>Status</span>
              <strong>{formatJobStatus(job.status)}</strong>
            </div>
              <div>
                <span>Started</span>
                <strong>{formatDate(job.startedAt)}</strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{job.sourceLibraryName ? `${job.sourcePath} / ${job.sourceLibraryName}` : job.sourcePath}</strong>
              </div>
              <div>
                <span>Destination</span>
                <strong>
                  {job.targetSite} / {job.targetLibrary}
                  {job.targetRootPath ? ` / ${job.targetRootPath}` : ""}
                </strong>
              </div>
            </div>
          </div>
        </article>

        {readiness ? (
          <article className="surface-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Evidence-derived preflight</span>
                <h2>Migration readiness</h2>
                <p>
                  This score uses only the current connection state, mapping fields, failure count, and event history.
                  It is not a prediction that a real migration will succeed.
                </p>
              </div>
              <div className={`status-chip ${readiness.level === "ready" ? "completed" : readiness.level === "review" ? "warning" : "failed"}`}>
                {readiness.level} · {readiness.score}%
              </div>
            </div>
            <div className="meta-grid">
              {readiness.checks.map((check) => (
                <div key={check.id} className="metric-box">
                  <span>{check.state}</span>
                  <strong className="readiness-label">{check.label}</strong>
                  <p>{check.detail}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {job.lastError ? (
          <article className="error-panel">
            <div>
              <span className="eyebrow">Failure Analysis</span>
              <h2>{getErrorGuidance(job.lastError)?.title ?? "Migration error requires review"}</h2>
              <p>{job.lastError}</p>
            </div>
            {getErrorGuidance(job.lastError) ? (
              <div className="guidance-list">
                <strong>{getErrorGuidance(job.lastError)?.summary}</strong>
                <ul>
                  {getErrorGuidance(job.lastError)?.checks.map((check) => <li key={check}>{check}</li>)}
                </ul>
                {getErrorGuidance(job.lastError)?.docs ? (
                  <a
                    className="external-link"
                    href={getErrorGuidance(job.lastError)?.docs?.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <AppIcon name="open_in_new" />
                    {getErrorGuidance(job.lastError)?.docs?.label}
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>
        ) : null}

        <section className="detail-grid">
          <article className="surface-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Recent Operations</span>
                <h2>Execution log</h2>
                <p>
                  {demoMode
                    ? "Event history is generated by local demo transitions and never written to an external service."
                    : "Event history is loaded from the reporting API and refreshed through the polling hook."}
                </p>
              </div>
            </div>

            <div className="timeline">
              {job.history.length === 0 ? (
                <div className="timeline-item">
                  <strong>No log entries yet.</strong>
                  <span>The reporting API will show activity after the job starts writing logs.</span>
                </div>
              ) : (
                job.history.slice(0, 8).map((event) => {
                  const guidance = getErrorGuidance(`${event.message} ${event.details ?? ""}`);

                  return (
                    <div key={event.id} className={`timeline-item ${event.level}`}>
                      <strong>{event.message}</strong>
                      <span>{formatDate(event.timestamp)}</span>
                      {event.details ? <p className="timeline-detail">{event.details}</p> : null}
                      {guidance && event.level !== "info" ? (
                        <div className="timeline-guidance">
                          <strong>{guidance.title}</strong>
                          <p>{guidance.summary}</p>
                          <ul>
                            {guidance.checks.slice(0, 3).map((check) => <li key={check}>{check}</li>)}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="surface-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Throughput</span>
                <h2>Execution profile</h2>
              </div>
            </div>

            <div className="page-stack">
              <div className="metric-box">
                <span>Completed batches</span>
                <strong>{Math.max(1, Math.round(job.migratedFiles / 80))}</strong>
                <p>Approximate processed batches based on persisted completed item counts.</p>
              </div>
              <div className="metric-box">
                <span>Metadata policy</span>
                <strong>{job.preserveMetadata ? "Preserved" : "Standard copy"}</strong>
                <p>The job keeps this flag alongside the source and target mapping throughout execution.</p>
              </div>
              <div className="metric-box">
                <span>Created</span>
                <strong>{formatDate(job.createdAt)}</strong>
                <p>The migration blueprint was created through the API and remains visible in the dashboard.</p>
              </div>
            </div>
          </article>
        </section>
      </section>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Pause current job?"
        description="Pause the migration to inspect current throughput and recent operations before more batches are processed."
        confirmLabel="Pause migration"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void pauseJob(job.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
