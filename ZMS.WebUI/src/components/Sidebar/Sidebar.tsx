import { NavLink } from "react-router-dom";
import { navigationItems } from "../../utils/constants";
import styles from "./Sidebar.module.css";

export default function Sidebar(): JSX.Element {
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
          Relocate digital infrastructure from SharePoint farms and file shares into Microsoft 365 with operational
          discipline.
        </p>
      </div>

      <nav className={styles.nav}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.engineCard}>
        <span className={styles.eyebrow}>Engine Status</span>
        <strong>ZettaStream Engine v4.2</strong>
        <p>Batch orchestration, retry queues, and metadata handling are all surfaced through one controlled workspace.</p>
      </div>
    </aside>
  );
}
