import { PROJECT_CATEGORIES } from '@/constants/projects';
import styles from './projects.module.scss';

export default function ProjectsPage() {

  return (
    <div className="container">
      <section className={styles.projectsSection}>
        <div className={styles.projectsContent}>
          <h1 className={styles.projectsTitle}>Projects</h1>

        <div className={styles.projectsGrid}>
          {PROJECT_CATEGORIES.map((category) => (
            <div
              key={category.name}
              className={styles.projectItem}
            >
              <span className={styles.borderTop}></span>
              <span className={styles.borderRight}></span>
              <span className={styles.borderBottom}></span>
              <span className={styles.borderLeft}></span>

              {/* Default content */}
              <div className={styles.defaultContent}>
                <div className={styles.itemBody}>
                  <div className={styles.textContainer}>
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={styles.categoryType}>{category.type}</span>
                  </div>
                </div>
              </div>

              {/* Hover content */}
              <div className={styles.hoverContent}>
                {/* Category name in top-left corner */}
                <div className={styles.categoryNameCorner}>
                  <div className={styles.textContainerSmall}>
                    <span className={styles.categoryNameCornerText}>{category.name}</span>
                  </div>
                </div>

                {/* Arrow in top-right corner */}
                <span className={styles.arrowIcon} aria-hidden>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 17L17 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 7H17V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                {/* Simple hint in center */}
                <div className={styles.simpleHint}>
                  SOON
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}
