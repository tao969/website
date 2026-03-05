/**
 * Global loading state
 *
 * Automatically used by Next.js App Router as a Suspense fallback
 * for the root layout segment.
 *
 * Design: single horizontal progress bar — fits the minimal brutalist theme.
 */

import styles from './loading.module.scss';

export default function Loading() {
  return (
    <div className={styles.root} aria-label="Loading" role="status">
      <div className={styles.bar} />
    </div>
  );
}
