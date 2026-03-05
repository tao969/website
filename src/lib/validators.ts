/**
 * validators — Pure input validation utilities
 *
 * No side-effects, no external deps. Safe in both server and client contexts.
 */

/** Returns true if the value is a non-empty string after trimming */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Returns true if value is a string within the given length bounds */
export function isWithinLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Returns true if the string is a valid absolute HTTP/HTTPS URL.
 * Uses the URL constructor — ReDoS-safe.
 */
export function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns true if the value looks like a valid email address.
 * Intentionally lenient — server should do strict validation.
 */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (!isWithinLength(value, 3, 254)) return false;
  const at     = value.lastIndexOf('@');
  if (at < 1) return false;
  const local  = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!local || !domain) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || !domain.includes('.')) return false;
  return true;
}

/**
 * Returns true if the value is a valid URL slug.
 * Allows lowercase letters, digits, and hyphens; no leading/trailing hyphens.
 */
export function isValidSlug(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  // eslint-disable-next-line security/detect-unsafe-regex
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/** Asserts a condition; throws with message if false */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invariant failed: ${message}`);
}

/** Exhaustive-check helper for discriminated unions */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
