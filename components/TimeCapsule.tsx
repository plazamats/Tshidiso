'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { story } from '../content/love-story';

const LetterTypewriter = dynamic(() => import('./LetterTypewriter'), { ssr: false });

export default function TimeCapsule() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className={`paper paper-aged ${open ? 'open' : ''}`}
      onClick={() => !open && setOpen(true)}
      whileHover={{ y: -5, rotate: open ? 0 : 1.5 }}
      initial={{ rotate: 1.5 }}
    >
      <div className="paper-seal">⌛</div>
      {open ? (
        <>
          <LetterTypewriter lines={story.timeCapsule.lines} />
        </>
      ) : (
        <div className="capsule-closed">
          <p className="eyebrow">{story.timeCapsule.subtitle}</p>
          <h3>{story.timeCapsule.title}</h3>
          <p className="tap-to-open">{story.timeCapsule.tapToOpen}</p>
        </div>
      )}
    </motion.div>
  );
}
