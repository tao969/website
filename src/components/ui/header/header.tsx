'use client';

import { Panel } from '@/components/ui/panel';
import { ScrambleText } from '@/components/ui/scrambletext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DesktopNav from './desktopnav';
import styles from './header.module.scss';
import MobileNav from './mobilenav';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle mobile menu interactions
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(`.${styles.nav}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <Panel className={styles.navPanel}>
            <nav className={styles.nav}>
              {/* Logo */}
              <div className={styles.logo}>
                <Link href="/" className={styles.logoLink}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 21 23"
                    className={styles.logoIcon}
                  >
                    <path fill="currentColor" d="M12.53 17.783v-9.08a4.144 4.144 0 0 0-4.14-4.117v14.511a3.8 3.8 0 0 0 3.96 3.841 4.28 4.28 0 0 0 2.816-.816c-2.39-.253-2.635-1.693-2.635-4.339"/>
                    <path fill="currentColor" d="M3.775.787A3.8 3.8 0 0 0 0 4.587h16.893a3.8 3.8 0 0 0 3.775-3.8z"/>
                  </svg>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <DesktopNav />

              {/* Mobile Menu Button */}
              <button
                className={styles.mobileMenuButton}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <ScrambleText>MENU</ScrambleText>
              </button>
            </nav>
          </Panel>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
