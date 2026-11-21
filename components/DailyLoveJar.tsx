'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { story } from '../content/love-story';

export default function DailyLoveJar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<string>('');
  const [drawnIndex, setDrawnIndex] = useState<number>(0);

  const drawNote = () => {
    const notes = story.loveNotes || [];
    if (notes.length === 0) return;
    const nextIdx = Math.floor(Math.random() * notes.length);
    setDrawnIndex(nextIdx);
    setCurrentNote(notes[nextIdx]);
    setIsOpen(true);
  };

  return (
    <div className="love-jar-container">
      <motion.div
        className="love-jar-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="jar-glow" />
        <div className="jar-icon-wrap" onClick={drawNote}>
          <motion.div
            className="jar-crystal"
            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="jar-emoji">🏺</span>
            <div className="jar-stars">
              <span className="star s1">✨</span>
              <span className="star s2">💖</span>
              <span className="star s3">⭐</span>
              <span className="star s4">🌸</span>
            </div>
          </motion.div>
        </div>

        <h3 className="jar-title">Jar of Daily Love Notes</h3>
        <p className="jar-subtitle">
          Whenever you need a smile, tap the jar to open a little piece of my heart.
        </p>

        <motion.button
          className="button glow-btn jar-btn"
          onClick={drawNote}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>💌</span> Draw Today&apos;s Love Note
        </motion.button>
      </motion.div>

      {/* Note Reveal Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="modal love-note-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="love-note-card"
              initial={{ scale: 0.8, y: 40, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="note-close" onClick={() => setIsOpen(false)}>×</button>
              <div className="note-seal">♥</div>
              <p className="note-tag">Love Note #{drawnIndex + 1}</p>
              <h4 className="note-text">&ldquo;{currentNote}&rdquo;</h4>
              <p className="note-signature">— Written with all my love for Tshidi</p>

              <div className="note-actions">
                <button className="button glow-btn note-draw-again" onClick={drawNote}>
                  <span>✨</span> Pick Another Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
