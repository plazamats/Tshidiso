'use client';

import { useMemo } from 'react';

const SYNODIC = 29.53058867;
const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14); // known new moon

const PHASE_NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
];

export default function MoonPhase() {
  const moon = useMemo(() => {
    const now = new Date();
    const days = (now.getTime() - NEW_MOON_REF) / 86400000;
    const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    const fraction = age / SYNODIC; // 0 = new, 0.5 = full
    const illuminated = Math.round((1 - Math.cos(2 * Math.PI * fraction)) / 2 * 100);
    const index = Math.round(fraction * 8) % 8;
    // shadow offset for CSS crescent illusion (-1..1)
    const offset = Math.cos(2 * Math.PI * fraction);
    return { name: PHASE_NAMES[index], illuminated, offset };
  }, []);

  return (
    <div className="moon-phase" aria-label={`Tonight's moon: ${moon.name}`}>
      <span
        className="moon-phase-disc"
        style={{ '--shadow-x': `${moon.offset * 68}%` } as React.CSSProperties}
      />
      <p className="moon-phase-text">
        Tonight&apos;s moon is a <b>{moon.name}</b> — {moon.illuminated}% full.
        <i>It still doesn&apos;t glow as bright as you do.</i>
      </p>
    </div>
  );
}
