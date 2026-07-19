import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { isDemoMode } from "../services/demoMode";

export default function SettingsPage(): JSX.Element {
  const demoMode = isDemoMode();
  const settings = useAppStore((state) => state.settings);
  const saveSettings = useAppStore((state) => state.saveSettings);
  const loading = useAppStore((state) => state.loading.settings);

  const initial = useMemo(
    () =>
      settings ?? {
        concurrency: 4,
        retryLimit: 3,
        notifyOnFailure: true,
        telemetryEnabled: false
      },
    [settings]
  );

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await saveSettings(form);
  };

  return (
    <section className="split-panel">
      <article className="surface-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Runtime Controls</span>
            <h2>Execution defaults</h2>
            <p>
              {demoMode
                ? "These fictional defaults are stored in this browser only; no worker or telemetry service receives them."
                : "These client defaults are stored locally and require backend support to affect worker execution."}
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label>
            Parallel workers
            <input
              type="number"
              value={form.concurrency}
              onChange={(event) => setForm({ ...form, concurrency: Number(event.target.value) || 1 })}
            />
          </label>
          <label>
            Retry limit
            <input
              type="number"
              value={form.retryLimit}
              onChange={(event) => setForm({ ...form, retryLimit: Number(event.target.value) || 0 })}
            />
          </label>
          <label className="checkbox-field full-width">
            <input
              type="checkbox"
              checked={form.notifyOnFailure}
              onChange={(event) => setForm({ ...form, notifyOnFailure: event.target.checked })}
            />
            Send notifications when migrations fail
          </label>
          <label className="checkbox-field full-width">
            <input
              type="checkbox"
              checked={form.telemetryEnabled}
              onChange={(event) => setForm({ ...form, telemetryEnabled: event.target.checked })}
            />
            Enable anonymous telemetry
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Saving..." : "Save settings"}
            </button>
          </div>
        </form>
      </article>

      <article className="tonal-card">
        <div className="page-stack">
          <div className="metric-box">
            <span>Concurrency</span>
            <strong>{form.concurrency}</strong>
            <p>
              {demoMode
                ? "Displayed for planning only; no migration engine is connected."
                : "Higher values request more parallel processing from a compatible external worker."}
            </p>
          </div>
          <div className="metric-box">
            <span>Retry policy</span>
            <strong>{form.retryLimit}</strong>
            <p>
              {demoMode
                ? "A synthetic policy value for the walkthrough; it does not execute retries."
                : "A compatible external worker may re-queue failed operations up to this client default."}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
