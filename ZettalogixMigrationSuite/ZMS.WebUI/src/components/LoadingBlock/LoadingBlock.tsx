import styles from "./LoadingBlock.module.css";

export default function LoadingBlock(): JSX.Element {
  return <div className={styles.block} aria-hidden="true" />;
}
