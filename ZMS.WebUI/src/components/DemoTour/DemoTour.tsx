import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../hooks/useAppStore";
import { resetDemoState } from "../../services/demoApi";
import AppIcon from "../AppIcon/AppIcon";
import styles from "./DemoTour.module.css";

interface TourScene {
  title: string;
  detail: string;
  run: () => void | Promise<void>;
}

function updateSearch(value: string): void {
  const input = document.querySelector<HTMLInputElement>('[data-demo-id="global-search"]');
  if (!input) return;

  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
}

function clearNotifications(): void {
  const state = useAppStore.getState();
  state.notifications.forEach((message) => state.dismissNotification(message.id));
}

export default function DemoTour(): JSX.Element | null {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const bootstrap = useAppStore((state) => state.bootstrap);
  const createJob = useAppStore((state) => state.createJob);
  const startJob = useAppStore((state) => state.startJob);
  const pauseJob = useAppStore((state) => state.pauseJob);
  const testConnection = useAppStore((state) => state.testConnection);
  const createdJobId = useRef<string | null>(null);
  const [enabled] = useState(() => new URLSearchParams(window.location.search).get("tour") === "1");
  const [tourScale] = useState(() => {
    const candidate = Number(new URLSearchParams(window.location.search).get("tourScale") ?? "1");
    return Number.isFinite(candidate) && candidate > 0 ? Math.max(0.02, Math.min(candidate, 1)) : 1;
  });
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const go = (path: string) => {
      navigateRef.current(path);
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 80);
    };

    const scenes: TourScene[] = [
      {
        title: "Bounded synthetic workspace",
        detail: "The banner and runtime card identify fictional local state before any workflow begins.",
        run: async () => {
          resetDemoState();
          await bootstrap();
          go("/dashboard");
        }
      },
      {
        title: "Cross-workspace search",
        detail: "Search resolves jobs, connections, and help topics from the current in-memory dataset.",
        run: () => updateSearch("finance")
      },
      {
        title: "Migration ledger",
        detail: "The operator can inspect running, completed, and failed work without implying a worker is connected.",
        run: () => {
          updateSearch("");
          go("/migrations");
        }
      },
      {
        title: "Four-step job blueprint",
        detail: "Discovery, source, destination, and review remain explicit before a synthetic job is created.",
        run: () => document.querySelector<HTMLButtonElement>('[data-demo-id="new-migration"]')?.click()
      },
      {
        title: "Draft created in local state",
        detail: "A deterministic draft proves the UI state transition while keeping all external services disconnected.",
        run: async () => {
          document.querySelector<HTMLButtonElement>('[data-demo-id="close-wizard"]')?.click();
          const job = await createJob({
            name: "Legal Records Validation Wave",
            sourceConnectionId: "demo-source",
            targetConnectionId: "demo-target",
            sourcePath: "/Legal/Archive",
            sourceLibraryName: "Legal Archive",
            targetSite: "https://contoso.example/sites/records",
            targetLibrary: "Legal Records",
            targetLibraryUrlSegment: "legal-records",
            targetRootPath: "/FY2026",
            preserveMetadata: true
          });
          createdJobId.current = job?.id ?? null;
          if (job) go(`/migrations/${job.id}`);
        }
      },
      {
        title: "Start transition",
        detail: "Approve the synthetic start to add progress and an inspectable event—without a network request.",
        run: async () => {
          if (createdJobId.current) await startJob(createdJobId.current);
        }
      },
      {
        title: "Pause transition",
        detail: "The same local state machine pauses the job and records the operator-visible event.",
        run: async () => {
          if (createdJobId.current) await pauseJob(createdJobId.current);
        }
      },
      {
        title: "Evidence-derived readiness",
        detail: "Readiness uses only connection health, mapping fields, failures, and event history—not predictive AI.",
        run: () => document.querySelector<HTMLElement>('[data-demo-id="migration-readiness"]')
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      },
      {
        title: "Connection inventory",
        detail: "Fictional endpoints demonstrate registration and validation while provider SDKs remain unloaded.",
        run: () => go("/connections")
      },
      {
        title: "Synthetic connection check",
        detail: "Testing updates the selected record locally and produces a visible success notification.",
        run: async () => testConnection("demo-source")
      },
      {
        title: "Browser-only defaults",
        detail: "Concurrency, retries, notifications, and telemetry are labeled as client settings, not worker proof.",
        run: () => go("/settings")
      },
      {
        title: "Operator guidance",
        detail: "The help center keeps external setup and backend ownership explicit.",
        run: () => go("/help")
      },
      {
        title: "Simulation complete",
        detail: "Search, jobs, state transitions, readiness, connections, settings, guidance, reset, and export are demonstrated honestly.",
        run: () => {
          updateSearch("");
          document.querySelector<HTMLInputElement>('[data-demo-id="global-search"]')?.blur();
          go("/dashboard");
        }
      }
    ];

    const sceneMs = Math.round(25_000 * tourScale);
    const timers = scenes.map((scene, index) => window.setTimeout(() => {
      clearNotifications();
      setSceneIndex(index);
      void scene.run();
    }, index * sceneMs));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [bootstrap, createJob, enabled, pauseJob, startJob, testConnection, tourScale]);

  if (!enabled) return null;

  const sceneTitles = [
    ["Bounded synthetic workspace", "The banner and runtime card identify fictional local state before any workflow begins."],
    ["Cross-workspace search", "Search resolves jobs, connections, and help topics from the current in-memory dataset."],
    ["Migration ledger", "Inspect running, completed, and failed work without implying a worker is connected."],
    ["Four-step job blueprint", "Discovery, source, destination, and review remain explicit before creation."],
    ["Draft created in local state", "A deterministic draft proves the UI transition with external services disconnected."],
    ["Start transition", "Synthetic progress and event evidence are added without a network request."],
    ["Pause transition", "The job pauses locally and records an operator-visible event."],
    ["Evidence-derived readiness", "Readiness uses inspectable state, not predictive AI."],
    ["Connection inventory", "Fictional endpoints demonstrate registration and validation."],
    ["Synthetic connection check", "The selected record updates locally with visible evidence."],
    ["Browser-only defaults", "Client settings stay separate from worker capability."],
    ["Operator guidance", "Help content preserves ownership and service boundaries."],
    ["Simulation complete", "The primary synthetic workflow and its honest limitations are now visible."]
  ];
  const [title, detail] = sceneTitles[sceneIndex];

  return (
    <aside className={styles.tourCard} aria-live="polite">
      <div className={styles.sceneLabel}>
        <AppIcon name="science" size={18} />
        Guided simulation · Scene {sceneIndex + 1}/{sceneTitles.length}
      </div>
      <strong>{title}</strong>
      <p>{detail}</p>
    </aside>
  );
}
