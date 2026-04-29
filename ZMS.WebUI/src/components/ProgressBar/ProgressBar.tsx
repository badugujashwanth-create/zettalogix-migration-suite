import { formatPercentage } from "../../utils/formatters";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${value}%` }} />
      </div>
      <span className={styles.label}>{formatPercentage(value)}</span>
    </div>
  );
}
