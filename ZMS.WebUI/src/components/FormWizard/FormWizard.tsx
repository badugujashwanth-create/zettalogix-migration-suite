import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConnectionRecord, CreateJobInput } from "../../utils/models";
import { formatConnectionType } from "../../utils/formatters";
import styles from "./FormWizard.module.css";

interface FormWizardProps {
  isOpen: boolean;
  connections: ConnectionRecord[];
  onClose: () => void;
  onSubmit: (input: CreateJobInput) => Promise<void>;
  loading: boolean;
}

const initialForm: CreateJobInput = {
  name: "",
  sourceConnectionId: "",
  targetConnectionId: "",
  sourcePath: "",
  sourceLibraryName: "",
  targetSite: "",
  targetLibrary: "",
  targetLibraryUrlSegment: "",
  targetRootPath: "",
  preserveMetadata: true
};

const steps = ["Discovery", "Source", "Destination", "Review"];

export default function FormWizard({
  isOpen,
  connections,
  onClose,
  onSubmit,
  loading
}: FormWizardProps): JSX.Element | null {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateJobInput>(initialForm);

  const sourceConnections = useMemo(() => connections, [connections]);
  const destinationConnections = useMemo(
    () => connections.filter((connection) => connection.type === "SharePointOnline"),
    [connections]
  );
  const selectedSourceConnection = connections.find((connection) => connection.id === form.sourceConnectionId);

  if (!isOpen) {
    return null;
  }

  const canContinue =
    step === 0
      ? form.name.length > 2
      : step === 1
        ? Boolean(form.sourceConnectionId && form.sourcePath)
        : step === 2
          ? Boolean(form.targetConnectionId && form.targetSite && form.targetLibrary)
          : true;

  const selectSourceConnection = (connectionId: string) => {
    const connection = connections.find((item) => item.id === connectionId);
    setForm({
      ...form,
      sourceConnectionId: connectionId,
      sourcePath: connection ? connection.rootPath || connection.url : "",
      sourceLibraryName: connection?.documentLibraryName ?? ""
    });
  };

  const selectTargetConnection = (connectionId: string) => {
    const connection = connections.find((item) => item.id === connectionId);
    setForm({
      ...form,
      targetConnectionId: connectionId,
      targetSite: connection?.url ?? "",
      targetLibrary: connection?.documentLibraryName ?? "",
      targetLibraryUrlSegment: "",
      targetRootPath: ""
    });
  };

  const submit = async () => {
    await onSubmit(form);
    setStep(0);
    setForm(initialForm);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <span className="eyebrow">Create Migration Job</span>
            <h3>Blueprint a new migration wave</h3>
            <p>Use a staged workflow so discovery, endpoint selection, and review remain clear for operators.</p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.steps}>
          {steps.map((label, index) => (
            <div key={label} className={index === step ? styles.activeStep : styles.step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <div className={styles.body}>
          <div className={styles.workspace}>
            {step === 0 ? (
              <div className={styles.grid}>
                <label className={styles.full}>
                  Migration name
                  <input
                    value={form.name}
                    placeholder="Example: Finance Shared Drive Cutover"
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <div className={styles.callout}>
                  <strong>Discovery profile</strong>
                  <p>
                    Discovery now comes from the connector-backed API layer, including file share, SharePoint, and
                    Google Drive sources.
                  </p>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className={styles.grid}>
                <label>
                  Source connection
                  <select
                    value={form.sourceConnectionId}
                    onChange={(event) => selectSourceConnection(event.target.value)}
                  >
                    <option value="">Select source</option>
                    {sourceConnections.map((connection) => (
                      <option key={connection.id} value={connection.id}>
                        {connection.name} ({formatConnectionType(connection.type)})
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.full}>
                  {selectedSourceConnection?.type === "GoogleDrive" ? "Google Drive Folder Link" : "Source path"}
                  <input
                    placeholder={
                      selectedSourceConnection?.type === "GoogleDrive"
                        ? "Saved Google Drive folder link"
                        : "Selected connection folder, site, or file share path"
                    }
                    value={form.sourcePath}
                    onChange={(event) => setForm({ ...form, sourcePath: event.target.value })}
                  />
                </label>
                {selectedSourceConnection?.type === "SharePointOnline" ? (
                  <label>
                    Source library
                    <input
                      placeholder="Leave blank or use * to copy every document library"
                      value={form.sourceLibraryName}
                      onChange={(event) => setForm({ ...form, sourceLibraryName: event.target.value })}
                    />
                  </label>
                ) : null}
                {selectedSourceConnection?.type === "GoogleDrive" ? (
                  <p className={styles.full}>This uses the folder link saved on the Google Drive source connection.</p>
                ) : null}
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.preserveMetadata}
                    onChange={(event) => setForm({ ...form, preserveMetadata: event.target.checked })}
                  />
                  Preserve metadata during migration
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div className={styles.grid}>
                <label>
                  Target connection
                  <select
                    value={form.targetConnectionId}
                    onChange={(event) => selectTargetConnection(event.target.value)}
                  >
                    <option value="">Select destination</option>
                    {destinationConnections.map((connection) => (
                      <option key={connection.id} value={connection.id}>
                        {connection.name} ({formatConnectionType(connection.type)})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Target library
                  <input
                    placeholder="Existing or new document library name"
                    value={form.targetLibrary}
                    onChange={(event) => setForm({ ...form, targetLibrary: event.target.value })}
                  />
                </label>
                <label>
                  New library URL path
                  <input
                    placeholder="Optional, e.g. finance-archive"
                    value={form.targetLibraryUrlSegment}
                    onChange={(event) => setForm({ ...form, targetLibraryUrlSegment: event.target.value })}
                  />
                </label>
                <label className={styles.full}>
                  Target site URL
                  <input value={form.targetSite} onChange={(event) => setForm({ ...form, targetSite: event.target.value })} />
                </label>
                <label className={styles.full}>
                  Target folder path
                  <input
                    placeholder="Optional, e.g. migrated-content/phase-1"
                    value={form.targetRootPath}
                    onChange={(event) => setForm({ ...form, targetRootPath: event.target.value })}
                  />
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <div className={styles.review}>
                <div>
                  <span>Job</span>
                  <strong>{form.name}</strong>
                </div>
                <div>
                  <span>Source</span>
                  <strong>{form.sourceLibraryName ? `${form.sourcePath} / ${form.sourceLibraryName}` : form.sourcePath}</strong>
                </div>
                <div>
                  <span>Destination</span>
                  <strong>
                    {form.targetSite} / {form.targetLibrary}
                    {form.targetRootPath ? ` / ${form.targetRootPath}` : ""}
                  </strong>
                </div>
                <div>
                  <span>Metadata policy</span>
                  <strong>{form.preserveMetadata ? "Preserve source metadata" : "Standard file copy only"}</strong>
                </div>
              </div>
            ) : null}
          </div>

          <aside className={styles.sidePanel}>
            <div className={styles.sideCard}>
              <span className="eyebrow">Readiness Guide</span>
              <strong>Operator checklist</strong>
              <ul>
                <li>Validate source connectivity before scheduling the run.</li>
                <li>Confirm the target SharePoint site and document library already exist.</li>
                <li>Monitor retries for locked or denied items after start.</li>
              </ul>
              <Link className={styles.helpLink} to="/help" onClick={onClose}>
                <span className="material-symbols-outlined">help</span>
                Open Help Center
              </Link>
            </div>
          </aside>
        </div>

        <div className={styles.actions}>
          <button type="button" className="ghost-button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>
            Back
          </button>
          {step < steps.length - 1 ? (
            <button type="button" className="primary-button" disabled={!canContinue} onClick={() => setStep((value) => value + 1)}>
              Continue
            </button>
          ) : (
            <button type="button" className="primary-button" disabled={loading} onClick={() => void submit()}>
              {loading ? "Creating..." : "Create job"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
