/**
 * WorkList — Section Component
 *
 * Renders the work/project category rows.
 * Wrapped with React.memo — receives only static data as props,
 * so re-renders on parent state changes are skipped entirely.
 */

import { memo } from 'react';
import type { ProjectCategory, ProjectStatus } from '@/config';
import styles from './work-list.module.scss';

interface WorkListProps {
  categories: readonly ProjectCategory[];
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  live:          'Live',
  wip:           'In progress',
  'coming-soon': 'Coming soon',
  archived:      'Archived',
};

export const WorkList = memo(function WorkList({ categories }: WorkListProps) {
  return (
    <div className={styles.list}>
      {categories.map((category, i) => (
        <div key={category.name} className={styles.row}>
          <div className="container">
            <div className={styles.rowInner}>
              <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.rowName}>{category.name}</span>
              <span className={styles.rowType}>{category.type}</span>
              <span className={styles.rowStatus} data-status={category.status}>
                {STATUS_LABELS[category.status]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

