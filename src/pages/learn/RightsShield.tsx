import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RIGHTS = [
  { title: 'Right to Vote', body: 'Every Indian citizen above 18 has the right to vote, regardless of caste, creed, religion, or gender.', source: 'Article 326, Constitution of India' },
  { title: 'Right to Secret Ballot', body: 'Your vote is completely secret. No one can force you to reveal who you voted for.', source: 'Section 128, RPA 1951' },
  { title: 'Cannot Be Turned Away', body: 'If your name appears on the voter roll, no official can deny you the right to vote.', source: 'Section 62, RPA 1951' },
  { title: 'Right to Assistance', body: 'Disabled or blind voters can bring a companion to help them vote.', source: 'Rule 49N, Conduct of Elections Rules' },
  { title: 'Right to NOTA', body: 'You can reject all candidates by pressing the NOTA button on the EVM.', source: 'Supreme Court, 2013' },
  { title: 'Right to Challenge', body: 'If someone voted in your name, you can still cast a "tendered vote".', source: 'Rule 49P, Conduct of Elections Rules' },
  { title: 'Protection from Influence', body: 'It is illegal for anyone to bribe, threaten, or coerce you to vote a certain way.', source: 'Section 171B, IPC' },
  { title: 'Right to Complain', body: 'You can file complaints about irregularities with the Election Commission.', source: 'ECI Guidelines' },
  { title: 'Right to Information', body: 'Candidates must disclose criminal records, assets, and educational qualifications.', source: 'Supreme Court, 2003' },
  { title: 'Right to Re-poll', body: 'If the EVM malfunctions or booth capturing occurs, a re-poll is ordered.', source: 'Section 58A, RPA 1951' },
];

export default function RightsShield() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const right = RIGHTS[current];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="text-section">Know Your Rights 🛡️</span>
        <span className="text-caption">{current + 1}/{RIGHTS.length}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p className="text-body" style={{ marginBottom: 16 }}>Swipe to learn your voter rights</p>

        {/* Flashcard */}
        {right && (
          <div className="card-elevated animate-in" key={current} style={{ maxWidth: 340, width: '100%', textAlign: 'center', padding: 24 }}>
            <div style={{ background: 'var(--navy-900)', color: '#FFF', padding: '8px 16px', borderRadius: '8px 8px 0 0', margin: '-24px -24px 20px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em' }}>
              RIGHT #{current + 1} OF {RIGHTS.length}
            </div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
            <h2 className="text-section" style={{ marginBottom: 12 }}>{right.title}</h2>
            <p className="text-body" style={{ marginBottom: 16 }}>{right.body}</p>
            <div className="text-caption">— {right.source}</div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Previous</button>
          <button className="btn btn-primary" onClick={() => setCurrent(c => Math.min(RIGHTS.length - 1, c + 1))} disabled={current === RIGHTS.length - 1}>Next →</button>
        </div>

        {/* Dots */}
        <div className="step-pills" style={{ marginTop: 20, justifyContent: 'center' }}>
          {RIGHTS.map((_, i) => <div key={i} className={`step-pill${i === current ? ' active' : ''}`} style={{ width: 8, height: 8, borderRadius: 4 }} />)}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn-sm btn-ghost">🔊 Read Aloud</button>
        <button className="btn btn-sm btn-ghost">📤 Share</button>
      </div>
    </div>
  );
}
