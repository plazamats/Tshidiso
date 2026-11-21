'use client';

import { motion } from 'framer-motion';
import { story } from '../content/love-story';
import { romanticAudio } from '../lib/romantic-audio';

interface IntroGateProps {
  onEnter: () => void;
}

export default function IntroGate({ onEnter }: IntroGateProps) {
  const handleEnter = () => {
    romanticAudio.playStardustChime(4);
    setTimeout(() => romanticAudio.playStardustChime(6), 250);
    onEnter();
  };

  return (
    <motion.div
      className="intro-gate"
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      <div className="gate-aurora" />
      <div className="gate-particles" aria-hidden="true">
        <span className="gate-sparkle gs1">✦</span>
        <span className="gate-sparkle gs2">♥</span>
        <span className="gate-sparkle gs3">✦</span>
        <span className="gate-sparkle gs4">♥</span>
      </div>
      <motion.div
        className="gate-inner"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
      >
        <p className="eyebrow glow-text">{story.gate.eyebrow}</p>
        <h1 className="gate-title">{story.gate.title}</h1>
        <div className="gate-subtitle">Every love story is special, but ours is my favorite universe.</div>
        <motion.button
          className="gate-seal"
          onClick={handleEnter}
          aria-label="Open your romantic universe"
          whileHover={{ scale: 1.14 }}
          whileTap={{ scale: 0.88 }}
          animate={{
            boxShadow: [
              '0 0 30px #ff5aa788, inset 0 0 15px #ffd99b88',
              '0 0 85px #ff5aa7ee, inset 0 0 25px #ffd99bee',
              '0 0 30px #ff5aa788, inset 0 0 15px #ffd99b88'
            ]
          }}
          transition={{ boxShadow: { duration: 2.2, repeat: Infinity } }}
        >
          <span className="seal-heart-glyph">♥</span>
        </motion.button>
        <p className="gate-hint">{story.gate.hint}</p>
      </motion.div>
    </motion.div>
  );
}
