import { WorkList } from '@/components/sections/work';
import { PageTitle } from '@/components/ui/scramble';
import { PROJECT_CATEGORIES } from '@/config';
import styles from './page.module.scss';

export default function WorkPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className={styles.pageIndex}>02</span>
          <PageTitle className={styles.pageTitle}>Work</PageTitle>
        </div>
      </div>

      <WorkList categories={PROJECT_CATEGORIES} />
    </div>
  );
}
