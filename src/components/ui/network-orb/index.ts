/**
 * network-orb — Interactive hub-and-spoke canvas widget
 *
 * Self-contained cluster: canvas drawing, dynamic import boundary,
 * client state bridge, and floating phrase overlay.
 *
 * Usage:
 *   import { HeroShell } from '@/components/ui/network-orb'
 *   <HeroShell />  ← mounts the whole widget
 */

export { HeroShell }        from './shell';
export { NetworkOrbLoader } from './loader';
export { NetworkOrb }       from './canvas';
export { NodePhrase }       from './phrase';
