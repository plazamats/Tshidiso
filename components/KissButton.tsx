'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { story } from '../content/love-story';

const STORAGE_KEY = 'tshidi-kisses';

export default function KissButton() {
  const [kisses, setKisses] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [flying, setFlying] = useState<{ id: number; dx: number }[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setKisses(parseInt(saved, 10) || 0);
    } catch { /* fresh start */ }
  }, []);

  const sendKiss = useCallback(() => {
    const next = kisses + 1;
    setKisses(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* private mode */ }

    const batch = Array.from({ length: 4 }, () => ({ id: nextId.current++, dx: Math.random() * 90 - 45 }));
    setFlying(batch);
    setTimeout(() => setFlying([]), 1400);

    if (next === 1) setToast('The first of thousands. ♥');
    else if (next === 10) setToast(story.kissWidget.milestone2);
    else if (next === 25) setToast(story.kissWidget.milestone3);
    else if (next % 50 === 0) setToast(`${next} kisses delivered straight to my heart.`);
    else return;
    setTimeout(() => setToast(null), 3600);
    if (navigator.vibrate) navigator.vibrate(15);
  }, [kisses]);

  return (
    <div className="kiss-widget">
      <button className="kiss-btn" onClick={sendKiss} aria-label="Send a kiss">
        💋
        {kisses > 0 && <span className="kiss-count">{kisses}</span>}
      </button>
      {flying.map(k => (
        <span key={k.id} className="kiss-fly" style={{ '--fly-x': `${k.dx}px` } as React.CSSProperties}>
          💋
        </span>
      ))}
      {toast && (
        <AnimatePresence>
          <motion.span
            key={toast}
            className={`kiss-toast ${toast.length > 40 ? 'wide' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {toast}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}
