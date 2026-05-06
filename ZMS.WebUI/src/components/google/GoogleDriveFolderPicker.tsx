import { useEffect, useMemo, useState } from "react";

const googleApiScriptUrl = "https://apis.google.com/js/api.js";
const googleIdentityScriptUrl = "https://accounts.google.com/gsi/client";
const googleDriveFolderMimeType = "application/vnd.google-apps.folder";
const defaultDriveScope = "https://www.googleapis.com/auth/drive.readonly";

export interface GoogleDriveFolderSelection {
  id: string;
  name: string;
  url: string;
}

interface GoogleDriveFolderPickerProps {
  onFolderSelected: (folder: GoogleDriveFolderSelection) => void;
  disabled?: boolean;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: () => void;
}

interface GoogleDocsView {
  setIncludeFolders(included: boolean): GoogleDocsView;
  setSelectFolderEnabled(enabled: boolean): GoogleDocsView;
  setMimeTypes(mimeTypes: string): GoogleDocsView;
}

interface GooglePicker {
  setVisible(visible: boolean): void;
}

interface GooglePickerResponse {
  [key: string]: unknown;
}

interface GooglePickerDocument {
  id?: string;
  name?: string;
  url?: string;
}

interface GooglePickerBuilder {
  setOAuthToken(token: string): GooglePickerBuilder;
  setDeveloperKey(key: string): GooglePickerBuilder;
  setAppId(appId: string): GooglePickerBuilder;
  addView(view: GoogleDocsView): GooglePickerBuilder;
  setCallback(callback: (data: GooglePickerResponse) => void): GooglePickerBuilder;
  build(): GooglePicker;
}

declare global {
  interface Window {
    gapi?: {
      load(
        apiName: string,
        config:
          | (() => void)
          | {
              callback: () => void;
              onerror?: () => void;
              timeout?: number;
              ontimeout?: () => void;
            }
      ): void;
    };
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: unknown) => void;
          }): GoogleTokenClient;
        };
      };
      picker?: {
        DocsView: new () => GoogleDocsView;
        PickerBuilder: new () => GooglePickerBuilder;
        Response: {
          ACTION: string;
          DOCUMENTS: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      };
    };
  }
}

const scriptPromises = new Map<string, Promise<void>>();
let pickerApiPromise: Promise<void> | null = null;

function loadScript(src: string, id: string): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Google Picker can only run in a browser."));
  }

  if (scriptPromises.has(src)) {
    return scriptPromises.get(src)!;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existingScript?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = existingScript ?? document.createElement("script");

    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });

    script.addEventListener("error", () => {
      reject(new Error(`Failed to load ${src}`));
    }, { once: true });

    if (!existingScript) {
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  scriptPromises.set(src, promise);
  return promise;
}

function loadPickerApi(): Promise<void> {
  if (window.google?.picker) {
    return Promise.resolve();
  }

  if (pickerApiPromise) {
    return pickerApiPromise;
  }

  pickerApiPromise = new Promise<void>((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error("Google API script loaded, but gapi is unavailable."));
      return;
    }

    let completed = false;
    const timeoutId = window.setTimeout(() => {
      if (!completed) {
        completed = true;
        reject(new Error("Google Picker took too long to load."));
      }
    }, 15000);

    window.gapi.load("picker", {
      callback: () => {
        if (!completed) {
          completed = true;
          window.clearTimeout(timeoutId);
          resolve();
        }
      },
      onerror: () => {
        if (!completed) {
          completed = true;
          window.clearTimeout(timeoutId);
          reject(new Error("Google Picker failed to load."));
        }
      },
      timeout: 15000,
      ontimeout: () => {
        if (!completed) {
          completed = true;
          window.clearTimeout(timeoutId);
          reject(new Error("Google Picker took too long to load."));
        }
      }
    });
  });

  return pickerApiPromise;
}

async function loadGoogleLibraries(): Promise<void> {
  await Promise.all([
    loadScript(googleApiScriptUrl, "google-api-script"),
    loadScript(googleIdentityScriptUrl, "google-identity-script")
  ]);

  await loadPickerApi();
}

function requestAccessToken(clientId: string, scope: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const oauth = window.google?.accounts?.oauth2;
    if (!oauth) {
      reject(new Error("Google Identity Services is unavailable."));
      return;
    }

    const tokenClient = oauth.initTokenClient({
      client_id: clientId,
      scope,
      callback: (response) => {
        if (response.error) {
          reject(new Error("Google folder selection was cancelled. You can paste the folder link manually."));
          return;
        }

        if (!response.access_token) {
          reject(new Error("Google did not return an access token."));
          return;
        }

        resolve(response.access_token);
      },
      error_callback: () => reject(new Error("Google folder selection was cancelled. You can paste the folder link manually."))
    });

    tokenClient.requestAccessToken();
  });
}

function readPickerDocument(data: GooglePickerResponse): GooglePickerDocument | null {
  const documentKey = window.google?.picker?.Response.DOCUMENTS ?? "docs";
  const documents = data[documentKey];
  if (!Array.isArray(documents) || documents.length === 0) {
    return null;
  }

  return documents[0] as GooglePickerDocument;
}

export default function GoogleDriveFolderPicker({
  onFolderSelected,
  disabled = false
}: GoogleDriveFolderPickerProps): JSX.Element | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";
  const developerKey = import.meta.env.VITE_GOOGLE_API_KEY?.trim() ?? "";
  const appId = import.meta.env.VITE_GOOGLE_APP_ID?.trim() ?? "";
  const scope = import.meta.env.VITE_GOOGLE_DRIVE_SCOPE?.trim() || defaultDriveScope;

  const isConfigured = useMemo(
    () => Boolean(clientId && developerKey && appId),
    [appId, clientId, developerKey]
  );

  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isConfigured) {
      setIsReady(false);
      setMessage("");
      setError("");
      return;
    }

    let cancelled = false;
    setError("");
    setMessage("Loading Google Picker...");

    loadGoogleLibraries()
      .then(() => {
        if (!cancelled) {
          setIsReady(true);
          setMessage("");
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setIsReady(false);
          setMessage("");
          setError(loadError instanceof Error ? loadError.message : "Google Picker failed to load.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isConfigured]);

  const openPicker = async () => {
    if (!isConfigured) {
      setError("");
      return;
    }

    if (!window.google?.picker) {
      setError("Google Picker is still loading. Try again in a moment.");
      return;
    }

    setIsOpening(true);
    setError("");
    setMessage("Authorizing Google Drive...");

    try {
      const accessToken = await requestAccessToken(clientId, scope);
      setMessage("Opening Google Picker...");

      const docsView = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true)
        .setMimeTypes(googleDriveFolderMimeType);

      const picker = new window.google.picker.PickerBuilder()
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setAppId(appId)
        .addView(docsView)
        .setCallback((data) => {
          const actionKey = window.google?.picker?.Response.ACTION ?? "action";
          const pickedAction = window.google?.picker?.Action.PICKED ?? "picked";

          if (data[actionKey] !== pickedAction) {
            setMessage("Google folder selection was cancelled. You can paste the folder link manually.");
            return;
          }

          const doc = readPickerDocument(data);
          if (!doc?.id) {
            setError("Google Picker did not return a folder id.");
            setMessage("");
            return;
          }

          onFolderSelected({
            id: doc.id,
            name: doc.name || "Selected folder",
            url: doc.url || `https://drive.google.com/drive/folders/${doc.id}`
          });
          setError("");
          setMessage("Folder selected successfully.");
        })
        .build();

      picker.setVisible(true);
    } catch (pickerError: unknown) {
      setMessage("");
      const message = pickerError instanceof Error
        ? pickerError.message
        : "Google folder selection was cancelled. You can paste the folder link manually.";
      setError(message);
    } finally {
      setIsOpening(false);
    }
  };

  if (!isConfigured) {
    return null;
  }

  return (
    <div className="picker-panel">
      <button
        type="button"
        className="ghost-button"
        disabled={disabled || !isConfigured || !isReady || isOpening}
        onClick={() => void openPicker()}
      >
        <span className="material-symbols-outlined">drive_folder_upload</span>
        {isOpening ? "Opening Google Picker..." : "Choose Google Drive Folder"}
      </button>
      {message ? <p className="inline-message success">{message}</p> : null}
      {error ? <p className="inline-message error">{error}</p> : null}
    </div>
  );
}
