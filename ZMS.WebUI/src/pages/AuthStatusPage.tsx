import styles from "./AuthPage.module.css";

interface AuthStatusPageProps {
  title: string;
  message: string;
}

export default function AuthStatusPage({ title, message }: AuthStatusPageProps): JSX.Element {
  return (
    <main className={styles.authShell}>
      <section className={styles.statusPanel}>
        <span className="material-symbols-outlined">lock</span>
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
