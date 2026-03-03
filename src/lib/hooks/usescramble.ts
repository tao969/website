import { useCallback, useEffect, useRef } from 'react';

interface ScrambleOptions {
  speed?: number;
  revealSpeed?: number;
  onComplete?: () => void;
}

export function useScramble(
  originalText: string,
  onScramble: (text: string) => void,
  options: ScrambleOptions = {},
) {
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  // Professional feel: short but perceptually smooth duration with easing
  const durationMs = options.speed || 500;
  const stepMs = options.revealSpeed || 60; // discrete steps for tactile feel

  const scramble = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const tick = Math.floor(elapsed / stepMs);

      // Scramble ALL characters each frame, preserve whitespace to avoid layout shift
      let newText = '';
      // Build pool from the same characters as the original (case-preserved, excluding whitespace)
      let pool = originalText.replace(/\s/g, '');
      if (pool.length === 0) {
        pool = originalText;
      }
      const revealCount = Math.floor(eased * originalText.length);
      for (let i = 0; i < originalText.length; i++) {
        const ch = originalText.charAt(i);
        if (/\s/.test(ch)) {
          newText += ch;
          continue;
        }
        if (progress < 1) {
          if (i < revealCount) {
            newText += ch;
          } else {
            // Use characters that have similar width to prevent layout shift
            // Prioritize characters from the same character set
            const randomIndex = (i * 31 + tick * 101 + 7) % pool.length;
            const scrambledChar = pool.charAt(randomIndex);
            // Ensure the scrambled character has similar width
            newText += scrambledChar;
          }
        } else {
          newText += ch;
        }
      }
      onScramble(newText);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onScramble(originalText);
        animationFrameRef.current = null;
        // Call completion callback if provided
        if (options.onComplete) {
          options.onComplete();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [originalText, onScramble, durationMs, stepMs, options]);

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
