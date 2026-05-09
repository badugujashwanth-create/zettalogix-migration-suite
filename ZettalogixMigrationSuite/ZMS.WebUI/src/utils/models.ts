export type ConnectionType = "SharePointOnPrem" | "SharePointOnline" | "FileShare" | "GoogleDrive";
export type ConnectionStatus = "Healthy" | "Warning" | "Disconnected";
export type JobStatus = "Draft" | "Queued" | "Running" | "Paused" | "Completed" | "CompletedWithErrors" | "Failed";
export type NotificationTone = "success" | "error" | "info";
export type JobEventLevel = "info" | "success" | "warning" | "error";

export interface ConnectionRecord {
  id: string;
  name: string;
  type: ConnectionType;
  url: string;
  rootPath?: string;
  documentLibraryName?: string;
  hasClientSecret: boolean;
  hasRefreshToken: boolean;
  summary: string;
  status: ConnectionStatus;
  lastChecked: string;
  lastTestMessage?: string;
}

export interface JobEvent {
  id: string;
  timestamp: string;
  level: JobEventLevel;
  message: string;
  details?: string;
}

export interface MigrationJob {
  id: string;
  name: string;
  sourceConnectionId: string;
  targetConnectionId: string;
  sourcePath: string;
  sourceLibraryName?: string;
  targetSite: string;
  targetLibrary: string;
  targetLibraryUrlSegment?: string;
  targetRootPath?: string;
  preserveMetadata: boolean;
  totalFiles: number;
  migratedFiles: number;
  failedFiles: number;
  progress: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  lastError?: string;
  history: JobEvent[];
}

export interface AppSettings {
  concurrency: number;
  retryLimit: number;
  notifyOnFailure: boolean;
  telemetryEnabled: boolean;
}

export interface CreateJobInput {
  name: string;
  sourceConnectionId: string;
  targetConnectionId: string;
  sourcePath: string;
  sourceLibraryName: string;
  targetSite: string;
  targetLibrary: string;
  targetLibraryUrlSegment: string;
  targetRootPath: string;
  preserveMetadata: boolean;
}

export interface CreateConnectionInput {
  name: string;
  type: ConnectionType;
  url: string;
  rootPath: string;
  folderId: string;
  folderUrl: string;
  folderName: string;
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  documentLibraryName: string;
}

export interface NotificationMessage {
  id: string;
  tone: NotificationTone;
  title: string;
  description: string;
}

export interface ConnectionTestResult {
  isSuccess: boolean;
  message: string;
  testedAt: string;
}

export interface LoadingState {
  bootstrap: boolean;
  jobs: boolean;
  connections: boolean;
  jobsMutation: boolean;
  connectionsMutation: boolean;
  settings: boolean;
}
