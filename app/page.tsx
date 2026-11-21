'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Lenis from 'lenis';
import { story } from '../content/love-story';
import type { FireworksHandle } from '../components/Fireworks';
import IntroGate from '../components/IntroGate';
import ExperienceOrchestrator from '../components/ExperienceOrchestrator';

const UniverseCanvas = dynamic(() => import('../components/UniverseCanvas'), { ssr: false });
const FloatingPetals = dynamic(() => import('../components/FloatingPetals'), { ssr: false });
const ConfettiExplosion = dynamic(() => import('../components/ConfettiExplosion'), { ssr: false });
const Fireworks = dynamic(() => import('../components/Fireworks'), { ssr: false });
const LoveTimer = dynamic(() => import('../components/LoveTimer'), { ssr: false });
const DailyLoveJar = dynamic(() => import('../components/DailyLoveJar'), { ssr: false });
const MusicPlayer = dynamic(() => import('../components/MusicPlayer'), { ssr: false });
const OpenWhen = dynamic(() => import('../components/OpenWhen'), { ssr: false });
const HeartbeatMoment = dynamic(() => import('../components/HeartbeatMoment'), { ssr: false });
const LetterTypewriter = dynamic(() => import('../components/LetterTypewriter'), { ssr: false });
const ReadAloudButton = dynamic(() => import('../components/ReadAloudButton'), { ssr: false });
const LoveLanguages = dynamic(() => import('../components/LoveLanguages'), { ssr: false });
const ScrollProgress = dynamic(() => import('../components/ScrollProgress'), { ssr: false });
const MoonPhase = dynamic(() => import('../components/MoonPhase'), { ssr: false });
const RoseGarden = dynamic(() => import('../components/RoseGarden'), { ssr: false });
const TimeCapsule = dynamic(() => import('../components/TimeCapsule'), { ssr: false });
const KissButton = dynamic(() => import('../components/KissButton'), { ssr: false });
const MicBlow = dynamic(() => import('../components/MicBlow'), { ssr: false });
const StarRegistry = dynamic(() => import('../components/StarRegistry'), { ssr: false });
const FuseHearts = dynamic(() => import('../components/FuseHearts'), { ssr: false });
const LoveQuiz = dynamic(() => import('../components/LoveQuiz'), { ssr: false });
const ConstellationTracer = dynamic(() => import('../components/ConstellationTracer'), { ssr: false });
const SoulResonance = dynamic(() => import('../components/SoulResonance'), { ssr: false });
const EnchantedRose = dynamic(() => import('../components/EnchantedRose'), { ssr: false });
const LoveDeck = dynamic(() => import('../components/LoveDeck'), { ssr: false });
const SkyLanterns = dynamic(() => import('../components/SkyLanterns'), { ssr: false });
const WhisperBack = dynamic(() => import('../components/WhisperBack'), { ssr: false });
import photoOne from '../lib/WhatsApp Image 2026-11-13 at 11.07.16 (1).jpeg';
import photoTwo from '../lib/WhatsApp Image 2026-11-13 at 11.07.16.jpeg';
import photoThree from '../lib/WhatsApp Image 2026-11-13 at 11.07.17 (1).jpeg';
import photoFour from '../lib/WhatsApp Image 2026-11-13 at 11.07.17.jpeg';
import photoFive from '../lib/WhatsApp Image 2026-11-13 at 20.02.36.jpeg';

/* ─── Tiny helpers ─── */
const Sparkle = ({ className = '' }: { className?: string }) => <span className={`sparkle ${className}`}>✦</span>;

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        x: `${(i * 43 + i * 7) % 100}%`,
        y: `${(i * 29 + i * i) % 96}%`,
        s: 1.5 + (i % 4),
      })),
    []
  );
  return <div className="stars" aria-hidden>{stars.map(s => <i key={s.id} style={{ left: s.x, top: s.y, width: s.s, height: s.s, animationDelay: `${s.id * -0.15}s` }} />)}</div>;
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <motion.div
      className="section-intro"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 dangerouslySetInnerHTML={{ __html: title }} />
      {text && <p className="section-text">{text}</p>}
    </motion.div>
  );
}

/* ─── Birthday Website Universe ─── */
function BirthdayUniverse() {
  const [entered, setEntered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [letterOpen, setLetterOpen] = useState(false);
  const [cakeLit, setCakeLit] = useState(true);
  const [giftOpen, setGiftOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [cakeBlown, setCakeBlown] = useState(false);
  const [giftConfetti, setGiftConfetti] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [magicToast, setMagicToast] = useState(false);
  const [idleToast, setIdleToast] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const currentTrack = story.soundtrack[trackIndex];
  const isBirthdayToday = useMemo(() => {
    if (!story.birthday) return false;
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` === story.birthday;
  }, []);
  const anniversaryToday = useMemo(() => {
    const start = new Date(story.togetherSince);
    const now = new Date();
    return start.getMonth() === now.getMonth() && start.getDate() === now.getDate();
  }, []);
  const yearsTogether = useMemo(() => {
    const start = new Date(story.togetherSince);
    return Math.max(1, new Date().getFullYear() - start.getFullYear());
  }, []);
  const audioContext = useRef<AudioContext | null>(null);
  const soundtrack = useRef<HTMLAudioElement>(null);
  const finaleRef = useRef<HTMLElement>(null);
  const fireworksRef = useRef<FireworksHandle>(null);
  const lastPointerRef = useRef<number>(0);

  /* Lock scroll until she enters the universe */
  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [entered]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  /* Mount the 3D universe only after entry, once the browser is idle */
  useEffect(() => {
    if (!entered || canvasReady) return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    let timer: ReturnType<typeof setTimeout>;
    if (idle) idle(() => setCanvasReady(true));
    else timer = setTimeout(() => setCanvasReady(true), 350);
    return () => clearTimeout(timer);
  }, [entered, canvasReady]);

  /* Smooth scroll */
  useEffect(() => {
    if (!entered) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, [entered]);

  /* Fireworks on finale scroll */
  useEffect(() => {
    if (!entered) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShowFireworks(true); }, { threshold: 0.25 });
    if (finaleRef.current) obs.observe(finaleRef.current);
    return () => obs.disconnect();
  }, [entered]);

  /* Keyboard navigation for the photo modal */
  useEffect(() => {
    if (selectedMemory === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMemory(null);
      if (e.key === 'ArrowLeft') setSelectedMemory(m => m === null ? null : (m + galleryLabels.length - 1) % galleryLabels.length);
      if (e.key === 'ArrowRight') setSelectedMemory(m => m === null ? null : (m + 1) % galleryLabels.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedMemory]);

  /* Easter egg — type her name anywhere for the grand show */
  useEffect(() => {
    if (!entered) return;
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-story.name.toLowerCase().length);
      if (buffer === story.name.toLowerCase()) {
        buffer = '';
        triggerGrandShowRef.current();
        setMagicToast(true);
        setTimeout(() => setMagicToast(false), 4200);
        if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 60]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered]);

  /* Sweet tab title when she looks away */
  useEffect(() => {
    if (!entered) return;
    const original = document.title;
    const awayTitles = ['come back, my love ♥', 'the stars miss you ✦', `${story.name} was here ♥`, 'our universe is waiting...'];
    const onVisibility = () => {
      document.title = document.hidden
        ? awayTitles[Math.floor(Math.random() * awayTitles.length)]
        : original;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.title = original;
    };
  }, [entered]);

  /* Gentle reminder if she goes quiet */
  useEffect(() => {
    if (!entered) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIdleToast(true);
        setTimeout(() => setIdleToast(false), 5200);
        arm();
      }, 55000);
    };
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'pointermove', 'keydown', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach(ev => window.removeEventListener(ev, arm));
    };
  }, [entered]);

  /* Sound toggle */
  const toggleSound = useCallback(() => {
    setMuted(current => {
      const next = !current;
      if (!next && typeof window !== 'undefined') {
        const player = soundtrack.current;
        if (player) { player.volume = 0.38; player.play().catch(() => {}); }
      } else {
        soundtrack.current?.pause();
      }
      return next;
    });
  }, []);

  const advanceTrack = useCallback(() => {
    setTrackIndex(index => (index + 1) % story.soundtrack.length);
  }, []);

  useEffect(() => {
    const player = soundtrack.current;
    if (!player || muted) return;
    player.play().catch(() => {});
  }, [trackIndex, muted]);

  /* Entering the universe — unlock audio, celebrate */
  const enterUniverse = () => {
    setEntered(true);
    setMuted(false);
    const player = soundtrack.current;
    if (player) { player.volume = 0; player.play().catch(() => {}); }
    const fade = setInterval(() => {
      if (!soundtrack.current) return clearInterval(fade);
      soundtrack.current.volume = Math.min(0.38, soundtrack.current.volume + 0.04);
      if (soundtrack.current.volume >= 0.38) clearInterval(fade);
    }, 120);
    setTimeout(() => fireworksRef.current?.launchBurst(window.innerWidth * 0.5, window.innerHeight * 0.3, 'heart'), 700);
    setTimeout(() => fireworksRef.current?.launchBurst(window.innerWidth * 0.28, window.innerHeight * 0.24, 'double_heart'), 1500);
    setTimeout(() => fireworksRef.current?.launchBurst(window.innerWidth * 0.72, window.innerHeight * 0.26, 'rose_bloom'), 2300);
    if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
  };

  /* Cake blow */
  const blowCandles = () => {
    if (!cakeLit) return;
    setCakeLit(false);
    setCakeBlown(true);
    setShowFireworks(true);
    fireworksRef.current?.launchBurst(undefined, undefined, 'rose_bloom');
    setTimeout(() => setCakeBlown(false), 2500);
  };

  /* Gift open */
  const openGift = () => {
    if (giftOpen) return;
    setGiftOpen(true);
    setGiftConfetti(true);
    setShowFireworks(true);
    fireworksRef.current?.launchBurst(undefined, undefined, 'queen_crown');
    setTimeout(() => setGiftConfetti(false), 2500);
  };

  /* Manual single romantic firework burst */
  const triggerLoveFireworks = () => {
    setShowFireworks(true);
    fireworksRef.current?.launchBurst(
      window.innerWidth * (0.3 + Math.random() * 0.4),
      window.innerHeight * (0.2 + Math.random() * 0.25),
      'double_heart'
    );
  };

  /* Grand Orchestrated Birthday Show */
  const triggerGrandShow = () => {
    setShowFireworks(true);
    fireworksRef.current?.launchGrandShow();
  };
  const triggerGrandShowRef = useRef(triggerGrandShow);
  triggerGrandShowRef.current = triggerGrandShow;

  /* Cursor hearts & occasional stardust chime
     Performance fix: reuse a pool of DOM nodes instead of creating/destroying
     one on every pointer move. Also increase throttle gap 110→180ms. */
  const heartPoolRef = useRef<HTMLElement[]>([]);
  const heartPoolIdx = useRef(0);
  const HEART_POOL_SIZE = 12;

  useEffect(() => {
    if (!entered) return;
    const pool: HTMLElement[] = [];
    for (let i = 0; i < HEART_POOL_SIZE; i++) {
      const el = document.createElement('b');
      el.className = 'cursor-heart';
      el.style.opacity = '0';
      document.body.appendChild(el);
      pool.push(el);
    }
    heartPoolRef.current = pool;
    return () => { pool.forEach(el => el.remove()); };
  }, [entered]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!entered || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) return;
    const now = performance.now();
    if (now - lastPointerRef.current < 180) return;
    lastPointerRef.current = now;

    if (Math.random() < 0.06) {
    }

    const pool = heartPoolRef.current;
    if (pool.length === 0) return;
    const dot = pool[heartPoolIdx.current % HEART_POOL_SIZE];
    heartPoolIdx.current++;
    dot.textContent = Math.random() > 0.5 ? '♥' : '✦';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    dot.style.opacity = '1';
    // Reset animation
    dot.style.animation = 'none';
    dot.offsetHeight; // force reflow (single element, trivial)
    dot.style.animation = '';
    setTimeout(() => { dot.style.opacity = '0'; }, 700);
  };

  const galleryLabels = ['First smile', 'Golden hour', 'Just you', 'Beautiful days', 'A new memory'];
  const galleryImages = [photoOne, photoTwo, photoThree, photoFour, photoFive];

  return (
    <main onPointerMove={onPointerMove}>
      <audio ref={soundtrack} src={currentTrack.src} onEnded={advanceTrack} preload="none" />
      <FloatingPetals />
      <AnimatePresence>
        {cakeBlown && <ConfettiExplosion active={cakeBlown} originX={50} originY={55} />}
        {giftConfetti && <ConfettiExplosion active={giftConfetti} originX={50} originY={50} />}
      </AnimatePresence>
      <Fireworks ref={fireworksRef} active={showFireworks && entered} />

      {/* Floating Vinyl Music Dedication Widget */}
      {entered && <MusicPlayer muted={muted} onToggle={toggleSound} audioRef={soundtrack} track={currentTrack} />}

      {/* Journey progress bar */}
      {entered && <ScrollProgress />}

      {/* Kiss ritual */}
      {entered && <KissButton />}

      {/* ─── INTRO GATE ─── */}
      <AnimatePresence>
        {!entered && <IntroGate key="gate" onEnter={enterUniverse} />}
      </AnimatePresence>

      <Stars />

      {/* ─── NAV ─── */}
      <nav
        className={menuOpen ? 'nav-open' : ''}
        style={{ opacity: entered ? undefined : 0, pointerEvents: entered ? undefined : 'none' }}
      >
        <a className="brand" href="#top">T<span>♥</span>T</a>
        <button
          className="nav-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(open => !open)}
        >
          <span /><span /><span />
        </button>
        <div className="nav-links" id="primary-navigation">
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="#constellation" onClick={() => setMenuOpen(false)}>Stars</a>
          <a href="#timer" onClick={() => setMenuOpen(false)}>Our time</a>
          <a href="#reasons" onClick={() => setMenuOpen(false)}>Reasons</a>
          <a href="#resonance" onClick={() => setMenuOpen(false)}>Soul</a>
          <a href="#jar" onClick={() => setMenuOpen(false)}>Daily Love</a>
          <a href="#rose" onClick={() => setMenuOpen(false)}>Forever Rose</a>
          <a href="#lanterns" onClick={() => setMenuOpen(false)}>Lanterns</a>
          <a href="#whisper" onClick={() => setMenuOpen(false)}>Whisper</a>
          <a href="#finale" onClick={() => setMenuOpen(false)}>Forever</a>
        </div>
        <button className="sound" onClick={toggleSound} aria-label="Toggle sound">
          {muted ? '♩' : '♫'} <span>{muted ? 'Sound off' : 'Sound on'}</span>
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section id="top" className="hero">
        {canvasReady && <UniverseCanvas />}
        <div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" />
        <div className="moon"><span>♡</span></div>
        <div className="shooting shooting-one" /><div className="shooting shooting-two" /><div className="shooting shooting-three" />
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: entered ? 1 : 0, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2 }}
        >
          <div className="hero-card">
            <div className="hero-orbit" aria-hidden="true">
              <span>♥</span>
            </div>
            <p className="eyebrow glow-text">A universe made for one</p>
            <h1><span>Happy Birthday,</span><em>my beautiful Tshidi.</em></h1>
          </div>
          {isBirthdayToday && (
            <motion.p
              className="birthday-crown"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              👑 Today is officially your day, my queen 👑
            </motion.p>
          )}
          {!isBirthdayToday && anniversaryToday && (
            <motion.p
              className="birthday-crown"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              ♥ Today marks {yearsTogether} year{yearsTogether === 1 ? '' : 's'} since our first hello ♥
            </motion.p>
          )}
          <p className="hero-sub">You are the most beautiful chapter<br />of my life.</p>
          <a className="button glow-btn" href="#story">Begin our story <span>↓</span></a>
        </motion.div>
        <div className="floating rose">✿</div>
        <div className="floating butterfly">🦋</div>
        <div className="floating lantern">✦</div>
        <div className="floating star-float">⭐</div>
        <div className="hero-bottom"><span>scroll to wander</span><i /></div>
      </section>

      {/* ─── STORY / TIMELINE ─── */}
      <section id="story" className="story section">
        <SectionIntro
          eyebrow="01 — The constellation of us"
          title="Our story"
          text="A few little stars from the beautiful universe we are building together."
        />
        <div className="timeline">
          {story.memories.map((memory, i) => (
            <motion.article
              className="memory"
              key={memory.date}
              initial={{ opacity: 0, y: 40, x: i % 2 ? 30 : -30 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
            >
              <span className="memory-no">0{i + 1}</span>
              <div>
                <p>{memory.date}</p>
                <h3>{memory.title}</h3>
                <span>{memory.note}</span>
              </div>
              <span className="memory-emoji">{memory.emoji}</span>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ─── CONSTELLATION TRACER ─── */}
      <section id="constellation" className="constellation-section section">
        <SectionIntro
          eyebrow="02 — Written in the heavens"
          title="Trace our<br /><i>constellation</i>"
          text="Connect the glowing stars of our love story to illuminate the celestial heart of us."
        />
        {entered && <ConstellationTracer />}
      </section>

      {/* ─── LOVE TIMER ─── */}
      <section id="timer" className="timer-section section">
        <SectionIntro
          eyebrow="03 — A little reminder"
          title="Every heartbeat<br /><i>with you</i>"
          text="The best part of our story is every moment we get to share."
        />
        <LoveTimer />
        {entered && <MoonPhase />}
      </section>

      {/* ─── REASONS & LOVE DECK ─── */}
      <section id="reasons" className="reasons section">
        <SectionIntro
          eyebrow="04 — Little things, infinite love"
          title="Reasons why<br /><i>I love you</i>"
          text="Twelve memories in starlight, plus an infinite deck of tender reasons."
        />
        <div className="reason-grid">
          {story.reasons.map((reason, i) => (
            <motion.div
              className="reason-card"
              key={reason}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -10, rotateX: 5, rotateY: i % 2 ? -5 : 5 }}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <p>{reason}</p>
              <b>✦</b>
            </motion.div>
          ))}
        </div>
        <p className="more-reasons">... and a million more, written in all the moments still to come.</p>

        {entered && (
          <div style={{ marginTop: '54px', width: '100%' }}>
            <SectionIntro
              eyebrow="The Infinite Love Deck"
              title="Draw a card from<br /><i>my soul</i>"
              text="Explore deep devotion, little quirks I adore, and vows for our tomorrow."
            />
            <LoveDeck />
          </div>
        )}
      </section>

      {/* ─── DAILY LOVE NOTES JAR ─── */}
      <section id="jar" className="jar-section section">
        <SectionIntro
          eyebrow="05 — Sweet daily affirmations"
          title="A love note<br /><i>for every day</i>"
          text="Open the jar to reveal a secret love note written exclusively for you."
        />
        <DailyLoveJar />
      </section>

      {/* ─── SOUL RESONANCE ─── */}
      <section id="resonance" className="resonance-section section">
        <SectionIntro
          eyebrow="06 — Two souls, one rhythm"
          title="Feel my touch<br /><i>across the distance</i>"
          text="Place and rest your thumb here. Feel our heartbeats synchronize into eternal harmony."
        />
        {entered && <SoulResonance />}
      </section>

      {/* ─── OPEN WHEN... LETTERS ─── */}
      <section id="openwhen" className="openwhen-section section">
        <SectionIntro
          eyebrow="07 — Sealed with my whole heart"
          title="Open when…<br /><i>you need me most</i>"
          text="Five sealed letters, each written for a different moment. Break a seal whenever your heart asks for it."
        />
        <OpenWhen />
      </section>

      {/* ─── POEMS ─── */}
      <section className="poems-section section">
        <SectionIntro
          eyebrow="08 — Words from my soul"
          title="Poems for<br /><i>my queen</i>"
        />
        <div className="poems-grid">
          {story.poems.map((poem, i) => (
            <motion.div
              className="poem-card"
              key={poem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
            >
              <h3>{poem.title}</h3>
              <div className="poem-lines">
                {poem.lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
              <Sparkle />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section className="gallery section">
        <SectionIntro
          eyebrow="09 — A thousand moments"
          title="Your memories"
          text="Every photograph is a doorway back to a feeling."
        />
        <div className="photo-wall">
          {galleryLabels.map((label, i) => (
            <button
              className={`photo photo-${i + 1}`}
              key={label}
              style={{ backgroundImage: `url("${galleryImages[i].src}")` }}
              onClick={() => setSelectedMemory(i)}
            >
              <span className="photo-shine" />
              <span>{label}</span>
              <i>↗</i>
            </button>
          ))}
        </div>
      </section>

      {/* ─── LETTER ─── */}
      <section id="letter" className="letter-section section">
        <SectionIntro eyebrow="10 — Written in starlight" title="A letter to Tshidi" />
        <motion.div
          className={`paper ${letterOpen ? 'open' : ''}`}
          onClick={() => !letterOpen && setLetterOpen(true)}
          whileHover={{ y: -5 }}
        >
          <div className="paper-seal">♥</div>
          {letterOpen ? (
            <>
              <LetterTypewriter lines={story.letter} />
              <ReadAloudButton />
            </>
          ) : (
            <p className="tap-to-open">Tap to unfold my heart</p>
          )}
        </motion.div>
      </section>

      {/* ─── ENCHANTED FOREVER ROSE ─── */}
      <section id="rose" className="enchanted-rose-outer section">
        <SectionIntro
          eyebrow="11 — In eternal bloom"
          title="The enchanted rose of<br /><i>our love</i>"
          text="Suspended in crystal and starlight. Tap to send a heartbeat or whisper a secret to the petals."
        />
        {entered && <EnchantedRose />}
      </section>

      {/* ─── HEART ─── */}
      <section className="heart-section section">
        <SectionIntro eyebrow="12 — Beyond any number" title="The heart of our love" />
        <div className="heart-wrap">
          <div className="big-heart">
            <span>♥</span>
            <i>100<small>%</small></i>
          </div>
          <p>My love for you has no limit.</p>
        </div>
        <HeartbeatMoment />
      </section>

      {/* ─── CAKE ─── */}
      <section className="cake-section section">
        <SectionIntro eyebrow="13 — Make a wish" title="A birthday wish for<br /><i>my queen</i>" />
        <button className={`cake-scene ${cakeLit ? '' : 'blown'}`} onClick={blowCandles}>
          <div className="cake-top">
            <div className="flame">🕯️</div>
            <div className="flame">🕯️</div>
            <div className="flame">🕯️</div>
          </div>
          <div className="cake-body"><span>for Tshidi</span></div>
          <div className="cake-plate" />
        </button>
        <p className="cake-note">{cakeLit ? '✨ Tap the candles and make a beautiful wish.' : '🌟 Your wish is on its way to the stars. ✦'}</p>
        {cakeLit && entered && <MicBlow onBlow={blowCandles} />}
      </section>

      {/* ─── GIFT ─── */}
      <section className="gift-section section">
        <SectionIntro eyebrow="14 — One more thing" title="A gift from<br /><i>my heart</i>" />
        <button className={`gift ${giftOpen ? 'gift-open' : ''}`} onClick={openGift}>
          <div className="gift-lid" />
          <div className="gift-box"><span>♥</span></div>
          {giftOpen && (
            <motion.div className="gift-message" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: -95 }}>
              Your greatest gift<br />will always be my heart.
            </motion.div>
          )}
        </button>
        <p className="cake-note">{giftOpen ? '💝 A thousand hearts, and every one is yours.' : '🎁 Tap to unwrap a little piece of forever.'}</p>
      </section>

      {/* ─── ROSE GARDEN ─── */}
      <section className="rose-section section">
        <SectionIntro
          eyebrow="15 — Counted in blooms"
          title="A garden that<br /><i>grows with us</i>"
        />
        <RoseGarden />
      </section>

      {/* ─── STAR REGISTRY ─── */}
      <section className="star-section section">
        <SectionIntro
          eyebrow="17 — Written in the sky"
          title={story.starRegistry.title}
          text={story.starRegistry.intro}
        />
        {entered && <StarRegistry />}
      </section>

      {/* ─── SKY LANTERNS ─── */}
      <section id="lanterns" className="lanterns-section section">
        <SectionIntro
          eyebrow="18 — The wishing sky"
          title="Release a lantern to<br /><i>the cosmos</i>"
          text="Light a golden candle, make a wish for our future, and watch it rise into the quiet starlit heavens."
        />
        {entered && <SkyLanterns />}
      </section>

      {/* ─── LOVE QUIZ ─── */}
      <section className="quiz-section section">
        <SectionIntro
          eyebrow="19 — Class is in session"
          title={story.quiz.title}
          text={story.quiz.intro}
        />
        {entered && <LoveQuiz />}
      </section>

      {/* ─── BIRTHDAY WISHES ─── */}
      <section className="wishes section">
        <div className="wish-glass">
          <Sparkle className="wish-spark one" />
          <Sparkle className="wish-spark two" />
          <Sparkle className="wish-spark three" />
          <Sparkle className="wish-spark four" />
          <p className="eyebrow">20 — Every word is true</p>
          <h2>Happy Birthday,<br /><i>my love.</i></h2>
          <div className="wish-text">
            <p>Thank you for bringing happiness, peace, and love into my life. Every day with you feels like a blessing, and every smile you give me becomes one of my favorite memories.</p>
            <p>Today I celebrate the incredible woman you are. I pray that your dreams come true, your heart always stays full of joy, and that this new year of your life brings you endless happiness.</p>
            <p>No matter what happens in life, I promise to continue choosing you, loving you, supporting you, and standing beside you.</p>
          </div>
          <p className="signature">
            Happy Birthday, Tshidi.<br />
            I love you more than words could ever explain.<br />
            <span>♥ Forever Yours ♥</span>
          </p>
        </div>
      </section>

      {/* ─── PROMISE ─── */}
      <section className="promise-section section">
        <motion.div
          className="promise-card"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1 }}
        >
          <div className="promise-glow" />
          <p className="eyebrow">21 — An eternal vow</p>
          <h2>{story.finalMessage.title}</h2>
          <p className="promise-text">{story.finalMessage.text}</p>
          <div className="promise-hearts">
            <span>♥</span><span>♥</span><span>♥</span>
          </div>
        </motion.div>
      </section>

      {/* ─── TIME CAPSULE ─── */}
      <section className="capsule-section section">
        <SectionIntro
          eyebrow="22 — Ten years from now"
          title="A letter that<br /><i>travelled through time</i>"
        />
        {entered && <TimeCapsule />}
      </section>

      {/* ─── WHISPER BACK ─── */}
      <section id="whisper" className="whisper-section section">
        <SectionIntro
          eyebrow="23 — A whisper in return"
          title="Leave a secret note in<br /><i>our universe</i>"
          text="Write a love note back to me. Seal it with warm wax and starlight, or send it straight to my phone."
        />
        {entered && <WhisperBack />}
      </section>

      {/* ─── FINALE ─── */}
      <section id="finale" className="finale" ref={finaleRef}>
        <div className="fireworks-bg"><i /><i /><i /><i /><i /><i /></div>
        <div className="final-heart">♥</div>
        <p className="eyebrow">24 — And then, forever</p>
        <h2>I love you,<br /><em>Tshidi.</em></h2>
        <p>Some loves are not a moment.<br />They are an entire universe.</p>
        <div className="finale-actions">
          <button className="button glow-btn firework-grand-btn" onClick={triggerGrandShow}>
            <span>🎆</span> Play Grand Birthday Fireworks Show <span>✨</span>
          </button>
          <button className="button glow-btn firework-btn" onClick={triggerLoveFireworks}>
            <span>🌹</span> Spark Love Fireworks <span>♥</span>
          </button>
          <a className="button replay glow-btn" href="#top">Replay our love story <span>↟</span></a>
        </div>
        <p className="fireworks-hint">✦ Tap, click, or drag anywhere on your screen to draw sparkling starlight &amp; fireworks ✦</p>
        <small className="magic-hint">{story.magicWordHint}</small>
        {entered && (
          <FuseHearts
            onMerge={() => {
              setShowFireworks(true);
              fireworksRef.current?.launchBurst(window.innerWidth * 0.5, window.innerHeight * 0.35, 'double_heart');
            }}
          />
        )}
        <div className="love-languages-wrap">
          <p className="eyebrow">in every language, in every lifetime</p>
          {entered && <LoveLanguages />}
        </div>
        <footer>♥ Forever &amp; Always ♥<br /><small>Happy Birthday, My Queen.</small></footer>
      </section>

      {/* ─── EASTER EGG TOAST ─── */}
      <AnimatePresence>
        {magicToast && (
          <motion.div
            className="magic-toast"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            ✨ You found the magic word — she really is unforgettable ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PHOTO MODAL ─── */}
      <AnimatePresence>
        {selectedMemory !== null && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMemory(null)}>
            <button>×</button>
            <div
              className={`modal-photo photo-${selectedMemory + 1}`}
              style={{ backgroundImage: `url("${galleryImages[selectedMemory].src}")` }}
              onClick={e => e.stopPropagation()}
            >
              <span>{galleryLabels[selectedMemory]}</span>
              <small className="modal-counter">{selectedMemory + 1} / {galleryLabels.length}</small>
              <div className="modal-nav">
                <button
                  aria-label="Previous memory"
                  onClick={() => setSelectedMemory(m => m === null ? null : (m + galleryLabels.length - 1) % galleryLabels.length)}
                >←</button>
                <button
                  aria-label="Next memory"
                  onClick={() => setSelectedMemory(m => m === null ? null : (m + 1) % galleryLabels.length)}
                >→</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── IDLE LOVE TOAST ─── */}
      <AnimatePresence>
        {idleToast && entered && (
          <motion.div
            className="idle-toast"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
          >
            still here? good — you are always the best part of my day ♥
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ─── Experience Orchestrator Entrypoint ─── */
export default function Home() {
  return (
    <ExperienceOrchestrator>
      <BirthdayUniverse />
    </ExperienceOrchestrator>
  );
}
