import styles from './articles.module.scss';

export default function ArticlesPage() {
  return (
    <div className="container">
      <section className={styles.articlesSection}>
        <div className={styles.articlesContent}>
          <h1 className={styles.articlesTitle}>Articles</h1>

        <div className={styles.articlesContainer}>
          <div className={styles.naBadge}>
            <span className={styles.naText}>N/A</span>
          </div>

          <p className={styles.articlesNote}>
            Articles will be available soon. Stay tuned for insights on technology, design, and development.
          </p>
        </div>
      </div>
    </section>
    </div>
  );
}
