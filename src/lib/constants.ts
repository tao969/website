/**
 * constants — Application-wide magic values
 *
 * Single source of truth for timing, animation thresholds, and limits.
 * All values are in milliseconds unless noted.
 */

// CSS transition mirrors (keep in sync with _variables.scss)
export const TRANSITION_FAST   = 150 as const;
export const TRANSITION_NORMAL = 300 as const;
export const TRANSITION_SLOW   = 600 as const;

// Scramble animation
export const SCRAMBLE_DURATION_FAST   = 650 as const; // fast scroll
export const SCRAMBLE_DURATION_NORMAL = 800 as const; // default
export const SCRAMBLE_DURATION_SLOW   = 900 as const; // idle
export const SCRAMBLE_REVEAL_STEP     = 55  as const; // ms per character

// Scroll velocity thresholds (px/ms)
export const SCROLL_VELOCITY_IDLE   = 0  as const;
export const SCROLL_VELOCITY_SLOW   = 2  as const;
export const SCROLL_VELOCITY_MEDIUM = 8  as const;
export const SCROLL_VELOCITY_FAST   = 15 as const;

// Intersection Observer
export const REVEAL_THRESHOLD   = 0.05                  as const;
export const REVEAL_ROOT_MARGIN = '0px 0px -32px 0px'   as const;

// Theme persistence
export const THEME_STORAGE_KEY = 'theme'      as const;
export const THEME_DATA_ATTR   = 'data-theme' as const;

// NodePhrase timing
export const NODE_PHRASE_LINGER_MS      = 2400 as const;
export const NODE_PHRASE_START_DELAY_MS = 30   as const;
