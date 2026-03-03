'use client';

import { ScrambleText } from '@/components/ui/scrambletext';
import Link from 'next/link';
import styles from './header.module.scss';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <>
      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${isOpen ? styles.active : ''}`}>
        <nav className={styles.mobileMenu}>
          {/* Close Button */}
          <button
            className={styles.mobileCloseButton}
            onClick={onClose}
            aria-label="Close mobile menu"
          >
            <ScrambleText shouldScramble={false}>CLOSE</ScrambleText>
          </button>

          {/* Navigation Content */}
          <div className={styles.mobileNavContent}>
            <ul className={styles.mobileNavList}>
              <li>
                <Link href="/projects" onClick={onClose}>
                  <ScrambleText shouldScramble={false}>Work</ScrambleText>
                </Link>
              </li>
              <li>
                <Link href="/articles" onClick={onClose}>
                  <ScrambleText shouldScramble={false}>Articles</ScrambleText>
                </Link>
              </li>
              <li>
                <Link href="/social" onClick={onClose}>
                  <ScrambleText shouldScramble={false}>Social</ScrambleText>
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className={styles.mobileCta}>
            <Link href="/social" onClick={onClose} className={styles.mobileCtaLink}>
              <ScrambleText shouldScramble={false}>let&apos;s connect</ScrambleText>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
