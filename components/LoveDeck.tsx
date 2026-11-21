'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { romanticAudio } from '../lib/romantic-audio';

interface LoveCard {
  category: string;
  quote: string;
  detail: string;
  icon: string;
}

const LOVE_DECK: LoveCard[] = [
  // The Way You Love
  {
    category: 'The Way You Love',
    icon: '🌸',
    quote: 'You make love feel like coming home after a lifetime in the cold.',
    detail: 'Your kindness isn’t just a trait; it’s an aura that comforts everyone around you, especially me.',
  },
  {
    category: 'The Way You Love',
    icon: '🕊️',
    quote: 'You love with patience, grace, and an open heart.',
    detail: 'Even on the days when the world is chaotic, you hold my hand with steady certainty.',
  },
  {
    category: 'The Way You Love',
    icon: '💫',
    quote: 'Your empathy is the softest pillow my soul has ever rested on.',
    detail: 'You listen not just to my words, but to the silence between my thoughts.',
  },
  // Little Quirks Only I Know
  {
    category: 'Little Quirks Only I Know',
    icon: '✨',
    quote: 'The way your eyes crinkle right before you burst into uncontrollable laughter.',
    detail: 'That sound is my favorite melody in the world. I would do anything just to hear it every day.',
  },
  {
    category: 'Little Quirks Only I Know',
    icon: '🌙',
    quote: 'Your sleepy, soft voice when you first wake up or whisper goodnight.',
    detail: 'It is the sweetest sound on earth. It makes all the noise of the day simply vanish.',
  },
  {
    category: 'Little Quirks Only I Know',
    icon: '🍯',
    quote: 'The tiny dance you do when you eat your favorite food.',
    detail: 'It melts me every single time. You are ridiculously adorable without even trying.',
  },
  // How You Changed My World
  {
    category: 'How You Changed My World',
    icon: '🌅',
    quote: 'Before you, I didn’t know quiet peace could exist in a person.',
    detail: 'You rewrote the meaning of happiness for me. Being beside you is where life truly began.',
  },
  {
    category: 'How You Changed My World',
    icon: '💎',
    quote: 'You made me believe in miracles without ever trying.',
    detail: 'Just seeing you across the room reminds me that something pure and beautiful is real in this life.',
  },
  {
    category: 'How You Changed My World',
    icon: '🌿',
    quote: 'You taught me that love isn’t about perfection; it’s about choosing each other.',
    detail: 'Every sunrise with you is a gift, and every sunset is a memory I treasure forever.',
  },
  // Vows for Our Tomorrow
  {
    category: 'Vows for Our Tomorrow',
    icon: '💍',
    quote: 'I promise to love you on the easy sunny days, and ten times harder through the storms.',
    detail: 'When the road gets steep, you will never walk alone. I will be right beside you, holding you tight.',
  },
  {
    category: 'Vows for Our Tomorrow',
    icon: '🕯️',
    quote: 'I will spend my lifetime celebrating the incredible woman you are.',
    detail: 'Not just on your birthdays, but in the quiet Tuesday mornings and the late starlit nights.',
  },
  {
    category: 'Vows for Our Tomorrow',
    icon: '♾️',
    quote: 'I choose you. In every timeline, in every universe, forever.',
    detail: 'If I had to live a thousand lives, I would search for you in every single one.',
  },
];

const CATEGORIES = ['All', 'The Way You Love', 'Little Quirks Only I Know', 'How You Changed My World', 'Vows for Our Tomorrow'];

export default function LoveDeck() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIdx, setCurrentIdx] = useState(0);

  const filtered = activeCategory === 'All'
    ? LOVE_DECK
    : LOVE_DECK.filter(c => c.category === activeCategory);

  const card = filtered[currentIdx % filtered.length];

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % filtered.length);
    romanticAudio.playStardustChime(currentIdx % 8);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handlePrev = () => {
    setCurrentIdx(prev => (prev - 1 + filtered.length) % filtered.length);
    romanticAudio.playStardustChime((currentIdx + 4) % 8);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  return (
    <div className="love-deck-section">
      {/* Category Pills */}
      <div className="deck-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`deck-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat);
              setCurrentIdx(0);
              romanticAudio.playStardustChime(2);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Flip Card */}
      <div className="deck-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${card.category}-${currentIdx}`}
            className="love-card-3d"
            initial={{ opacity: 0, rotateY: 15, scale: 0.94 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -15, scale: 0.94 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -6, boxShadow: '0 20px 45px rgba(255, 105, 180, 0.28)' }}
          >
            <div className="card-foil-border" />
            <div className="card-inner">
              <div className="card-top">
                <span className="card-icon">{card.icon}</span>
                <span className="card-category-tag">{card.category}</span>
                <span className="card-counter">
                  {(currentIdx % filtered.length) + 1} / {filtered.length}
                </span>
              </div>

              <blockquote className="card-quote">
                “{card.quote}”
              </blockquote>

              <p className="card-detail">
                {card.detail}
              </p>

              <div className="card-watermark">
                <span>♥</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Deck Navigation Controls */}
        <div className="deck-nav-buttons">
          <button className="deck-btn" onClick={handlePrev} aria-label="Previous reason">
            ← Previous
          </button>
          <button className="button glow-btn draw-btn" onClick={handleNext}>
            <span>💌</span> Draw Next Reason <span>♥</span>
          </button>
          <button className="deck-btn" onClick={handleNext} aria-label="Next reason">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
