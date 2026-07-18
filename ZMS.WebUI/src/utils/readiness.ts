import type { ConnectionRecord, MigrationJob } from "./models";

export type ReadinessLevel = "ready" | "review" | "blocked";
export type ReadinessCheckState = "pass" | "review" | "blocked";

export interface ReadinessCheck {
  id: string;
  label: string;
  state: ReadinessCheckState;
  detail: string;
}

export interface MigrationReadiness {
  level: ReadinessLevel;
  score: number;
  checks: ReadinessCheck[];
}

function connectionCheck(
  id: string,
  label: string,
  connection: ConnectionRecord | undefined
): ReadinessCheck {
  if (!connection) {
    return { id, label, state: "blocked", detail: "The referenced connection is not present in this dataset." };
  }

  if (connection.status === "Healthy") {
    return { id, label, state: "pass", detail: `${connection.name} is reported healthy.` };
  }

  if (connection.status === "Warning") {
    return { id, label, state: "review", detail: `${connection.name} requires operator review.` };
  }

  return { id, label, state: "blocked", detail: `${connection.name} has not passed a connection check.` };
}

export function assessMigrationReadiness(
  job: MigrationJob,
  connections: ConnectionRecord[]
): MigrationReadiness {
  const source = connections.find((connection) => connection.id === job.sourceConnectionId);
  const target = connections.find((connection) => connection.id === job.targetConnectionId);
  const hasMapping = Boolean(job.sourcePath.trim() && job.targetSite.trim() && job.targetLibrary.trim());

  const checks: ReadinessCheck[] = [
    connectionCheck("source", "Source connection", source),
    connectionCheck("target", "Target connection", target),
    {
      id: "mapping",
      label: "Source and target mapping",
      state: hasMapping ? "pass" : "blocked",
      detail: hasMapping
        ? `${job.sourcePath} maps to ${job.targetLibrary}.`
        : "A source path, target site, or target library is missing."
    },
    {
      id: "failures",
      label: "Failure pressure",
      state: job.failedFiles > 0 ? "review" : "pass",
      detail: job.failedFiles > 0
        ? `${job.failedFiles} item failure${job.failedFiles === 1 ? "" : "s"} require review.`
        : "No item failures are recorded in the current dataset."
    },
    {
      id: "history",
      label: "Inspectable evidence",
      state: job.history.length > 0 || job.status === "Draft" ? "pass" : "review",
      detail: job.history.length > 0
        ? `${job.history.length} event${job.history.length === 1 ? " is" : "s are"} available for inspection.`
        : job.status === "Draft"
          ? "The draft has not produced execution events yet."
          : "This non-draft job has no event evidence in the current dataset."
    }
  ];

  const level: ReadinessLevel = checks.some((check) => check.state === "blocked")
    ? "blocked"
    : checks.some((check) => check.state === "review")
      ? "review"
      : "ready";
  const score = Math.round(
    checks.reduce((total, check) => total + (check.state === "pass" ? 1 : check.state === "review" ? 0.5 : 0), 0)
      / checks.length
      * 100
  );

  return { level, score, checks };
}
