import { NavLink } from "react-router-dom";
import AppIcon from "../AppIcon/AppIcon";
import { navigationItems } from "../../utils/constants";
import { isDemoMode } from "../../services/demoMode";
import styles from "./Sidebar.module.css";

export default function Sidebar(): JSX.Element {
  const demoMode = isDemoMode();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>Z</div>
          <div>
            <strong>Zettalogix</strong>
            <span>Migration Suite</span>
          </div>
        </div>
        <p className={styles.copy}>
          Plan, inspect, and demonstrate migration-control workflows. Execution requires the separately owned backend.
        </p>
      </div>

      <nav className={styles.nav}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            <AppIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.engineCard}>
        <span className={styles.eyebrow}>Runtime boundary</span>
        <strong>{demoMode ? "Synthetic state active" : "External backend required"}</strong>
        <p>
          {demoMode
            ? "Actions update fictional in-memory records only. No migration worker is connected."
            : "This frontend observes configured API state; the migration worker is not included in this repository."}
        </p>
      </div>
    </aside>
  );
}
