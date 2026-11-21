'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { story } from '../content/love-story';

const BEAT_MS_START = 900;
const BEAT_MS_MIN = 420;
const SPEEDUP_PER_BEAT = 0.92;

export default function HeartbeatMoment() {
  const [holding, setHolding] = useState(false);
  const [beats, setBeats] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const beatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatCount = useRef(0);
  const audioCtx = useRef<AudioContext | null>(null);

  const thump = useCallback((strong: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtx.current) audioCtx.current = new AudioCtx();
      const ctx = audioCtx.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      const makeThump = (delay: number, gainValue: number, pitch: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now + delay);
        osc.frequency.exponentialRampToValueAtTime(Math.max(24, pitch * 0.4), now + delay + 0.16);
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.linearRampToValueAtTime(gainValue, now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.26);
      };

      makeThump(0, strong ? 0.32 : 0.22, strong ? 62 : 54);
      makeThump(0.14, strong ? 0.2 : 0.13, 48);
    } catch {
      /* audio unavailable */
    }
    if (navigator.vibrate) {
      navigator.vibrate(strong ? [28, 60, 18] : 20);
    }
  }, []);

  const scheduleBeat = useCallback((strong: boolean) => {
    thump(strong);
    const nextStrong = !strong;
    const interval = Math.max(BEAT_MS_MIN, BEAT_MS_START * Math.pow(SPEEDUP_PER_BEAT, beatCount.current / 2));
    beatTimer.current = setTimeout(() => {
      if (!holdingRef.current) return;
      beatCount.current += 1;
      setBeats(beatCount.current);
      scheduleBeat(nextStrong);
    }, interval * 0.55);
  }, [thump]);

  const holdingRef = useRef(holding);
  useEffect(() => { holdingRef.current = holding; }, [holding]);

  const startHold = () => {
    if (holding) return;
    beatCount.current = 0;
    setHolding(true);
    scheduleBeat(true);
  };

  const endHold = () => {
    if (!holding) return;
    setHolding(false);
    holdingRef.current = false;
    if (beatTimer.current) clearTimeout(beatTimer.current);
    if (beatCount.current >= 6 && !revealed) setRevealed(true);
  };

  useEffect(() => () => { if (beatTimer.current) clearTimeout(beatTimer.current); }, []);

  const caption = revealed
    ? story.heartbeat.after
    : holding || beats > 0
      ? story.heartbeat.reveal
      : story.heartbeat.instruction;

  return (
    <div className="heartbeat-moment">
      <button
        className={`heartbeat-heart ${holding ? 'holding' : ''}`}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={e => e.preventDefault()}
        aria-label="Press and hold my heart"
      >
        <span className="heartbeat-ring" />
        <span className="heartbeat-core">♥</span>
      </button>
      <p className={`heartbeat-caption ${holding ? 'active' : ''}`}>{caption}</p>
      <small className="heartbeat-hint">{beats > 0 ? `${beats} heartbeats... keep holding` : 'it beats for you — literally'}</small>
    </div>
  );
}
