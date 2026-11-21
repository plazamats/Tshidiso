'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FuseHeartsProps {
  onMerge: () => void;
}

export default function FuseHearts({ onMerge }: FuseHeartsProps) {
  const [merged, setMerged] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'left' | 'right' | null>(null);

  const posOf = (which: 'left' | 'right') => {
    const el = which === 'left' ? leftRef.current : rightRef.current;
    if (!el || !wrapRef.current) return { x: 0, y: 0 };
    const wr = wrapRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
  };

  const place = (which: 'left' | 'right', x: number, y: number) => {
    const el = which === 'left' ? leftRef.current : rightRef.current;
    if (!el) return;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };

  const checkMerge = () => {
    const a = posOf('left'), b = posOf('right');
    if (Math.hypot(a.x - b.x, a.y - b.y) < 92) {
      setMerged(true);
      dragging.current = null;
      onMerge();
      if (navigator.vibrate) navigator.vibrate([50, 70, 50, 70, 90]);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (merged) return;
    const a = posOf('left'), b = posOf('right');
    const da = Math.hypot(e.clientX - (wrapRef.current!.getBoundingClientRect().left + a.x), e.clientY - (wrapRef.current!.getBoundingClientRect().top + a.y));
    const db = Math.hypot(e.clientX - (wrapRef.current!.getBoundingClientRect().left + b.x), e.clientY - (wrapRef.current!.getBoundingClientRect().top + b.y));
    dragging.current = da < db ? 'left' : 'right';
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || merged) return;
    const wr = wrapRef.current!.getBoundingClientRect();
    const x = e.clientX - wr.left, y = e.clientY - wr.top;
    place(dragging.current, x, y);
    checkMerge();
  };

  const reset = () => {
    const l = leftRef.current, r = rightRef.current;
    if (l) { l.style.left = '18%'; l.style.top = '50%'; }
    if (r) { r.style.left = '82%'; r.style.top = '50%'; }
    setMerged(false);
  };

  return (
    <div className="fuse-wrap">
      <p className="eyebrow">one last thing</p>
      <h3 className="fuse-title">{merged ? 'See?' : 'Pull us back together'}</h3>
      <div
        className={`fuse-stage ${merged ? 'merged' : ''}`}
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { dragging.current = null; }}
        onPointerCancel={() => { dragging.current = null; }}
      >
        <AnimatePresence>
          {!merged && (
            <>
              <motion.div
                ref={leftRef}
                className="fuse-orb fuse-you"
                exit={{ scale: 0, opacity: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span>♥</span>
              </motion.div>
              <motion.div
                ref={rightRef}
                className="fuse-orb fuse-me"
                exit={{ scale: 0, opacity: 0 }}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span>♥</span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {merged && (
            <motion.div
              className="fuse-result"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180 }}
            >
              ♥
            </motion.div>
          )}
        </AnimatePresence>

        {!merged && (
          <>
            <span className="fuse-label label-left">you</span>
            <span className="fuse-label label-right">me</span>
          </>
        )}
      </div>
      <AnimatePresence mode="wait">
        {merged ? (
          <motion.p
            key="after"
            className="fuse-caption"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            No matter how far life pulls us apart,
            we always find our way back to each other.
            <button className="fuse-again" onClick={reset}>↺ drift apart again</button>
          </motion.p>
        ) : (
          <motion.p key="before" className="fuse-caption">
            drag us into each other&apos;s arms
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
