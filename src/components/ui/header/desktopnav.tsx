'use client';

import { ScrambleText } from '@/components/ui/scrambletext';
import Link from 'next/link';
import styles from './header.module.scss';

export default function DesktopNav() {
  return (
    <>
      {/* Desktop Navigation */}
      <div className={styles.navCenter}>
        <ul className={styles.navList}>
          <li><Link href="/projects"><ScrambleText>Work</ScrambleText></Link></li>
          <li><Link href="/articles"><ScrambleText>Articles</ScrambleText></Link></li>
          <li><Link href="/social"><ScrambleText>Social</ScrambleText></Link></li>
        </ul>
      </div>

      {/* Desktop CTA */}
      <div className={styles.navRight}>
        <Link href="/social" className={styles.ctaLink}><ScrambleText>let&apos;s connect</ScrambleText></Link>
      </div>
    </>
  );
}
