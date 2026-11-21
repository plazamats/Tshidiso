'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const LockedCountdown = dynamic(() => import('./LockedCountdown'), { ssr: false });
const ThrillerIntro = dynamic(() => import('./ThrillerIntro'), { ssr: false });

// 29 November 2026, 00:00:00 in Africa/Johannesburg (UTC+2)
const UNLOCK_DATE = new Date('2026-11-29T00:00:00+02:00');
const THRILLER_FLAG = 'birthday_thriller_seen_v1';
const DEV_SIMULATE_KEY = 'dev_birthday_simulate_mode';

type Phase = 'loading' | 'countdown' | 'unlocking' | 'thriller' | 'birthday';

interface ExperienceOrchestratorProps {
  children: React.ReactNode;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Heart Lock Opening Visual Sequence                                */
/*  The heart padlock shackle unlocks, the heart splits open, and     */
/*  a beam of radiant light burst transitions into the thriller intro */
/* ────────────────────────────────────────────────────────────────── */
function UnlockAnimation() {
  return (
    <motion.div
      key="unlocking"
      className="eo-unlock-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="eo-unlock-center">
        {/* Core light explosion */}
        <motion.div
          className="eo-light-flare"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 4], opacity: [0, 1, 0] }}
          transition={{ duration: 2.3, times: [0, 0.35, 1], ease: 'easeOut' }}
        />

        {/* Shackle popping & opening */}
        <motion.div
          className="eo-shackle-wrap"
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: -30, rotate: 38, opacity: [1, 1, 0] }}
          transition={{ duration: 1.8, times: [0, 0.4, 1], ease: 'easeInOut' }}
        >
          <svg width="140" height="70" viewBox="0 0 140 70" fill="none">
            <path
              d="M45 65 C45 22, 95 22, 95 65"
              stroke="#ffd99b"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255, 217, 155, 0.8))' }}
            />
          </svg>
        </motion.div>

        {/* Split Heart Body */}
        <div className="eo-heart-split-wrap">
          {/* Left half of heart */}
          <motion.svg
            width="140"
            height="140"
            viewBox="0 0 120 120"
            fill="none"
            className="eo-heart-half"
            initial={{ x: 0, rotate: 0, opacity: 1 }}
            animate={{ x: -110, rotate: -25, opacity: [1, 1, 0] }}
            transition={{ duration: 2.2, delay: 0.35, times: [0, 0.7, 1], ease: [0.16, 1, 0.3, 1] }}
          >
            <defs>
              <linearGradient id="eoLeftGrad" x1="10" y1="20" x2="60" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffd99b" />
                <stop offset="50%" stopColor="#ff5aa7" />
                <stop offset="100%" stopColor="#8e6af5" />
              </linearGradient>
              <clipPath id="eoClipLeft">
                <rect x="0" y="0" width="60" height="120" />
              </clipPath>
            </defs>
            <g clipPath="url(#eoClipLeft)">
              <path
                d="M60 102
                   C25 76, 6 56, 16 35
                   C23 18, 43 13, 60 30
                   C77 13, 97 18, 104 35
                   C114 56, 95 76, 60 102Z"
                fill="url(#eoLeftGrad)"
                stroke="rgba(255, 217, 155, 0.6)"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 90, 167, 0.7))' }}
              />
              <circle cx="60" cy="54" r="7.5" fill="#07051a" />
              <polygon points="56,58 64,58 62.5,74 57.5,74" fill="#07051a" />
            </g>
          </motion.svg>

          {/* Right half of heart */}
          <motion.svg
            width="140"
            height="140"
            viewBox="0 0 120 120"
            fill="none"
            className="eo-heart-half"
            initial={{ x: 0, rotate: 0, opacity: 1 }}
            animate={{ x: 110, rotate: 25, opacity: [1, 1, 0] }}
            transition={{ duration: 2.2, delay: 0.35, times: [0, 0.7, 1], ease: [0.16, 1, 0.3, 1] }}
          >
            <defs>
              <linearGradient id="eoRightGrad" x1="60" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffd99b" />
                <stop offset="50%" stopColor="#ff5aa7" />
                <stop offset="100%" stopColor="#8e6af5" />
              </linearGradient>
              <clipPath id="eoClipRight">
                <rect x="60" y="0" width="60" height="120" />
              </clipPath>
            </defs>
            <g clipPath="url(#eoClipRight)">
              <path
                d="M60 102
                   C25 76, 6 56, 16 35
                   C23 18, 43 13, 60 30
                   C77 13, 97 18, 104 35
                   C114 56, 95 76, 60 102Z"
                fill="url(#eoRightGrad)"
                stroke="rgba(255, 217, 155, 0.6)"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 90, 167, 0.7))' }}
              />
              <circle cx="60" cy="54" r="7.5" fill="#07051a" />
              <polygon points="56,58 64,58 62.5,74 57.5,74" fill="#07051a" />
            </g>
          </motion.svg>
        </div>

        {/* Unlocking label */}
        <motion.p
          className="eo-unlock-label"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: [0, 1, 0], y: [15, 0, -10] }}
          transition={{ duration: 2.0, times: [0, 0.4, 1] }}
        >
          Unlocking your universe…
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Main Experience Orchestrator                                      */
/* ────────────────────────────────────────────────────────────────── */
export default function ExperienceOrchestrator({ children }: ExperienceOrchestratorProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [simulatedTarget, setSimulatedTarget] = useState<Date | undefined>(undefined);
  const [devMinimized, setDevMinimized] = useState<boolean>(true);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- initial phase determination ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const now = new Date();
    const simMode = localStorage.getItem(DEV_SIMULATE_KEY);

    // If dev simulation is active in development
    let isUnlocked = now >= UNLOCK_DATE;

    if (process.env.NODE_ENV !== 'production' && simMode) {
      if (simMode === 'unlocked') {
        isUnlocked = true;
      } else if (simMode === 'locked') {
        isUnlocked = false;
      } else if (simMode.startsWith('countdown_')) {
        const targetMs = parseInt(simMode.replace('countdown_', ''), 10);
        if (targetMs > Date.now()) {
          setSimulatedTarget(new Date(targetMs));
          isUnlocked = false;
        } else {
          isUnlocked = true;
        }
      }
    }

    const seenThriller = Boolean(localStorage.getItem(THRILLER_FLAG));

    if (!isUnlocked) {
      // PHASE 1: Locked countdown
      setPhase('countdown');
    } else if (seenThriller) {
      // PHASE 4: Direct to birthday website
      setPhase('birthday');
    } else {
      // First visit after unlock date:
      // Mark thriller as started immediately before playing it (ONCE-ONLY requirement)
      localStorage.setItem(THRILLER_FLAG, Date.now().toString());
      setPhase('thriller');
    }
  }, []);

  /* ---------- body overflow lock ---------- */
  useEffect(() => {
    if (phase !== 'birthday') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  /* ---------- cleanup timers ---------- */
  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, []);

  /* ---------- transitions ---------- */
  // Automatic unlock when countdown hits zero
  const handleUnlock = useCallback(() => {
    setPhase('unlocking');

    // After 2.5s lock opening animation, transition into thriller
    unlockTimerRef.current = setTimeout(() => {
      // Mark thriller as started IMMEDIATELY before playing it
      // So if she refreshes during the thriller, it does NOT restart
      localStorage.setItem(THRILLER_FLAG, Date.now().toString());
      setPhase('thriller');
    }, 2500);
  }, []);

  const handleThrillerComplete = useCallback(() => {
    // PHASE 4: Reveal existing birthday website
    setPhase('birthday');
  }, []);

  /* ---------- dev mode helpers ---------- */
  const devSetSimulateLocked = () => {
    localStorage.setItem(DEV_SIMULATE_KEY, 'locked');
    setSimulatedTarget(undefined);
    setPhase('countdown');
  };

  const devSetCountdown5s = () => {
    const target = new Date(Date.now() + 5000);
    localStorage.setItem(DEV_SIMULATE_KEY, `countdown_${target.getTime()}`);
    setSimulatedTarget(target);
    setPhase('countdown');
  };

  const devSetSimulateUnlocked = () => {
    localStorage.setItem(DEV_SIMULATE_KEY, 'unlocked');
    setSimulatedTarget(undefined);
    handleUnlock();
  };

  const devPlayThriller = () => {
    // Direct preview must not consume the once-only production flag.
    setPhase('thriller');
  };

  const devSkipToBirthday = () => {
    setPhase('birthday');
  };

  const devResetAll = () => {
    localStorage.removeItem(THRILLER_FLAG);
    localStorage.removeItem(DEV_SIMULATE_KEY);
    setSimulatedTarget(undefined);
    setPhase('countdown');
  };

  const devTestRefreshDuringThriller = () => {
    localStorage.setItem(THRILLER_FLAG, Date.now().toString());
    localStorage.setItem(DEV_SIMULATE_KEY, 'unlocked');
    window.location.reload();
  };

  if (phase === 'loading') return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* ── Unlocking Animation styles ───────────────────────── */
        .eo-unlock-screen {
          position: fixed;
          inset: 0;
          z-index: 9500;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .eo-unlock-center {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .eo-light-flare {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, rgba(255, 90, 167, 0.9) 30%, rgba(142, 106, 245, 0.4) 60%, transparent 80%);
          pointer-events: none;
          z-index: 10;
          filter: blur(15px);
        }

        .eo-shackle-wrap {
          position: absolute;
          top: -35px;
          z-index: 2;
          transform-origin: 95px 65px;
        }

        .eo-heart-split-wrap {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eo-heart-half {
          position: absolute;
          top: 0;
          left: 0;
          overflow: visible;
        }

        .eo-unlock-label {
          position: absolute;
          bottom: -60px;
          font-family: var(--font-playfair, Georgia, serif);
          font-style: italic;
          font-size: clamp(14px, 2.5vw, 20px);
          color: #ffd99b;
          letter-spacing: 0.1em;
          white-space: nowrap;
          text-shadow: 0 0 15px rgba(255, 217, 155, 0.6);
        }

        /* ── Dev Panel styles ─────────────────────────────────── */
        .eo-dev-pill {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 99999;
          background: rgba(13, 8, 38, 0.9);
          border: 1px solid rgba(255, 90, 167, 0.4);
          color: #ffd99b;
          padding: 8px 16px;
          border-radius: 999px;
          font-family: var(--font-dm-mono, monospace);
          font-size: 11px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .eo-dev-box {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 99999;
          background: rgba(7, 5, 26, 0.94);
          border: 1px solid rgba(255, 90, 167, 0.35);
          border-radius: 16px;
          padding: 16px;
          font-family: var(--font-dm-mono, monospace);
          color: #fff;
          max-width: 320px;
          width: calc(100vw - 32px);
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
        }

        .eo-dev-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .eo-dev-title {
          font-size: 12px;
          font-weight: 700;
          color: #ffd99b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .eo-dev-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 14px;
          padding: 2px 6px;
        }

        .eo-dev-status {
          font-size: 10px;
          line-height: 1.6;
          margin-bottom: 12px;
          color: #d8cef5;
          background: rgba(255, 255, 255, 0.04);
          padding: 8px;
          border-radius: 8px;
        }

        .eo-dev-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .eo-dev-btn {
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 10.5px;
          color: #ffffff;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }

        .eo-dev-btn:hover {
          background: rgba(255, 90, 167, 0.2);
          border-color: rgba(255, 90, 167, 0.5);
        }
      `}} />

      {/* PHASE 1 & 2 & 3 OVERLAYS */}
      <AnimatePresence mode="wait">
        {phase === 'countdown' && (
          <LockedCountdown
            key="countdown"
            onUnlock={handleUnlock}
            targetDate={simulatedTarget}
          />
        )}

        {phase === 'unlocking' && <UnlockAnimation key="unlocking" />}

        {phase === 'thriller' && (
          <ThrillerIntro key="thriller" onComplete={handleThrillerComplete} />
        )}
      </AnimatePresence>

      {/* PHASE 4: THE EXISTING BIRTHDAY WEBSITE */}
      {phase === 'birthday' && (
        <motion.div
          key="birthday"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}

      {/* TEMPORARY DEVELOPMENT TESTING CONTROLS */}
      {(
        <>
          {devMinimized ? (
            <button
              className="eo-dev-pill"
              onClick={() => setDevMinimized(false)}
              title="Expand Dev Testing Controls"
            >
              <span>🔧</span>
              <span>Dev Controls ({phase})</span>
            </button>
          ) : (
            <div className="eo-dev-box" data-testid="developer-testing-panel">
              <div className="eo-dev-header">
                <div className="eo-dev-title">
                  <span>🔧</span> Test Controls
                </div>
                <button
                  className="eo-dev-close"
                  onClick={() => setDevMinimized(true)}
                  title="Minimize"
                >
                  ✕
                </button>
              </div>

              <div className="eo-dev-status">
                <div>Phase: <strong style={{ color: '#ff5aa7' }}>{phase}</strong></div>
                <div>
                  Thriller Seen:{' '}
                  <strong style={{ color: typeof window !== 'undefined' && localStorage.getItem(THRILLER_FLAG) ? '#4ade80' : '#f87171' }}>
                    {typeof window !== 'undefined' && localStorage.getItem(THRILLER_FLAG) ? 'Yes' : 'No'}
                  </strong>
                </div>
              </div>

              <div className="eo-dev-actions">
                <button className="eo-dev-btn" onClick={devSetSimulateLocked}>
                  <span>🔒</span> Locked Countdown
                </button>
                <button className="eo-dev-btn" onClick={devSetCountdown5s}>
                  <span>⚡</span> Auto Unlock Test
                </button>
                <button className="eo-dev-btn" onClick={devSetSimulateUnlocked}>
                  <span>🔓</span> Trigger Unlock + Thriller
                </button>
                <button className="eo-dev-btn" onClick={devPlayThriller}>
                  <span>🎬</span> Play Thriller Directly
                </button>
                <button className="eo-dev-btn" onClick={devTestRefreshDuringThriller}>
                  <span>🔄</span> Test Refresh During Thriller
                </button>
                <button className="eo-dev-btn" onClick={devSkipToBirthday}>
                  <span>🎂</span> Show Birthday Website
                </button>
                <button className="eo-dev-btn" onClick={devResetAll} style={{ color: '#ffb3d3' }}>
                  <span>🧹</span> Reset Everything
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
