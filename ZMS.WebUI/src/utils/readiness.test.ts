import { describe, expect, test } from "vitest";
import type { ConnectionRecord, MigrationJob } from "./models";
import { assessMigrationReadiness } from "./readiness";

const connections: ConnectionRecord[] = [
  {
    id: "source",
    name: "Synthetic source",
    type: "FileShare",
    url: "synthetic://source",
    hasClientSecret: false,
    hasRefreshToken: false,
    summary: "Synthetic source",
    status: "Healthy",
    lastChecked: "2026-07-19T00:00:00.000Z"
  },
  {
    id: "target",
    name: "Synthetic target",
    type: "SharePointOnline",
    url: "https://contoso.example/sites/records",
    hasClientSecret: true,
    hasRefreshToken: false,
    summary: "Synthetic target",
    status: "Healthy",
    lastChecked: "2026-07-19T00:00:00.000Z"
  }
];

const job: MigrationJob = {
  id: "job",
  name: "Synthetic migration",
  sourceConnectionId: "source",
  targetConnectionId: "target",
  sourcePath: "/Source",
  targetSite: "https://contoso.example/sites/records",
  targetLibrary: "Records",
  preserveMetadata: true,
  totalFiles: 10,
  migratedFiles: 0,
  failedFiles: 0,
  progress: 0,
  status: "Draft",
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
  history: []
};

describe("migration readiness", () => {
  test("marks inspectable healthy drafts ready", () => {
    const readiness = assessMigrationReadiness(job, connections);
    expect(readiness.level).toBe("ready");
    expect(readiness.score).toBe(100);
  });

  test("requires review when failures are present", () => {
    const readiness = assessMigrationReadiness({ ...job, failedFiles: 2 }, connections);
    expect(readiness.level).toBe("review");
    expect(readiness.checks.find((check) => check.id === "failures")?.state).toBe("review");
  });

  test("blocks when a referenced connection is absent", () => {
    const readiness = assessMigrationReadiness(job, connections.filter((connection) => connection.id !== "target"));
    expect(readiness.level).toBe("blocked");
    expect(readiness.score).toBeLessThan(100);
  });

  test("blocks incomplete mappings without inventing readiness", () => {
    const readiness = assessMigrationReadiness({ ...job, targetLibrary: "" }, connections);
    expect(readiness.level).toBe("blocked");
    expect(readiness.checks.find((check) => check.id === "mapping")?.state).toBe("blocked");
  });
});
