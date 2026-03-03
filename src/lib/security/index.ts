/**
 * Security utilities and configurations
 * Centralized security module for the application
 */

export { env, default as envValidator, getAllowedOrigins, isDevelopment, isProduction } from './env';
export { handleOptions, withCORS, withSecurity } from './middleware';
export { default as rateLimiter, withRateLimit } from './rate-limit';
export { InputValidator } from './validation';

// Re-export types
export type { SecurityConfig } from './middleware';
export type { ValidationResult } from './validation';
