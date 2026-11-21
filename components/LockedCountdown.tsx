'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LockedCountdownProps {
  onUnlock: () => void;
  targetDate?: Date;
}

const DEFAULT_TARGET = new Date('2026-11-29T00:00:00+02:00');

const ROMANTIC_MESSAGES = [
  'Something beautiful is being prepared for you...',
  'Every second brings us closer to your surprise...',
  'The stars are aligning for your special day...',
  'A universe of love is about to unfold...',
  'Patience, my love… magic takes time...',
];

function calculateTimeLeft(target: Date) {
  const now = Date.now();
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

export default function LockedCountdown({ onUnlock, targetDate = DEFAULT_TARGET }: LockedCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));
  const [msgIdx, setMsgIdx] = useState(0);

  // Floating petals and hearts
  const floatingElements = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: ((i * 17 + 23) % 94) + 3,
        delay: (i * 0.45) % 6,
        duration: 7 + ((i * 1.3) % 6),
        size: 12 + ((i * 3) % 16),
        type: i % 3 === 0 ? 'petal' : i % 3 === 1 ? 'rose' : 'heart',
        opacity: 0.2 + ((i * 0.05) % 0.35),
      })),
    []
  );

  const tick = useCallback(() => {
    const tl = calculateTimeLeft(targetDate);
    setTimeLeft(tl);
    if (tl.done) {
      onUnlock();
    }
  }, [targetDate, onUnlock]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((p) => (p + 1) % ROMANTIC_MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const units = [
    { label: 'DAYS', value: pad(timeLeft.days) },
    { label: 'HOURS', value: pad(timeLeft.hours) },
    { label: 'MINUTES', value: pad(timeLeft.minutes) },
    { label: 'SECONDS', value: pad(timeLeft.seconds) },
  ];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
/* ── LockedCountdown scoped styles ─────────────────────────── */
.lc-root {
  --ink: #fff7ff;
  --pink: #ffb3d3;
  --rose: #f365a3;
  --violet: #8e6af5;
  --gold: #ffd99b;
  --night: #07051a;
  --deep: #0d0826;
  --glow-pink: #ff5aa7;
  --glow-purple: #a855f7;

  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--night);
  color: var(--ink);
  font-family: var(--font-manrope, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  padding: 24px;
}

/* ── animated romantic background ───────────────────────────── */
.lc-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 50% 28%, rgba(255, 90, 167, 0.16) 0%, transparent 60%),
    radial-gradient(circle at 20% 75%, rgba(168, 85, 247, 0.14) 0%, transparent 55%),
    radial-gradient(circle at 80% 70%, rgba(243, 101, 163, 0.12) 0%, transparent 50%),
    linear-gradient(180deg, #050314 0%, #0c0824 50%, #07051a 100%);
  animation: lc-bgShift 12s ease-in-out infinite alternate;
}

@keyframes lc-bgShift {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(12deg) brightness(1.1); }
}

.lc-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.22;
  pointer-events: none;
  animation: lc-orbDrift 18s ease-in-out infinite alternate;
}
.lc-orb--1 { width: 450px; height: 450px; top: -10%; left: -5%; background: var(--glow-pink); }
.lc-orb--2 { width: 400px; height: 400px; bottom: -15%; right: -5%; background: var(--glow-purple); animation-delay: -6s; }
.lc-orb--3 { width: 300px; height: 300px; top: 40%; left: 60%; background: var(--gold); opacity: 0.12; animation-delay: -12s; }

@keyframes lc-orbDrift {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(35px, -25px) scale(1.1); }
  100% { transform: translate(-25px, 20px) scale(0.95); }
}

/* ── floating elements ─────────────────────────────────────── */
.lc-float {
  position: absolute;
  bottom: -40px;
  pointer-events: none;
  animation: lc-floatUp linear infinite;
  user-select: none;
}

@keyframes lc-floatUp {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: var(--float-o, 0.35);
  }
  50% {
    transform: translateY(-55vh) translateX(25px) rotate(140deg);
    opacity: var(--float-o, 0.35);
  }
  85% {
    opacity: var(--float-o, 0.35);
  }
  100% {
    transform: translateY(-115vh) translateX(-20px) rotate(320deg);
    opacity: 0;
  }
}

/* ── padlock container ─────────────────────────────────────── */
.lc-padlock-wrap {
  position: relative;
  z-index: 2;
  margin-bottom: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lc-padlock-glow {
  position: absolute;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 90, 167, 0.35) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 75%);
  filter: blur(20px);
  animation: lc-glowPulse 2.8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes lc-glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.18); }
}

.lc-padlock-svg {
  animation: lc-pulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 25px rgba(255, 90, 167, 0.55)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.3));
}

@keyframes lc-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* ── typography ────────────────────────────────────────────── */
.lc-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 90, 167, 0.1);
  border: 1px solid rgba(255, 90, 167, 0.28);
  color: var(--pink);
  font-family: var(--font-dm-mono, 'Courier New', monospace);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

.lc-title {
  position: relative;
  z-index: 2;
  font-family: var(--font-italiana, 'Georgia', serif);
  font-size: clamp(26px, 5.5vw, 52px);
  font-weight: 400;
  letter-spacing: 0.02em;
  text-align: center;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff 10%, #ffd99b 45%, #ffb3d3 80%, #ff5aa7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.lc-subtitle {
  position: relative;
  z-index: 2;
  font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
  font-size: clamp(14px, 2.2vw, 20px);
  color: #e5d8ff;
  opacity: 0.82;
  text-align: center;
  margin: 0 0 2.2rem;
  font-style: italic;
  max-width: 580px;
}

/* ── countdown row ─────────────────────────────────────────── */
.lc-countdown {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2.5vw, 22px);
  margin-bottom: 2rem;
  flex-wrap: nowrap;
}

.lc-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: clamp(66px, 15vw, 114px);
  padding: clamp(14px, 2.2vw, 22px) clamp(10px, 1.8vw, 18px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 179, 211, 0.16);
  border-radius: 20px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.lc-unit-value {
  font-family: var(--font-dm-mono, 'Courier New', monospace);
  font-size: clamp(34px, 6.2vw, 62px);
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(180deg, #ffffff 15%, #ffd99b 60%, #ff5aa7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lc-unit-label {
  font-family: var(--font-dm-mono, 'Courier New', monospace);
  font-size: clamp(9px, 1.3vw, 11px);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--pink);
  opacity: 0.7;
  margin-top: 8px;
}

.lc-sep {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-bottom: 22px;
}

.lc-sep-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--glow-pink);
  box-shadow: 0 0 10px var(--glow-pink);
  animation: lc-sepBlink 1.2s ease-in-out infinite alternate;
}
.lc-sep-dot:nth-child(2) { animation-delay: 0.6s; }

@keyframes lc-sepBlink {
  0% { opacity: 0.25; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

/* ── unlock date badge ─────────────────────────────────────── */
.lc-unlock-date {
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
  text-align: center;
}

.lc-unlock-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 217, 155, 0.3);
  color: var(--gold);
  font-family: var(--font-dm-mono, 'Courier New', monospace);
  font-size: clamp(10px, 1.6vw, 12px);
  letter-spacing: 0.12em;
  text-shadow: 0 0 12px rgba(255, 217, 155, 0.4);
  backdrop-filter: blur(12px);
}

/* ── cycling message ───────────────────────────────────────── */
.lc-message-wrap {
  position: relative;
  z-index: 2;
  min-height: 40px;
  text-align: center;
  padding: 0 1.5rem;
  max-width: 620px;
}

.lc-message {
  font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
  font-size: clamp(14px, 2.4vw, 19px);
  font-style: italic;
  color: var(--pink);
  opacity: 0.88;
  line-height: 1.5;
  text-shadow: 0 0 15px rgba(255, 90, 167, 0.3);
}

/* ── subtle bottom footer ──────────────────────────────────── */
.lc-footer {
  position: absolute;
  bottom: 22px;
  z-index: 2;
  font-family: var(--font-dm-mono, 'Courier New', monospace);
  font-size: 10px;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
}
`}} />

      <div className="lc-root">
        {/* Ambient background */}
        <div className="lc-bg" />
        <div className="lc-orb lc-orb--1" />
        <div className="lc-orb lc-orb--2" />
        <div className="lc-orb lc-orb--3" />

        {/* Floating hearts and rose petals */}
        {floatingElements.map((el) => (
          <span
            key={el.id}
            className="lc-float"
            style={
              {
                left: `${el.left}%`,
                animationDuration: `${el.duration}s`,
                animationDelay: `${el.delay}s`,
                fontSize: `${el.size}px`,
                '--float-o': el.opacity,
              } as React.CSSProperties
            }
          >
            {el.type === 'heart' ? '♥' : el.type === 'rose' ? '🌹' : '🌸'}
          </span>
        ))}

        {/* Top badge */}
        <motion.div
          className="lc-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span>✦</span> FOR TSHIDI <span>✦</span>
        </motion.div>

        {/* Heart padlock with glow */}
        <motion.div
          className="lc-padlock-wrap"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 130, damping: 15, delay: 0.35 }}
        >
          <div className="lc-padlock-glow" />
          <svg
            className="lc-padlock-svg"
            width="130"
            height="130"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lc-heartGrad" x1="20" y1="15" x2="100" y2="110" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffd99b" />
                <stop offset="35%" stopColor="#ff5aa7" />
                <stop offset="70%" stopColor="#f365a3" />
                <stop offset="100%" stopColor="#8e6af5" />
              </linearGradient>
              <filter id="lc-heartGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Lock shackle */}
            <path
              d="M40 45 C40 18, 80 18, 80 45"
              stroke="#ffd99b"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              filter="drop-shadow(0 0 8px rgba(255, 217, 155, 0.7))"
            />

            {/* Heart padlock body */}
            <path
              d="M60 102
                 C25 76, 6 56, 16 35
                 C23 18, 43 13, 60 30
                 C77 13, 97 18, 104 35
                 C114 56, 95 76, 60 102Z"
              fill="url(#lc-heartGrad)"
              filter="url(#lc-heartGlow)"
              stroke="rgba(255, 217, 155, 0.45)"
              strokeWidth="1.5"
            />

            {/* Inner heart accent outline */}
            <path
              d="M60 92
                 C32 70, 18 53, 25 38
                 C30 25, 45 22, 60 34
                 C75 22, 90 25, 95 38
                 C102 53, 88 70, 60 92Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="1"
            />

            {/* Keyhole */}
            <circle cx="60" cy="54" r="7.5" fill="#07051a" />
            <polygon points="56,58 64,58 62.5,74 57.5,74" fill="#07051a" />
            <circle cx="58.5" cy="52" r="2.2" fill="rgba(255, 217, 155, 0.4)" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="lc-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          A surprise is waiting for you…
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="lc-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.82 }}
          transition={{ duration: 0.9, delay: 0.75 }}
        >
          Every heartbeat brings us closer to the moment your universe unlocks.
        </motion.p>

        {/* Live Countdown */}
        <motion.div
          className="lc-countdown"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {units.map((unit, i) => (
            <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.5vw, 14px)' }}>
              <div className="lc-unit">
                <motion.span
                  className="lc-unit-value"
                  key={unit.value}
                  initial={{ opacity: 0.6, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {unit.value}
                </motion.span>
                <span className="lc-unit-label">{unit.label}</span>
              </div>
              {i < units.length - 1 && (
                <div className="lc-sep">
                  <span className="lc-sep-dot" />
                  <span className="lc-sep-dot" />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Unlock date specification */}
        <motion.div
          className="lc-unlock-date"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="lc-unlock-pill">
            <span>🔒</span>
            <span>Unlocks 29 November 2026 · 00:00 SAST</span>
          </div>
        </motion.div>

        {/* Cycling romantic messages */}
        <div className="lc-message-wrap">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIdx}
              className="lc-message"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.9, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
            >
              “{ROMANTIC_MESSAGES[msgIdx]}”
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="lc-footer">
          Made with infinite love
        </div>
      </div>
    </>
  );
}
