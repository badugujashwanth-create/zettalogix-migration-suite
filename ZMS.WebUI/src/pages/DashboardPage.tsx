import DashboardCards from "../components/DashboardCards/DashboardCards";
import JobTable from "../components/JobTable/JobTable";
import LoadingBlock from "../components/LoadingBlock/LoadingBlock";
import { useAppStore } from "../hooks/useAppStore";
import { useJobsPolling } from "../hooks/useJobsPolling";
import { getDashboardSummary } from "../utils/formatters";

export default function DashboardPage(): JSX.Element {
  const jobs = useAppStore((state) => state.jobs);
  const connections = useAppStore((state) => state.connections);
  const loading = useAppStore((state) => state.loading.bootstrap || state.loading.jobs);
  const startJob = useAppStore((state) => state.startJob);
  const pauseJob = useAppStore((state) => state.pauseJob);

  useJobsPolling(true);

  const summary = getDashboardSummary(jobs, connections);
  const activeJobs = jobs.filter((job) => job.status === "Running");

  if (loading && jobs.length === 0) {
    return (
      <div className="card-grid">
        <LoadingBlock />
        <LoadingBlock />
        <LoadingBlock />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="split-panel">
        <article className="surface-card hero-stat">
          <span className="eyebrow">Migration Throughput</span>
          <strong>{summary.runningJobs}</strong>
          <p>Jobs are currently running across the suite, with state refreshed from the live migration API.</p>
        </article>

        <article className="tonal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">System Health</span>
              <h2>Operational confidence</h2>
              <p>Connection quality, failure pressure, and completion rates stay visible without switching workspaces.</p>
            </div>
          </div>
          <div className="meta-grid">
            <div className="metric-box">
              <span>Healthy gateways</span>
              <strong>{summary.connectedSources}</strong>
              <p>Endpoints ready for source or destination traffic.</p>
            </div>
            <div className="metric-box">
              <span>At risk</span>
              <strong>{summary.atRiskConnections}</strong>
              <p>Connections that require a fresh validation.</p>
            </div>
            <div className="metric-box">
              <span>Completed waves</span>
              <strong>{summary.completedJobs}</strong>
              <p>Migrations closed without operator escalation.</p>
            </div>
          </div>
        </article>
      </section>

      <DashboardCards
        cards={[
          { label: "Total jobs", value: summary.totalJobs, caption: "All migration work tracked in the operational ledger." },
          { label: "Running", value: summary.runningJobs, caption: "Live executions currently processing batches." },
          { label: "Completed", value: summary.completedJobs, caption: "Successful jobs now available for reporting." },
          { label: "Failed", value: summary.failedJobs, caption: "Pipelines requiring remediation or rerun." }
        ]}
      />

      <section className="two-column">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Recent Activity</span>
              <h2>Migration queue</h2>
              <p>Recent job movement and progress sit in a compact operational view.</p>
            </div>
          </div>
          <JobTable jobs={jobs.slice(0, 5)} onStart={(id) => void startJob(id)} onPause={(id) => void pauseJob(id)} />
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Pipeline Overview</span>
              <h2>Running workloads</h2>
              <p>Operators can spot active migrations and file movement at a glance.</p>
            </div>
          </div>
          <div className="page-stack">
            {activeJobs.length === 0 ? (
              <div className="metric-box">
                <span>Idle state</span>
                <strong>No active jobs</strong>
                <p>Start a migration from the monitor page to see live throughput here.</p>
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.id} className="metric-box">
                  <span>{job.status}</span>
                  <strong>{job.name}</strong>
                  <p>
                    {job.migratedFiles} of {job.totalFiles} files moved toward {job.targetLibrary}.
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
