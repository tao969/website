'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import MobileNav from './mobile-nav';
import styles from './header.module.scss';

const NAV_ID = 'site-nav';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((p) => !p), []);

  /**
   * AbortController pattern (React 19 / modern JS):
   * one controller.abort() removes all listeners at once, no manual removeEventListener
   */
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener(
      'keydown',
      (e: KeyboardEvent) => { if (e.key === 'Escape') close(); },
      { signal },
    );
    document.addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        if (navRef.current && !navRef.current.contains(e.target as Node)) close();
      },
      { signal },
    );

    return () => {
      controller.abort();
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <nav ref={navRef} className={styles.nav} aria-label="Primary navigation">

            <Link href="/" className={styles.logoLink} aria-label="Home">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 21 23"
                className={styles.logoIcon}
                aria-hidden="true"
              >
                <path fill="currentColor" d="M12.53 17.783v-9.08a4.144 4.144 0 0 0-4.14-4.117v14.511a3.8 3.8 0 0 0 3.96 3.841 4.28 4.28 0 0 0 2.816-.816c-2.39-.253-2.635-1.693-2.635-4.339"/>
                <path fill="currentColor" d="M3.775.787A3.8 3.8 0 0 0 0 4.587h16.893a3.8 3.8 0 0 0 3.775-3.8z"/>
              </svg>
            </Link>

            {/* Hamburger / Close — always visible, morphs between states */}
            <button
              className={`${styles.menuBtn}${isOpen ? ` ${styles.open}` : ''}`}
              onClick={toggle}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls={NAV_ID}
            >
              {/* Hamburger lines */}
              <svg
                className={styles.iconHamburger}
                width="20"
                height="14"
                viewBox="0 0 20 14"
                fill="none"
                aria-hidden="true"
              >
                <rect width="20" height="1.5" fill="currentColor" />
                <rect y="6" width="20" height="1.5" fill="currentColor" />
                <rect y="12" width="20" height="1.5" fill="currentColor" />
              </svg>

              {/* Close × */}
              <svg
                className={styles.iconClose}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

          </nav>
        </div>
      </header>

      <MobileNav id={NAV_ID} isOpen={isOpen} onClose={close} />
    </>
  );
}
