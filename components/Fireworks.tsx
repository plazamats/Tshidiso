'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface FireworksHandle {
  launchBurst: (x?: number, y?: number, type?: Rocket['burstType']) => void;
  launchGrandShow: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
  gravity: number;
  friction: number;
  type: 'heart' | 'spark' | 'willow' | 'ring' | 'text' | 'letter';
  text?: string;
  rotation: number;
  rotSpeed: number;
  shimmerSpeed: number;
  shimmerPhase: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Rocket {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  vy: number;
  vx: number;
  color: string;
  trail: { x: number; y: number; alpha: number; size: number }[];
  exploded: boolean;
  burstType: 'heart' | 'double_heart' | 'willow' | 'rose_bloom' | 'queen_crown' | 'infinity' | 'tshidi_name' | 'love_bouquet';
  customText?: string;
}

const ROMANTIC_PALETTES = [
  ['#ff65a3', '#ffb3d3', '#ffe4f0', '#ffd700', '#ffffff'], // Rose & Champagne Gold
  ['#f43f5e', '#fb7185', '#fda4af', '#fef08a', '#ffedd5'], // Ruby Sunset
  ['#ec4899', '#f472b6', '#c084fc', '#e9d5ff', '#fff1f2'], // Velvet Violet Romance
  ['#fbbf24', '#fde047', '#f472b6', '#ff80bf', '#ffffff'], // Golden Starlight
  ['#e11d48', '#ff4d8d', '#ffd166', '#06d6a0', '#ffffff'], // Royal Celebration
];

const LOVE_WORDS = [
  'Tshidi ♥',
  'My Queen 👑',
  'Forever Yours ♥',
  'Happy Birthday ✨',
  'My Whole Universe 💫',
  'Only You 💖',
  'Pure Magic 🌸',
  'Eternal Love ♾️',
  'My Soulmate 💕',
  'You & Me 🌹',
];

interface FireworksProps {
  active: boolean;
  interactive?: boolean;
}

const Fireworks = forwardRef<FireworksHandle, FireworksProps>(({ active, interactive = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rockets = useRef<Rocket[]>([]);
  const sparklerTrail = useRef<{ x: number; y: number; alpha: number; color: string }[]>([]);
  const animRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const launchTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Reusable noise buffer for authentic physical acoustics
  const getNoiseBuffer = useCallback((ctx: AudioContext, duration = 1.0) => {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
    }
    return buffer;
  }, []);

  // Realistic rocket launch sound (ascent whoosh & hiss)
  const playLaunchSound = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx, 0.7);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(360, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.55);
      filter.Q.setValueAtTime(3.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.00005, now + 0.65);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.7);
    } catch {
      // Audio fallback
    }
  }, [getNoiseBuffer]);

  // Authentic physical firework explosion sound (Thump Boom + Gunpowder Snap + Sizzling Crackles)
  const playRealFireworkExplosion = useCallback((isLarge = true) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // 1. Deep Sub-Bass BOOM (Thump)
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      const startPitch = isLarge ? 140 + Math.random() * 25 : 170 + Math.random() * 30;
      const endPitch = 30 + Math.random() * 8;

      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(startPitch, now);
      boomOsc.frequency.exponentialRampToValueAtTime(endPitch, now + 0.35);

      boomGain.gain.setValueAtTime(0.001, now);
      boomGain.gain.linearRampToValueAtTime(0.26, now + 0.015);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 0.9);

      // 2. Gunpowder Crack / Pop (Transient Snap)
      const crack = ctx.createBufferSource();
      crack.buffer = getNoiseBuffer(ctx, 0.35);

      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(950 + Math.random() * 350, now);
      crackFilter.Q.setValueAtTime(2.2, now);

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.001, now);
      crackGain.gain.linearRampToValueAtTime(0.20, now + 0.008);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crack.start(now);
      crack.stop(now + 0.35);

      // 3. Distant Atmospheric Rumble Tail
      const rumble = ctx.createBufferSource();
      rumble.buffer = getNoiseBuffer(ctx, 1.3);

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(150, now);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.001, now);
      rumbleGain.gain.linearRampToValueAtTime(0.11, now + 0.05);
      rumbleGain.gain.exponentialRampToValueAtTime(0.00005, now + 1.25);

      rumble.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumble.start(now);
      rumble.stop(now + 1.3);

      // 4. Sizzling Sparkler Crackles
      const crackleCount = isLarge ? 8 + Math.floor(Math.random() * 6) : 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < crackleCount; i++) {
        const popTime = now + 0.10 + Math.random() * 0.6;
        const pop = ctx.createBufferSource();
        pop.buffer = getNoiseBuffer(ctx, 0.07);

        const popFilter = ctx.createBiquadFilter();
        popFilter.type = 'highpass';
        popFilter.frequency.setValueAtTime(2200 + Math.random() * 1200, popTime);

        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.001, popTime);
        popGain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, popTime + 0.004);
        popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.055);

        pop.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(ctx.destination);
        pop.start(popTime);
        pop.stop(popTime + 0.06);
      }
    } catch {
      // Audio fallback
    }
  }, [getNoiseBuffer]);

  // Burst generator with rich romantic patterns
  const createRomanticBurst = useCallback((
    x: number,
    y: number,
    palette: string[],
    burstType: Rocket['burstType'],
    customText?: string
  ) => {
    playRealFireworkExplosion(burstType === 'willow' || burstType === 'double_heart' || burstType === 'love_bouquet' || burstType === 'rose_bloom');

    const primaryColor = palette[0];
    const secondaryColor = palette[1];
    const goldColor = palette[3] || '#ffd700';

    // 1. Text Particle (Floating Love Message)
    const displayText = customText || LOVE_WORDS[Math.floor(Math.random() * LOVE_WORDS.length)];
    particles.current.push({
      x,
      y: y - 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.5 - Math.random() * 0.3,
      color: '#ffffff',
      alpha: 1,
      size: 15,
      decay: 0.008,
      gravity: -0.001,
      friction: 0.99,
      type: 'text',
      text: displayText,
      rotation: 0,
      rotSpeed: 0,
      shimmerSpeed: 0.1,
      shimmerPhase: 0,
      trail: []
    });

    if (burstType === 'heart') {
      const count = 55;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const scale = 0.34 + Math.random() * 0.06;
        const isHeartShape = i % 2 === 0;
        const color = Math.random() > 0.3 ? primaryColor : secondaryColor;

        particles.current.push({
          x,
          y,
          vx: hx * scale + (Math.random() - 0.5) * 0.35,
          vy: hy * scale + (Math.random() - 0.5) * 0.35,
          color,
          alpha: 1,
          size: isHeartShape ? 5 + Math.random() * 3 : 2.5,
          decay: 0.009 + Math.random() * 0.004,
          gravity: 0.02,
          friction: 0.982,
          type: isHeartShape ? 'heart' : 'spark',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          shimmerSpeed: 0.08,
          shimmerPhase: Math.random() * Math.PI * 2,
          trail: []
        });
      }

      // Golden core
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 1.8;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: goldColor,
          alpha: 1,
          size: 2,
          decay: 0.014,
          gravity: 0.018,
          friction: 0.97,
          type: 'spark',
          rotation: 0,
          rotSpeed: 0,
          shimmerSpeed: 0.15,
          shimmerPhase: Math.random() * Math.PI * 2,
          trail: []
        });
      }
    } else if (burstType === 'double_heart') {
      const count = 40;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        // Outer Left Heart
        particles.current.push({
          x: x - 25,
          y,
          vx: hx * 0.35 + (Math.random() - 0.5) * 0.3,
          vy: hy * 0.35 + (Math.random() - 0.5) * 0.3,
          color: primaryColor,
          alpha: 1,
          size: 4.5,
          decay: 0.008,
          gravity: 0.018,
          friction: 0.985,
          type: 'heart',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          shimmerSpeed: 0.08,
          shimmerPhase: Math.random() * Math.PI,
          trail: []
        });

        // Interlocking Right Heart
        particles.current.push({
          x: x + 25,
          y,
          vx: hx * 0.35 + (Math.random() - 0.5) * 0.3,
          vy: hy * 0.35 + (Math.random() - 0.5) * 0.3,
          color: goldColor,
          alpha: 1,
          size: 4.5,
          decay: 0.008,
          gravity: 0.018,
          friction: 0.985,
          type: 'heart',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          shimmerSpeed: 0.08,
          shimmerPhase: Math.random() * Math.PI,
          trail: []
        });
      }
    } else if (burstType === 'rose_bloom') {
      // 3-tiered blossoming rose
      const tiers = [
        { count: 36, speed: 2.2, color: '#e11d48', size: 5 },
        { count: 28, speed: 3.4, color: '#f43f5e', size: 4 },
        { count: 22, speed: 4.6, color: '#ffb3d3', size: 3 }
      ];
      tiers.forEach(tier => {
        for (let i = 0; i < tier.count; i++) {
          const a = (i / tier.count) * Math.PI * 2;
          const petalNoise = 1 + Math.sin(a * 5) * 0.25;
          const spd = tier.speed * petalNoise;
          particles.current.push({
            x,
            y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            color: tier.color,
            alpha: 1,
            size: tier.size,
            decay: 0.007,
            gravity: 0.022,
            friction: 0.984,
            type: 'heart',
            rotation: a,
            rotSpeed: 0.02,
            shimmerSpeed: 0.1,
            shimmerPhase: Math.random() * Math.PI,
            trail: []
          });
        }
      });
    } else if (burstType === 'queen_crown') {
      // 5-pointed Queen's Crown
      const crownPoints = [
        [-40, 10], [-20, -25], [0, 5], [20, -25], [40, 10],
        [30, 20], [0, 25], [-30, 20]
      ];
      crownPoints.forEach(([px, py], idx) => {
        // Star tip sparkles
        for (let j = 0; j < 12; j++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 0.5 + Math.random() * 2.0;
          particles.current.push({
            x: x + px,
            y: y + py,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            color: idx % 2 === 1 ? '#ffffff' : goldColor,
            alpha: 1,
            size: 3.5,
            decay: 0.008,
            gravity: 0.015,
            friction: 0.98,
            type: 'spark',
            rotation: 0,
            rotSpeed: 0,
            shimmerSpeed: 0.15,
            shimmerPhase: Math.random() * Math.PI,
            trail: []
          });
        }
      });
    } else if (burstType === 'infinity') {
      // Lemniscate Infinity Curve (∞)
      const count = 60;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const scale = 50;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        const lx = (scale * Math.cos(t)) / denom;
        const ly = (scale * Math.sin(t) * Math.cos(t)) / denom;

        particles.current.push({
          x,
          y,
          vx: lx * 0.08 + (Math.random() - 0.5) * 0.3,
          vy: ly * 0.08 + (Math.random() - 0.5) * 0.3,
          color: i % 2 === 0 ? '#c084fc' : goldColor,
          alpha: 1,
          size: 3.5,
          decay: 0.007,
          gravity: 0.016,
          friction: 0.985,
          type: 'spark',
          rotation: 0,
          rotSpeed: 0,
          shimmerSpeed: 0.12,
          shimmerPhase: Math.random() * Math.PI,
          trail: []
        });
      }
    } else if (burstType === 'tshidi_name') {
      // Starlight Constellation Letters spelling T S H I D I
      const letters = ['T', 'S', 'H', 'I', 'D', 'I', '♥'];
      const spacing = 45;
      const startLeft = x - ((letters.length - 1) * spacing) / 2;

      letters.forEach((char, idx) => {
        particles.current.push({
          x: startLeft + idx * spacing,
          y,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -0.4 - Math.random() * 0.2,
          color: char === '♥' ? '#ff65a3' : '#ffd700',
          alpha: 1,
          size: 22,
          decay: 0.0055,
          gravity: -0.001,
          friction: 0.99,
          type: 'text',
          text: char,
          rotation: 0,
          rotSpeed: 0,
          shimmerSpeed: 0.1,
          shimmerPhase: idx * 0.5,
          trail: []
        });

        // Golden aura particles surrounding each letter
        for (let k = 0; k < 8; k++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 0.5 + Math.random() * 1.5;
          particles.current.push({
            x: startLeft + idx * spacing,
            y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            color: '#fff',
            alpha: 1,
            size: 2,
            decay: 0.012,
            gravity: 0.015,
            friction: 0.97,
            type: 'spark',
            rotation: 0,
            rotSpeed: 0,
            shimmerSpeed: 0.15,
            shimmerPhase: Math.random() * Math.PI,
            trail: []
          });
        }
      });
    } else {
      // Cascading Willow Waterfall
      const count = 65;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 3.8;
        const isGolden = Math.random() > 0.45;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.0,
          color: isGolden ? goldColor : primaryColor,
          alpha: 1,
          size: 2,
          decay: 0.006 + Math.random() * 0.003,
          gravity: 0.034,
          friction: 0.988,
          type: 'willow',
          rotation: 0,
          rotSpeed: 0,
          shimmerSpeed: 0.12,
          shimmerPhase: Math.random() * Math.PI * 2,
          trail: []
        });
      }
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.0;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          color: secondaryColor,
          alpha: 1,
          size: 6,
          decay: 0.006,
          gravity: 0.014,
          friction: 0.98,
          type: 'heart',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          shimmerSpeed: 0.09,
          shimmerPhase: Math.random() * Math.PI,
          trail: []
        });
      }
    }
  }, [playRealFireworkExplosion]);

  const startLoopIfNeeded = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    const drawHeart = (
      c: CanvasRenderingContext2D,
      hx: number,
      hy: number,
      size: number,
      color: string,
      alpha: number,
      rot: number
    ) => {
      c.save();
      c.translate(hx, hy);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;

      const s = size * 0.4;
      c.beginPath();
      c.moveTo(0, s * 0.6);
      c.bezierCurveTo(-s * 1.1, -s * 0.6, -s * 2.0, s * 0.8, 0, s * 2.0);
      c.bezierCurveTo(s * 2.0, s * 0.8, s * 1.1, -s * 0.6, 0, s * 0.6);
      c.fill();
      c.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if we should sleep
      if (rockets.current.length === 0 && particles.current.length === 0 && sparklerTrail.current.length === 0 && !active) {
        isRunningRef.current = false;
        return;
      }

      // ─── Sparkler Drag Trail ───
      sparklerTrail.current = sparklerTrail.current.filter(s => s.alpha > 0.02);
      for (const s of sparklerTrail.current) {
        s.alpha -= 0.035;
        ctx.globalAlpha = s.alpha * 0.4;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── Rockets ───
      rockets.current = rockets.current.filter(r => !r.exploded || r.trail.length > 0);
      for (const r of rockets.current) {
        if (!r.exploded) {
          r.trail.push({ x: r.x, y: r.y, alpha: 1, size: 2.2 });
          if (r.trail.length > 10) r.trail.shift();

          r.x += r.vx;
          r.y += r.vy;
          r.vy += 0.06;

          // Rocket head (Fast dual-pass glow)
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 1.0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (r.y <= r.targetY || r.vy >= 0) {
            r.exploded = true;
            const palette = ROMANTIC_PALETTES.find(p => p[0] === r.color) || ROMANTIC_PALETTES[0];
            createRomanticBurst(r.x, r.y, palette, r.burstType, r.customText);
          }
        }

        // Rocket Trail
        for (let i = 0; i < r.trail.length; i++) {
          const t = r.trail[i];
          t.alpha -= 0.07;
          if (t.alpha <= 0) {
            r.trail.splice(i, 1);
            i--;
            continue;
          }
          ctx.globalAlpha = t.alpha * 0.7;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.size * t.alpha, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─── Particles ───
      particles.current = particles.current.filter(p => p.alpha > 0.01);
      for (const p of particles.current) {
        if (p.type !== 'text') {
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
          const maxTrail = p.type === 'willow' ? 6 : 3;
          if (p.trail.length > maxTrail) p.trail.shift();
        }

        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;
        p.shimmerPhase += p.shimmerSpeed;

        const currentAlpha = Math.max(0, p.alpha * (0.8 + Math.sin(p.shimmerPhase) * 0.2));

        // Trails
        if (p.type === 'willow' || p.type === 'spark') {
          for (const t of p.trail) {
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Particle Body
        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, p.color, currentAlpha, p.rotation);
        } else if (p.type === 'text' && p.text) {
          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.font = `600 ${p.size}px Georgia, "Times New Roman", serif`;
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.fillText(p.text, p.x, p.y);
          ctx.restore();
        } else {
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.0, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  }, [active, createRomanticBurst]);

  const launchRocket = useCallback((
    targetX?: number,
    targetY?: number,
    burstTypeOverride?: Rocket['burstType'],
    customText?: string
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = targetX !== undefined
      ? targetX + (Math.random() - 0.5) * 50
      : canvas.width * (0.18 + Math.random() * 0.64);
    const startY = canvas.height + 15;

    const endX = targetX !== undefined
      ? targetX
      : startX + (Math.random() - 0.5) * 60;
    const endY = targetY !== undefined
      ? targetY
      : canvas.height * (0.16 + Math.random() * 0.30);

    const palette = ROMANTIC_PALETTES[Math.floor(Math.random() * ROMANTIC_PALETTES.length)];
    const color = palette[0];

    const burstTypes: Rocket['burstType'][] = [
      'heart',
      'double_heart',
      'rose_bloom',
      'queen_crown',
      'infinity',
      'willow',
      'love_bouquet'
    ];
    const burstType = burstTypeOverride || burstTypes[Math.floor(Math.random() * burstTypes.length)];

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    const speed = 12 + Math.random() * 3;
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    rockets.current.push({
      x: startX,
      y: startY,
      startX,
      startY,
      targetX: endX,
      targetY: endY,
      vx,
      vy,
      color,
      trail: [],
      exploded: false,
      burstType,
      customText
    });

    playLaunchSound();
    startLoopIfNeeded();
  }, [playLaunchSound, startLoopIfNeeded]);

  // Grand Orchestrated Fireworks Show for Tshidi
  const launchGrandShow = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const showSequence: { delay: number; type: Rocket['burstType']; x: number; y: number; text?: string }[] = [
      { delay: 100, type: 'rose_bloom', x: canvas.width * 0.3, y: canvas.height * 0.25, text: 'For Tshidi 🌹' },
      { delay: 600, type: 'double_heart', x: canvas.width * 0.7, y: canvas.height * 0.22, text: 'Two Hearts ♥' },
      { delay: 1200, type: 'queen_crown', x: canvas.width * 0.5, y: canvas.height * 0.18, text: 'My Queen 👑' },
      { delay: 1900, type: 'infinity', x: canvas.width * 0.35, y: canvas.height * 0.28, text: 'Eternal Love ♾️' },
      { delay: 2500, type: 'tshidi_name', x: canvas.width * 0.5, y: canvas.height * 0.20, text: 'TSHIDI ♥' },
      { delay: 3400, type: 'willow', x: canvas.width * 0.25, y: canvas.height * 0.22, text: 'Forever ✨' },
      { delay: 3800, type: 'willow', x: canvas.width * 0.75, y: canvas.height * 0.22, text: 'And Always 💖' },
      { delay: 4400, type: 'heart', x: canvas.width * 0.5, y: canvas.height * 0.15, text: 'Happy Birthday! 🎉' }
    ];

    showSequence.forEach(item => {
      setTimeout(() => {
        launchRocket(item.x, item.y, item.type, item.text);
      }, item.delay);
    });
  }, [launchRocket]);

  // Expose imperative API
  useImperativeHandle(ref, () => ({
    launchBurst: (x, y, type) => launchRocket(x, y, type),
    launchGrandShow
  }), [launchGrandShow, launchRocket]);

  // Window resize & interactive pointer / sparkler drag listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let dragStartX = 0;
    let dragStartY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest('button') || target.closest('a') || target.closest('.paper') || target.closest('.modal') || target.closest('input'))) {
        return;
      }
      isDraggingRef.current = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      // Draw fairy sparkler trail
      sparklerTrail.current.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1,
        color: Math.random() > 0.5 ? '#ff65a3' : '#ffd700'
      });
      startLoopIfNeeded();
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      if (dist < 15) {
        // Direct tap / click
        launchRocket(e.clientX, e.clientY);
      } else {
        // Drag swipe release -> Launch firework to release coordinate
        launchRocket(e.clientX, e.clientY, 'double_heart');
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [launchRocket, startLoopIfNeeded]);

  // Periodic launcher when active
  useEffect(() => {
    if (active) {
      startLoopIfNeeded();
      const openingTimeouts: NodeJS.Timeout[] = [];
      const count = 3;
      for (let i = 0; i < count; i++) {
        openingTimeouts.push(
          setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const x = canvas.width * (0.25 + (i / (count - 1)) * 0.5);
            const y = canvas.height * (0.18 + (i % 2) * 0.1);
            launchRocket(
              x,
              y,
              i === 1 ? 'rose_bloom' : i === 2 ? 'queen_crown' : 'heart',
              i === 1 ? 'Tshidi ♥' : i === 2 ? 'My Queen 👑' : undefined
            );
          }, i * 450)
        );
      }

      launchTimer.current = setInterval(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const x = canvas.width * (0.18 + Math.random() * 0.64);
        const y = canvas.height * (0.16 + Math.random() * 0.28);
        launchRocket(x, y);
      }, 1600 + Math.random() * 700);

      return () => {
        openingTimeouts.forEach(t => clearTimeout(t));
        if (launchTimer.current) clearInterval(launchTimer.current);
      };
    } else {
      if (launchTimer.current) {
        clearInterval(launchTimer.current);
        launchTimer.current = null;
      }
    }
  }, [active, launchRocket, startLoopIfNeeded]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 15,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
});

Fireworks.displayName = 'Fireworks';
export default Fireworks;
