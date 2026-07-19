import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";

import { api } from "./api";
import { resetDemoState } from "./demoApi";

const storage = new Map<string, string>();
const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;

beforeAll(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { search: "?demo=1" },
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key)
      }
    }
  });
  globalThis.fetch = vi.fn(() => {
    throw new Error("Synthetic demo must not call fetch.");
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  globalThis.fetch = originalFetch;
});

beforeEach(() => {
  storage.clear();
  resetDemoState();
});

test("synthetic demo performs job state transitions without the live API", async () => {
  const initialJobs = await api.getJobs();
  expect(initialJobs).toHaveLength(2);
  expect(initialJobs.some((job) => job.status === "Running")).toBe(true);

  const created = await api.createJob({
    name: "Legal archive wave",
    sourceConnectionId: "demo-source",
    targetConnectionId: "demo-target",
    sourcePath: "/Legal/Archive",
    sourceLibraryName: "Legal",
    targetSite: "https://contoso.example/sites/records",
    targetLibrary: "Legal Records",
    targetLibraryUrlSegment: "legal-records",
    targetRootPath: "/2026",
    preserveMetadata: true
  });
  expect(created.status).toBe("Draft");

  await api.startMigration(created.id);
  expect((await api.getJob(created.id))?.status).toBe("Running");
  expect((await api.getJob(created.id))?.progress).toBeGreaterThan(0);

  await api.pauseMigration(created.id);
  const paused = await api.getJob(created.id);
  expect(paused?.status).toBe("Paused");
  expect(paused?.history[0]?.message).toContain("paused");
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("synthetic connection tests update real local state", async () => {
  const created = await api.createConnection({
    name: "Synthetic source",
    type: "FileShare",
    url: "synthetic://demo/source",
    rootPath: "/Source",
    folderId: "",
    folderUrl: "",
    folderName: "",
    username: "",
    password: "",
    clientId: "",
    clientSecret: "",
    tenantId: "",
    documentLibraryName: ""
  });
  expect(created.status).toBe("Disconnected");

  const result = await api.testConnection(created.id);
  expect(result.isSuccess).toBe(true);
  expect((await api.getConnections()).find((item) => item.id === created.id)?.status).toBe("Healthy");
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("synthetic state resets to a repeatable two-job baseline", async () => {
  const created = await api.createJob({
    name: "Temporary demo wave",
    sourceConnectionId: "demo-source",
    targetConnectionId: "demo-target",
    sourcePath: "/Temporary",
    sourceLibraryName: "Temporary",
    targetSite: "https://contoso.example/sites/records",
    targetLibrary: "Temporary Records",
    targetLibraryUrlSegment: "temporary",
    targetRootPath: "/2026",
    preserveMetadata: true
  });
  expect(await api.getJob(created.id)).toBeDefined();

  resetDemoState();
  expect(await api.getJobs()).toHaveLength(2);
  expect(await api.getJob(created.id)).toBeUndefined();
});
