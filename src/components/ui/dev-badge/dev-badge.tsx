'use client';

import { useState } from 'react';
import { Panel } from '../panel';
import styles from './dev-badge.module.scss';

export default function DevBadge() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={styles.devBadge}>
      <Panel className={styles.panelWrapper}>
        <div className={styles.badgeContent}>
          <div className={styles.badgeInfo}>
            <span className={styles.badgeText}>
              BUILDING
              <span className={styles.dots}>
                <span className={styles.dot}>.</span>
                <span className={styles.dot}>.</span>
                <span className={styles.dot}>.</span>
              </span>
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setIsVisible(false)}
            aria-label="Close development badge"
            title="Close notification"
          >
            ×
          </button>
        </div>
      </Panel>
    </div>
  );
}
