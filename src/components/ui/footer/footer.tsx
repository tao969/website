import { ScrambleText } from '@/components/ui/scrambletext';
import Link from 'next/link';
import styles from './footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <Link href="/" className={styles.footerLogoLink}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 21 23" className={styles.footerLogo}>
                <path fill="currentColor" d="M12.53 17.783v-9.08a4.144 4.144 0 0 0-4.14-4.117v14.511a3.8 3.8 0 0 0 3.96 3.841 4.28 4.28 0 0 0 2.816-.816c-2.39-.253-2.635-1.693-2.635-4.339"/>
                <path fill="currentColor" d="M3.775.787A3.8 3.8 0 0 0 0 4.587h16.893a3.8 3.8 0 0 0 3.775-3.8z"/>
              </svg>
            </Link>
          </div>
          <div className={styles.footerCenter}>
            <p className={styles.footerCopyright}>
              © 2024 <span className={styles.footerName}>Taopik Hidayat</span>.<br className={styles.mobileBreak} />
              <span className={styles.rightsText}>All rights reserved.</span>
            </p>
          </div>
          <div className={styles.footerRight}>
            <a href="/privacy" className={styles.footerLink}>
              <ScrambleText>Privacy Policy</ScrambleText>
            </a>
            <a href="/terms" className={styles.footerLink}>
              <ScrambleText>Terms of Service</ScrambleText>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
