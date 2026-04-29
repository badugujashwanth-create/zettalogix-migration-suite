export const navigationItems = [
  { label: "Command Center", path: "/dashboard", icon: "space_dashboard" },
  { label: "Migration Jobs", path: "/migrations", icon: "moving" },
  { label: "Connections", path: "/connections", icon: "hub" },
  { label: "Settings", path: "/settings", icon: "tune" }
];

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Operational Ledger",
    subtitle: "A premium control surface for pipeline velocity, migration health, and endpoint readiness."
  },
  "/migrations": {
    title: "Migration Monitor",
    subtitle: "Track queue movement, start new waves, and intervene when jobs require operator judgment."
  },
  "/connections": {
    title: "Cloud Gateways",
    subtitle: "Register and validate source and destination endpoints before migration work enters the queue."
  },
  "/settings": {
    title: "Execution Defaults",
    subtitle: "Tune worker concurrency, retries, and operational signals for the migration control plane."
  }
};
