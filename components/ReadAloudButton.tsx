'use client';

import { useEffect, useRef, useState } from 'react';
import { story } from '../content/love-story';

export default function ReadAloudButton() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const voice = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const voices = speechSynthesis.getVoices();
      voice.current =
        voices.find(v => /female|zira|samantha|victoria|karen|moira|tessa/i.test(v.name) && v.lang.startsWith('en')) ??
        voices.find(v => v.lang.startsWith('en')) ??
        voices[0] ?? null;
    };
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      speechSynthesis.onvoiceschanged = null;
      speechSynthesis.cancel();
    };
  }, []);

  const stop = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  const start = () => {
    if (speaking) { stop(); return; }
    speechSynthesis.cancel();

    // Warm, intimate delivery: slower rate, soft pauses between lines
    story.letter.forEach((line, i) => {
      const utterance = new SpeechSynthesisUtterance(line);
      if (voice.current) utterance.voice = voice.current;
      utterance.rate = i === 0 ? 0.82 : 0.92;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      utterance.onend = () => {
        if (i === story.letter.length - 1) setSpeaking(false);
      };
      speechSynthesis.speak(utterance);
    });
    setSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button className={`read-aloud ${speaking ? 'speaking' : ''}`} onClick={start}>
      <span>{speaking ? '◼' : '▶'}</span> {speaking ? 'Stop reading' : story.readAloudLabel}
    </button>
  );
}
