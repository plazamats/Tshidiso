'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { story } from '../content/love-story';

export default function RoseGarden() {
  const months = useMemo(() => {
    const start = new Date(story.togetherSince);
    const now = new Date();
    return Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
  }, []);

  const roses = useMemo(() => Array.from({ length: Math.min(months, 36) }, (_, i) => i), [months]);

  return (
    <div className="rose-garden">
      <div className="rose-bed" role="img" aria-label={`${months} roses, one for every month together`}>
        {roses.map(i => (
          <motion.span
            key={i}
            className="garden-rose"
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            whileInView={{ scale: 1, rotate: (i % 2 ? 8 : -8), opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.055, type: 'spring', stiffness: 260, damping: 16 }}
          >
            {i % 7 === 6 ? '🌸' : '🌹'}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="rose-caption"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        {months} month{months === 1 ? '' : 's'} of us — one rose for every single one,
        and the garden is still growing.
      </motion.p>
    </div>
  );
}
