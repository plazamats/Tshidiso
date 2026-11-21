'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { romanticAudio } from '../lib/romantic-audio';

export default function SoulResonance() {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [synced, setSynced] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startResonance = useCallback(() => {
    if (synced) return;
    setHolding(true);
    romanticAudio.playStardustChime(0);
    if (navigator.vibrate) navigator.vibrate([20, 30]);

    const startTime = Date.now();
    const duration = 3400; // ~3.4s hold for emotional tension and build-up

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(current);

      if (current % 25 === 0 && current > 0) {
        romanticAudio.playStardustChime(Math.floor(current / 20));
        if (navigator.vibrate) navigator.vibrate(25);
      }

      if (current < 100) {
        timerRef.current = window.requestAnimationFrame(tick);
      } else {
        setSynced(true);
        setHolding(false);
        romanticAudio.playStardustChime(5);
        setTimeout(() => romanticAudio.playStardustChime(7), 200);
        if (navigator.vibrate) navigator.vibrate([40, 80, 50, 90, 120]);
      }
    };
    timerRef.current = window.requestAnimationFrame(tick);
  }, [synced]);

  const stopResonance = useCallback(() => {
    if (synced) return;
    setHolding(false);
    if (timerRef.current) {
      window.cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setProgress(0);
  }, [synced]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.cancelAnimationFrame(timerRef.current);
    };
  }, []);

  const getStatusText = () => {
    if (synced) return '100% — Eternal Resonance';
    if (progress > 75) return 'Entwining soul frequencies...';
    if (progress > 50) return 'Heartbeats falling into sync...';
    if (progress > 25) return 'Feeling your warmth across the distance...';
    if (holding) return 'Connecting our spirits...';
    return 'Press and rest your thumb here with mine';
  };

  return (
    <div className="soul-resonance-wrap">
      <div className="resonance-portal">
        <div
          className={`resonance-touchpad ${holding ? 'active' : ''} ${synced ? 'synced' : ''}`}
          onPointerDown={startResonance}
          onPointerUp={stopResonance}
          onPointerLeave={stopResonance}
          onPointerCancel={stopResonance}
          onContextMenu={e => e.preventDefault()}
          role="button"
          tabIndex={0}
          aria-label="Hold to synchronize soul resonance"
        >
          {/* Concentric Aura Ripples */}
          <div className="aura-ring ring-1" />
          <div className="aura-ring ring-2" />
          <div className="aura-ring ring-3" />

          {/* Left Soul (His) */}
          <motion.div
            className="soul-orb his-soul"
            animate={{
              x: synced ? 0 : holding ? `-${40 - progress * 0.4}px` : '-50px',
              scale: holding ? 1.1 + progress * 0.003 : 1,
              opacity: holding ? 0.95 : 0.65,
            }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          >
            <span>♥</span>
          </motion.div>

          {/* Right Soul (Hers) */}
          <motion.div
            className="soul-orb her-soul"
            animate={{
              x: synced ? 0 : holding ? `${40 - progress * 0.4}px` : '50px',
              scale: holding ? 1.1 + progress * 0.003 : 1,
              opacity: holding ? 0.95 : 0.65,
            }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          >
            <span>♥</span>
          </motion.div>

          {/* Center Fusion Glow */}
          <div
            className="fusion-core"
            style={{
              opacity: progress / 100,
              transform: `scale(${0.6 + (progress / 100) * 0.8})`,
            }}
          />

          {/* Fingerprint / Heart Icon Center */}
          <div className="resonance-icon">
            <span>{synced ? '💖' : '✦'}</span>
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="resonance-hud">
          <div className="resonance-meter">
            <div className="resonance-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="resonance-status">{getStatusText()}</p>
        </div>

        {/* Reveal Card on Sync */}
        <AnimatePresence>
          {synced && (
            <motion.div
              className="resonance-vow-card"
              initial={{ opacity: 0, y: 25, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <div className="vow-badge">✦ Soul Synchrony Achieved ✦</div>
              <h3>One Heart, One Rhythm</h3>
              <p className="vow-quote">
                “There are eight billion people wandering this earth, but in this quiet moment,
                every breath in my lungs and every beat in my chest knows exactly where it belongs:
                right beside you. Distance is only geography — my soul has never left your side.”
              </p>
              <button
                className="button glow-btn resonance-reset-btn"
                onClick={() => {
                  setSynced(false);
                  setProgress(0);
                }}
              >
                <span>♥</span> Feel My Touch Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
