'use client';

import React, { type CSSProperties, type ReactNode, useCallback, useRef } from 'react';
import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD } from '@/lib/constants';
import styles from './reveal.module.scss';

interface RevealSectionProps {
  children: ReactNode;
  /** HTML element to render as (default: div) */
  as?: keyof React.JSX.IntrinsicElements;
  /** Stagger entrance delay in ms */
  delay?: number;
  className?: string;
}

export function RevealSection({ children, as = 'div', delay = 0, className }: RevealSectionProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Callback ref — fires with the real DOM node on attach, null on detach.
   * Observer stays connected for the lifetime of the node so the reveal
   * re-triggers every time the element re-enters the viewport (bidirectional).
   */
  const setNodeRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add(styles.visible);
        } else {
          // Element left the viewport — reset immediately (no transition)
          // so it can animate in cleanly next time it re-enters
          node.classList.remove(styles.visible);
        }
      },
      // Only apply bottom margin — prevents elements near the TOP of the
      // viewport from being blocked while scrolling back up
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN },
    );

    observerRef.current.observe(node);
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={setNodeRef}
      className={[styles.reveal, className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
