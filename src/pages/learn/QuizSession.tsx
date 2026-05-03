import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../../store/journeyStore';

const QUESTIONS = [
  { q: 'What is the minimum voting age in India?', options: ['16 years', '18 years', '21 years', '25 years'], correct: 1, explanation: 'Article 326 of the Constitution sets it at 18. Changed from 21 by the 61st Amendment in 1988.' },
  { q: 'What does EVM stand for?', options: ['Electronic Voting Machine', 'Election Verification Method', 'Electronic Vote Manager', 'Election Voting Module'], correct: 0, explanation: 'EVMs were first used in 1982 in Kerala and have been used nationwide since 2004.' },
  { q: 'Who is the Chief Election Commissioner of India appointed by?', options: ['Prime Minister', 'Parliament', 'President of India', 'Supreme Court'], correct: 2, explanation: 'The President appoints the CEC under Article 324 of the Constitution.' },
  { q: 'What is NOTA?', options: ['National Organization for Transparent Administration', 'None Of The Above', 'New Online Tally Application', 'National Office of Technology Auditing'], correct: 1, explanation: 'NOTA was introduced in 2013 after a Supreme Court ruling, allowing voters to reject all candidates.' },
  { q: 'How long is the "silence period" before voting?', options: ['24 hours', '48 hours', '72 hours', '1 week'], correct: 1, explanation: 'Campaigning must stop 48 hours before polling to give voters time for uninfluenced decisions.' },
];

export default function QuizSession() {
  const navigate = useNavigate();
  const { addQuizScore, addXP, addBadge } = useJourneyStore();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  const question = QUESTIONS[current];

  const handleAnswer = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === question?.correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (current >= QUESTIONS.length - 1) {
      const finalScore = score + (selected === question?.correct ? 0 : 0);
      addQuizScore(finalScore);
      addXP(finalScore * 50);
      if (finalScore === 5) addBadge('quiz-master');
      setFinished(true);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  if (finished) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: 'var(--color-bg)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{score >= 4 ? '🏆' : score >= 2 ? '👍' : '📚'}</div>
        <h2 className="text-display">You scored {score}/5</h2>
        <p className="text-body" style={{ marginTop: 8, marginBottom: 24 }}>
          {score >= 4 ? 'Excellent! You\'re an election expert!' : score >= 2 ? 'Good job! Keep learning!' : 'Keep practicing — knowledge is power!'}
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span className="badge badge-saffron badge-pill">+{score * 50} XP</span>
          {score === 5 && <span className="badge badge-green badge-pill">🏅 Quiz Master</span>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/learn')}>Back to Learn</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => navigate('/learn')} aria-label="Close quiz" style={{ fontSize: 20, color: 'var(--color-text-primary)' }}>✕</button>
        <span className="text-section">Election Quiz</span>
        <span className="text-card text-success">Score: {score}/{current}{showAnswer ? '+1' : ''}</span>
      </div>

      {/* Progress pills */}
      <div className="step-pills" style={{ marginBottom: 20 }}>
        {QUESTIONS.map((_, i) => <div key={i} className={`step-pill${i <= current ? ' active' : ''}`} style={{ flex: 1 }} />)}
      </div>

      {streak >= 2 && <div className="badge badge-saffron badge-pill" style={{ marginBottom: 12 }}>🔥 {streak} correct in a row!</div>}

      {/* Question */}
      {question && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="badge badge-navy" style={{ marginBottom: 12 }}>Q{current + 1}</div>
            <div className="text-section">{question.q}</div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {question.options.map((opt, idx) => {
              let style = {};
              if (showAnswer) {
                if (idx === question.correct) style = { border: '1.5px solid var(--color-success)', background: 'var(--color-success-light)' };
                else if (idx === selected) style = { border: '1.5px solid var(--color-danger)', background: 'var(--color-danger-light)' };
              } else if (idx === selected) {
                style = { border: '1.5px solid var(--color-accent)', background: 'var(--color-accent-light)' };
              }
              return (
                <button key={idx} className="card" onClick={() => handleAnswer(idx)}
                  aria-label={`Option ${String.fromCharCode(65 + idx)}: ${opt}`}
                  style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, ...style }}>
                  <span className="text-caption" style={{ minWidth: 24 }}>{String.fromCharCode(65 + idx)}.</span>
                  <span className="text-card">{opt}</span>
                  {showAnswer && idx === question.correct && <span>✅</span>}
                  {showAnswer && idx === selected && idx !== question.correct && <span>❌</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showAnswer && (
            <div className="card animate-in" style={{ background: 'var(--navy-50)', marginBottom: 16 }}>
              <div className="text-card" style={{ color: 'var(--navy-900)', marginBottom: 4 }}>💡 Explanation</div>
              <div className="text-body">{question.explanation}</div>
            </div>
          )}

          {showAnswer && (
            <button className="btn btn-primary btn-full" onClick={handleNext}>
              {current >= QUESTIONS.length - 1 ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
