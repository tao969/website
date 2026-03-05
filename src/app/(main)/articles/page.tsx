import { PageTitle } from '@/components/ui/scramble';
import styles from './page.module.scss';

export default function ArticlesPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className={styles.pageIndex}>03</span>
          <PageTitle className={styles.pageTitle}>Articles</PageTitle>
        </div>

        <div className={styles.comingSoon}>
          <div className={styles.comingSoonInner}>
            <p className={styles.comingSoonLabel}>In progress</p>
            <p className={styles.comingSoonText}>
              Writing on technology, development, and AI-augmented workflows.
              <br />
              Coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
