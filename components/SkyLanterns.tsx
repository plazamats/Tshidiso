'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { romanticAudio } from '../lib/romantic-audio';

interface Lantern {
  id: number;
  x: number;
  wish: string;
  speed: number;
  sway: number;
  size: number;
  delay: number;
}

const PRESET_WISHES = [
  'To grow old together and still look at you like day one',
  'To wake up to your smile for the rest of my life',
  'To hold your hand through every storm and every triumph',
  'To travel to every corner of the world with you beside me',
  'To make you laugh so hard your stomach hurts every single day',
  'To build a home full of warmth, peace, and eternal love',
];

export default function SkyLanterns() {
  const [selectedWish, setSelectedWish] = useState(PRESET_WISHES[0]);
  const [customWish, setCustomWish] = useState('');
  const [isLit, setIsLit] = useState(false);
  const [isReleased, setIsReleased] = useState(false);
  const [activeLanterns, setActiveLanterns] = useState<Lantern[]>([
    { id: 1, x: 18, wish: 'Forever and always', speed: 28, sway: 8, size: 48, delay: 0 },
    { id: 2, x: 74, wish: 'My home is you', speed: 32, sway: 12, size: 40, delay: 4 },
    { id: 3, x: 42, wish: 'In every lifetime', speed: 25, sway: 10, size: 54, delay: 8 },
    { id: 4, x: 88, wish: 'My greatest blessing', speed: 35, sway: 7, size: 36, delay: 12 },
  ]);

  const activeWish = customWish.trim() || selectedWish;

  const handleLight = () => {
    if (isLit) return;
    setIsLit(true);
    romanticAudio.playStardustChime(2);
    if (navigator.vibrate) navigator.vibrate([30, 40]);
  };

  const handleRelease = () => {
    if (!isLit || isReleased) return;
    setIsReleased(true);
    romanticAudio.playStardustChime(4);
    setTimeout(() => romanticAudio.playStardustChime(6), 250);
    setTimeout(() => romanticAudio.playStardustChime(7), 500);

    const newLantern: Lantern = {
      id: Date.now(),
      x: 50,
      wish: activeWish,
      speed: 22,
      sway: 14,
      size: 58,
      delay: 0,
    };
    setActiveLanterns(prev => [newLantern, ...prev]);

    if (navigator.vibrate) navigator.vibrate([40, 60, 80]);
  };

  const handleReset = () => {
    setIsLit(false);
    setIsReleased(false);
    setCustomWish('');
  };

  return (
    <div className="sky-lanterns-container">
      {/* Drifting Background Lanterns in the Night Sky */}
      <div className="sky-lanterns-canopy" aria-hidden="true">
        {activeLanterns.map(l => (
          <motion.div
            key={l.id}
            className="drifting-lantern"
            style={{ left: `${l.x}%`, width: `${l.size}px`, height: `${l.size * 1.3}px` }}
            initial={{ y: '120vh', opacity: 0 }}
            animate={{
              y: '-30vh',
              opacity: [0, 0.9, 0.85, 0],
              x: [`${l.x - l.sway}%`, `${l.x + l.sway}%`, `${l.x - l.sway}%`],
            }}
            transition={{
              duration: l.speed,
              repeat: Infinity,
              delay: l.delay,
              ease: 'linear',
            }}
          >
            <div className="lantern-glow-inner" />
            <div className="lantern-candle-point" />
          </motion.div>
        ))}
      </div>

      <div className="lantern-stage">
        {!isReleased ? (
          <div className="lantern-altar">
            <motion.div
              className={`interactive-lantern ${isLit ? 'lantern-lit' : ''}`}
              onClick={handleLight}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="lantern-cap" />
              <div className="lantern-body">
                <div className="lantern-paper">
                  <span className="lantern-inscription">{activeWish}</span>
                  <div className="lantern-flame">
                    {isLit && <div className="flame-spark" />}
                    <span className="flame-core">{isLit ? '🔥' : '🕯️'}</span>
                  </div>
                </div>
              </div>
              <div className="lantern-base" />
              {isLit && <div className="lantern-halo" />}
            </motion.div>

            <div className="lantern-controls">
              <p className="lantern-prompt">
                {!isLit
                  ? '✦ Tap the lantern to light its golden flame ✦'
                  : '✨ Your lantern burns with warm love. Ready to send it to the stars? ✨'}
              </p>

              {/* Wish Selection */}
              <div className="wishes-selector">
                <span className="selector-title">Choose a wish for our universe:</span>
                <div className="wish-chips">
                  {PRESET_WISHES.map(w => (
                    <button
                      key={w}
                      className={`wish-chip ${selectedWish === w && !customWish ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedWish(w);
                        setCustomWish('');
                        romanticAudio.playStardustChime();
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>

                <div className="custom-wish-wrap">
                  <input
                    type="text"
                    className="custom-wish-input"
                    placeholder="... or write your own secret wish here"
                    value={customWish}
                    maxLength={70}
                    onChange={e => setCustomWish(e.target.value)}
                  />
                </div>
              </div>

              <div className="lantern-actions">
                {!isLit ? (
                  <button className="button glow-btn lantern-btn" onClick={handleLight}>
                    <span>🕯️</span> Light the Flame
                  </button>
                ) : (
                  <button className="button glow-btn release-btn" onClick={handleRelease}>
                    <span>🏮</span> Release Into Our Sky <span>✨</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            className="lantern-released-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="released-sparkles">✨ 🏮 ✨</div>
            <h3 className="released-title">Carried by the Stars</h3>
            <p className="released-wish">“{activeWish}”</p>
            <p className="released-text">
              Your wish is floating into the quiet sky, dancing among a thousand other lights.
              May every dream your heart has ever whispered come true — and whatever tomorrow brings,
              I promise my heart will always be your home.
            </p>
            <button className="button glow-btn lantern-btn-subtle" onClick={handleReset}>
              <span>✦</span> Light Another Wish <span>✦</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
