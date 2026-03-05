'use client';

/**
 * Global error boundary
 *
 * Required to be a Client Component (React error boundaries are class-based
 * internally; the 'use client' directive is mandatory here).
 *
 * Catches unhandled errors in the root layout segment and renders a
 * minimal recovery UI consistent with the site's brutalist aesthetic.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { useEffect } from 'react';
import styles from './error.module.scss';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <p className={styles.code}>error</p>
        <p className={styles.message}>
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'Something went wrong.'}
        </p>
        <button type="button" onClick={reset} className={styles.retry}>
          try again
        </button>
      </div>
    </div>
  );
}
