'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { romanticAudio } from '../lib/romantic-audio';

const WHISPERS = [
  '“You are my favorite thought in the quiet morning, and my sweetest dream when the world goes to sleep.”',
  '“Even if a thousand lifetimes passed, I would look for you in every single crowd.”',
  '“You make my heart feel like it has finally come home after a long journey.”',
  '“No matter how busy or chaotic this world gets, loving you will always be my peace.”',
  '“You didn’t just make my life better — you became the best part of it.”',
  '“This rose will never lose its bloom, just like my love will never lose its wonder.”',
];

export default function EnchantedRose() {
  const [whisperIdx, setWhisperIdx] = useState(0);
  const [bloomPulse, setBloomPulse] = useState(0);
  const [glassTouched, setGlassTouched] = useState(false);
  const [whisperOpen, setWhisperOpen] = useState(false);

  const handlePulse = () => {
    setBloomPulse(p => p + 1);
    romanticAudio.playStardustChime(3);
    if (navigator.vibrate) navigator.vibrate([30, 40]);
  };

  const handleWhisper = () => {
    setWhisperIdx(prev => (prev + 1) % WHISPERS.length);
    setWhisperOpen(true);
    romanticAudio.playStardustChime(5);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const handleTouchGlass = () => {
    setGlassTouched(true);
    romanticAudio.playStardustChime(1);
    setTimeout(() => setGlassTouched(false), 900);
  };

  return (
    <div className="enchanted-rose-section">
      <div className="rose-cloche-stage">
        {/* Crystal Glass Bell Cloche */}
        <div
          className={`cloche-dome ${glassTouched ? 'glass-shimmer' : ''}`}
          onClick={handleTouchGlass}
          role="button"
          tabIndex={0}
          aria-label="Touch the crystal glass"
        >
          {/* Glass Specular Highlights */}
          <div className="glass-reflection-left" />
          <div className="glass-reflection-right" />

          {/* Floating Stardust Embers inside glass */}
          <div className="cloche-embers" aria-hidden="true">
            <span className="ember e1">✦</span>
            <span className="ember e2">✦</span>
            <span className="ember e3">✦</span>
            <span className="ember e4">✦</span>
          </div>

          {/* The Enchanted Rose */}
          <motion.div
            className="luminous-rose"
            key={bloomPulse}
            animate={{
              scale: [1, 1.08, 1],
              filter: [
                'drop-shadow(0 0 15px rgba(255, 90, 167, 0.7))',
                'drop-shadow(0 0 35px rgba(255, 105, 180, 0.95))',
                'drop-shadow(0 0 15px rgba(255, 90, 167, 0.7))',
              ],
            }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {/* Rose Blossom */}
            <div className="rose-head">
              <span className="rose-petal petal-back" />
              <span className="rose-petal petal-left" />
              <span className="rose-petal petal-right" />
              <span className="rose-petal petal-center" />
              <span className="rose-glow-heart">♥</span>
            </div>

            {/* Stem & Leaves */}
            <div className="rose-stem">
              <span className="rose-leaf leaf-left" />
              <span className="rose-leaf leaf-right" />
            </div>
          </motion.div>

          {/* Fallen Petal on the wooden base */}
          <div className="fallen-petals">
            <span className="drift-petal p1">🌸</span>
            <span className="drift-petal p2">🌹</span>
          </div>
        </div>

        {/* Polished Rosewood Base */}
        <div className="cloche-base">
          <div className="base-ring" />
          <span className="base-engraving">TSHIDI · FOREVER IN BLOOM</span>
        </div>

        {/* Interactive Controls */}
        <div className="rose-actions">
          <button className="button glow-btn rose-action-btn" onClick={handlePulse}>
            <span>💖</span> Send a Heartbeat
          </button>
          <button className="button glow-btn rose-action-btn" onClick={handleWhisper}>
            <span>💌</span> Whisper a Secret
          </button>
        </div>

        {/* Secret Whisper Display */}
        <AnimatePresence>
          {whisperOpen && (
            <motion.div
              className="rose-whisper-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
            >
              <p className="whisper-text">{WHISPERS[whisperIdx]}</p>
              <small className="whisper-hint">tap &apos;Whisper a Secret&apos; for another whisper</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
