import styles from "./DashboardCards.module.css";

interface CardData {
  label: string;
  value: string | number;
  caption: string;
}

export default function DashboardCards({ cards }: { cards: CardData[] }): JSX.Element {
  return (
    <section className={styles.grid}>
      {cards.map((card) => (
        <article key={card.label} className={`surface-card ${styles.card}`}>
          <p className={styles.label}>{card.label}</p>
          <strong className={styles.value}>{card.value}</strong>
          <span className={styles.caption}>{card.caption}</span>
        </article>
      ))}
    </section>
  );
}
