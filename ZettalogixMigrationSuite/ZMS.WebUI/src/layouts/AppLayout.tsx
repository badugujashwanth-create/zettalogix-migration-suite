import { PropsWithChildren } from "react";
import NotificationCenter from "../components/NotificationCenter/NotificationCenter";
import Sidebar from "../components/Sidebar/Sidebar";
import TopNavbar from "../components/TopNavbar/TopNavbar";
import { useAppBootstrap } from "../hooks/useAppBootstrap";
import styles from "./AppLayout.module.css";

export default function AppLayout({ children }: PropsWithChildren): JSX.Element {
  useAppBootstrap();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentWrap}>
        <TopNavbar />
        <main className={styles.main}>{children}</main>
      </div>
      <NotificationCenter />
    </div>
  );
}
