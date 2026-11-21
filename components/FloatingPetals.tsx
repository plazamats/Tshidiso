'use client';

import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speedY: number;
  speedX: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

const COLORS = ['#ff8fbf', '#ffb3d3', '#f7a8c9', '#ffc4e1', '#ff6b9d', '#ffd1e8', '#e88bbb'];

export default function FloatingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d', { alpha: true })!;
    let animId = 0;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Fewer petals on small screens keeps CPU well under control
    const count = window.innerWidth < 650 ? 12 : 20;
    const petals: Petal[] = Array.from({ length: count }, () => ({
      x: Math.random() * (canvas.width || 1200),
      y: Math.random() * (canvas.height || 800),
      size: 7 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      speedY: 0.4 + Math.random() * 0.6,
      speedX: -0.15 + Math.random() * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      opacity: 0.2 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.012 + Math.random() * 0.015,
    }));

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.4;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height + 25) {
          p.y = -25;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 25) p.x = -25;
        if (p.x < -25) p.x = canvas.width + 25;
        drawPetal(p);
      }
      animId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (!running) { running = true; animId = requestAnimationFrame(animate); }
    };
    const stop = () => {
      if (running) { running = false; cancelAnimationFrame(animId); }
    };

    const onVisibility = () => { document.hidden ? stop() : start(); };

    animId = requestAnimationFrame(animate);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
