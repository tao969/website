/**
 * PlatformList — Feature Component
 *
 * Renders the social platform rows with external links.
 * Accepts only domain data from the social domain.
 * Wrapped with React.memo — pure rendering, no local state.
 */

import { memo } from 'react';
import type { SocialPlatform } from '@/config';
import styles from './platform-list.module.scss';

interface PlatformListProps {
  platforms: readonly SocialPlatform[];
}

export const PlatformList = memo(function PlatformList({ platforms }: PlatformListProps) {
  return (
    <div className={styles.list}>
      {platforms.map((platform, i) => {
        const isActive = platform.active && platform.url !== 'N/A';

        if (!isActive) {
          return (
            <div key={platform.name} className={`${styles.row} ${styles.rowDisabled}`}>
              <div className="container">
                <div className={styles.rowInner}>
                  <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.rowName}>{platform.name}</span>
                  <span className={styles.rowUnavailable}>Unavailable</span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.row}
            aria-label={`Visit ${platform.name}`}
          >
            <div className="container">
              <div className={styles.rowInner}>
                <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.rowName}>{platform.name}</span>
                <span className={styles.rowArrow} aria-hidden>&#8599;</span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
});

