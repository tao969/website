'use client';

/**
 * NetworkOrbLoader — thin Client Component boundary.
 *
 * `next/dynamic` with `ssr: false` must live inside a Client Component.
 * This wrapper keeps HeroSection as an RSC while deferring the canvas
 * animation to the client bundle only.  (Vercel: bundle-dynamic-imports)
 */

import dynamic from 'next/dynamic';

const NetworkOrb = dynamic(
  () => import('./canvas').then((m) => ({ default: m.NetworkOrb })),
  { ssr: false },
);

interface LoaderProps {
  onNodeClick?:      (payload: { phrase: string }) => void;
  onPositionUpdate?: (x: number, y: number) => void;
}

export function NetworkOrbLoader({ onNodeClick, onPositionUpdate }: LoaderProps) {
  return <NetworkOrb onNodeClick={onNodeClick} onPositionUpdate={onPositionUpdate} />;
}
