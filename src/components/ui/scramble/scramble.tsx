'use client';

import { useScramble } from '@/hooks/use-scramble';
import { getScrollVelocity, velocityToDuration } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './scramble.module.scss';

type ScrambleTextProps = {
  children: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  shouldScramble?: boolean;
  /** Scramble once on mount */
  triggerOnMount?: boolean;
  /** Scramble once when element enters viewport */
  triggerOnView?: boolean;
  /**
   * Delay (ms) before scramble fires after entering viewport.
   * Use this to match a wrapping RevealSection's CSS transition-delay
   * so scramble starts exactly when the element becomes visible.
   */
  viewDelay?: number;
  /**
   * Enable hover/touch interaction (default: true).
   * Set false for display-only text that should never scramble on hover.
   */
  interactive?: boolean;
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
  triggerOnMount = false,
  triggerOnView = false,
  viewDelay = 0,
  interactive = true,
  scrambleSpeed,
  revealSpeed,
  flashClassName,
  onScrambleComplete,
}: ScrambleTextProps) {
  const [text, setText] = useState(children);
  const onScramble = useCallback((t: string) => setText(t), []);

  const { scramble, stopScramble } = useScramble(children, onScramble, {
    speed: scrambleSpeed ?? 800,
    revealSpeed: revealSpeed ?? 55,
    onComplete: onScrambleComplete,
  });

  /**
   * Always-fresh ref to the latest scramble function.
   * Typed explicitly so callers can pass the duration override.
   */
  const scrambleRef = useRef<(durationOverride?: number) => void>(scramble);
  useEffect(() => {
    scrambleRef.current = scramble;
  });

  // Helper: fire scramble with velocity-adjusted duration
  const triggerWithVelocity = useCallback(() => {
    const duration = velocityToDuration(getScrollVelocity());
    scrambleRef.current(duration);
  }, []);

  // Sync display text when children prop changes
  useEffect(() => {
    setText(children);
  }, [children]);

  // Controlled trigger via shouldScramble prop
  useEffect(() => {
    if (shouldScramble) scramble();
  }, [shouldScramble, scramble]);

  // Fire once on mount — no mountFired guard: Strict Mode (dev) unmounts and
  // remounts, the cleanup cancels the first timeout, the real remount fires it.
  useEffect(() => {
    if (!triggerOnMount) return;
    // On mount: comfortable pace, no scroll context
    const id = setTimeout(() => scrambleRef.current(800), 80);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * IntersectionObserver via callback ref (React 19 pattern).
   * On every viewport entry: read live scroll velocity → compute duration →
   * scramble at a speed that feels proportional to the user's scroll speed.
   * viewDelay: defers the scramble so it aligns with the wrapping RevealSection
   * CSS transition-delay — element must be visible first.
   */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      // Clear any pending delayed scramble
      if (viewDelayTimerRef.current) {
        clearTimeout(viewDelayTimerRef.current);
        viewDelayTimerRef.current = null;
      }
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || !triggerOnView) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.boundingClientRect.top > 0) {
            // Cancel any previous pending trigger before scheduling a new one
            if (viewDelayTimerRef.current) clearTimeout(viewDelayTimerRef.current);
            if (viewDelay > 0) {
              viewDelayTimerRef.current = setTimeout(triggerWithVelocity, viewDelay);
            } else {
              triggerWithVelocity();
            }
          } else if (!entry.isIntersecting) {
            // Element left viewport — cancel pending delayed scramble
            if (viewDelayTimerRef.current) {
              clearTimeout(viewDelayTimerRef.current);
              viewDelayTimerRef.current = null;
            }
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
      );
      observerRef.current.observe(node);
    },
    [triggerOnView, triggerWithVelocity, viewDelay],
  );

  const handleScramble = useCallback(() => {
    scramble(550);
  }, [scramble]);
  const interactionHandlers = interactive
    ? {
        onMouseEnter: handleScramble,
        onMouseLeave: stopScramble,
        onTouchStart: handleScramble,
        onTouchEnd: stopScramble,
      }
    : {};

  const Comp = as as React.ElementType;
  return (
    <Comp
      ref={setNodeRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={style}
      {...interactionHandlers}
      aria-label={children}
    >
      <span className={styles.placeholder} aria-hidden="true">
        {children}
      </span>
      <span className={`${styles.overlay} ${flashClassName ?? ''}`} aria-hidden="true">
        {text}
      </span>
    </Comp>
  );
}
