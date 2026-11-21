'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { romanticAudio } from '../lib/romantic-audio';

interface StarNode {
  id: number;
  x: number;
  y: number;
  label: string;
  sub: string;
}

const STAR_NODES: StarNode[] = [
  { id: 0, x: 50, y: 16, label: 'The First Spark', sub: 'The small hello that changed my life' },
  { id: 1, x: 80, y: 38, label: 'Your Radiant Smile', sub: 'When your laughter became my favorite song' },
  { id: 2, x: 68, y: 76, label: 'The Quiet Peace', sub: 'Finding home in your embrace' },
  { id: 3, x: 32, y: 76, label: 'Our Deepest Vow', sub: 'Choosing you in every single season' },
  { id: 4, x: 20, y: 38, label: 'Infinite Tomorrow', sub: 'Growing old with you beside me' },
];

export default function ConstellationTracer() {
  const [connected, setConnected] = useState<number[]>([0]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStarClick = (idx: number) => {
    if (isCompleted) return;

    const nextRequired = (connected[connected.length - 1] + 1) % STAR_NODES.length;
    // Allow clicking next sequentially or close the loop
    if (idx === nextRequired && !connected.includes(idx)) {
      const nextList = [...connected, idx];
      setConnected(nextList);
      romanticAudio.playStardustChime(idx + 1);
      if (navigator.vibrate) navigator.vibrate(30);

      if (nextList.length === STAR_NODES.length) {
        setIsCompleted(true);
        romanticAudio.playStardustChime(6);
        setTimeout(() => romanticAudio.playStardustChime(7), 250);
        if (navigator.vibrate) navigator.vibrate([40, 60, 80, 100]);
      }
    } else if (connected.length === STAR_NODES.length && idx === 0) {
      setIsCompleted(true);
    } else {
      // Gentle hint chime
      romanticAudio.playStardustChime(0);
    }
  };

  const handleReset = () => {
    setConnected([0]);
    setIsCompleted(false);
  };

  return (
    <div className="constellation-tracer-wrap">
      <div className="tracer-sky">
        {/* SVG connection lines */}
        <svg className="constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="starlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd99b" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ff7eb3" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffd99b" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw connected lines */}
          {connected.map((starIdx, i) => {
            if (i === 0) return null;
            const prev = STAR_NODES[connected[i - 1]];
            const curr = STAR_NODES[starIdx];
            return (
              <line
                key={`line-${prev.id}-${curr.id}`}
                x1={prev.x}
                y1={prev.y}
                x2={curr.x}
                y2={curr.y}
                stroke="url(#starlightGrad)"
                strokeWidth="0.8"
                filter="url(#glowEffect)"
              />
            );
          })}

          {/* If complete, close the heart shape to Star 0 */}
          {isCompleted && (
            <line
              x1={STAR_NODES[STAR_NODES.length - 1].x}
              y1={STAR_NODES[STAR_NODES.length - 1].y}
              x2={STAR_NODES[0].x}
              y2={STAR_NODES[0].y}
              stroke="url(#starlightGrad)"
              strokeWidth="0.8"
              filter="url(#glowEffect)"
            />
          )}
        </svg>

        {/* Interactive Star Points */}
        {STAR_NODES.map((star, i) => {
          const isConnected = connected.includes(i);
          const isNext = !isCompleted && i === (connected[connected.length - 1] + 1) % STAR_NODES.length && !connected.includes(i);

          return (
            <div
              key={star.id}
              className={`constellation-star ${isConnected ? 'active' : ''} ${isNext ? 'next-target' : ''}`}
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              onClick={() => handleStarClick(i)}
            >
              <div className="star-pulse-ring" />
              <div className="star-core">✦</div>
              <div className="star-label-tooltip">
                <strong>{star.label}</strong>
                <span>{star.sub}</span>
              </div>
            </div>
          );
        })}

        {/* Center Golden Heart / Monogram when completed */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              className="constellation-crown"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 14 }}
            >
              <div className="crown-glow">♥</div>
              <span className="crown-name">TSHIDI & FOREVER</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="tracer-controls">
        <p className="tracer-hint">
          {!isCompleted
            ? `✦ Tap the glowing stars in sequence to trace our constellation (${connected.length}/${STAR_NODES.length}) ✦`
            : '🌟 The Constellation of Us is complete — written in eternal starlight 🌟'}
        </p>

        {isCompleted && (
          <button className="button glow-btn tracer-reset-btn" onClick={handleReset}>
            <span>✨</span> Trace Again
          </button>
        )}
      </div>
    </div>
  );
}
