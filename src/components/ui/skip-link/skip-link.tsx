import styles from './skip-link.module.scss';

interface SkipLinkProps {
  href?: string;
  label?: string;
}

export function SkipLink({
  href = '#main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a href={href} className={styles.skipLink}>
      {label}
    </a>
  );
}
