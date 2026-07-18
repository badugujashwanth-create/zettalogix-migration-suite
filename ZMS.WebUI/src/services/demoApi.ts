import type {
  AppSettings,
  ConnectionRecord,
  ConnectionTestResult,
  CreateConnectionInput,
  CreateJobInput,
  MigrationJob
} from "../utils/models";

const cloned = <T,>(value: T): T => structuredClone(value);

let connections: ConnectionRecord[] = [
  {
    id: "demo-source",
    name: "Legacy Finance Share",
    type: "FileShare",
    url: "synthetic://demo/finance",
    rootPath: "/Finance/Quarterly",
    hasClientSecret: false,
    hasRefreshToken: false,
    summary: "Synthetic file-share source with finance documents.",
    status: "Healthy",
    lastChecked: "2026-07-18T08:30:00.000Z",
    lastTestMessage: "Synthetic source is available."
  },
  {
    id: "demo-target",
    name: "Microsoft 365 Records",
    type: "SharePointOnline",
    url: "https://contoso.example/sites/records",
    documentLibraryName: "Finance Records",
    hasClientSecret: true,
    hasRefreshToken: false,
    summary: "Synthetic SharePoint Online target.",
    status: "Healthy",
    lastChecked: "2026-07-18T08:31:00.000Z",
    lastTestMessage: "Synthetic target permissions validated."
  }
];

let jobs: MigrationJob[] = [
  {
    id: "demo-running",
    name: "Finance Records Wave 2",
    sourceConnectionId: "demo-source",
    targetConnectionId: "demo-target",
    sourcePath: "/Finance/Quarterly",
    sourceLibraryName: "Quarterly Reports",
    targetSite: "https://contoso.example/sites/records",
    targetLibrary: "Finance Records",
    targetRootPath: "/FY2026",
    preserveMetadata: true,
    totalFiles: 1840,
    migratedFiles: 1288,
    failedFiles: 7,
    progress: 70,
    status: "Running",
    createdAt: "2026-07-17T09:10:00.000Z",
    updatedAt: "2026-07-18T08:42:00.000Z",
    startedAt: "2026-07-18T07:55:00.000Z",
    history: [
      {
        id: "demo-event-2",
        timestamp: "2026-07-18T08:42:00.000Z",
        level: "warning",
        message: "Seven files moved to the retry queue.",
        details: "The synthetic demo retains these failures for review."
      },
      {
        id: "demo-event-1",
        timestamp: "2026-07-18T07:55:00.000Z",
        level: "success",
        message: "Migration worker started."
      }
    ]
  },
  {
    id: "demo-complete",
    name: "HR Policies Archive",
    sourceConnectionId: "demo-source",
    targetConnectionId: "demo-target",
    sourcePath: "/HR/Policies",
    targetSite: "https://contoso.example/sites/records",
    targetLibrary: "HR Archive",
    preserveMetadata: true,
    totalFiles: 642,
    migratedFiles: 642,
    failedFiles: 0,
    progress: 100,
    status: "Completed",
    createdAt: "2026-07-16T10:00:00.000Z",
    updatedAt: "2026-07-17T13:20:00.000Z",
    startedAt: "2026-07-17T12:48:00.000Z",
    history: [
      {
        id: "demo-event-3",
        timestamp: "2026-07-17T13:20:00.000Z",
        level: "success",
        message: "All 642 synthetic items migrated."
      }
    ]
  }
];

const initialConnections = cloned(connections);
const initialJobs = cloned(jobs);

export function resetDemoState(): void {
  connections = cloned(initialConnections);
  jobs = cloned(initialJobs);
}

export const demoApi = {
  getJobs: () => Promise.resolve(cloned(jobs)),
  getJob: (id: string) => Promise.resolve(cloned(jobs.find((job) => job.id === id))),
  createJob: (input: CreateJobInput) => {
    const now = new Date().toISOString();
    const job: MigrationJob = {
      id: crypto.randomUUID(),
      name: input.name,
      sourceConnectionId: input.sourceConnectionId,
      targetConnectionId: input.targetConnectionId,
      sourcePath: input.sourcePath,
      sourceLibraryName: input.sourceLibraryName,
      targetSite: input.targetSite,
      targetLibrary: input.targetLibrary,
      targetLibraryUrlSegment: input.targetLibraryUrlSegment,
      targetRootPath: input.targetRootPath,
      preserveMetadata: input.preserveMetadata,
      totalFiles: 320,
      migratedFiles: 0,
      failedFiles: 0,
      progress: 0,
      status: "Draft",
      createdAt: now,
      updatedAt: now,
      history: []
    };
    jobs = [job, ...jobs];
    return Promise.resolve(cloned(job));
  },
  startMigration: (id: string) => {
    const now = new Date().toISOString();
    jobs = jobs.map((job) =>
      job.id === id
        ? {
            ...job,
            status: "Running",
            progress: Math.max(job.progress, 18),
            migratedFiles: Math.max(job.migratedFiles, Math.round(job.totalFiles * 0.18)),
            startedAt: job.startedAt ?? now,
            updatedAt: now,
            history: [
              { id: crypto.randomUUID(), timestamp: now, level: "info", message: "Synthetic migration started." },
              ...job.history
            ]
          }
        : job
    );
    return Promise.resolve();
  },
  pauseMigration: (id: string) => {
    const now = new Date().toISOString();
    jobs = jobs.map((job) =>
      job.id === id
        ? {
            ...job,
            status: "Paused",
            updatedAt: now,
            history: [
              { id: crypto.randomUUID(), timestamp: now, level: "warning", message: "Synthetic migration paused." },
              ...job.history
            ]
          }
        : job
    );
    return Promise.resolve();
  },
  getConnections: () => Promise.resolve(cloned(connections)),
  createConnection: (input: CreateConnectionInput) => {
    const connection: ConnectionRecord = {
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      url: input.url || input.folderUrl,
      rootPath: input.rootPath || input.folderId,
      documentLibraryName: input.documentLibraryName,
      hasClientSecret: Boolean(input.clientSecret),
      hasRefreshToken: false,
      summary: "User-created synthetic demo connection.",
      status: "Disconnected",
      lastChecked: new Date().toISOString()
    };
    connections = [connection, ...connections];
    return Promise.resolve(cloned(connection));
  },
  testConnection: (id: string): Promise<ConnectionTestResult> => {
    const testedAt = new Date().toISOString();
    connections = connections.map((connection) =>
      connection.id === id
        ? { ...connection, status: "Healthy", lastChecked: testedAt, lastTestMessage: "Synthetic connection validated." }
        : connection
    );
    return Promise.resolve({ isSuccess: true, message: "Synthetic connection validated.", testedAt });
  },
  downloadReport: () => {
    const rows = ["name,status,progress,migrated,failed", ...jobs.map((job) =>
      [job.name, job.status, job.progress, job.migratedFiles, job.failedFiles]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "zettalogix-synthetic-demo-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    return Promise.resolve();
  }
};
