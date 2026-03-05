/**
 * Types — Shared utility types
 *
 * Global TypeScript utility types used across all layers.
 * Keep this file free of external dependencies.
 *
 * @module types
 */

// ─────────────────────────────────────────────────────────────────────────────
// Nullability
// ─────────────────────────────────────────────────────────────────────────────

/** T or null */
export type Nullable<T> = T | null;

/** T or undefined */
export type Optional<T> = T | undefined;

/** T, null, or undefined */
export type Maybe<T> = T | null | undefined;

// ─────────────────────────────────────────────────────────────────────────────
// Array helpers
// ─────────────────────────────────────────────────────────────────────────────

/** An array guaranteed to have at least one element */
export type NonEmptyArray<T> = [T, ...T[]];

/** Readonly variant that also makes nested objects readonly */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// ─────────────────────────────────────────────────────────────────────────────
// Object helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the union of value types from an object type */
export type ValueOf<T> = T[keyof T];

/** Omit keys distributively over a union type */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

/** Make specified keys required */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specified keys optional */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ─────────────────────────────────────────────────────────────────────────────
// Component helpers
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';

/** Component props with an optional className */
export type PropsWithClassName<T = object> = T & { className?: string };

/** Component props with children */
export type PropsWithChildren<T = object> = T & { children: ReactNode };

/** Component props with both className and children */
export type PropsWithClassNameAndChildren<T = object> = T & {
  className?: string;
  children: ReactNode;
};

// ─────────────────────────────────────────────────────────────────────────────
// UI primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Valid HTML heading levels */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Valid link target attribute values */
export type LinkTarget = '_self' | '_blank' | '_parent' | '_top';

// ─────────────────────────────────────────────────────────────────────────────
// Async / data-fetching states
// ─────────────────────────────────────────────────────────────────────────────

/** Generic fetch state wrapper */
export interface AsyncState<T> {
  data: Nullable<T>;
  isLoading: boolean;
  error: Nullable<Error>;
}
