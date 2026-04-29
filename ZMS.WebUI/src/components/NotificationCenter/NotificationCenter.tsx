import { useEffect } from "react";
import { useAppStore } from "../../hooks/useAppStore";
import styles from "./NotificationCenter.module.css";

export default function NotificationCenter(): JSX.Element | null {
  const notifications = useAppStore((state) => state.notifications);
  const dismissNotification = useAppStore((state) => state.dismissNotification);

  useEffect(() => {
    const timers = notifications.map((notification) =>
      window.setTimeout(() => dismissNotification(notification.id), 4200)
    );

    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [dismissNotification, notifications]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.stack}>
      {notifications.slice(0, 4).map((notification) => (
        <div key={notification.id} className={`${styles.toast} ${styles[notification.tone]}`}>
          <strong>{notification.title}</strong>
          <p>{notification.description}</p>
          <button type="button" onClick={() => dismissNotification(notification.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
