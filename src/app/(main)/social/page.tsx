import { PlatformList } from '@/components/sections/social';
import { SOCIAL_PLATFORMS } from '@/config';
import { PageTitle } from '@/components/ui/scramble';
import styles from './page.module.scss';

export default function SocialPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className={styles.pageIndex}>04</span>
          <PageTitle className={styles.pageTitle}>Social</PageTitle>
        </div>
      </div>

      <PlatformList platforms={SOCIAL_PLATFORMS} />
    </div>
  );
}
