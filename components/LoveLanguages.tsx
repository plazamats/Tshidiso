'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { story } from '../content/love-story';

export default function LoveLanguages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % story.loveLanguages.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const current = story.loveLanguages[index];

  return (
    <div className="love-languages" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="love-language-line"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.55 }}
        >
          <span className="love-language-phrase">{current.phrase}</span>
          <span className="love-language-name">— in {current.language}, and every other language I'll ever learn</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
