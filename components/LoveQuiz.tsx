'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { story } from '../content/love-story';

const BEST_KEY = 'tshidi-quiz-best';

export default function LoveQuiz() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const finished = step >= story.quizQuestions.length;

  const pick = (index: number) => {
    if (picked !== null) return;
    setPicked(index);
    if (index === story.quizQuestions[step].answer) setScore(s => s + 1);
  };

  const next = () => {
    if (step + 1 >= story.quizQuestions.length) {
      const finalScore = score;
      setStep(s => s + 1);
      try {
        const saved = localStorage.getItem(BEST_KEY);
        const prev = saved ? parseInt(saved, 10) : -1;
        if (finalScore > prev) {
          localStorage.setItem(BEST_KEY, String(finalScore));
          setBest(finalScore);
        } else setBest(prev);
      } catch { /* private mode */ }
      return;
    }
    setStep(s => s + 1);
    setPicked(null);
  };

  const restart = () => {
    setStep(0);
    setPicked(null);
    setScore(0);
  };

  const resultLine = score === story.quizQuestions.length
    ? story.quiz.perfectLine
    : score >= Math.ceil(story.quizQuestions.length * 0.6)
      ? story.quiz.greatLine
      : story.quiz.sweetLine;

  return (
    <div className="quiz-wrap">
      {!finished && (
        <div className="quiz-progress" aria-hidden>
          {story.quizQuestions.map((_, i) => (
            <span key={i} className={`quiz-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={step}
            className="quiz-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.45 }}
          >
            <p className="quiz-count">question {step + 1} of {story.quizQuestions.length}</p>
            <h3 className="quiz-question">{story.quizQuestions[step].q}</h3>
            <div className="quiz-options">
              {story.quizQuestions[step].options.map((option, i) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    picked === null ? '' :
                    i === story.quizQuestions[step].answer ? 'correct' :
                    i === picked ? 'wrong' : 'dim'
                  }`}
                  onClick={() => pick(i)}
                >
                  <span>{String.fromCharCode(65 + i)}</span> {option}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {picked !== null && (
                <motion.div
                  className="quiz-reveal"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>
                    {picked === story.quizQuestions[step].answer
                      ? story.quizQuestions[step].reveal
                      : story.quiz.wrongReveal}
                  </p>
                  <button className="button glow-btn quiz-next" onClick={next}>
                    {step + 1 === story.quizQuestions.length ? 'see my results' : 'next question'} <span>→</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="quiz-result"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          >
            <span className="quiz-score-heart">♥</span>
            <h3>{score} / {story.quizQuestions.length}</h3>
            <p className="quiz-result-line">{resultLine}</p>
            {best !== null && best > 0 && (
              <small className="quiz-best">personal best: {best}/{story.quizQuestions.length} — kept safe like all our memories</small>
            )}
            <button className="button glow-btn quiz-again" onClick={restart}>
              ↺ take it again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
