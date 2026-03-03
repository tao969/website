import Link from 'next/link';
import styles from './notfound.module.scss';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Page Not Found</h2>
          <p className={styles.description}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" className={styles.homeLink}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
