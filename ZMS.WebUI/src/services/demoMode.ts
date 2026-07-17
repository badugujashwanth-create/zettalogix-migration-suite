const demoModeKey = "zms-synthetic-demo";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;

  const requested = new URLSearchParams(window.location.search).get("demo") === "1";
  if (requested) window.sessionStorage.setItem(demoModeKey, "true");

  return window.sessionStorage.getItem(demoModeKey) === "true";
}

export function enableDemoMode(): void {
  window.sessionStorage.setItem(demoModeKey, "true");
}

export function disableDemoMode(): void {
  window.sessionStorage.removeItem(demoModeKey);
}
