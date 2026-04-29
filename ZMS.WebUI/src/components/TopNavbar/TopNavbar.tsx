import { useLocation } from "react-router-dom";
import { pageTitles } from "../../utils/constants";
import { useAppStore } from "../../hooks/useAppStore";
import styles from "./TopNavbar.module.css";

export default function TopNavbar(): JSX.Element {
  const location = useLocation();
  const jobs = useAppStore((state) => state.jobs);

  const titleConfig = location.pathname.startsWith("/migrations/")
    ? {
        title: "Active Migration",
        subtitle: "Inspect throughput, execution history, and intervention controls for the selected pipeline."
      }
    : pageTitles[location.pathname] ?? pageTitles["/dashboard"];

  const activeCount = jobs.filter((job) => job.status === "Running").length;
  const failedCount = jobs.filter((job) => job.status === "Failed").length;

  return (
    <header className={`${styles.navbar} glass-card`}>
      <div className={styles.titleBlock}>
        <span className="eyebrow">Migration Control Plane</span>
        <h1>{titleConfig.title}</h1>
        <p>{titleConfig.subtitle}</p>
      </div>

      <div className={styles.utilityArea}>
        <label className={styles.search}>
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search jobs, sites, libraries" />
        </label>

        <div className={styles.pill}>Running {activeCount}</div>
        <div className={styles.pill}>At Risk {failedCount}</div>

        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>ZA</div>
          <div>
            <strong>ZMS Admin</strong>
            <span>Operations Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}
