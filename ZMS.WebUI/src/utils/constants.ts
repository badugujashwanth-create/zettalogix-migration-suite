export const navigationItems = [
  { label: "Command Center", path: "/dashboard", icon: "space_dashboard" },
  { label: "Migration Jobs", path: "/migrations", icon: "moving" },
  { label: "Connections", path: "/connections", icon: "hub" },
  { label: "Help Center", path: "/help", icon: "help" },
  { label: "Settings", path: "/settings", icon: "tune" }
];

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Operational Ledger",
    subtitle: "Inspect pipeline state, migration health, and endpoint readiness with the runtime boundary always visible."
  },
  "/migrations": {
    title: "Migration Monitor",
    subtitle: "Track queue movement, start new waves, and intervene when jobs require operator judgment."
  },
  "/connections": {
    title: "Cloud Gateways",
    subtitle: "Register and validate source and destination endpoints before migration work enters the queue."
  },
  "/help": {
    title: "Help Center",
    subtitle: "Operator runbooks, provider setup links, error fixes, and deployment requirements in one place."
  },
  "/settings": {
    title: "Execution Defaults",
    subtitle: "Review client-side concurrency, retry, notification, and telemetry defaults."
  }
};
