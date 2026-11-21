'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setSharedAnalyser } from '../lib/audio-bridge';

interface MusicPlayerProps {
  muted: boolean;
  onToggle: () => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  track: { title: string; artist: string };
}

export default function MusicPlayer({ muted, onToggle, audioRef, track }: MusicPlayerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [graphReady, setGraphReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceCreated = useRef(false);
  const rafRef = useRef(0);

  /* Build the audio graph once, on first unmute */
  useEffect(() => {
    if (muted) return;
    try {
      if (audioRef?.current && !sourceCreated.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = ctxRef.current ?? new AudioCtx();
          ctxRef.current = ctx;
          try {
            const source = ctx.createMediaElementSource(audioRef.current);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
            sourceCreated.current = true;
            setSharedAnalyser(analyser);
            setGraphReady(true);
            return;
          } catch {
            // MediaElementSource might throw if already connected or empty src
          }
        }
      }
    } catch {
      /* visualizer unavailable — eq bars fallback stays */
    }
  }, [muted, audioRef]);

  /* Draw live bars only while playing */
  useEffect(() => {
    if (muted || !analyserRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d')!;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      analyserRef.current!.getByteFrequencyData(data);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 10;
      const step = Math.floor(data.length / bars / 1.6);
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += data[i * step + j];
        const level = sum / step / 255;
        const h = Math.max(3, level * canvas.height);
        const grad = ctx2d.createLinearGradient(0, canvas.height - h, 0, canvas.height);
        grad.addColorStop(0, '#ffd99b');
        grad.addColorStop(1, '#ff65a3');
        ctx2d.fillStyle = grad;
        const bw = canvas.width / bars - 2.5;
        ctx2d.fillRect(i * (bw + 2.5), canvas.height - h, bw, h);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [muted]);

  useEffect(() => {
    if (muted && ctxRef.current?.state === 'running') ctxRef.current.suspend().catch(() => {});
    if (!muted && ctxRef.current?.state === 'suspended') ctxRef.current.resume().catch(() => {});
  }, [muted]);

  return (
    <motion.div
      className="floating-music-player"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className={`player-disc-btn ${!muted ? 'playing' : ''}`}
        onClick={onToggle}
        aria-label={muted ? 'Play soundtrack' : 'Pause soundtrack'}
      >
        <div className="vinyl-disc">
          <div className="vinyl-grooves" />
          <div className="vinyl-center">
            <span>♥</span>
          </div>
        </div>

        <div className="player-meta">
          <div className="track-info">
            <span className="track-title">{track.title}</span>
            <span className="track-artist">{track.artist}</span>
          </div>

          {!muted && graphReady ? (
            <canvas ref={canvasRef} width={64} height={20} className="live-eq" aria-hidden />
          ) : (
            <div className="eq-bars">
              <span className={`bar b1 ${!muted ? 'active' : ''}`} />
              <span className={`bar b2 ${!muted ? 'active' : ''}`} />
              <span className={`bar b3 ${!muted ? 'active' : ''}`} />
              <span className={`bar b4 ${!muted ? 'active' : ''}`} />
            </div>
          )}
        </div>
      </button>

      {/* Dedication Badge Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="player-dedication"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <span>🌹 Dedicated to Tshidi — Our Song</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
