import { PropsWithChildren } from "react";
import NotificationCenter from "../components/NotificationCenter/NotificationCenter";
import AppIcon from "../components/AppIcon/AppIcon";
import Sidebar from "../components/Sidebar/Sidebar";
import TopNavbar from "../components/TopNavbar/TopNavbar";
import { useAppBootstrap } from "../hooks/useAppBootstrap";
import { isDemoMode } from "../services/demoMode";
import { resetDemoState } from "../services/demoApi";
import { useAppStore } from "../hooks/useAppStore";
import styles from "./AppLayout.module.css";

export default function AppLayout({ children }: PropsWithChildren): JSX.Element {
  useAppBootstrap();
  const demoMode = isDemoMode();
  const bootstrap = useAppStore((state) => state.bootstrap);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentWrap}>
        <section className={`${styles.modeBanner} ${demoMode ? styles.demo : styles.live}`}>
          <AppIcon name={demoMode ? "science" : "hub"} size={22} />
          <div>
            <strong>{demoMode ? "Synthetic demo — local browser state" : "Live client — external services required"}</strong>
            <span>
              {demoMode
                ? "Fictional records only. Migration, identity, Google Drive, and SharePoint services stay disconnected."
                : "This repository provides the client; migration execution and identity are owned by configured external services."}
            </span>
          </div>
          {demoMode ? (
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                resetDemoState();
                void bootstrap();
              }}
            >
              Reset demo
            </button>
          ) : null}
        </section>
        <TopNavbar />
        <main className={styles.main}>{children}</main>
      </div>
      <NotificationCenter />
    </div>
  );
}
