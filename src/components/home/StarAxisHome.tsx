import { tr } from '@/lib/lang';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import IntentInput from './IntentInput';
import type { IntentType } from '@/lib/types';
import { intentRouter } from '@/lib/intentRouter';

interface StarAxisHomeProps {
  inputValue: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  onExampleSubmit: (text: string) => void;
  onStudioClick: () => void;
  onDirectIntent: (intent: IntentType) => void;
  inputFocused: boolean;
  onInputFocus: () => void;
  onInputBlur: () => void;
}

/* ─────────────────────────────────────────────
   Layer 3: Starfield — 4 categories, ~55 stars
   shape: 'dot' | 'cross' | 'glow'
   Content-safe zone avoidance:
     Input:  y 40%–55%, x 25%–75%
     Buttons: y 55%–65%, x 28%–72%
   ───────────────────────────────────────────── */
type StarShape = 'dot' | 'cross' | 'glow';

interface StarDot {
  x: number;
  y: number;
  s: number;
  o: number;
  d: number;
  variant: 'bright' | 'mid' | 'dim';
  color: 'lime' | 'warm' | 'white';
  shape: StarShape;
  cat: 'anchor' | 'mid' | 'dust' | 'axis';
}

const starfieldData: StarDot[] = [
  /* ── A. Anchor Stars (8) — bright, corners & edges, immediately visible ── */
  { x: 6,  y: 5,  s: 3.2, o: 0.78, d: 5.8, variant: 'bright', color: 'lime', shape: 'glow',  cat: 'anchor' },
  { x: 92, y: 7,  s: 2.8, o: 0.72, d: 6.4, variant: 'bright', color: 'warm', shape: 'cross', cat: 'anchor' },
  { x: 3,  y: 38, s: 3.6, o: 0.8,  d: 7.2, variant: 'bright', color: 'lime', shape: 'glow',  cat: 'anchor' },
  { x: 95, y: 42, s: 2.6, o: 0.68, d: 5.5, variant: 'bright', color: 'white',shape: 'cross', cat: 'anchor' },
  { x: 9,  y: 72, s: 3.0, o: 0.75, d: 6.8, variant: 'bright', color: 'warm', shape: 'glow',  cat: 'anchor' },
  { x: 88, y: 76, s: 2.4, o: 0.65, d: 5.2, variant: 'bright', color: 'lime', shape: 'cross', cat: 'anchor' },
  { x: 14, y: 92, s: 2.8, o: 0.7,  d: 7.0, variant: 'bright', color: 'white',shape: 'glow',  cat: 'anchor' },
  { x: 82, y: 94, s: 3.4, o: 0.82, d: 6.2, variant: 'bright', color: 'lime', shape: 'glow',  cat: 'anchor' },

  /* ── B. Mid Stars (20) — diagonal scatter, avoid center ── */
  { x: 18, y: 14, s: 1.8, o: 0.55, d: 4.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 32, y: 11, s: 1.5, o: 0.48, d: 5.5, variant: 'mid', color: 'white',shape: 'dot', cat: 'mid' },
  { x: 68, y: 10, s: 1.4, o: 0.42, d: 4.2, variant: 'mid', color: 'warm', shape: 'dot', cat: 'mid' },
  { x: 84, y: 8,  s: 1.7, o: 0.52, d: 5.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 11, y: 22, s: 1.6, o: 0.5,  d: 6.0, variant: 'mid', color: 'white',shape: 'dot', cat: 'mid' },
  { x: 22, y: 28, s: 1.3, o: 0.42, d: 4.5, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 87, y: 24, s: 1.9, o: 0.58, d: 5.2, variant: 'mid', color: 'warm', shape: 'dot', cat: 'mid' },
  { x: 78, y: 30, s: 1.4, o: 0.45, d: 4.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 5,  y: 54, s: 1.6, o: 0.5,  d: 5.5, variant: 'mid', color: 'white',shape: 'dot', cat: 'mid' },
  { x: 93, y: 56, s: 1.5, o: 0.48, d: 4.2, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 15, y: 60, s: 1.8, o: 0.55, d: 6.2, variant: 'mid', color: 'warm', shape: 'dot', cat: 'mid' },
  { x: 85, y: 62, s: 1.3, o: 0.4,  d: 5.0, variant: 'mid', color: 'white',shape: 'dot', cat: 'mid' },
  { x: 26, y: 68, s: 2.0, o: 0.6,  d: 6.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 72, y: 70, s: 1.7, o: 0.52, d: 5.2, variant: 'mid', color: 'warm', shape: 'dot', cat: 'mid' },
  { x: 35, y: 80, s: 1.2, o: 0.38, d: 4.5, variant: 'mid', color: 'white',shape: 'dot', cat: 'mid' },
  { x: 64, y: 82, s: 1.5, o: 0.46, d: 5.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 48, y: 88, s: 1.8, o: 0.54, d: 6.0, variant: 'mid', color: 'warm', shape: 'dot', cat: 'mid' },
  { x: 8,  y: 32, s: 1.4, o: 0.44, d: 4.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'mid' },
  { x: 90, y: 36, s: 1.6, o: 0.5,  d: 5.5, variant: 'mid', color: 'white',shape: 'dot', cat: 'mid' },
  { x: 44, y: 18, s: 1.2, o: 0.38, d: 4.2, variant: 'mid', color: 'warm', shape: 'dot', cat: 'mid' },

  /* ── C. Dust Stars (22) — tiny edge sparkle for density ── */
  { x: 2,  y: 15, s: 0.9, o: 0.28, d: 3.8, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 16, y: 9,  s: 0.7, o: 0.22, d: 4.2, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 38, y: 6,  s: 0.8, o: 0.25, d: 3.5, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 58, y: 5,  s: 1.0, o: 0.3,  d: 4.0, variant: 'dim', color: 'warm', shape: 'dot', cat: 'dust' },
  { x: 74, y: 7,  s: 0.9, o: 0.26, d: 3.6, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 96, y: 12, s: 0.8, o: 0.24, d: 4.4, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 2,  y: 45, s: 0.7, o: 0.2,  d: 3.2, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 98, y: 48, s: 0.9, o: 0.28, d: 3.8, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 5,  y: 64, s: 0.8, o: 0.24, d: 4.5, variant: 'dim', color: 'warm', shape: 'dot', cat: 'dust' },
  { x: 96, y: 68, s: 0.7, o: 0.2,  d: 3.5, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 10, y: 84, s: 0.9, o: 0.28, d: 3.8, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 56, y: 92, s: 0.8, o: 0.22, d: 4.0, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 92, y: 86, s: 0.7, o: 0.2,  d: 3.5, variant: 'dim', color: 'warm', shape: 'dot', cat: 'dust' },
  { x: 28, y: 4,  s: 0.8, o: 0.26, d: 4.2, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 52, y: 3,  s: 0.7, o: 0.22, d: 3.6, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 46, y: 95, s: 1.0, o: 0.3,  d: 3.8, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 70, y: 96, s: 0.8, o: 0.25, d: 4.0, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 19, y: 96, s: 0.9, o: 0.28, d: 3.5, variant: 'dim', color: 'warm', shape: 'dot', cat: 'dust' },
  { x: 5,  y: 18, s: 0.7, o: 0.2,  d: 3.2, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 94, y: 18, s: 0.8, o: 0.24, d: 3.8, variant: 'dim', color: 'lime', shape: 'dot', cat: 'dust' },
  { x: 76, y: 22, s: 0.7, o: 0.22, d: 3.4, variant: 'dim', color: 'white',shape: 'dot', cat: 'dust' },
  { x: 80, y: 14, s: 0.9, o: 0.26, d: 4.0, variant: 'dim', color: 'warm', shape: 'dot', cat: 'dust' },

  /* ── D. Center Axis Stars (6) — subtle vertical line above logo-to-input zone ── */
  { x: 49.5, y: 10, s: 1.4, o: 0.38, d: 5.5, variant: 'mid', color: 'lime', shape: 'dot', cat: 'axis' },
  { x: 50.5, y: 16, s: 1.0, o: 0.3,  d: 4.8, variant: 'dim', color: 'white',shape: 'dot', cat: 'axis' },
  { x: 49.0, y: 22, s: 1.6, o: 0.42, d: 6.2, variant: 'mid', color: 'lime', shape: 'dot', cat: 'axis' },
  { x: 50.0, y: 28, s: 1.2, o: 0.35, d: 5.0, variant: 'mid', color: 'warm', shape: 'dot', cat: 'axis' },
  { x: 51.0, y: 34, s: 1.8, o: 0.45, d: 6.8, variant: 'mid', color: 'lime', shape: 'dot', cat: 'axis' },
  { x: 49.5, y: 38, s: 1.0, o: 0.28, d: 4.5, variant: 'dim', color: 'white',shape: 'dot', cat: 'axis' },
];

const colorMap: Record<StarDot['color'], string> = {
  lime: '#DEFF9A',
  warm: '#F5F5D0',
  white: '#F5F5F2',
};

/* ─────────────────────────────────────────────
   Layer 4: Distant floating particles (12)
   ───────────────────────────────────────────── */
interface FloatParticle {
  x: number;
  y: number;
  s: number;
  o: number;
  duration: number;
  driftType: 'A' | 'B' | 'C';
  blur: number;
}

const floatParticles: FloatParticle[] = [
  { x: 12, y: 25, s: 3.5, o: 0.12, duration: 22, driftType: 'A', blur: 3 },
  { x: 84, y: 16, s: 3.0, o: 0.1,  duration: 26, driftType: 'B', blur: 4 },
  { x: 6,  y: 58, s: 4.0, o: 0.09, duration: 19, driftType: 'C', blur: 3 },
  { x: 90, y: 52, s: 3.2, o: 0.11, duration: 24, driftType: 'A', blur: 2 },
  { x: 38, y: 75, s: 3.8, o: 0.09, duration: 28, driftType: 'B', blur: 4 },
  { x: 68, y: 10, s: 2.8, o: 0.1,  duration: 20, driftType: 'C', blur: 3 },
  { x: 22, y: 44, s: 3.0, o: 0.08, duration: 25, driftType: 'A', blur: 3 },
  { x: 56, y: 65, s: 3.5, o: 0.1,  duration: 23, driftType: 'B', blur: 2 },
  { x: 78, y: 35, s: 3.3, o: 0.08, duration: 27, driftType: 'C', blur: 3 },
  { x: 15, y: 82, s: 2.5, o: 0.1,  duration: 21, driftType: 'A', blur: 2 },
  { x: 46, y: 12, s: 3.0, o: 0.09, duration: 24, driftType: 'B', blur: 3 },
  { x: 92, y: 72, s: 3.8, o: 0.08, duration: 26, driftType: 'C', blur: 4 },
];

const driftAnimations: Record<string, string> = {
  A: 'floatDriftA',
  B: 'floatDriftB',
  C: 'floatDriftC',
};

/* ─────────────────────────────────────────────
   Twinkle animation by variant
   ───────────────────────────────────────────── */
const twinkleAnim: Record<string, string> = {
  bright: 'starTwinkleBright',
  mid: 'starTwinkleMid',
  dim: 'starTwinkleDim',
};

/* ─────────────────────────────────────────────
   Task mode buttons
   ───────────────────────────────────────────── */
const taskButtons: { label: string; intent: IntentType; desc: string; icon: string }[] = [
  { label: '快速分析', intent: 'quick', desc: '输入标的，快速了解风险与机会', icon: 'ri-flashlight-line' },
  { label: '引导研究', intent: 'guided', desc: '多源数据 + 分析框架深入研究', icon: 'ri-search-eye-line' },
  { label: 'Research Studio', intent: 'studio', desc: '自定义研究流与节点编辑', icon: 'ri-dashboard-3-line' },
];

const examples = [
  'TSLA 风险在哪里',
  '拆解腾讯云增长逻辑',
  '搭建半导体研究流',
];

export default function StarAxisHome({
  inputValue, onInputChange, onSubmit, onExampleSubmit, onStudioClick, onDirectIntent,
  inputFocused, onInputFocus, onInputBlur,
}: StarAxisHomeProps) {
  const currentIntent = inputValue.trim() ? intentRouter(inputValue.trim()) : null;

  /* ── Mouse parallax ── */
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* Parallax offsets — enhanced ranges */
  const px3 = ((mousePos.x - 0.5) * 16).toFixed(2);
  const py3 = ((mousePos.y - 0.5) * 10).toFixed(2);
  const px4 = ((mousePos.x - 0.5) * 24).toFixed(2);
  const py4 = ((mousePos.y - 0.5) * 16).toFixed(2);
  const px2 = ((mousePos.x - 0.5) * 8).toFixed(2);
  const py2 = ((mousePos.y - 0.5) * 5).toFixed(2);
  const pxOrb = ((mousePos.x - 0.5) * 6).toFixed(2);
  const pyOrb = ((mousePos.y - 0.5) * 4).toFixed(2);

  /* ── Layer 5a: Meteor — first at 2.5s, then 8-14s ── */
  const [meteor, setMeteor] = useState<{
    active: boolean;
    top: string;
    left: string;
    length: number;
    opacity: number;
    variant: 'A' | 'B';
  }>({ active: false, top: '0%', left: '0%', length: 0, opacity: 0, variant: 'A' });

  const scheduleMeteor = useCallback((firstDelay: number) => {
    let isFirst = firstDelay < 3000;
    const next = isFirst ? firstDelay : 8000 + Math.random() * 6000; // 8-14s after first
    const timer = setTimeout(() => {
      const side = Math.random();
      let top: string;
      let left: string;
      let variant: 'A' | 'B';
      if (side < 0.5) {
        top = `${6 + Math.random() * 20}%`;
        left = `${3 + Math.random() * 8}%`;
        variant = 'A'; // top-left → bottom-right
      } else {
        top = `${8 + Math.random() * 18}%`;
        left = `${78 + Math.random() * 16}%`;
        variant = 'B'; // top-right → bottom-left
      }
      setMeteor({
        active: true,
        top,
        left,
        length: 120 + Math.random() * 60,
        opacity: 0.45 + Math.random() * 0.25,
        variant,
      });
      setTimeout(() => setMeteor((p) => ({ ...p, active: false })), 2500);
      scheduleMeteor(0); // subsequent ones use normal interval
    }, next);
    return timer;
  }, []);

  useEffect(() => {
    const timer = scheduleMeteor(2500);
    return () => clearTimeout(timer);
  }, [scheduleMeteor]);

  /* ── Layer 5b: Scan sweep ── */
  const [scanActive, setScanActive] = useState(false);
  const [scanDelay, setScanDelay] = useState(0);

  const scheduleScan = useCallback(() => {
    const next = 10000 + Math.random() * 6000;
    const timer = setTimeout(() => {
      setScanDelay(Math.random() * 1.5);
      setScanActive(true);
      setTimeout(() => setScanActive(false), 5000);
      scheduleScan();
    }, next);
    return timer;
  }, []);

  useEffect(() => {
    const timer = scheduleScan();
    return () => clearTimeout(timer);
  }, [scheduleScan]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center relative min-h-0 bg-xing-bg overflow-hidden">

      {/* ═══════════════════════════════════════════
          Layer 1: Base black + subtle edge-darkening
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 68% 58% at 50% 48%, rgba(10,11,10,0) 0%, rgba(4,5,3,0.45) 100%)' }} />

      {/* ═══════════════════════════════════════════
          Layer 2: Dot grid — more visible now
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none bg-dots-home opacity-60"
        style={{ willChange: 'transform', transform: `translate3d(${px2}px, ${py2}px, 0)` }} />

      {/* ═══════════════════════════════════════════
          Layer 2b: Three-layer central radial glow
          ═══════════════════════════════════════════ */}
      {/* Outer Halo — widest, very faint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[460px] rounded-full pointer-events-none"
        style={{
          willChange: 'opacity',
          background: 'radial-gradient(ellipse, rgba(222,255,154,0.06) 0%, rgba(222,255,154,0.015) 30%, transparent 65%)',
          animation: 'haloBreath 12s ease-in-out infinite',
        }} />
      {/* Input Halo — tighter, stronger */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[220px] rounded-full pointer-events-none"
        style={{
          willChange: 'opacity',
          background: 'radial-gradient(ellipse, rgba(222,255,154,0.08) 0%, rgba(222,255,154,0.025) 28%, transparent 55%)',
          animation: 'haloBreath 9s ease-in-out 2s infinite',
        }} />
      {/* Logo Halo — above logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[160px] rounded-full pointer-events-none"
        style={{
          willChange: 'opacity',
          background: 'radial-gradient(ellipse, rgba(222,255,154,0.055) 0%, rgba(222,255,154,0.012) 40%, transparent 70%)',
          animation: 'haloBreath 10s ease-in-out 4s infinite',
          marginTop: '-160px',
        }} />

      {/* ═══════════════════════════════════════════
          Central Star Axis — thin vertical energy line
          ═══════════════════════════════════════════ */}
      <div className="absolute left-1/2 pointer-events-none"
        style={{
          width: '1px',
          height: '340px',
          top: '22%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(222,255,154,0.18) 15%, rgba(222,255,154,0.06) 45%, rgba(222,255,154,0.02) 70%, transparent 100%)',
          animation: 'axisPulse 9s ease-in-out infinite',
          willChange: 'opacity',
        }} />

      {/* ═══════════════════════════════════════════
          Orbital Rings — 3 faint elliptical orbits
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ring 1 — largest */}
        <div className="absolute left-1/2"
          style={{
            width: '900px',
            height: '540px',
            top: '52%',
            border: '1px solid rgba(222,255,154,0.07)',
            borderRadius: '50%',
            transform: `translate(-50%, -50%) rotate(15deg)`,
            maskImage: 'linear-gradient(to bottom, transparent 12%, black 30%, black 70%, transparent 88%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 12%, black 30%, black 70%, transparent 88%)',
            animation: 'orbitalRotateSlow 80s linear infinite',
            willChange: 'transform',
          }}
        />
        {/* Ring 2 — medium, reverse */}
        <div className="absolute left-1/2"
          style={{
            width: '720px',
            height: '420px',
            top: '50%',
            border: '1px solid rgba(222,255,154,0.06)',
            borderRadius: '50%',
            transform: `translate(-50%, -50%) translate3d(${pxOrb}px, ${pyOrb}px, 0) rotate(-12deg)`,
            maskImage: 'linear-gradient(to bottom, transparent 10%, black 28%, black 72%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, black 28%, black 72%, transparent 90%)',
            animation: 'orbitalRotateReverse 95s linear infinite',
            willChange: 'transform',
          }}
        />
        {/* Ring 3 — smallest, tight */}
        <div className="absolute left-1/2"
          style={{
            width: '560px',
            height: '320px',
            top: '49%',
            border: '1px solid rgba(222,255,154,0.05)',
            borderRadius: '50%',
            transform: `translate(-50%, -50%) translate3d(${pxOrb}px, ${pyOrb}px, 0) rotate(28deg)`,
            maskImage: 'linear-gradient(to bottom, transparent 8%, black 25%, black 75%, transparent 92%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 8%, black 25%, black 75%, transparent 92%)',
            animation: 'orbitalRotateVerySlow 110s linear infinite',
            willChange: 'transform',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════
          Readability mask — behind content, darkens area
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse 70% 42% at 50% 46%, rgba(0,0,0,0.32) 0%, transparent 100%)',
        }} />

      {/* ═══════════════════════════════════════════
          Layer 3: Main starfield — 55 deliberate stars
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]"
        style={{ willChange: 'transform', transform: `translate3d(${px3}px, ${py3}px, 0)` }}>
        {starfieldData.map((dot, i) => {
          const baseColor = colorMap[dot.color];
          const anim = twinkleAnim[dot.variant];
          const delay = (i * 1.13).toFixed(1);

          if (dot.shape === 'cross') {
            return (
              <div key={`star-${i}`} className="star-cross"
                style={{
                  width: `${dot.s * 3}px`,
                  height: `${dot.s * 3}px`,
                  top: `${dot.y}%`,
                  left: `${dot.x}%`,
                  background: baseColor,
                  opacity: dot.o,
                  animation: `${anim} ${dot.d}s ease-in-out ${delay}s infinite`,
                  willChange: 'opacity, transform',
                }}
              />
            );
          }
          if (dot.shape === 'glow') {
            return (
              <div key={`star-${i}`} className="absolute rounded-full"
                style={{
                  width: `${dot.s}px`,
                  height: `${dot.s}px`,
                  top: `${dot.y}%`,
                  left: `${dot.x}%`,
                  background: baseColor,
                  boxShadow: `0 0 ${dot.s * 2.5}px ${baseColor}55, 0 0 ${dot.s * 5}px ${baseColor}22`,
                  opacity: dot.o,
                  animation: `${anim} ${dot.d}s ease-in-out ${delay}s infinite`,
                  willChange: 'opacity, transform',
                }}
              />
            );
          }
          return (
            <div key={`star-${i}`} className="absolute rounded-full"
              style={{
                width: `${dot.s}px`,
                height: `${dot.s}px`,
                top: `${dot.y}%`,
                left: `${dot.x}%`,
                background: baseColor,
                boxShadow: dot.variant === 'bright' ? `0 0 ${dot.s * 1.8}px ${baseColor}33` : 'none',
                opacity: dot.o,
                animation: `${anim} ${dot.d}s ease-in-out ${delay}s infinite`,
                willChange: 'opacity, transform',
              }}
            />
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════
          Layer 4: Distant floating particles (12)
          ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]"
        style={{ willChange: 'transform', transform: `translate3d(${px4}px, ${py4}px, 0)` }}>
        {floatParticles.map((p, i) => (
          <div key={`float-${i}`} className="absolute rounded-full"
            style={{
              width: `${p.s}px`, height: `${p.s}px`,
              top: `${p.y}%`, left: `${p.x}%`,
              background: 'rgba(222,255,154,0.6)',
              opacity: p.o,
              filter: `blur(${p.blur}px)`,
              animation: `${driftAnimations[p.driftType]} ${p.duration}s linear infinite`,
              animationDelay: `${i * 1.7}s`,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          Layer 5a: Meteor — edge-only, two directions
          ═══════════════════════════════════════════ */}
      {meteor.active && (
        <div className="absolute pointer-events-none z-[0]"
          style={{
            top: meteor.top, left: meteor.left,
            width: `${meteor.length}px`, height: '1.5px',
            opacity: meteor.opacity,
            animation: `${meteor.variant === 'A' ? 'meteorShootA' : 'meteorShootB'} 2.2s ease-out forwards`,
          }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(222,255,154,0.95) 0%, rgba(222,255,154,0) 65%)',
              boxShadow: '0 0 8px rgba(222,255,154,0.55), 0 0 18px rgba(222,255,154,0.25)',
            }} />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 h-px rounded-full"
            style={{
              background: 'linear-gradient(to left, rgba(222,255,154,0.7), rgba(222,255,154,0.08), transparent)',
              animation: 'meteorTrail 2.2s ease-out forwards',
            }} />
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Layer 5b: Scan sweep
          ═══════════════════════════════════════════ */}
      {scanActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-px pointer-events-none origin-center z-[0]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(222,255,154,0.1) 30%, rgba(222,255,154,0.18) 50%, rgba(222,255,154,0.1) 70%, transparent 100%)',
            animation: `scanSweep 4.5s ease-in-out ${scanDelay}s forwards`,
            willChange: 'transform, opacity',
          }} />
      )}

      {/* ═══════════════════════════════════════════
          Studio entry
          ═══════════════════════════════════════════ */}
      <motion.button onClick={onStudioClick}
        className="absolute top-6 right-8 flex items-center gap-1.5 text-[13px] font-medium text-xing-text-2 hover:text-xing-green transition-all cursor-pointer font-mono group z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <span className="w-1.5 h-1.5 rounded-full bg-xing-green/60 group-hover:bg-xing-green transition-colors" />
        Studio
        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-xing-green/0 group-hover:bg-xing-green/30 transition-colors" />
      </motion.button>

      {/* ═══════════════════════════════════════════
          Logo
          ═══════════════════════════════════════════ */}
      <motion.div className="mb-12 relative z-[2]"
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        <div className="flex justify-center mb-3">
          <div className="w-2 h-2 rounded-full bg-xing-green animate-pulse-soft" />
        </div>
        <h1 className="text-[38px] font-light tracking-[0.42em] text-xing-text opacity-92 select-none">
          X<span className="text-xing-green font-normal">I</span>NG
        </h1>
      </motion.div>

      {/* ═══════════════════════════════════════════
          Input
          ═══════════════════════════════════════════ */}
      <motion.div className="w-full px-6 mb-6 relative z-[2]"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}>
        <IntentInput value={inputValue} onChange={onInputChange} onSubmit={onSubmit}
          focused={inputFocused} onFocus={onInputFocus} onBlur={onInputBlur} />
      </motion.div>

      {/* ═══════════════════════════════════════════
          Mode buttons
          ═══════════════════════════════════════════ */}
      <motion.div className="flex items-center gap-3 mb-6 relative z-[2]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        {taskButtons.map((btn) => {
          const isRecommended = currentIntent === btn.intent;
          return (
            <button key={btn.intent} onClick={() => onDirectIntent(btn.intent)}
              className={`relative px-5 py-3.5 rounded-xl border transition-all cursor-pointer text-left min-w-[190px] group ${
                isRecommended
                  ? 'border-xing-green bg-xing-card-active shadow-[0_0_24px_rgba(222,255,154,0.08)]'
                  : 'border-xing-border bg-xing-card hover:border-xing-border-active hover:bg-xing-card-hover hover:-translate-y-0.5'
              }`}>
              {isRecommended && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-xing-green/15 border border-xing-green/30 text-[9px] text-xing-green font-mono">
                  {tr('推荐')}
                </span>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <i className={`${btn.icon} text-sm ${isRecommended ? 'text-xing-green' : 'text-xing-text-2 group-hover:text-xing-green'} transition-colors`} />
                <span className={`text-[13px] font-medium whitespace-nowrap ${isRecommended ? 'text-xing-text' : 'text-xing-text group-hover:text-xing-text'} transition-colors`}>
                  {tr(btn.label)}
                </span>
                <span className="ml-auto text-xing-text-disabled/40 group-hover:text-xing-text-3 transition-colors text-[10px]">&rarr;</span>
              </div>
              <div className={`text-[10px] leading-relaxed ${isRecommended ? 'text-xing-text-2/80' : 'text-xing-text-3 group-hover:text-xing-text-2/70'} transition-colors`}>
                {tr(btn.desc)}
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════
          Example prompts
          ═══════════════════════════════════════════ */}
      <motion.div className="flex items-center gap-6 relative z-[2]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
        {examples.map((ex, i) => (
          <span key={i} className="flex items-center gap-6">
            <button onClick={() => onExampleSubmit(ex)}
              className="text-[13px] text-xing-text-3 opacity-75 hover:text-xing-green hover:opacity-100 transition-all cursor-pointer hover:-translate-y-0.5 whitespace-nowrap duration-200">
              {tr(ex)}
            </button>
            {i < examples.length - 1 && <span className="w-px h-3 bg-xing-border-subtle" />}
          </span>
        ))}
      </motion.div>
    </div>
  );
}