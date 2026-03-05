'use client';

/**
 * NodePhrase — floating phrase reveal triggered by NetworkOrb node clicks.
 *
 * Animation flow:
 * 1. phrase prop changes → component becomes visible
 * 2. scramble + typewriter reveal runs (via useScramble)
 * 3. after reveal completes, phrase lingers 2.4s then fades out
 *
 * Kept as a separate UI component (not mixed into NetworkOrb) so the
 * canvas draw loop stays free of DOM mutation concerns.
 */

import { NODE_PHRASE_LINGER_MS, NODE_PHRASE_START_DELAY_MS } from '@/lib/constants';
import { useScramble } from '@/hooks/use-scramble';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import styles from './phrase.module.scss';

interface NodePhraseProps {
  phrase: string | null;
}

export const NodePhrase = forwardRef<HTMLDivElement, NodePhraseProps>(
function NodePhrase({ phrase }, ref) {
  const [displayText, setDisplayText]     = useState('');
  const [visible, setVisible]             = useState(false);
  const fadeTimerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onScramble = useCallback((t: string) => setDisplayText(t), []);

  const { scramble } = useScramble(phrase ?? '', onScramble, {
    speed: 520,       // total scramble duration ms
    revealSpeed: 42,  // ms per character reveal
    onComplete: () => {
      // linger 2.4s after full reveal then fade
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => setVisible(false), NODE_PHRASE_LINGER_MS);
    },
  });

  useEffect(() => {
    if (!phrase) return;

    // Cancel any pending fade-out
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    setVisible(true);
    // Small delay so CSS transition from invisible → visible fires first
    const t = setTimeout(() => scramble(), NODE_PHRASE_START_DELAY_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={styles.wrap}
      style={{ transform: 'translate(calc(-100% - 12px), -50%)' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={`${styles.phrase} ${visible ? styles.visible : ''}`}
        aria-label={phrase ?? undefined}
      >
        {displayText}
        <span className={styles.cursor} aria-hidden="true" />
      </span>
    </div>
  );
});
