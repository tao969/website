/**
 * Rate limiting middleware for API routes
 * Implements in-memory rate limiting with configurable windows
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from './env';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly maxStoreSize = 10000; // Prevent unbounded growth

  constructor(maxRequests: number = 100, windowMs: number = 900000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  private getKey(request: NextRequest): string {
    // Secure IP extraction with spoofing protection
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    let ip: string;

    // In production, prefer X-Real-IP from trusted proxies, then first X-Forwarded-For
    // In development, use direct connection
    if (process.env.NODE_ENV === 'production') {
      // Trust X-Real-IP if present (set by trusted proxy like Cloudflare)
      if (realIp && this.isValidIP(realIp)) {
        ip = realIp;
      } else if (forwarded) {
        // Take the first IP from X-Forwarded-For (closest to client)
        const firstIP = forwarded.split(',')[0].trim();
        if (this.isValidIP(firstIP)) {
          ip = firstIP;
        } else {
          ip = 'invalid';
        }
      } else {
        ip = 'unknown';
      }
    } else {
      // In development, try to get from forwarded headers or fall back
      if (forwarded && this.isValidIP(forwarded.split(',')[0].trim())) {
        ip = forwarded.split(',')[0].trim();
      } else if (realIp && this.isValidIP(realIp)) {
        ip = realIp;
      } else {
        ip = '127.0.0.1'; // localhost fallback
      }
    }

    return ip;
  }

  private isValidIP(ip: string): boolean {
    // Basic IP validation - IPv4 and IPv6
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    // Basic IPv6 validation - simplified to avoid unsafe regex patterns
    const ipv6Regex = /^[0-9a-fA-F:]+$/;

    if (ipv4Regex.test(ip)) {
      // Validate IPv4 octets
      const octets = ip.split('.').map(Number);
      return octets.every(octet => octet >= 0 && octet <= 255);
    }

    if (ipv6Regex.test(ip)) {
      return true; // Basic IPv6 validation
    }

    // Allow localhost variations
    return ['localhost', '::1', '127.0.0.1'].includes(ip);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }

    // If store is still too large, remove oldest entries
    if (this.store.size > this.maxStoreSize) {
      const entriesToRemove = this.store.size - this.maxStoreSize + 100; // Remove extra 100 for buffer
      const sortedEntries = Array.from(this.store.entries())
        .sort(([, a], [, b]) => a.resetTime - b.resetTime);

      for (let i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        const [key] = sortedEntries[i];
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  public check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    // Aggressive cleanup if store is getting too large
    if (this.store.size > this.maxStoreSize * 0.9) {
      this.cleanup();
    }

    const key = this.getKey(request);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, newEntry);

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter(
  env.API_RATE_LIMIT_MAX,
  env.API_RATE_LIMIT_WINDOW
);

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = rateLimiter.check(request);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': env.API_RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', env.API_RATE_LIMIT_MAX.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  };
}

export default rateLimiter;

// Export destroy method for cleanup
export { RateLimiter };
