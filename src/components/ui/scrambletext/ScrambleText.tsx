'use client';

import { useScramble } from '@/lib/hooks/usescramble';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './scrambletext.module.scss';

type ScrambleTextProps = {
  children: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  shouldScramble?: boolean;
  scrambleSpeed?: number;
  revealSpeed?: number;
  flashClassName?: string;
  onScrambleComplete?: () => void;
};

export function ScrambleText({
  children,
  as = 'span',
  className,
  style,
  shouldScramble = false,
  scrambleSpeed,
  revealSpeed,
  flashClassName,
  onScrambleComplete,
}: ScrambleTextProps) {
  const [text, setText] = useState(children);
  const onScramble = useCallback((t: string) => setText(t), []);

  // Mobile detection - hydration safe
  const [isMobile, setIsMobile] = useState(false);

  const { scramble, stopScramble } = useScramble(children, onScramble, {
    speed: scrambleSpeed || (isMobile ? 150 : 200),
    revealSpeed: revealSpeed || (isMobile ? 20 : 30),
    onComplete: onScrambleComplete,
  });

  // Keep internal text in sync if the source children changes (e.g., theme label cycles)
  useEffect(() => {
    setText(children);
  }, [children]);

  // Trigger scramble when shouldScramble prop changes
  useEffect(() => {
    if (shouldScramble) {
      scramble();
    }
  }, [shouldScramble, scramble]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Instant scramble for better responsiveness
  const handleScramble = useCallback(() => {
    scramble();
  }, [scramble]);

  const Comp = as as keyof React.JSX.IntrinsicElements;
  return (
    <Comp
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{
        ...style,
        // Ensure consistent width to prevent layout shift
        minWidth: 'fit-content',
        width: 'max-content',
      }}
      onMouseEnter={handleScramble}
      onMouseLeave={stopScramble}
      onTouchStart={handleScramble}
      onTouchEnd={stopScramble}
      onClick={(e) => {
        // Don't stop scramble on click if it's a button or link
        if (e.currentTarget.tagName === 'BUTTON' || e.currentTarget.tagName === 'A') {
          // Let the parent handle the click
          return;
        }
        stopScramble();
      }}
      aria-label={text}
    >
      <span className={styles.placeholder} aria-hidden>
        {children}
      </span>
      <span className={`${styles.overlay} ${flashClassName || ''}`}>{text}</span>
    </Comp>
  );
}
