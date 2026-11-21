'use client';

import { useEffect, useRef, useState } from 'react';

interface LetterTypewriterProps {
  lines: string[];
}

export default function LetterTypewriter({ lines }: LetterTypewriterProps) {
  const [typed, setTyped] = useState<string[]>(() => lines.map(() => ''));
  const [done, setDone] = useState(false);
  const buffer = useRef<string[]>(lines.map(() => ''));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skip = useRef(false);

  useEffect(() => {
    skip.current = false;
    buffer.current = lines.map(() => '');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(lines);
      setDone(true);
      return;
    }

    let lineIndex = 0;
    let charIndex = -1;

    const advance = () => {
      if (skip.current) return;
      const line = lines[lineIndex];
      charIndex += 1;
      buffer.current[lineIndex] = line.slice(0, charIndex + 1);
      setTyped(buffer.current.slice());

      if (charIndex + 1 < line.length) {
        timer.current = setTimeout(advance, 17);
      } else if (lineIndex + 1 < lines.length) {
        lineIndex += 1;
        charIndex = -1;
        timer.current = setTimeout(advance, 340);
      } else {
        setDone(true);
      }
    };

    timer.current = setTimeout(advance, 260);

    return () => {
      skip.current = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lines]);

  const finishInstantly = () => {
    if (done || skip.current) return;
    skip.current = true;
    if (timer.current) clearTimeout(timer.current);
    setTyped(lines);
    setDone(true);
  };

  return (
    <div className="letter-words" onClick={finishInstantly}>
      {typed.map((text, i) => {
        const isCaretLine = !done && text.length > 0 && typed.slice(i + 1).every(t => t.length === 0);
        return (
          <p key={i} className={i === 0 ? 'letter-greeting' : ''}>
            {text}
            {isCaretLine && <span className="caret" />}
          </p>
        );
      })}
      {!done && <small className="letter-skip">writing... tap to reveal it all</small>}
    </div>
  );
}
