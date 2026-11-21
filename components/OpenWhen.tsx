'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { story } from '../content/love-story';

export default function OpenWhen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const letters = story.openWhen;
  const current = openIndex !== null ? letters[openIndex] : null;

  return (
    <div className="openwhen-wrap">
      <div className="envelope-grid">
        {letters.map((letter, i) => (
          <motion.button
            key={letter.label}
            className="envelope"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: (i % 2) * 0.12 + Math.floor(i / 2) * 0.08, duration: 0.7 }}
            whileHover={{ y: -8 }}
            onClick={() => setOpenIndex(i)}
          >
            <span className="envelope-flap" />
            <span className="envelope-wax">♥</span>
            <span className="envelope-label">{letter.label}</span>
            <span className="envelope-open">break the seal ↗</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="modal love-note-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIndex(null)}
          >
            <motion.div
              className="love-note-card openwhen-card"
              initial={{ scale: 0.85, y: 44, rotateX: 18 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.85, y: 44, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="note-close" onClick={() => setOpenIndex(null)}>×</button>
              <div className="note-seal">♥</div>
              <p className="note-tag">{current.label}</p>
              <h4 className="note-text">{current.title}</h4>
              <p className="openwhen-body">{current.body}</p>
              <p className="note-signature">— Always yours</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
