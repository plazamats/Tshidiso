'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { romanticAudio } from '../lib/romantic-audio';

const WAX_SEALS = [
  { icon: '💖', label: 'Heart' },
  { icon: '🌹', label: 'Rose' },
  { icon: '👑', label: 'Crown' },
  { icon: '🌙', label: 'Crescent' },
];

export default function WhisperBack() {
  const [note, setNote] = useState('');
  const [selectedSeal, setSelectedSeal] = useState(WAX_SEALS[0].icon);
  const [isSealed, setIsSealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tshidi_whisper_back');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.note) {
          setNote(parsed.note);
          setSelectedSeal(parsed.seal || WAX_SEALS[0].icon);
          setIsSealed(true);
        }
      }
    } catch {
      /* ignore storage error */
    }
  }, []);

  const handleSeal = () => {
    if (!note.trim()) return;
    setIsSealed(true);
    romanticAudio.playStardustChime(4);
    setTimeout(() => romanticAudio.playStardustChime(6), 200);
    if (navigator.vibrate) navigator.vibrate([40, 70, 50]);

    try {
      localStorage.setItem('tshidi_whisper_back', JSON.stringify({
        note: note.trim(),
        seal: selectedSeal,
        date: new Date().toLocaleDateString(),
      }));
    } catch {
      /* ignore */
    }
  };

  const handleEdit = () => {
    setIsSealed(false);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`My love, I just sealed a secret note in our universe: "${note.trim()}" ${selectedSeal} ♥`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`My love, here is my secret note from our universe: "${note.trim()}" ${selectedSeal} ♥`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="whisper-back-wrap">
      <div className="whisper-station">
        {!isSealed ? (
          <motion.div
            className="whisper-draft-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="draft-header">
              <span className="draft-icon">💌</span>
              <h3>Leave a Whisper in Our Universe</h3>
              <p>Write a secret note back to me. It will be sealed in starlight forever.</p>
            </div>

            <textarea
              className="whisper-textarea"
              rows={4}
              placeholder="My love, reading this made me feel... / I love you because..."
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={400}
            />

            <div className="seal-picker">
              <span>Choose your wax seal:</span>
              <div className="seal-options">
                {WAX_SEALS.map(s => (
                  <button
                    key={s.label}
                    className={`seal-btn ${selectedSeal === s.icon ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSeal(s.icon);
                      romanticAudio.playStardustChime(2);
                    }}
                  >
                    <span>{s.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="button glow-btn seal-action-btn"
              onClick={handleSeal}
              disabled={!note.trim()}
            >
              <span>{selectedSeal}</span> Seal With Wax &amp; Save Forever
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="whisper-sealed-card"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="envelope-top-crease" />
            <div className="wax-stamp-seal">
              <span>{selectedSeal}</span>
            </div>

            <div className="sealed-content">
              <p className="sealed-subtitle">✦ Tshidi&apos;s Secret Note Sealed in Starlight ✦</p>
              <blockquote className="sealed-quote">
                “{note}”
              </blockquote>
              <span className="sealed-sign">With all her love · Forever preserved</span>
            </div>

            <div className="sealed-actions">
              <button className="button glow-btn send-wa-btn" onClick={handleShareWhatsApp}>
                <span>💬</span> Send to His WhatsApp
              </button>
              <button className="button glow-btn copy-note-btn" onClick={handleCopy}>
                <span>{copied ? '✓ Copied' : '📋 Copy Note'}</span>
              </button>
              <button className="re-edit-btn" onClick={handleEdit}>
                <span>✎</span> Edit Note
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
