/**
 * useScramble — Character-scramble animation hook
 *
 * @example
 * const { scramble, stopScramble } = useScramble('Hello', setText);
 */

import { useCallback, useEffect, useRef } from 'react';
import { SCRAMBLE_DURATION_NORMAL, SCRAMBLE_REVEAL_STEP } from '@/lib/constants';

export interface ScrambleOptions {
  speed?:       number;
  revealSpeed?: number;
  onComplete?:  () => void;
}

/** Lowercase alphabet — looks random, easy on eyes, no harsh symbols */
const POOL = 'abcdefghijklmnopqrstuvwxyz';

export function useScramble(
  originalText: string,
  onScramble:   (text: string) => void,
  options:      ScrambleOptions = {},
) {
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef      = useRef<number | null>(null);

  const durationRef = useRef(options.speed       ?? SCRAMBLE_DURATION_NORMAL);
  const stepRef     = useRef(options.revealSpeed ?? SCRAMBLE_REVEAL_STEP);
  useEffect(() => {
    durationRef.current = options.speed       ?? SCRAMBLE_DURATION_NORMAL;
    stepRef.current     = options.revealSpeed ?? SCRAMBLE_REVEAL_STEP;
  });

  const onCompleteRef = useRef(options.onComplete);
  useEffect(() => {
    onCompleteRef.current = options.onComplete;
  });

  const scramble = useCallback((durationOverride?: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed    = timestamp - startTimeRef.current;
      const durationMs = durationOverride ?? durationRef.current;
      const stepMs     = stepRef.current;
      const progress   = Math.min(1, elapsed / durationMs);

      // easeOutQuart — deliberate deceleration at the end
      const eased       = 1 - Math.pow(1 - progress, 4);
      const revealCount = Math.floor(eased * originalText.length);

      let newText = '';
      for (let i = 0; i < originalText.length; i++) {
        const ch = originalText[i];
        if (/\s/.test(ch) || i < revealCount) {
          newText += ch;
          continue;
        }
        const charStep = stepMs + i * 8;
        const charTick = Math.floor(elapsed / charStep);
        const idx      = Math.abs(i * 19 + charTick * 37 + 13) % POOL.length;
        newText += POOL[idx];
      }

      onScramble(newText);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onScramble(originalText);
        animationFrameRef.current = null;
        onCompleteRef.current?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  // durationMs/stepMs read from refs — no extra deps needed here
  }, [originalText, onScramble]);

  const stopScramble = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    onScramble(originalText);
  }, [originalText, onScramble]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { scramble, stopScramble };
}
