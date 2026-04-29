import { FormEvent, useMemo, useState } from "react";
import ConnectionCard from "../components/ConnectionCard/ConnectionCard";
import EmptyState from "../components/EmptyState/EmptyState";
import { useAppStore } from "../hooks/useAppStore";
import { formatConnectionType } from "../utils/formatters";
import { ConnectionType, CreateConnectionInput } from "../utils/models";

const initialForm: CreateConnectionInput = {
  name: "",
  type: "GoogleDrive",
  url: "",
  rootPath: "",
  username: "",
  password: "",
  clientId: "",
  clientSecret: "",
  tenantId: "",
  refreshToken: ""
};

function getEndpointLabel(type: ConnectionType): string {
  switch (type) {
    case "SharePointOnline":
      return "SharePoint site URL";
    case "SharePointOnPrem":
      return "SharePoint source URL";
    case "FileShare":
      return "File share path or UNC";
    case "GoogleDrive":
      return "Google Drive folder URL or ID";
    default:
      return "Endpoint";
  }
}

export default function ConnectionsPage(): JSX.Element {
  const connections = useAppStore((state) => state.connections);
  const createConnection = useAppStore((state) => state.createConnection);
  const testConnection = useAppStore((state) => state.testConnection);
  const loading = useAppStore((state) => state.loading.connectionsMutation);
  const [form, setForm] = useState<CreateConnectionInput>(initialForm);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await createConnection(form);
    setForm(initialForm);
  };

  const typeSummary = useMemo(() => {
    switch (form.type) {
      case "GoogleDrive":
        return "Configure OAuth refresh-token access so the backend can read Google Drive files directly during migration.";
      case "SharePointOnline":
        return "Use Microsoft Entra application credentials so the backend can upload to SharePoint Online libraries.";
      case "FileShare":
        return "Point the worker at a local or network-accessible file share path.";
      case "SharePointOnPrem":
        return "Register the legacy SharePoint endpoint for source discovery and migration planning.";
      default:
        return "Register a reusable migration endpoint.";
    }
  }, [form.type]);

  return (
    <div className="page-stack">
      <section className="split-panel">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Register Gateway</span>
              <h2>Add source or destination connection</h2>
              <p>Store reusable endpoints with the credentials needed for real discovery, validation, and direct transfer.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={submit}>
            <label>
              Connection name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              Type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ConnectionType })}>
                <option value="GoogleDrive">Google Drive</option>
                <option value="SharePointOnline">SharePoint Online</option>
                <option value="FileShare">File Share</option>
                <option value="SharePointOnPrem">SharePoint On-Prem</option>
              </select>
            </label>
            <label className="full-width">
              {getEndpointLabel(form.type)}
              <input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
            </label>

            {form.type === "FileShare" ? (
              <label className="full-width">
                Root path override
                <input
                  placeholder="Optional if the endpoint field already contains the share path"
                  value={form.rootPath}
                  onChange={(event) => setForm({ ...form, rootPath: event.target.value })}
                />
              </label>
            ) : null}

            {form.type === "SharePointOnPrem" ? (
              <>
                <label>
                  Username
                  <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                </label>
              </>
            ) : null}

            {form.type === "SharePointOnline" ? (
              <>
                <label>
                  Tenant ID
                  <input value={form.tenantId} onChange={(event) => setForm({ ...form, tenantId: event.target.value })} />
                </label>
                <label>
                  Client ID
                  <input value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })} />
                </label>
                <label className="full-width">
                  Client secret
                  <input
                    type="password"
                    value={form.clientSecret}
                    onChange={(event) => setForm({ ...form, clientSecret: event.target.value })}
                  />
                </label>
              </>
            ) : null}

            {form.type === "GoogleDrive" ? (
              <>
                <label>
                  Google client ID
                  <input value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })} />
                </label>
                <label>
                  Google client secret
                  <input
                    type="password"
                    value={form.clientSecret}
                    onChange={(event) => setForm({ ...form, clientSecret: event.target.value })}
                  />
                </label>
                <label className="full-width">
                  Refresh token
                  <input
                    type="password"
                    value={form.refreshToken}
                    onChange={(event) => setForm({ ...form, refreshToken: event.target.value })}
                  />
                </label>
              </>
            ) : null}

            <div className="form-actions full-width">
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Saving..." : "Save connection"}
              </button>
            </div>
          </form>
        </article>

        <article className="tonal-card">
          <div className="page-stack">
            <div className="metric-box">
              <span>Connection mode</span>
              <strong>{formatConnectionType(form.type)}</strong>
              <p>{typeSummary}</p>
            </div>
            <div className="metric-box">
              <span>Registered gateways</span>
              <strong>{connections.length}</strong>
              <p>Available for discovery, target validation, and job creation from the migration wizard.</p>
            </div>
          </div>
        </article>
      </section>

      {connections.length === 0 ? (
        <EmptyState title="No connections available" description="Register a source or target endpoint to begin." />
      ) : (
        <section className="card-grid">
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} onTest={(id) => void testConnection(id)} />
          ))}
        </section>
      )}
    </div>
  );
}
