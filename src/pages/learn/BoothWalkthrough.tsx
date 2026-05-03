import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { icon: '🚶', title: 'Enter Queue', desc: 'Join the queue at your assigned polling station. Show your voter slip to the queue manager. Wait for your turn.' },
  { icon: '🪪', title: 'ID Verification', desc: 'Present your Voter ID (EPIC) to the presiding officer. They will check your name on the voter roll and verify your identity.' },
  { icon: '✋', title: 'Get Ink & Slip', desc: 'Indelible ink is applied to your left index finger. You receive a ballot slip. This ink lasts ~48 hours as proof of voting.' },
  { icon: '🗳️', title: 'Cast Your Vote', desc: 'Enter the voting booth. Press the blue button next to your chosen candidate on the EVM. Wait for the beep confirmation.' },
  { icon: '✅', title: 'VVPAT & Exit', desc: 'Check the VVPAT slip for 7 seconds to verify your vote. Exit the booth. Collect your voter slip receipt.' },
];

export default function BoothWalkthrough() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const step = STEPS[current];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="text-section">Booth Walk-Through</span>
        <span className="text-caption">Step {current + 1} of 5</span>
      </div>

      <div className="step-pills" style={{ padding: '0 16px', marginBottom: 16 }}>
        {STEPS.map((_, i) => <div key={i} className={`step-pill${i <= current ? ' active' : ''}`} style={{ flex: 1 }} />)}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {step && (
          <div className="animate-in" key={current} style={{ textAlign: 'center', maxWidth: 340 }}>
            <div style={{ width: 120, height: 120, borderRadius: 60, background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 56 }}>
              {step.icon}
            </div>
            <h2 className="text-title" style={{ marginBottom: 12 }}>Step {current + 1}: {step.title}</h2>
            <p className="text-body">{step.desc}</p>

            <div className="card" style={{ marginTop: 20, background: 'var(--saffron-50)', textAlign: 'left' }}>
              <div className="text-caption" style={{ color: 'var(--saffron-800)' }}>
                💡 Tip: {current === 0 ? 'Arrive between 9-10 AM for shorter queues.' :
                  current === 1 ? 'Keep your Voter ID ready before reaching the desk.' :
                  current === 2 ? 'The ink mark cannot be removed — don\'t try to wash it.' :
                  current === 3 ? 'You have full privacy in the booth. Take your time.' :
                  'Verify the VVPAT slip matches your intended vote.'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Previous</button>
        {current < STEPS.length - 1 ? (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setCurrent(c => c + 1)}>Next →</button>
        ) : (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/vote')}>Try EVM Simulator →</button>
        )}
      </div>
    </div>
  );
}
