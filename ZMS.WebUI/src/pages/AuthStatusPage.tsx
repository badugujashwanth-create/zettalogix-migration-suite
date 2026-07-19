import AppIcon from "../components/AppIcon/AppIcon";
import styles from "./AuthPage.module.css";

interface AuthStatusPageProps {
  title: string;
  message: string;
}

export default function AuthStatusPage({ title, message }: AuthStatusPageProps): JSX.Element {
  return (
    <main className={styles.authShell}>
      <section className={styles.statusPanel}>
        <AppIcon name="lock" />
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
