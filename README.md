# Tshidi's Birthday Universe

A cinematic, interactive love letter — 19 chapters, hidden surprises, and a soundtrack.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Make it hers (2 minutes)

All words live in **`content/love-story.ts`** — names, dates, letters, poems, quiz answers, coupons, everything:

- `name` / `togetherSince` — her name and your anniversary (`YYYY-MM-DD`)
- `birthday` — set to her birthday as `MM-DD`; a golden crown banner appears automatically that day
- `letter` — the letter that types itself out and can be read aloud by the browser
- `timeCapsule.lines` — the letter "from ten years in the future"
- `quizQuestions` — edit questions/answers about *your* real story
- `coupons` — your own redeemable love coupons
- `openWhen` — the five sealed "open when…" letters
- `loveLanguages`, `reasons`, `memories`, `poems`, `loveNotes` — all editable

## Photos & music

1. Drop real photos into `public/memories/`, then replace the four Unsplash URLs for `.photo-1` … `.photo-4` in `app/globals.css` with `url('/memories/her-01.jpg')`.
2. Place an MP3 of your song at `public/audio/perfect-ed-sheeran.mp3`. The vinyl player loops it; the 3D heart nebula pulses to its bass and a live visualizer dances next to it. Music starts the moment she taps the intro heart.

## The experiences

Intro gate with fireworks → hero universe (3D heart + galaxy) → story timeline → live love timer (+ anniversary countdown + tonight's real moon phase) → reasons grid → daily love-note jar → five "open when…" letters → poems → photo gallery (keyboard-navigable lightbox) → self-typing letter with read-aloud voice → press-and-hold heartbeat → cake she can blow out **with her real breath** 🎤 → gift → rose garden (one rose per month together) → redeemable love coupons (saved between visits) → find-your-named-star sky + certificate → love quiz → wishes → promise → time capsule from the future → finale: grand fireworks show, drag-us-back-together interaction, "I love you" in 20 languages.

**Hidden magic:** type her name anywhere for a secret show · tab away and the browser tab whispers for you · go quiet for a minute and the site says something sweet · kisses counter keeps count forever · best quiz score is remembered.

## Performance

Static prerender, ~160 kB first load, fonts self-hosted via `next/font`, Three.js/GSAP-free critical path, all heavy scenes lazy-loaded after entry, canvases sleep on hidden tabs, full `prefers-reduced-motion` support.
