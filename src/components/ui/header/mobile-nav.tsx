'use client';

import { ScrambleText } from '@/components/ui/scramble';
import { NAVIGATION, ROUTES } from '@/config';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './header.module.scss';

interface MobileNavProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

/** Base delay (ms) before the first scramble — lets the overlay fade in first */
const OPEN_BASE_DELAY = 130;
/** Stagger between each nav item */
const OPEN_STAGGER_MS = 85;

/**
 * Total trigger slots:
 * indices 0..NAVIGATION.length-1 → nav items
 * index NAVIGATION.length           → CTA link
 */
const TOTAL = NAVIGATION.length + 1;

export default function MobileNav({ id, isOpen, onClose }: MobileNavProps) {
  /**
   * Per-item scramble triggers.
   * false → true fires the scramble; reset to false on close so re-open fires again.
   */
  const [triggers, setTriggers] = useState<boolean[]>(() => Array(TOTAL).fill(false));

  useEffect(() => {
    if (!isOpen) {
      // Reset all triggers so the next open re-fires scramble on every item
      setTriggers(Array(TOTAL).fill(false));
      return;
    }

    // Staggered timeouts — each item fires after the overlay has had time to appear
    const timers = Array.from({ length: TOTAL }, (_, i) =>
      setTimeout(() => {
        setTriggers((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, OPEN_BASE_DELAY + i * OPEN_STAGGER_MS),
    );

    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  return (
    <div
      id={id}
      className={`${styles.mobileMenuOverlay}${isOpen ? ` ${styles.active}` : ''}`}
      aria-hidden={!isOpen}
    >
      <nav className={styles.mobileMenu}>

        <div className={styles.mobileNavContent}>
          <ul className={styles.mobileNavList}>
            {NAVIGATION.map((item, i) => (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose} className={styles.mobileNavLink}>
                  <ScrambleText shouldScramble={triggers[i]}>
                    {item.name}
                  </ScrambleText>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.mobileCta}>
          <Link href={ROUTES.SOCIAL} onClick={onClose} className={styles.mobileCtaLink}>
            <ScrambleText shouldScramble={triggers[NAVIGATION.length]}>
              let&apos;s connect
            </ScrambleText>
          </Link>
        </div>

      </nav>
    </div>
  );
}
