import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
