'use client';

/**
 * NetworkOrb — Hub-and-spoke 3D diagram.
 *
 * Visual: one square at center, thin lines radiating outward in 3D space,
 * square nodes at each endpoint (and one intermediate node per arm).
 * Inspired by xAI / starburst node diagrams.
 *
 * Performance:
 * - Zero re-renders — all state in refs.
 * - Single rAF loop with dt cap.
 * - ResizeObserver + DPR cap at 2.
 */

import { useEffect, useRef } from 'react';
import styles from './canvas.module.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const N_ARMS     = 14; // matches ICON_PATHS exactly — no duplicates
const ROT_Y      = 0.00013;
const TILT_X     = 0.28;
const FOV        = 3.0;
const ORB_SCALE  = 0.38;

// Animation timing (ms)
const ANIM_ARM_DURATION  = 2200;  // arms fully grown
const ANIM_GLOW_DURATION = 2800;  // glow fades after arrival
const STAGGER_MS         = 55;    // offset between each arm's start — race feel
const RING_DURATION      = 650;   // ms for ring sweep + fade at each icon

// Colors — brand tokens from _variables.scss
const C_LINE         = '72,70,66';    // dark warm-grey arm color
const C_NODE_LIT     = '135,169,255'; // $color-accent — blue on click
const C_INK          = '240,237,228'; // warm white

// Easing helpers
/** Smooth-step: zero derivative at 0 and 1 — no pop, no snap */
const smoothstep  = (t: number) => t * t * (3 - 2 * t);
/** Ease-out quint: aggressive deceleration toward target */
const easeOutQ    = (t: number) => 1 - Math.pow(1 - t, 5);
/** Ease-in-out cosine: symmetric, video-like fade */
const easeInOutCos = (t: number) => (1 - Math.cos(t * Math.PI)) / 2;

// Phrases — index-matched to ICON_PATHS below
const PHRASES = [
  'OpenAI',
  'Claude',
  'Gemini',
  'Grok',
  'xAI',
  'Cursor',
  'GitHub Copilot',
  'Meta AI',
  'Claude Code',
  'NotebookLM',
  'Ollama',
  'AI Studio',
  'Vertex AI',
  'AntiGravity',
];

/** Depth-scaled half-size for end-node squares (CSS px). */
const endHalf = (psp: number) => Math.max(10, Math.min(18, psp * 13));

// Icons — one per slot, cycled across N_ARMS
const ICON_PATHS = [
  '/icons/ai/svg/openai.svg',
  '/icons/ai/svg/claude.svg',
  '/icons/ai/svg/gemini.svg',
  '/icons/ai/svg/grok.svg',
  '/icons/ai/svg/xai.svg',
  '/icons/ai/png/cursor.png',
  '/icons/ai/svg/githubcopilot.svg',
  '/icons/ai/svg/metaai.svg',
  '/icons/ai/svg/claudecode.svg',
  '/icons/ai/svg/notebooklm.svg',
  '/icons/ai/svg/ollama.svg',
  '/icons/ai/svg/aistudio.svg',
  '/icons/ai/svg/vertexai.svg',
  '/icons/ai/png/antigravity.png',
];

// ─────────────────────────────────────────────────────────────────────────────
interface Node3D {
  ox: number; oy: number; oz: number;
  sx: number; sy: number;
  alpha: number;
  psp: number;
  armIdx: number;
  lit: boolean;
}

interface Arm {
  endIdx: number;
}

interface Scene {
  nodes: Node3D[];
  arms: Arm[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
function fibonacciDirections(n: number): [number, number, number][] {
  const phi  = Math.PI * (3 - Math.sqrt(5));
  const dirs: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const y   = 1 - (i / (n - 1)) * 2;
    const rxy = Math.sqrt(Math.max(0, 1 - y * y));
    const t   = phi * i;
    dirs.push([rxy * Math.cos(t), y, rxy * Math.sin(t)]);
  }
  return dirs;
}

function buildScene(): Scene {
  const nodes: Node3D[] = [];
  const arms:  Arm[]    = [];

  const ARM_LEN = 1.0;
  const dirs    = fibonacciDirections(N_ARMS);

  for (let a = 0; a < N_ARMS; a++) {
    const [dx, dy, dz] = dirs[a];

    const endIdx = nodes.length;
    nodes.push({
      ox: dx * ARM_LEN,
      oy: dy * ARM_LEN,
      oz: dz * ARM_LEN,
      sx: 0, sy: 0, alpha: 1, psp: 1,
      armIdx: a, lit: false,
    });

    arms.push({ endIdx });
  }

  return { nodes, arms };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface NetworkOrbProps {
  onNodeClick?:       (payload: { phrase: string }) => void;
  onPositionUpdate?:  (x: number, y: number) => void;
}

export function NetworkOrb({ onNodeClick, onPositionUpdate }: NetworkOrbProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const sceneRef      = useRef<Scene>(buildScene());
  const iconsRef      = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef     = useRef<Set<number>>(new Set());
  const litArmRef     = useRef<number>(-1);
  const startTimeRef  = useRef<number>(0);
  const inViewRef     = useRef<boolean>(false);
  const ringStartRef  = useRef<(number | null)[]>(Array.from({ length: N_ARMS }, () => null));
  const angleY        = useRef(0.0);
  const rafHandle     = useRef(0);
  const lastT         = useRef(0);

  useEffect(() => {
    // Reset both refs on every mount/remount (handles HMR re-runs in dev).
    loadedRef.current    = new Set();
    iconsRef.current     = new Array(ICON_PATHS.length).fill(null) as (HTMLImageElement | null)[];
    ringStartRef.current   = Array.from({ length: N_ARMS }, () => null);
    startTimeRef.current   = 0;
    inViewRef.current      = false;

    const loadIcon = (src: string, i: number) => {
      const setImg = (img: HTMLImageElement) => {
        iconsRef.current[i] = img;
        loadedRef.current.add(i);
      };

      if (src.endsWith('.svg')) {
        // SVGs with fill="currentColor" render transparent on canvas — no CSS context.
        // Fix: fetch text, patch currentColor → brand color, embed as data URI.
        fetch(src)
          .then(r => r.text())
          .then(text => {
            const patched  = text.replaceAll('currentColor', '#f0ede4');
            const dataUri  = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(patched)}`;
            const img      = new Image();
            img.onload     = () => setImg(img);
            img.onerror    = () => loadedRef.current.add(i); // skip gracefully
            img.src        = dataUri;
          })
          .catch(() => {
            // Fallback: load raw (will be invisible if currentColor, but won't crash)
            const img  = new Image();
            img.onload = () => setImg(img);
            img.src    = src;
            if (img.complete && img.naturalWidth > 0) setImg(img);
          });
      } else {
        const img   = new Image();
        img.onload  = () => setImg(img);
        img.onerror = () => loadedRef.current.add(i);
        img.src     = src;
        if (img.complete) setImg(img);
      }
    };

    ICON_PATHS.forEach(loadIcon);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const dpr     = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas, { box: 'border-box' });

    // Only start animation when canvas enters the viewport
    const io = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    io.observe(canvas);

    // ── Click handler — only toggle if cursor is on a square node ──────────
    const getHitNode = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const my   = e.clientY - rect.top;
      const { nodes } = sceneRef.current;
      for (const nd of nodes) {
        const half = endHalf(nd.psp) + 4; // +4px tolerance
        if (
          mx >= nd.sx - half && mx <= nd.sx + half &&
          my >= nd.sy - half && my <= nd.sy + half
        ) return nd;
      }
      return null;
    };

    const onClick = (e: MouseEvent) => {
      const nd = getHitNode(e);
      if (!nd) return;

      const { nodes } = sceneRef.current;

      if (litArmRef.current === nd.armIdx) {
        // Same node — toggle off
        nd.lit = false;
        litArmRef.current = -1;
      } else {
        // Different node — unlit the previous one, lit the new one
        if (litArmRef.current !== -1) {
          const prev = nodes.find(n => n.armIdx === litArmRef.current);
          if (prev) prev.lit = false;
        }
        nd.lit = true;
        litArmRef.current = nd.armIdx;
        const phrase = PHRASES[nd.armIdx % PHRASES.length];
        onNodeClick?.({ phrase });
      }
    };

    // Change cursor to pointer only when hovering over a node
    const onMouseMove = (e: MouseEvent) => {
      canvas.style.cursor = getHitNode(e) ? 'pointer' : 'default';
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);

    const draw = (t: number) => {
      const dt = Math.min(t - (lastT.current || t), 32);
      lastT.current = t;

      // Only start the clock once the canvas is visible in the viewport
      if (!inViewRef.current) {
        rafHandle.current = requestAnimationFrame(draw);
        return;
      }

      // Init start time on first visible frame
      if (startTimeRef.current === 0) startTimeRef.current = t;
      const elapsed = t - startTimeRef.current;

      // (scroll lock removed — this section is below the fold)

      angleY.current += ROT_Y * dt;

      const W     = canvas.offsetWidth;
      const H     = canvas.offsetHeight;
      const cx    = W / 2;
      const cy    = H * 0.42;
      const scale = Math.min(W, H) * ORB_SCALE;

      const cosY = Math.cos(angleY.current);
      const sinY = Math.sin(angleY.current);
      const cosX = Math.cos(TILT_X);
      const sinX = Math.sin(TILT_X);

      const { nodes, arms } = sceneRef.current;

      // Project
      for (const nd of nodes) {
        const x1  =  nd.ox * cosY + nd.oz * sinY;
        const z1  = -nd.ox * sinY + nd.oz * cosY;
        const y2  =  nd.oy * cosX - z1   * sinX;
        const z2  =  nd.oy * sinX + z1   * cosX;
        const psp = FOV / (FOV + z2);
        nd.sx     = cx + x1 * scale * psp;
        nd.sy     = cy + y2 * scale * psp;
        nd.psp    = psp;
        nd.alpha  = 0.08 + 0.92 * Math.max(0, Math.min(1, (z2 + 1.6) / 3.2));
      }

      // Live label position
      if (litArmRef.current !== -1) {
        const litNode = nodes.find(n => n.armIdx === litArmRef.current);
        if (litNode) onPositionUpdate?.(litNode.sx, litNode.sy);
      }

      // ── Per-arm timing: arms race with stagger ─────────────────────────
      // Each arm 'a' starts a * STAGGER_MS ms after arm 0.
      // Glow fires once the LAST arm has fully arrived.
      ctx.clearRect(0, 0, W, H);

      if (elapsed <= 0) {
        rafHandle.current = requestAnimationFrame(draw);
        return;
      }

      // ── Arms ──────────────────────────────────────────────────────────────
      for (let a = 0; a < N_ARMS; a++) {
        const nd       = nodes[arms[a].endIdx];
        const half     = endHalf(nd.psp);
        const dxS      = nd.sx - cx;
        const dyS      = nd.sy - cy;
        const dist     = Math.sqrt(dxS * dxS + dyS * dyS);
        const ux       = dist > 0 ? dxS / dist : 0;
        const uy       = dist > 0 ? dyS / dist : 0;

        // Per-arm staggered progress
        const elapsed_a = Math.max(0, elapsed - a * STAGGER_MS);
        const armProg_a = easeOutQ(Math.min(elapsed_a / ANIM_ARM_DURATION, 1));

        const drawnDist = dist * armProg_a;
        const edgeDist  = Math.max(0, dist - half); // near edge of square

        // Arm always stops at near edge — never snaps, never enters the square
        const stopDist = Math.min(drawnDist, edgeDist);
        const stopX    = cx + ux * stopDist;
        const stopY    = cy + uy * stopDist;

        if (stopDist <= 0) continue;

        // Base arm — always full opacity of drawn segment, no hard edge
        const armLineA = nd.alpha * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(stopX, stopY);
        ctx.strokeStyle = `rgba(${C_LINE},${armLineA.toFixed(3)})`;
        ctx.lineWidth   = 0.85;
        ctx.stroke();

        // Travelling wave — a sine bell that rides the tip of the arm
        // Bell is 35% of total arm length; fully fades in/out at its edges
        const edgeProg = edgeDist > 0 ? drawnDist / edgeDist : 1; // 0→1 until tip reaches edge
        if (edgeProg < 1) {
          const bellLen   = 0.35 * edgeDist;
          const tipX      = cx + ux * drawnDist;
          const tipY      = cy + uy * drawnDist;
          const tailX     = cx + ux * Math.max(0, drawnDist - bellLen);
          const tailY     = cy + uy * Math.max(0, drawnDist - bellLen);

          // Extra wave on top of arm that is already drawn (overpaints)
          const grad = ctx.createLinearGradient(tailX, tailY, tipX, tipY);
          // Sine bell: 0 → peak → 0, centered at 60% of bell length
          const peakA = nd.alpha * 0.85;
          grad.addColorStop(0,    `rgba(${C_NODE_LIT},0)`);
          grad.addColorStop(0.35, `rgba(${C_NODE_LIT},${(peakA * 0.55).toFixed(3)})`);
          grad.addColorStop(0.65, `rgba(${C_NODE_LIT},${peakA.toFixed(3)})`);
          grad.addColorStop(1,    `rgba(${C_NODE_LIT},${(peakA * 0.15).toFixed(3)})`);
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }
      }

      // ── Squares — each fades in the moment its arm tip reaches the near edge ──
      const sorted = nodes.slice().sort((a, b) => a.psp - b.psp);
      for (const nd of sorted) {
        const half     = endHalf(nd.psp);
        const dxS      = nd.sx - cx;
        const dyS      = nd.sy - cy;
        const dist     = Math.sqrt(dxS * dxS + dyS * dyS);
        const edgeDist = Math.max(0, dist - half);
        // Per-arm staggered progress
        const elapsed_a  = Math.max(0, elapsed - nd.armIdx * STAGGER_MS);
        const armProg_a  = easeOutQ(Math.min(elapsed_a / ANIM_ARM_DURATION, 1));
        const drawnDist  = dist * armProg_a;

        // touchProg: smoothstep from 0→1 as arm tip crosses the square boundary
        const rawTouch  = Math.min(1, Math.max(0, (drawnDist - edgeDist) / Math.max(1, half)));
        const touchProg = smoothstep(rawTouch);
        if (touchProg <= 0) continue;

        // Ring / glow trigger — set once when arm reaches the square edge
        const edgeProg_a = edgeDist > 0 ? Math.min(1, drawnDist / edgeDist) : 1;
        if (edgeProg_a >= 1 && ringStartRef.current[nd.armIdx] === null) {
          ringStartRef.current[nd.armIdx] = t;
        }
        // Per-arm glow: fires immediately after THIS arm's ring ends, no global delay
        const rs         = ringStartRef.current[nd.armIdx];
        const afterRing  = rs !== null ? Math.max(0, t - rs - RING_DURATION) : 0;
        const perArmGlow = afterRing > 0
          ? easeInOutCos(1 - Math.min(1, afterRing / ANIM_GLOW_DURATION))
          : 0;

        const r  = Math.max(2, half * 0.30);
        const x  = nd.sx - half;
        const y  = nd.sy - half;
        const sz = half * 2;
        const na = nd.alpha * touchProg;

        // 1. Frosted fill
        ctx.beginPath();
        ctx.roundRect(x, y, sz, sz, r);
        const fillGlow = smoothstep(perArmGlow);
        ctx.fillStyle = nd.lit
          ? `rgba(135,169,255,${(na * (0.12 + fillGlow * 0.20)).toFixed(3)})`
          : `rgba(${C_INK},${(na * (0.05 + fillGlow * 0.06)).toFixed(3)})`;
        ctx.fill();

        // 2. Icon
        const img = iconsRef.current[nd.armIdx];
        if (loadedRef.current.has(nd.armIdx) && img) {
          const pad = 2;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x + pad, y + pad, sz - pad * 2, sz - pad * 2, Math.max(1, r - pad));
          ctx.clip();
          ctx.globalAlpha = na * (nd.lit ? 0.92 : 0.82);
          try { ctx.drawImage(img, x + pad, y + pad, sz - pad * 2, sz - pad * 2); }
          catch { /* skip */ }
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // 3. Border
        ctx.beginPath();
        ctx.roundRect(x, y, sz, sz, r);
        if (nd.lit) {
          ctx.strokeStyle = `rgba(${C_NODE_LIT},${na.toFixed(3)})`;
          ctx.lineWidth   = 0.8;
        } else {
          // Per-arm: interpolate accent → grey based on THIS arm's glow, not global
          const gi  = smoothstep(perArmGlow);
          const r1  = 135, g1 = 169, b1 = 255;
          const r0  = 72,  g0 = 70,  b0 = 66;
          const ri  = Math.round(r0 + (r1 - r0) * gi);
          const gi2 = Math.round(g0 + (g1 - g0) * gi);
          const bi  = Math.round(b0 + (b1 - b0) * gi);
          const ba  = na * (0.18 + gi * 0.65);
          ctx.strokeStyle = `rgba(${ri},${gi2},${bi},${ba.toFixed(3)})`;
          ctx.lineWidth   = 0.6;
        }
        ctx.stroke();

        // 4. Ring — arc sweeps around icon as arm first arrives, then fades
        //    ringStartRef already set above — no duplicate trigger needed
        if (rs !== null) {
          const ringAge  = t - rs!;
          const ringProg = Math.min(1, ringAge / RING_DURATION);
          if (ringProg < 1) {
            // Arc sweeps in first 80% of duration, then holds while fading
            const arcProgress = smoothstep(Math.min(1, ringProg / 0.8));
            // Start from the direction pointing back toward center
            const startAngle = Math.atan2(-dyS, -dxS);
            const endAngle   = startAngle + arcProgress * Math.PI * 2;
            // Sine-bell opacity: 0 → peak → 0 over ringProg 0..1
            const ringAlpha  = nd.alpha * Math.sin(ringProg * Math.PI) * 0.80;
            const ringRadius = half * 1.30;
            ctx.beginPath();
            ctx.arc(nd.sx, nd.sy, ringRadius, startAngle, endAngle);
            ctx.strokeStyle = `rgba(${C_NODE_LIT},${ringAlpha.toFixed(3)})`;
            ctx.lineWidth   = 1.0;
            ctx.stroke();
          }
        }
      }

      rafHandle.current = requestAnimationFrame(draw);
    };

    rafHandle.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafHandle.current);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      tabIndex={-1}                      // not keyboard-focusable → no focus ring
      aria-label="Interactive starburst diagram"
    />
  );
}
