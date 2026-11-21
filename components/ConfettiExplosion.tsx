'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; rotation: number; rotationSpeed: number;
  opacity: number; shape: 'rect' | 'circle' | 'heart';
  gravity: number; friction: number; life: number; maxLife: number;
}

const COLORS = ['#ff6b9d', '#ffd700', '#ff8fbf', '#a855f7', '#38bdf8', '#fbbf24', '#fb7185', '#c084fc', '#fff', '#ff3d7f'];

interface Props {
  active: boolean;
  originX?: number;
  originY?: number;
}

export default function ConfettiExplosion({ active, originX = 50, originY = 50 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const firedRef = useRef(false);

  const fire = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = (originX / 100) * canvas.width;
    const cy = (originY / 100) * canvas.height;

    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      const shapes: Particle['shape'][] = ['rect', 'circle', 'heart'];
      particles.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 4,
        size: 4 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        gravity: 0.18 + Math.random() * 0.15,
        friction: 0.975 + Math.random() * 0.015,
        life: 0, maxLife: 80 + Math.random() * 60,
      });
    }
  }, [originX, originY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life < p.maxLife);

      for (const p of particles.current) {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life++;
        p.opacity = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const s = p.size * 0.4;
          ctx.beginPath();
          ctx.moveTo(0, s);
          ctx.bezierCurveTo(-s, -s * 0.2, -s * 1.8, -s * 1.2, 0, -s * 1.8);
          ctx.bezierCurveTo(s * 1.8, -s * 1.2, s, -s * 0.2, 0, s);
          ctx.fill();
        }
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    if (active && !firedRef.current) { fire(); firedRef.current = true; }
    if (!active) firedRef.current = false;
  }, [active, fire]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }} />;
}
