/**
 * proxy — Edge Runtime proxy (Next.js 16+ standard)
 *
 * Runs on the Edge Runtime before every matched request.
 *
 * Responsibilities:
 *   1. Block access to sensitive filesystem paths.
 *   2. Inject baseline security headers not covered by next.config.ts.
 *
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextRequest, NextResponse } from 'next/server';

const BLOCKED_PATHS = [
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.env.development',
  '/package.json',
  '/package-lock.json',
  '/pnpm-lock.yaml',
  '/yarn.lock',
  '/.git',
  '/.gitignore',
  '/README.md',
] as const;

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (BLOCKED_PATHS.some((path) => pathname.startsWith(path))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public/
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
