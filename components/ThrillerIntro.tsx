'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ThrillerIntroProps {
  onComplete: () => void;
}

/* ────────────────────────────────────────────────────────────────── */
/*  CINEMATIC SOUND DESIGN & SOUNDTRACK ENGINE                        */
/*  - Blends real romantic soundtrack (Ruth B - Dandelions / Perfect) */
/*  - Dynamic Web Audio score: sub-bass heartbeat, celestial chimes,  */
/*    deep cinematic climax impact hit, and warm harmonic pads        */
/* ────────────────────────────────────────────────────────────────── */
class CinematicSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private filter: BiquadFilterNode | null = null;
  private heartbeatInterval: number | null = null;
  private isMuted = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      /* AudioContext unavailable */
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public startScore() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.22, now + 4);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(110, now);
      this.filter.frequency.linearRampToValueAtTime(280, now + 24);
      this.filter.frequency.linearRampToValueAtTime(550, now + 43);

      // Deep warm orchestral sub-harmonics
      const freqs = [43.65, 65.41, 87.31, 130.81];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.filter) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx - 1.5) * 4, now);
        osc.connect(this.filter);
        osc.start(now);
        this.droneOscs.push(osc);
      });

      this.filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);
    } catch {
      /* ignore audio error */
    }
  }

  // Realistic acoustic double-beat heartbeat ("lub-dub")
  public startHeartbeat(bpm = 54) {
    if (this.heartbeatInterval) return;
    const intervalMs = (60 / bpm) * 1000;

    const playThump = () => {
      if (!this.ctx || !this.masterGain) return;
      this.resume();
      const now = this.ctx.currentTime;
      // "Lub" — deep primary chamber contraction
      this.triggerSubKick(now, 75, 30, 0.55, 0.19);
      // "Dub" — secondary valve closure 160ms later
      this.triggerSubKick(now + 0.16, 62, 26, 0.42, 0.15);
    };

    playThump();
    this.heartbeatInterval = window.setInterval(playThump, intervalMs);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private triggerSubKick(
    startTime: number,
    startFreq: number,
    endFreq: number,
    gain: number,
    duration: number
  ) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      /* ignore */
    }
  }

  // The Grand Climax: Sub-bass boom & celestial crystal cascade
  public playClimaxImpact() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    // 1. Deep cinematic sub-boom
    this.triggerSubKick(now, 130, 22, 0.9, 1.6);

    // 2. Silky white noise shimmer wash
    try {
      const bufferSize = this.ctx.sampleRate * 2.0;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(600, now + 1.8);
      noiseFilter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 2.0);
    } catch {
      /* ignore */
    }

    // 3. Ethereal D major 9th starlight chimes
    const chordNotes = [587.33, 739.99, 880.0, 1108.73, 1318.51, 1479.98, 1760.0];
    chordNotes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      try {
        const osc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        const t = now + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        chimeGain.gain.setValueAtTime(0.001, t);
        chimeGain.gain.linearRampToValueAtTime(0.12, t + 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);

        osc.connect(chimeGain);
        chimeGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 3.2);
      } catch {
        /* ignore */
      }
    });
  }

  public fadeOutAndStop(duration = 2.5) {
    this.stopHeartbeat();
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      setTimeout(() => {
        this.droneOscs.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        this.droneOscs = [];
        try {
          this.ctx?.close();
        } catch {}
        this.ctx = null;
      }, duration * 1000 + 100);
    } catch {
      /* ignore */
    }
  }

  public toggleMute(): boolean {
    if (!this.masterGain) return false;
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return !this.isMuted;
  }
}

/* ────────────────────────────────────────────────────────────────── */
/*  CANVAS REALISTIC GRAPHICS DATA STRUCTURES                         */
/* ────────────────────────────────────────────────────────────────── */
interface Star3D {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  hasSpike: boolean;
  color: string;
}

interface StardustEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  pulsePhase: number;
}

interface Petal3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  hue: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

// Realistic Physical Fireworks Particles
interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  gravity: number;
  drag: number;
  sparkle: boolean;
}

// Realistic Floating Sky Lantern
interface SkyLantern {
  x: number;
  y: number;
  z: number; // 0.2 (distant) to 1.0 (near)
  vy: number;
  swayOffset: number;
  swaySpeed: number;
  scale: number;
  alpha: number;
}

/* ────────────────────────────────────────────────────────────────── */
/*  REALISTIC CINEMATIC MEMORY PORTALS                                */
/*  Authentic floating photographs of Tshidi with glass bevels,       */
/*  golden starlight illumination, and gentle organic drift           */
/* ────────────────────────────────────────────────────────────────── */
const MEMORY_HIGHLIGHTS = [
  {
    src: '/memories/photo1.jpg',
    date: 'The Beginning',
    caption: 'When your smile rewrote my world',
  },
  {
    src: '/memories/photo2.jpg',
    date: 'Golden Radiance',
    caption: 'Every ordinary second turned into poetry',
  },
  {
    src: '/memories/photo3.jpg',
    date: 'Serendipity',
    caption: 'The blessing I never knew I was waiting for',
  },
  {
    src: '/memories/photo4.jpg',
    date: 'Forever Peace',
    caption: 'In your laughter, I found my home',
  },
  {
    src: '/memories/photo5.jpg',
    date: 'My Queen',
    caption: 'The most beautiful part of my life',
  },
];

/* ────────────────────────────────────────────────────────────────── */
/*  MAIN THRILLER INTRO COMPONENT                                     */
/* ────────────────────────────────────────────────────────────────── */
export default function ThrillerIntro({ onComplete }: ThrillerIntroProps) {
  const [scene, setScene] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [audioActive, setAudioActive] = useState<boolean>(true);
  const [soundtrackPlaying, setSoundtrackPlaying] = useState<boolean>(false);
  const [soundtrackNeedsTap, setSoundtrackNeedsTap] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const soundEngineRef = useRef<CinematicSoundEngine | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const fireworksRef = useRef<FireworkParticle[]>([]);
  const lanternsRef = useRef<SkyLantern[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const TOTAL_DURATION_SEC = 75;

  // Soundtracks available
  const soundtrackSrc = '/audio/Ruth_B._-_Dandelions__Lyrics_(256k).mp3';

  // 1. Initialize audio & sound engine on mount
  useEffect(() => {
    const engine = new CinematicSoundEngine();
    soundEngineRef.current = engine;
    engine.startScore();

    // Try playing HTML5 romantic soundtrack
    const audio = new Audio(soundtrackSrc);
    audioElemRef.current = audio;
    audio.volume = 0.55;
    audio.loop = true;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setSoundtrackPlaying(true);
        })
        .catch(() => {
          // Autoplay was restricted by browser; will start on first touch/click
          setSoundtrackNeedsTap(true);
        });
    }

    const onUserInteraction = () => {
      engine.resume();
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            setSoundtrackPlaying(true);
            setSoundtrackNeedsTap(false);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('pointerdown', onUserInteraction, { once: true });
    window.addEventListener('keydown', onUserInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
      engine.fadeOutAndStop(1.0);
      try {
        audio.pause();
        audio.src = '';
      } catch {}
    };
  }, []);

  /* ────────────────────────────────────────────────────────────────── */
  /*  75-SECOND CINEMATIC MASTER TIMELINE                               */
  /*  ACT I: 0s – 12s   (The Awakening · Cosmic Solitude)               */
  /*  ACT II: 12s – 27s  (The Mystery & Destiny · Floating Memories)    */
  /*  ACT III: 27s – 43s (The Sacred Devotion · Pulsing Sacred Heart)   */
  /*  ACT IV: 43s – 60s  (The Royal Climax · TSHIDI Title Reveal)       */
  /*  ACT V: 60s – 75s   (The Symphony of Light · Realistic Fireworks)  */
  /* ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const clockInterval = setInterval(() => {
      setElapsedSec((prev) => Math.min(TOTAL_DURATION_SEC, prev + 1));
    }, 1000);

    /* ── ACT I: THE AWAKENING (0–12s) ── */
    timers.push(setTimeout(() => setScene(1), 3500));

    /* ── ACT II: THE DESTINY (12–27s) ── */
    timers.push(setTimeout(() => setScene(2), 12000)); // "Among all the faces…"
    timers.push(setTimeout(() => setScene(3), 15800)); // "Among all the stories…"
    timers.push(setTimeout(() => setScene(4), 19500)); // "Among all the moments life could have given me…"
    timers.push(setTimeout(() => setScene(5), 23200)); // "Somehow… I found you."

    /* ── ACT III: THE SACRED DEVOTION (27–43s) ── */
    timers.push(
      setTimeout(() => {
        setScene(6); // Crystalline Heart emerges + Heartbeat audio begins
        soundEngineRef.current?.startHeartbeat(54);

        if (canvasRef.current) {
          const w = canvasRef.current.width;
          const h = canvasRef.current.height;
          shockwavesRef.current.push({
            x: w / 2,
            y: h / 2,
            radius: 20,
            maxRadius: Math.max(w, h) * 0.7,
            alpha: 0.85,
            color: '#ff5aa7',
            lineWidth: 2.5,
          });
        }
      }, 27000)
    );

    timers.push(setTimeout(() => setScene(7), 32500)); // "My unexpected blessing."
    timers.push(setTimeout(() => setScene(8), 37500)); // "And one of the most beautiful parts of my life."

    /* ── ACT IV: THE ROYAL CLIMAX (43–60s) ── */
    timers.push(
      setTimeout(() => {
        setScene(9); // CLIMAX! Massive impact + TSHIDI reveal
        soundEngineRef.current?.stopHeartbeat();
        soundEngineRef.current?.playClimaxImpact();

        // Dual golden & magenta celestial shockwave
        if (canvasRef.current) {
          const w = canvasRef.current.width;
          const h = canvasRef.current.height;
          shockwavesRef.current.push({
            x: w / 2,
            y: h / 2,
            radius: 10,
            maxRadius: Math.max(w, h) * 1.15,
            alpha: 1.0,
            color: '#ffd99b',
            lineWidth: 5,
          });
          shockwavesRef.current.push({
            x: w / 2,
            y: h / 2,
            radius: 5,
            maxRadius: Math.max(w, h) * 0.9,
            alpha: 0.85,
            color: '#ff5aa7',
            lineWidth: 3.5,
          });

          // Trigger massive stardust explosion in center
          for (let i = 0; i < 90; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            fireworksRef.current.push({
              x: w / 2,
              y: h / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              alpha: 1,
              decay: Math.random() * 0.015 + 0.008,
              color: i % 2 === 0 ? '#ffd99b' : '#ff7eb6',
              size: Math.random() * 3 + 1.5,
              gravity: 0.04,
              drag: 0.985,
              sparkle: true,
            });
          }
        }
      }, 43000)
    );

    timers.push(setTimeout(() => setScene(10), 52000)); // "Today, the universe celebrates you."

    /* ── ACT V: THE CELEBRATION & SYMPHONY OF LIGHT (60–75s) ── */
    timers.push(
      setTimeout(() => {
        setScene(11); // "Happy Birthday, Tshidi." + Physical fireworks ignite
      }, 60000)
    );

    timers.push(
      setTimeout(() => {
        setScene(12); // "You are my favorite universe, my peace, and my forever."
      }, 66000)
    );

    timers.push(
      setTimeout(() => {
        setScene(13); // Final golden white bloom transition
        soundEngineRef.current?.fadeOutAndStop(2.5);
        if (audioElemRef.current) {
          // Smoothly ramp down volume
          const fadeInterval = setInterval(() => {
            if (audioElemRef.current && audioElemRef.current.volume > 0.05) {
              audioElemRef.current.volume -= 0.05;
            } else {
              clearInterval(fadeInterval);
            }
          }, 150);
        }
      }, 72500)
    );

    timers.push(
      setTimeout(() => {
        onComplete();
      }, 75000)
    );

    return () => {
      clearInterval(clockInterval);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  /* ────────────────────────────────────────────────────────────────── */
  /*  CANVAS HIGH-PERFORMANCE PHOTOREALISTIC RENDERING ENGINE           */
  /* ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // 1. 3D Stars with blackbody spectrum colors and optical diffraction spikes
    const starColors = ['#ffffff', '#fdf4dc', '#ffd99b', '#fbcfe8', '#e0e7ff', '#bae6fd'];
    const stars: Star3D[] = Array.from({ length: 180 }, () => ({
      x: (Math.random() - 0.5) * width * 2.2,
      y: (Math.random() - 0.5) * height * 2.2,
      z: Math.random() * 950 + 50,
      baseSize: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 2 + 1,
      hasSpike: Math.random() < 0.18, // 18% have anamorphic diffraction spikes
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // 2. Volumetric Stardust Embers
    const emberColors = ['#ffd99b', '#ffb3d3', '#f472b6', '#fed7aa', '#fde047'];
    const embers: StardustEmber[] = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2,
      size: Math.random() * 2.4 + 1.2,
      alpha: Math.random() * 0.6 + 0.25,
      color: emberColors[Math.floor(Math.random() * emberColors.length)],
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // 3. Realistic Multi-plane Botanical 3D Rose Petals
    const petalColors = ['#ff2a6d', '#f43f5e', '#e11d48', '#fda4af', '#fb7185', '#be123c'];
    const petals: Petal3D[] = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      z: Math.random(), // 0 = distant/small, 1 = foreground/bokeh
      vx: (Math.random() - 0.5) * 1.1,
      vy: Math.random() * 0.8 + 0.7,
      size: 16 + Math.random() * 22,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      vRotX: (Math.random() - 0.5) * 0.025,
      vRotY: (Math.random() - 0.5) * 0.025,
      vRotZ: (Math.random() - 0.5) * 0.018,
      hue: petalColors[Math.floor(Math.random() * petalColors.length)],
    }));

    // 4. Initialize Sky Lanterns for Act V celebration
    lanternsRef.current = Array.from({ length: 24 }, (_, i) => ({
      x: Math.random() * width,
      y: height + Math.random() * 400 + i * 35,
      z: Math.random() * 0.7 + 0.3, // Depth
      vy: -(Math.random() * 0.7 + 0.6),
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.015,
      scale: Math.random() * 0.4 + 0.6,
      alpha: 0.85,
    }));

    let cameraZ = 0;
    let cameraPanX = 0;
    let cameraPanY = 0;
    let lastTime = performance.now();
    let fireworkSpawnTimer = 0;

    // Helper: Draw realistic curved 3D rose petal with dual-side velvety shading
    const drawPetal = (
      pCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      scaleX: number,
      scaleY: number,
      rotZ: number,
      color: string,
      alpha: number
    ) => {
      pCtx.save();
      pCtx.translate(x, y);
      pCtx.rotate(rotZ);
      pCtx.scale(scaleX, scaleY);
      pCtx.globalAlpha = alpha;

      // Realistic anatomical rose petal curvature
      pCtx.beginPath();
      pCtx.moveTo(0, -size);
      pCtx.bezierCurveTo(size * 0.72, -size * 0.88, size * 0.98, size * 0.28, 0, size);
      pCtx.bezierCurveTo(-size * 0.98, size * 0.28, -size * 0.72, -size * 0.88, 0, -size);
      pCtx.closePath();

      // Velvety dual-tone gradient with specular rim
      const grad = pCtx.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, '#fff1f2'); // Translucent edge highlight
      grad.addColorStop(0.2, color); // Main velvety rose body
      grad.addColorStop(0.8, '#881337'); // Deep shadow
      grad.addColorStop(1, '#4c0519'); // Underside depth
      pCtx.fillStyle = grad;
      pCtx.fill();

      // Delicate organic vein highlight
      pCtx.beginPath();
      pCtx.moveTo(0, -size * 0.75);
      pCtx.quadraticCurveTo(size * 0.08, 0, 0, size * 0.75);
      pCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      pCtx.lineWidth = 1;
      pCtx.stroke();

      pCtx.restore();
    };

    // Helper: Spawn realistic multi-stage physical firework burst
    const spawnRealisticFirework = (targetX: number, targetY: number) => {
      const palette = [
        ['#ffd99b', '#fff2b8', '#ffffff'], // Gold Kamuro
        ['#ff5aa7', '#f43f5e', '#fed7aa'], // Peony Rose
        ['#c084fc', '#e879f9', '#ffffff'], // Lavender Starlight
        ['#38bdf8', '#818cf8', '#fed7aa'], // Twilight Sapphire
      ];
      const colors = palette[Math.floor(Math.random() * palette.length)];
      const count = Math.floor(Math.random() * 40 + 60);

      // Flash illumination
      shockwavesRef.current.push({
        x: targetX,
        y: targetY,
        radius: 8,
        maxRadius: 180,
        alpha: 0.55,
        color: colors[0],
        lineWidth: 1.5,
      });

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.2;
        fireworksRef.current.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.014 + 0.01,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 2.2 + 1.2,
          gravity: 0.035, // Realistic downward gravity
          drag: 0.988, // Atmospheric drag
          sparkle: Math.random() < 0.35,
        });
      }
    };

    // Helper: Draw floating luminous sky lantern
    const drawLantern = (
      pCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      alpha: number
    ) => {
      pCtx.save();
      pCtx.translate(x, y);
      pCtx.scale(scale, scale);
      pCtx.globalAlpha = alpha;

      const w = 22;
      const h = 32;

      // Outer ambient warm glow
      const glowGrad = pCtx.createRadialGradient(0, 0, 4, 0, 0, 48);
      glowGrad.addColorStop(0, 'rgba(255, 217, 155, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(255, 126, 182, 0.15)');
      glowGrad.addColorStop(1, 'rgba(255, 126, 182, 0)');
      pCtx.fillStyle = glowGrad;
      pCtx.beginPath();
      pCtx.arc(0, 0, 48, 0, Math.PI * 2);
      pCtx.fill();

      // Rice paper lantern body (curved trapezoid)
      pCtx.beginPath();
      pCtx.moveTo(-w * 0.4, -h * 0.5);
      pCtx.lineTo(w * 0.4, -h * 0.5);
      pCtx.lineTo(w * 0.5, h * 0.45);
      pCtx.lineTo(-w * 0.5, h * 0.45);
      pCtx.closePath();

      const paperGrad = pCtx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
      paperGrad.addColorStop(0, 'rgba(255, 243, 204, 0.9)');
      paperGrad.addColorStop(0.6, 'rgba(255, 190, 118, 0.85)');
      paperGrad.addColorStop(1, 'rgba(244, 63, 94, 0.7)');
      pCtx.fillStyle = paperGrad;
      pCtx.fill();

      // Subtle bamboo rim outline
      pCtx.strokeStyle = 'rgba(255, 237, 213, 0.6)';
      pCtx.lineWidth = 1;
      pCtx.stroke();

      // Inner candle flame core
      pCtx.beginPath();
      pCtx.arc(0, h * 0.18, 3.5, 0, Math.PI * 2);
      pCtx.fillStyle = '#ffffff';
      pCtx.shadowColor = '#ffd99b';
      pCtx.shadowBlur = 12;
      pCtx.fill();

      pCtx.restore();
    };

    // ── Master Render Loop ──
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      cameraZ += dt * 16;
      cameraPanX = Math.sin(time * 0.00028) * 32;
      cameraPanY = Math.cos(time * 0.00022) * 18;

      // Clear Canvas to pure cinematic deep space
      ctx.fillStyle = '#020108';
      ctx.fillRect(0, 0, width, height);

      // ── Layer 1: Volumetric Cosmic Nebula & Soft Starlight Fog ──
      const nebulaGrad = ctx.createRadialGradient(
        width / 2 + cameraPanX * 1.4,
        height / 2 + cameraPanY * 1.4,
        15,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.85
      );
      nebulaGrad.addColorStop(0, 'rgba(255, 90, 167, 0.12)');
      nebulaGrad.addColorStop(0.35, 'rgba(142, 106, 245, 0.09)');
      nebulaGrad.addColorStop(0.7, 'rgba(255, 217, 155, 0.04)');
      nebulaGrad.addColorStop(1, 'rgba(2, 1, 8, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // ── Layer 2: 3D Projected Starfield with Optical Spikes ──
      const focalLength = 320;
      stars.forEach((s) => {
        let sz = s.z - (cameraZ % 950);
        if (sz <= 10) sz += 950;

        const k = focalLength / sz;
        const px = s.x * k + width / 2 + cameraPanX;
        const py = s.y * k + height / 2 + cameraPanY;

        if (px >= -20 && px <= width + 20 && py >= -20 && py <= height + 20) {
          const depthAlpha = Math.min(1, Math.max(0.12, (1000 - sz) / 950));
          const twinkle =
            Math.sin(time * 0.002 * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
          const starAlpha = s.alpha * depthAlpha * twinkle;
          const radius = Math.max(0.5, s.baseSize * k * 0.7);

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = starAlpha;
          ctx.fill();

          // Anamorphic 4-point cross diffraction spikes on brightest stars
          if (s.hasSpike && radius > 1.4) {
            ctx.save();
            ctx.strokeStyle = s.color;
            ctx.globalAlpha = starAlpha * 0.55;
            ctx.lineWidth = 0.8;
            const spikeLen = radius * 4.5;
            ctx.beginPath();
            ctx.moveTo(px - spikeLen, py);
            ctx.lineTo(px + spikeLen, py);
            ctx.moveTo(px, py - spikeLen);
            ctx.lineTo(px, py + spikeLen);
            ctx.stroke();
            ctx.restore();
          }
        }
      });
      ctx.globalAlpha = 1.0;

      // ── Layer 3: Floating Stardust Embers ──
      embers.forEach((emb) => {
        emb.x += emb.vx * (dt * 60);
        emb.y += emb.vy * (dt * 60);

        if (emb.y < -20) {
          emb.y = height + 20;
          emb.x = Math.random() * width;
        }

        const pulse = Math.sin(time * 0.003 + emb.pulsePhase) * 0.25 + 0.75;
        ctx.beginPath();
        ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
        ctx.fillStyle = emb.color;
        ctx.globalAlpha = emb.alpha * pulse;
        ctx.shadowColor = emb.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1.0;

      // ── Layer 4: Expanding Shockwaves ──
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += dt * 340;
        sw.alpha -= dt * 0.42;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.globalAlpha = Math.max(0, sw.alpha);
          ctx.lineWidth = sw.lineWidth;
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Layer 5: Realistic Physics Fireworks (Act V: 60s+) ──
      if (scene >= 11) {
        fireworkSpawnTimer += dt;
        if (fireworkSpawnTimer > 1.2) {
          fireworkSpawnTimer = 0;
          // Spawn at random upper-sky coordinates
          const fx = Math.random() * (width * 0.75) + width * 0.12;
          const fy = Math.random() * (height * 0.4) + height * 0.12;
          spawnRealisticFirework(fx, fy);
        }

        // Render firework particles with physics
        for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
          const p = fireworksRef.current[i];
          p.x += p.vx * (dt * 60);
          p.y += p.vy * (dt * 60);
          p.vy += p.gravity * (dt * 60);
          p.vx *= Math.pow(p.drag, dt * 60);
          p.vy *= Math.pow(p.drag, dt * 60);
          p.alpha -= p.decay * (dt * 60);

          if (p.alpha <= 0) {
            fireworksRef.current.splice(i, 1);
          } else {
            ctx.save();
            ctx.beginPath();
            const curSize = p.sparkle && Math.random() < 0.4 ? p.size * 1.5 : p.size;
            ctx.arc(p.x, p.y, curSize, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
          }
        }

        // ── Layer 6: Realistic Floating Sky Lanterns ──
        lanternsRef.current.forEach((lan) => {
          lan.y += lan.vy * (dt * 60);
          lan.x += Math.sin(time * lan.swaySpeed + lan.swayOffset) * 0.4;

          if (lan.y < -80) {
            lan.y = height + 60;
            lan.x = Math.random() * width;
          }

          drawLantern(ctx, lan.x, lan.y, lan.scale * lan.z, lan.alpha * lan.z);
        });
      }

      // ── Layer 7: Multi-plane Rose Petals with 3D Depth of Field ──
      petals.forEach((p) => {
        p.y += p.vy * (0.8 + p.z * 1.2) * (dt * 60);
        p.x += Math.sin(time * 0.0014 + p.rotZ) * (0.6 + p.z * 1.4) * (dt * 60);

        p.rotX += p.vRotX * (dt * 60);
        p.rotY += p.vRotY * (dt * 60);
        p.rotZ += p.vRotZ * (dt * 60);

        if (p.y > height + 60) {
          p.y = -60;
          p.x = Math.random() * width;
        }

        const scaleX = Math.cos(p.rotY) * (0.6 + p.z * 0.8);
        const scaleY = Math.cos(p.rotX) * (0.6 + p.z * 0.8);
        const curSize = p.size * (0.55 + p.z * 0.9);

        // Foreground petals have soft camera bokeh blur
        if (p.z > 0.82) {
          ctx.save();
          ctx.filter = 'blur(4px)';
          drawPetal(ctx, p.x, p.y, curSize, scaleX, scaleY, p.rotZ, p.hue, 0.75);
          ctx.restore();
        } else {
          drawPetal(ctx, p.x, p.y, curSize, scaleX, scaleY, p.rotZ, p.hue, 0.4 + p.z * 0.5);
        }
      });

      // ── Layer 8: Anamorphic Horizontal Optical Flare ──
      const flareAlpha =
        scene === 9
          ? 0.82
          : scene >= 6 && scene <= 8
            ? 0.24
            : scene >= 11
              ? 0.18
              : 0.08;
      const flareGrad = ctx.createLinearGradient(0, height / 2, width, height / 2);
      flareGrad.addColorStop(0, 'rgba(255, 90, 167, 0)');
      flareGrad.addColorStop(0.35, 'rgba(255, 217, 155, 0.05)');
      flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flareAlpha})`);
      flareGrad.addColorStop(0.65, 'rgba(255, 90, 167, 0.05)');
      flareGrad.addColorStop(1, 'rgba(255, 90, 167, 0)');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, height / 2 - 2, width, 4);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [scene]);

  // Audio Toggle
  const toggleSound = useCallback(() => {
    const isNowActive = !audioActive;
    setAudioActive(isNowActive);

    // Toggle Web Audio engine
    if (soundEngineRef.current) {
      soundEngineRef.current.toggleMute();
    }

    // Toggle HTML5 audio
    if (audioElemRef.current) {
      if (isNowActive) {
        audioElemRef.current.volume = 0.55;
        audioElemRef.current.play().catch(() => {});
      } else {
        audioElemRef.current.volume = 0;
      }
    }
  }, [audioActive]);

  const handleEnableSound = () => {
    if (audioElemRef.current) {
      audioElemRef.current.volume = 0.55;
      audioElemRef.current.play().then(() => {
        setSoundtrackPlaying(true);
        setSoundtrackNeedsTap(false);
      }).catch(() => {});
    }
    soundEngineRef.current?.resume();
  };

  const progressPercent = Math.min(100, Math.round((elapsedSec / TOTAL_DURATION_SEC) * 100));

  // Act display name
  const currentActName = useMemo(() => {
    if (elapsedSec < 12) return 'ACT I · THE AWAKENING';
    if (elapsedSec < 27) return 'ACT II · THE DESTINY';
    if (elapsedSec < 43) return 'ACT III · THE SACRED DEVOTION';
    if (elapsedSec < 60) return 'ACT IV · THE ROYAL REVEAL';
    return 'ACT V · THE SYMPHONY OF LIGHT';
  }, [elapsedSec]);

  // Selected memory for the active scene
  const activeMemory = useMemo(() => {
    if (scene === 2) return MEMORY_HIGHLIGHTS[0];
    if (scene === 3) return MEMORY_HIGHLIGHTS[1];
    if (scene === 4) return MEMORY_HIGHLIGHTS[2];
    if (scene === 5) return MEMORY_HIGHLIGHTS[3];
    return null;
  }, [scene]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* ── Fullscreen cinematic presentation ────────────────── */
        .dc-cinema-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #020108;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: var(--font-manrope, system-ui, sans-serif);
          color: #fff;
          user-select: none;
        }

        .dc-canvas-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        /* ── 35mm Cinematic Film Grain Texture ───────────────── */
        .dc-film-grain {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* ── 2.39:1 Cinema Letterbox ──────────────────────────── */
        .dc-letterbox-top,
        .dc-letterbox-bottom {
          position: absolute;
          left: 0;
          right: 0;
          background: #000000;
          z-index: 25;
          pointer-events: none;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.95);
        }
        .dc-letterbox-top {
          top: 0;
          height: clamp(34px, 6.8vh, 72px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .dc-letterbox-bottom {
          bottom: 0;
          height: clamp(38px, 7.4vh, 76px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* ── Top cinematic HUD bar ────────────────────────────── */
        .dc-hud-top {
          position: absolute;
          top: clamp(10px, 2vh, 20px);
          left: 28px;
          right: 28px;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: auto;
        }

        .dc-act-indicator {
          font-family: var(--font-dm-mono, monospace);
          font-size: clamp(9.5px, 1.4vw, 12px);
          letter-spacing: 0.3em;
          color: #ffd99b;
          text-transform: uppercase;
          opacity: 0.95;
          text-shadow: 0 0 16px rgba(255, 217, 155, 0.6);
        }

        .dc-hud-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dc-btn-hud {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 179, 211, 0.28);
          color: #ffb3d3;
          border-radius: 999px;
          padding: 6px 15px;
          font-family: var(--font-dm-mono, monospace);
          font-size: 11px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          gap: 7px;
          transition: all 0.25s ease;
        }
        .dc-btn-hud:hover {
          background: rgba(255, 90, 167, 0.22);
          border-color: rgba(255, 90, 167, 0.7);
          color: #ffffff;
          transform: translateY(-1px);
        }

        /* ── Bottom HUD Timeline Progress Bar ─────────────────── */
        .dc-hud-bottom {
          position: absolute;
          bottom: clamp(10px, 2.2vh, 22px);
          left: 28px;
          right: 28px;
          z-index: 30;
          display: flex;
          flex-direction: column;
          gap: 7px;
          pointer-events: auto;
        }

        .dc-progress-track {
          width: 100%;
          height: 2.5px;
          background: rgba(255, 255, 255, 0.16);
          border-radius: 2px;
          overflow: hidden;
        }

        .dc-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff5aa7, #ffd99b, #ffffff);
          transition: width 1s linear;
          box-shadow: 0 0 14px #ff5aa7;
        }

        .dc-timeline-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-dm-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255, 255, 255, 0.55);
        }

        /* ── Tap to unmute prompt ────────────────────────────── */
        .dc-sound-prompt {
          position: absolute;
          top: clamp(60px, 10vh, 85px);
          background: rgba(255, 90, 167, 0.2);
          border: 1px solid rgba(255, 217, 155, 0.4);
          color: #ffd99b;
          border-radius: 999px;
          padding: 8px 18px;
          font-family: var(--font-dm-mono, monospace);
          font-size: 11.5px;
          letter-spacing: 0.15em;
          backdrop-filter: blur(12px);
          cursor: pointer;
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 25px rgba(255, 90, 167, 0.4);
          animation: dc-prompt-breathe 2.4s ease-in-out infinite;
        }
        @keyframes dc-prompt-breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
        }

        /* ── Central Cinematic Content Stage ─────────────────── */
        .dc-content-stage {
          position: relative;
          z-index: 10;
          max-width: 1020px;
          width: 100%;
          padding: 0 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dc-scene-eyebrow {
          font-family: var(--font-dm-mono, monospace);
          font-size: clamp(10.5px, 1.6vw, 13px);
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: #ffd99b;
          margin-bottom: 22px;
          opacity: 0.9;
          text-shadow: 0 0 16px rgba(255, 217, 155, 0.6);
        }

        .dc-quote {
          font-family: var(--font-playfair, Georgia, serif);
          font-style: italic;
          font-size: clamp(26px, 5.2vw, 46px);
          line-height: 1.45;
          color: #ffffff;
          letter-spacing: 0.02em;
          text-shadow: 0 0 30px rgba(255, 179, 211, 0.5);
          filter: drop-shadow(0 10px 35px rgba(0, 0, 0, 0.9));
        }

        .dc-quote-accent {
          color: #ffd99b;
          text-shadow: 0 0 28px rgba(255, 217, 155, 0.7);
        }

        /* ── Act 2: Realistic Floating Memory Polaroid Portal ─── */
        .dc-memory-portal {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
          position: relative;
        }

        .dc-memory-glass-frame {
          position: relative;
          width: clamp(180px, 28vw, 240px);
          height: clamp(230px, 35vw, 300px);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 217, 155, 0.45);
          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.8),
            0 0 45px rgba(255, 90, 167, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transform: perspective(800px) rotateY(-4deg) rotateX(3deg);
          transition: transform 0.8s ease;
        }

        .dc-memory-aura {
          position: absolute;
          inset: -35px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 217, 155, 0.25) 0%, rgba(255, 90, 167, 0.15) 50%, transparent 75%);
          filter: blur(25px);
          pointer-events: none;
          z-index: -1;
        }

        .dc-memory-tag {
          margin-top: 14px;
          font-family: var(--font-dm-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #ffb3d3;
          text-shadow: 0 0 12px rgba(255, 179, 211, 0.6);
        }

        /* ── Act 3: Sacred Crystalline Heart ──────────────────── */
        .dc-sacred-heart-stage {
          position: relative;
          width: 170px;
          height: 170px;
          margin-bottom: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dc-heart-radiance {
          position: absolute;
          inset: -45px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 90, 167, 0.45) 0%, rgba(255, 217, 155, 0.25) 45%, transparent 75%);
          animation: dc-heart-radiance-pulse 1.1s ease-in-out infinite;
          pointer-events: none;
        }

        .dc-heart-svg-pulsing {
          animation: dc-heart-double-beat 1.1s ease-in-out infinite;
          filter: drop-shadow(0 0 40px rgba(255, 90, 167, 0.9)) drop-shadow(0 0 75px rgba(255, 217, 155, 0.6));
        }

        @keyframes dc-heart-double-beat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.18); }
          28% { transform: scale(1.02); }
          42% { transform: scale(1.12); }
          58% { transform: scale(1); }
        }

        @keyframes dc-heart-radiance-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.92); }
          18% { opacity: 1; transform: scale(1.25); }
          50% { opacity: 0.45; transform: scale(0.98); }
        }

        /* ── Act 4: The Monumental Title Centerpiece (TSHIDI) ─── */
        .dc-climax-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .dc-name-halo {
          position: absolute;
          width: clamp(320px, 60vw, 580px);
          height: clamp(320px, 60vw, 580px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 217, 155, 0.45) 0%, rgba(255, 90, 167, 0.3) 45%, transparent 75%);
          filter: blur(45px);
          pointer-events: none;
          animation: dc-name-halo-breathe 3.5s ease-in-out infinite alternate;
        }

        @keyframes dc-name-halo-breathe {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        .dc-name-title {
          font-family: var(--font-italiana, Georgia, serif);
          font-size: clamp(78px, 19vw, 195px);
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 0.95;
          text-align: center;
          background: linear-gradient(135deg, #ffffff 0%, #ffd99b 32%, #ffb3d3 68%, #ff5aa7 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 40px rgba(255, 217, 155, 0.9)) drop-shadow(0 0 85px rgba(255, 90, 167, 0.7));
          position: relative;
        }

        .dc-name-subtag {
          font-family: var(--font-dm-mono, monospace);
          font-size: clamp(10.5px, 2vw, 15px);
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #ffd99b;
          margin-top: 22px;
          text-shadow: 0 0 20px rgba(255, 217, 155, 0.75);
        }

        /* ── Act 5: Grand Celebration & Forever Vow ──────────── */
        .dc-birthday-banner {
          font-family: var(--font-italiana, Georgia, serif);
          font-size: clamp(38px, 8vw, 76px);
          letter-spacing: 0.06em;
          line-height: 1.1;
          background: linear-gradient(135deg, #ffffff 15%, #ffd99b 55%, #ffb3d3 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 35px rgba(255, 217, 155, 0.75));
          margin-bottom: 22px;
        }

        .dc-vow-text {
          font-family: var(--font-playfair, Georgia, serif);
          font-style: italic;
          font-size: clamp(18px, 3.4vw, 29px);
          line-height: 1.6;
          color: #fce7f3;
          max-width: 820px;
          text-shadow: 0 0 25px rgba(255, 179, 211, 0.45);
        }

        /* ── Final white starlight bloom transition ───────────── */
        .dc-fade-bloom {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, #ffffff 0%, #fff1f2 50%, #ffffff 100%);
          z-index: 50;
          pointer-events: none;
        }
      `}} />

      <div className="dc-cinema-root">
        {/* Dynamic Multi-plane Graphics Canvas (Stars, Petals, Fireworks, Sky Lanterns) */}
        <canvas ref={canvasRef} className="dc-canvas-layer" />

        {/* Authentic 35mm Film Grain Overlay */}
        <div className="dc-film-grain" />

        {/* 2.39:1 Cinema Letterbox Bars */}
        <div className="dc-letterbox-top" />
        <div className="dc-letterbox-bottom" />

        {/* Top HUD: Act Indicator & Audio Toggle */}
        <header className="dc-hud-top">
          <div className="dc-act-indicator">{currentActName}</div>
          <div className="dc-hud-controls">
            <button
              className="dc-btn-hud"
              onClick={toggleSound}
              aria-label="Toggle Cinema Audio"
            >
              <span>{audioActive ? '♫' : '♩'}</span>
              <span>{audioActive ? 'Ruth B. · Dandelions' : 'Muted'}</span>
            </button>
            <button
              className="dc-btn-hud"
              onClick={onComplete}
              title="Skip intro directly to birthday universe"
            >
              <span>⏭</span>
              <span>Skip</span>
            </button>
          </div>
        </header>

        {/* Subtle Tap to unmute banner if browser blocked initial autoplay */}
        {soundtrackNeedsTap && (
          <button
            className="dc-sound-prompt"
            onClick={handleEnableSound}
            aria-label="Enable sound"
          >
            <span>♫</span>
            <span>Tap anywhere for sound</span>
          </button>
        )}

        {/* Bottom HUD: Progress Scrub Timeline */}
        <footer className="dc-hud-bottom">
          <div className="dc-progress-track">
            <div
              className="dc-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="dc-timeline-meta">
            <span>DIRECTOR&apos;S CUT · 75s CINEMATIC TRAILER</span>
            <span>
              {String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:
              {String(elapsedSec % 60).padStart(2, '0')} / 01:15
            </span>
          </div>
        </footer>

        {/* ── CINEMATIC CONTENT STAGE ── */}
        <div className="dc-content-stage">
          <AnimatePresence mode="wait">
            {/* ── ACT I: THE AWAKENING ── */}
            {scene === 1 && (
              <motion.div
                key="scene1"
                initial={{ opacity: 0, y: 35, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -25, filter: 'blur(8px)' }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="dc-scene-eyebrow">A Universe of Billions</div>
                <h1 className="dc-quote">
                  “In a world filled with billions of people…”
                </h1>
              </motion.div>
            )}

            {/* ── ACT II: THE DESTINY · FLOATING MEMORY PORTALS ── */}
            {scene >= 2 && scene <= 5 && activeMemory && (
              <motion.div
                key={`scene-${scene}`}
                initial={{ opacity: 0, scale: 0.9, y: 25, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="dc-memory-portal">
                  <div className="dc-memory-aura" />
                  <div className="dc-memory-glass-frame">
                    <Image
                      src={activeMemory.src}
                      alt={activeMemory.caption}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 240px, 300px"
                    />
                  </div>
                  <div className="dc-memory-tag">✦ {activeMemory.date} ✦</div>
                </div>

                <div className="dc-scene-eyebrow">The Impossible Odds</div>

                {scene === 2 && (
                  <h2 className="dc-quote">“Among all the faces…”</h2>
                )}
                {scene === 3 && (
                  <h2 className="dc-quote">“Among all the stories…”</h2>
                )}
                {scene === 4 && (
                  <h2 className="dc-quote">
                    “Among all the moments life could have given me…”
                  </h2>
                )}
                {scene === 5 && (
                  <h2 className="dc-quote dc-quote-accent">
                    “Somehow… I found you.”
                  </h2>
                )}
              </motion.div>
            )}

            {/* ── ACT III: THE SACRED DEVOTION · CRYSTALLINE HEART ── */}
            {scene === 6 && (
              <motion.div
                key="scene6"
                initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -25, filter: 'blur(6px)' }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="dc-sacred-heart-stage">
                  <div className="dc-heart-radiance" />
                  <svg
                    width="135"
                    height="135"
                    viewBox="0 0 120 120"
                    fill="none"
                    className="dc-heart-svg-pulsing"
                  >
                    <defs>
                      <linearGradient
                        id="dcCrystalGrad"
                        x1="10"
                        y1="10"
                        x2="110"
                        y2="110"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="25%" stopColor="#ffd99b" />
                        <stop offset="65%" stopColor="#ff5aa7" />
                        <stop offset="100%" stopColor="#e11d48" />
                      </linearGradient>
                      <linearGradient
                        id="dcFacetGrad"
                        x1="30"
                        y1="30"
                        x2="90"
                        y2="90"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
                        <stop offset="100%" stopColor="rgba(255, 217, 155, 0.2)" />
                      </linearGradient>
                    </defs>

                    {/* Outer Crystalline Facets */}
                    <path
                      d="M60 106 C20 78, 4 54, 15 32 C22 15, 44 11, 60 28 C76 11, 98 15, 105 32 C116 54, 100 78, 60 106Z"
                      fill="url(#dcCrystalGrad)"
                      stroke="#ffd99b"
                      strokeWidth="1.8"
                    />

                    {/* Internal Sacred Geometry Diamond Prisms */}
                    <polygon
                      points="60,34 40,55 60,82 80,55"
                      fill="url(#dcFacetGrad)"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1"
                    />
                    <line x1="60" y1="34" x2="60" y2="82" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                    <line x1="40" y1="55" x2="80" y2="55" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                    <line x1="15" y1="32" x2="40" y2="55" stroke="rgba(255, 217, 155, 0.4)" strokeWidth="0.8" />
                    <line x1="105" y1="32" x2="80" y2="55" stroke="rgba(255, 217, 155, 0.4)" strokeWidth="0.8" />
                  </svg>
                </div>
                <div className="dc-scene-eyebrow">The Devotion</div>
                <h2 className="dc-quote">
                  “You became my favourite chapter.”
                </h2>
              </motion.div>
            )}

            {scene === 7 && (
              <motion.div
                key="scene7"
                initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className="dc-scene-eyebrow">The Devotion</div>
                <h2 className="dc-quote dc-quote-accent">
                  “My unexpected blessing.”
                </h2>
              </motion.div>
            )}

            {scene === 8 && (
              <motion.div
                key="scene8"
                initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className="dc-scene-eyebrow">The Devotion</div>
                <h2 className="dc-quote">
                  “And one of the most beautiful parts of my life.”
                </h2>
              </motion.div>
            )}

            {/* ── ACT IV: THE ROYAL REVEAL (TSHIDI) ── */}
            {scene === 9 && (
              <motion.div
                key="scene9"
                className="dc-climax-stage"
                initial={{ opacity: 0, scale: 0.3, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="dc-name-halo" />
                <h1 className="dc-name-title">TSHIDI</h1>
                <div className="dc-name-subtag">
                  ✦ THE QUEEN OF MY HEART ✦
                </div>
              </motion.div>
            )}

            {scene === 10 && (
              <motion.div
                key="scene10"
                initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
              >
                <div className="dc-scene-eyebrow">A Royal Celebration</div>
                <h2 className="dc-quote dc-quote-accent">
                  “Today, the universe celebrates you.”
                </h2>
              </motion.div>
            )}

            {/* ── ACT V: THE FINAL MOMENT & REALISTIC FIREWORKS ── */}
            {scene === 11 && (
              <motion.div
                key="scene11"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
              >
                <h1 className="dc-birthday-banner">Happy Birthday, Tshidi.</h1>
                <p className="dc-scene-eyebrow">✦ Forever &amp; Always My Queen ✦</p>
              </motion.div>
            )}

            {scene === 12 && (
              <motion.div
                key="scene12"
                initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                transition={{ duration: 2.0, ease: 'easeOut' }}
              >
                <p className="dc-vow-text">
                  “I made this little universe because someone as special as
                  you deserves something extraordinary.”
                </p>
              </motion.div>
            )}

            {/* ── Scene 13: Radiant Light Dissolve into Universe ── */}
            {scene === 13 && (
              <motion.div
                key="scene13"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
                className="dc-fade-bloom"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
