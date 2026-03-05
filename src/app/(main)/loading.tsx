/**
 * Main layout loading state
 *
 * Displayed while the main layout segment is streaming or suspending.
 * Minimal — a single skeleton bar to maintain layout stability and
 * avoid content-layout-shift during page transitions.
 */

import styles from './loading.module.scss';

export default function MainLoading() {
  return (
    <div className={styles.root} aria-label="Loading page" role="status">
      <div className={styles.skeleton} />
    </div>
  );
}
