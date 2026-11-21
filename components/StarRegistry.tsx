'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { story } from '../content/love-story';

interface Star {
  x: number; y: number; r: number; phase: number; speed: number;
}

const SPECIAL = { fx: 0.7, fy: 0.42 };

export default function StarRegistry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const foundRef = useRef(false);

  useEffect(() => {
    if (found) return;
    const timer = setTimeout(() => setShowHint(true), 11000);
    return () => clearTimeout(timer);
  }, [found]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let running = true;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const stars: Star[] = Array.from({ length: 150 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
    }));

    const ripples: { x: number; y: number; a: number }[] = [];
    let celebration = 0;

    const resize = () => {
      w = wrap.clientWidth; h = 420;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let reticle: { x: number; y: number } | null = null;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;

      for (const s of stars) {
        const tw = 0.45 + Math.sin(time * s.speed + s.phase) * 0.35;
        ctx.globalAlpha = tw;
        ctx.fillStyle = '#e8e4ff';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Her star
      const sx = SPECIAL.fx * w, sy = SPECIAL.fy * h;
      const pulse = 1 + Math.sin(time * 2.4) * 0.35;
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 26 * pulse);
      halo.addColorStop(0, 'rgba(255, 214, 130, 0.9)');
      halo.addColorStop(1, 'rgba(255, 214, 130, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(sx, sy, 26 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe9b8';
      ctx.beginPath(); ctx.arc(sx, sy, 3.2 * pulse, 0, Math.PI * 2); ctx.fill();

      // Cross sparkle on her star
      ctx.strokeStyle = 'rgba(255, 233, 184, 0.75)';
      ctx.lineWidth = 1;
      const arm = 10 * pulse;
      ctx.beginPath();
      ctx.moveTo(sx - arm, sy); ctx.lineTo(sx + arm, sy);
      ctx.moveTo(sx, sy - arm); ctx.lineTo(sx, sy + arm);
      ctx.stroke();

      if (celebration > 0) {
        celebration -= 1;
        for (let i = 0; i < 3; i++) {
          const ringR = (1 - celebration / 90) * (60 + i * 34);
          ctx.globalAlpha = Math.max(0, celebration / 90) * 0.6;
          ctx.strokeStyle = '#ffd982';
          ctx.beginPath(); ctx.arc(sx, sy, ringR, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.a -= 0.03;
        if (rp.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.globalAlpha = rp.a * 0.5;
        ctx.strokeStyle = '#bfa8ff';
        ctx.beginPath(); ctx.arc(rp.x, rp.y, (1 - rp.a) * 44, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (reticle && !foundRef.current) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffb3d3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(reticle.x, reticle.y, 14, 0, Math.PI * 2);
        ctx.moveTo(reticle.x - 20, reticle.y); ctx.lineTo(reticle.x - 8, reticle.y);
        ctx.moveTo(reticle.x + 8, reticle.y); ctx.lineTo(reticle.x + 20, reticle.y);
        ctx.moveTo(reticle.x, reticle.y - 20); ctx.lineTo(reticle.x, reticle.y - 8);
        ctx.moveTo(reticle.x, reticle.y + 8); ctx.lineTo(reticle.x, reticle.y + 20);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running && !foundRef.current) {
        running = true;
        raf = requestAnimationFrame(draw);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0.15 });
    io.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      reticle = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { reticle = null; };
    const onClick = (e: PointerEvent) => {
      if (foundRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const sx = SPECIAL.fx * w, sy = SPECIAL.fy * h;
      if (Math.hypot(x - sx, y - sy) < 30) {
        foundRef.current = true;
        celebration = 90;
        setFound(true);
        setShowHint(false);
        if (navigator.vibrate) navigator.vibrate([40, 80, 120]);
        setTimeout(() => { running = false; cancelAnimationFrame(raf); }, 1600);
      } else {
        ripples.push({ x, y, a: 1 });
      }
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onClick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onClick);
    };
  }, []);

  return (
    <div className="star-registry">
      <div className="star-sky-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="star-sky" aria-label="A sky of stars — one belongs to you" />
        <AnimatePresence>
          {!found && showHint && (
            <motion.small
              className="star-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
            >
              {story.starRegistry.hintAfter}
            </motion.small>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {found && (
          <motion.div
            className="star-certificate"
            initial={{ opacity: 0, y: 40, rotateX: 18 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          >
            <p className="star-found-line">{story.starRegistry.found}</p>
            <div className="certificate-card">
              <span className="cert-eyebrow">{story.starRegistry.certificate}</span>
              <h4>{story.name}</h4>
              <p className="cert-id">Star catalog: {story.starRegistry.catalogId}</p>
              <p className="cert-coords">{story.starRegistry.coordsNote}</p>
              <p className="cert-magnitude">Magnitude: immeasurable · Registered: forever</p>
              <div className="cert-seal">★</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
