'use client';

/**
 * HeroShell — client state bridge for the hero canvas interaction.
 *
 * HeroSection is an RSC, so it cannot hold useState. This thin wrapper
 * lives at the client boundary and wires:
 *   NetworkOrbLoader (canvas)  →  onNodeClick  →  NodePhrase (typing UI)
 */

import { useCallback, useRef, useState } from 'react';
import { NetworkOrbLoader } from './loader';
import { NodePhrase } from './phrase';

export function HeroShell() {
  const [phrase, setPhrase] = useState<string | null>(null);
  const phraseElRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(({ phrase }: { phrase: string }) => {
    setPhrase(phrase);
  }, []);

  // Called every rAF frame — mutates DOM directly, no re-render
  const handlePosition = useCallback((x: number, y: number) => {
    if (phraseElRef.current) {
      phraseElRef.current.style.left = `${x}px`;
      phraseElRef.current.style.top  = `${y}px`;
    }
  }, []);

  return (
    <>
      <NetworkOrbLoader onNodeClick={handleClick} onPositionUpdate={handlePosition} />
      <NodePhrase ref={phraseElRef} phrase={phrase} />
    </>
  );
}
