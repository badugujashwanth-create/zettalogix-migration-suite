import { ConnectionRecord, ConnectionType, JobStatus, MigrationJob } from "./models";

export function formatDate(value: string | undefined): string {
  if (!value) {
    return "Not started";
  }

  return new Date(value).toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatConnectionType(value: ConnectionType): string {
  switch (value) {
    case "SharePointOnPrem":
      return "SharePoint On-Prem";
    case "SharePointOnline":
      return "SharePoint Online";
    case "FileShare":
      return "File Share";
    case "GoogleDrive":
      return "Google Drive";
    default:
      return value;
  }
}

export function formatJobStatus(value: JobStatus): string {
  switch (value) {
    case "CompletedWithErrors":
      return "Completed With Errors";
    default:
      return value.replace(/([a-z])([A-Z])/g, "$1 $2");
  }
}

export function getDashboardSummary(jobs: MigrationJob[], connections: ConnectionRecord[]) {
  return {
    totalJobs: jobs.length,
    runningJobs: jobs.filter((job) => job.status === "Running").length,
    completedJobs: jobs.filter((job) => job.status === "Completed" || job.status === "CompletedWithErrors").length,
    failedJobs: jobs.filter((job) => job.status === "Failed").length,
    connectedSources: connections.filter((connection) => connection.status === "Healthy").length,
    atRiskConnections: connections.filter((connection) => connection.status !== "Healthy").length
  };
}
