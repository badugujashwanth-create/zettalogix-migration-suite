import {
  AppSettings,
  ConnectionRecord,
  ConnectionStatus,
  ConnectionTestResult,
  CreateConnectionInput,
  CreateJobInput,
  JobEvent,
  MigrationJob
} from "../utils/models";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5206").replace(/\/+$/, "");
const settingsStorageKey = "zms-web-ui-settings";

const connectionHealth = new Map<string, ConnectionTestResult>();

interface ApiConnectionResponse {
  id: string;
  name: string;
  type: ConnectionRecord["type"];
  url: string;
  rootPath?: string;
  isEnabled: boolean;
  createdUtc: string;
  updatedUtc: string;
}

interface ApiConnectionTestResponse {
  isSuccess: boolean;
  message: string;
  testedUtc: string;
}

interface ApiMigrationJobResponse {
  id: string;
  name: string;
  sourceConnectionId: string;
  targetConnectionId: string;
  sourceLocation: string;
  sourceLibraryName?: string;
  targetSiteUrl: string;
  targetLibraryName: string;
  preserveMetadata: boolean;
  batchSize: number;
  maxRetryCount: number;
  status: MigrationJob["status"];
  totalItems: number;
  completedItems: number;
  failedItems: number;
  lastError?: string;
  createdUtc: string;
  startedUtc?: string;
  finishedUtc?: string;
  updatedUtc: string;
}

interface ApiJobReportResponse {
  progressPercentage: number;
  recentLogs: ApiLogEntry[];
}

interface ApiLogEntry {
  id: string;
  severity: "Information" | "Warning" | "Error";
  message: string;
  details?: string;
  createdUtc: string;
}

const defaultSettings: AppSettings = {
  concurrency: 4,
  retryLimit: 3,
  notifyOnFailure: true,
  telemetryEnabled: false
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request to '${path}' failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.text();
  if (!payload) {
    return undefined as T;
  }

  return JSON.parse(payload) as T;
}

function getConnectionSummary(connection: ApiConnectionResponse): string {
  switch (connection.type) {
    case "SharePointOnPrem":
      return "Legacy SharePoint source connection.";
    case "SharePointOnline":
      return "Target Microsoft 365 document library connection.";
    case "FileShare":
      return connection.rootPath
        ? `Reads files from '${connection.rootPath}'.`
        : "Reads files from a network file share.";
    case "GoogleDrive":
      return connection.rootPath
        ? `Uses Google Drive folder scope '${connection.rootPath}'.`
        : "Uses the configured Google Drive root.";
    default:
      return "Migration connection profile.";
  }
}

function getConnectionStatus(connectionId: string, updatedUtc: string): Pick<ConnectionRecord, "status" | "lastChecked" | "lastTestMessage"> {
  const health = connectionHealth.get(connectionId);
  if (!health) {
    return {
      status: "Disconnected",
      lastChecked: updatedUtc
    };
  }

  return {
    status: health.isSuccess ? "Healthy" : "Warning",
    lastChecked: health.testedAt,
    lastTestMessage: health.message
  };
}

function mapConnection(connection: ApiConnectionResponse): ConnectionRecord {
  return {
    id: connection.id,
    name: connection.name,
    type: connection.type,
    url: connection.url,
    rootPath: connection.rootPath,
    summary: getConnectionSummary(connection),
    ...getConnectionStatus(connection.id, connection.updatedUtc)
  };
}

function mapEventLevel(severity: ApiLogEntry["severity"]): JobEvent["level"] {
  switch (severity) {
    case "Error":
      return "error";
    case "Warning":
      return "warning";
    default:
      return "info";
  }
}

function mapJob(job: ApiMigrationJobResponse, report?: ApiJobReportResponse | null): MigrationJob {
  const totalFiles = job.totalItems;
  const migratedFiles = job.completedItems;
  const progress =
    report?.progressPercentage
    ?? (totalFiles > 0 ? Math.round((migratedFiles / totalFiles) * 100) : job.status === "Completed" ? 100 : 0);

  return {
    id: job.id,
    name: job.name,
    sourceConnectionId: job.sourceConnectionId,
    targetConnectionId: job.targetConnectionId,
    sourcePath: job.sourceLocation,
    targetSite: job.targetSiteUrl,
    targetLibrary: job.targetLibraryName,
    preserveMetadata: job.preserveMetadata,
    totalFiles,
    migratedFiles,
    failedFiles: job.failedItems,
    progress,
    status: job.status,
    createdAt: job.createdUtc,
    updatedAt: job.updatedUtc,
    startedAt: job.startedUtc,
    history:
      report?.recentLogs.map((log) => ({
        id: log.id,
        timestamp: log.createdUtc,
        level: mapEventLevel(log.severity),
        message: log.message
      })) ?? []
  };
}

async function getJobReport(jobId: string): Promise<ApiJobReportResponse | null> {
  try {
    return await request<ApiJobReportResponse>(`/reports/jobs/${jobId}`);
  } catch {
    return null;
  }
}

function loadSettings(): AppSettings {
  const stored = window.localStorage.getItem(settingsStorageKey);
  if (!stored) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...(JSON.parse(stored) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
}

function saveSettingsToStorage(settings: AppSettings): void {
  window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
}

export const api = {
  async getJobs(): Promise<MigrationJob[]> {
    const jobs = await request<ApiMigrationJobResponse[]>("/jobs");
    const reports = await Promise.all(jobs.map((job) => getJobReport(job.id)));

    return jobs
      .map((job, index) => mapJob(job, reports[index]))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },

  async getJob(id: string): Promise<MigrationJob | undefined> {
    try {
      const [job, report] = await Promise.all([
        request<ApiMigrationJobResponse>(`/jobs/${id}`),
        getJobReport(id)
      ]);

      return mapJob(job, report);
    } catch {
      return undefined;
    }
  },

  async createJob(input: CreateJobInput): Promise<MigrationJob> {
    const job = await request<ApiMigrationJobResponse>("/jobs", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        sourceConnectionId: input.sourceConnectionId,
        targetConnectionId: input.targetConnectionId,
        sourceLocation: input.sourcePath,
        targetSiteUrl: input.targetSite,
        targetLibraryName: input.targetLibrary,
        preserveMetadata: input.preserveMetadata,
        batchSize: 20,
        maxRetryCount: 3
      })
    });

    return mapJob(job, await getJobReport(job.id));
  },

  async startMigration(id: string): Promise<void> {
    await request<void>(`/jobs/${id}/start`, { method: "POST", body: "{}" });
  },

  async pauseMigration(id: string): Promise<void> {
    await request<void>(`/jobs/${id}/pause`, { method: "POST", body: "{}" });
  },

  async getConnections(): Promise<ConnectionRecord[]> {
    const connections = await request<ApiConnectionResponse[]>("/connections");
    return connections.map(mapConnection);
  },

  async createConnection(input: CreateConnectionInput): Promise<ConnectionRecord> {
    const connection = await request<ApiConnectionResponse>("/connections", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        url: input.url,
        username: input.username || null,
        password: input.password || null,
        clientId: input.clientId || null,
        clientSecret: input.clientSecret || null,
        tenantId: input.tenantId || null,
        rootPath: input.rootPath || null,
        additionalSettings: input.refreshToken
          ? {
              RefreshToken: input.refreshToken
            }
          : {}
      })
    });

    return mapConnection(connection);
  },

  async testConnection(id: string): Promise<ConnectionTestResult> {
    const result = await request<ApiConnectionTestResponse>(`/connections/${id}/test`, {
      method: "POST",
      body: "{}"
    });

    const mappedResult: ConnectionTestResult = {
      isSuccess: result.isSuccess,
      message: result.message,
      testedAt: result.testedUtc
    };

    connectionHealth.set(id, mappedResult);
    return mappedResult;
  },

  async getSettings(): Promise<AppSettings> {
    return loadSettings();
  },

  async saveSettings(input: AppSettings): Promise<AppSettings> {
    saveSettingsToStorage(input);
    return input;
  }
};
