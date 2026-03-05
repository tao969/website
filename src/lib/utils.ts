/**
 * utils — Shared pure utilities
 *
 * cn:              Merge class names (clsx wrapper)
 * getScrollVelocity: Current scroll speed in px/ms
 * velocityToDuration: Map scroll speed → scramble duration
 */

import { type ClassValue, clsx } from 'clsx';
import { SCRAMBLE_DURATION_FAST, SCRAMBLE_DURATION_SLOW } from './constants';

// ─── Class names ─────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ─── Scroll velocity ─────────────────────────────────────────────────────────

let currentVelocity = 0;
let lastScrollY     = 0;
let lastScrollTime  = 0;
let decayTimer: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      const now  = performance.now();
      const dy   = Math.abs(window.scrollY - lastScrollY);
      const dt   = now - lastScrollTime;

      if (dt > 0) {
        currentVelocity = currentVelocity * 0.4 + (dy / dt) * 0.6;
      }

      lastScrollY    = window.scrollY;
      lastScrollTime = now;

      if (decayTimer !== null) clearTimeout(decayTimer);
      decayTimer = setTimeout(() => { currentVelocity = 0; }, 200);
    },
    { passive: true },
  );
}

/**
 * Returns current scroll velocity in px/ms.
 * ~0 = idle | ~2-4 = slow | ~8-15 = moderate | ~20+ = fast
 */
export function getScrollVelocity(): number {
  return currentVelocity;
}

/**
 * Maps scroll velocity to a scramble animation duration.
 * Fast scroll → shorter (650ms) | Idle → longer (900ms)
 */
export function velocityToDuration(velocityPxMs: number): number {
  const computed = SCRAMBLE_DURATION_SLOW - velocityPxMs * 12;
  return Math.round(
    Math.max(SCRAMBLE_DURATION_FAST, Math.min(SCRAMBLE_DURATION_SLOW, computed)),
  );
}
