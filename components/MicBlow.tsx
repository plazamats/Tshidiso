'use client';

import { useEffect, useRef, useState } from 'react';

interface MicBlowProps {
  onBlow: () => void;
}

type Status = 'idle' | 'requesting' | 'listening' | 'denied';

export default function MicBlow({ onBlow }: MicBlowProps) {
  const [status, setStatus] = useState<Status>('idle');
  const cleanupRef = useRef<(() => void) | null>(null);

  const stop = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setStatus('idle');
  };

  const start = async () => {
    if (status === 'listening') { stop(); return; }
    try {
      setStatus('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      let loudFrames = 0;
      let raf = 0;
      let done = false;

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);

        // A real breath is a sustained low rumble — require ~150ms of it
        if (rms > 0.12) loudFrames++; else loudFrames = Math.max(0, loudFrames - 2);
        if (loudFrames >= 9 && !done) {
          done = true;
          onBlow();
          if (navigator.vibrate) navigator.vibrate([60, 60, 60]);
          teardown();
          setStatus('idle');
          return;
        }
        raf = requestAnimationFrame(tick);
      };

      const teardown = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach(t => t.stop());
        ctx.close().catch(() => {});
        cleanupRef.current = null;
      };
      cleanupRef.current = teardown;

      setStatus('listening');
      raf = requestAnimationFrame(tick);
    } catch {
      setStatus('denied');
      setTimeout(() => setStatus('idle'), 3200);
    }
  };

  useEffect(() => () => cleanupRef.current?.(), []);

  return (
    <div className="mic-blow">
      <button
        className={`mic-btn ${status === 'listening' ? 'listening' : ''}`}
        onClick={start}
        disabled={status === 'requesting'}
      >
        {status === 'idle' && '🎤 Or blow for real'}
        {status === 'requesting' && 'asking the stars...'}
        {status === 'listening' && '🌬️ I\'m listening — blow now!'}
        {status === 'denied' && 'no mic? a tap works too ♥'}
      </button>
      {status === 'listening' && <span className="mic-ring" />}
    </div>
  );
}
