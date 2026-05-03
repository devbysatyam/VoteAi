import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SCENARIOS = [
  { q: 'What if my name is missing from the voter list?', a: "Don't worry! You can still cast a 'Tendered Vote'. Steps: 1) Ask the Presiding Officer 2) Fill Form 49P 3) Your vote is kept separate but counted if your claim is verified. You can also file a complaint with the ERO." },
  { q: 'Can I vote without Aadhaar card?', a: "Yes! Aadhaar is NOT mandatory for voting. You can use any of these: Voter ID (EPIC), Passport, Driving License, PAN Card, MNREGA Job Card, or any government photo ID." },
  { q: 'What if the EVM machine malfunctions?', a: "The Presiding Officer will replace the faulty EVM with a backup. Your vote is NOT lost. If your vote wasn't recorded before the malfunction, you get to vote again on the replacement machine." },
  { q: 'What happens if I arrive after 6 PM?', a: "If you were in the queue before 6 PM, you WILL be allowed to vote even if it takes hours. Polling officers cannot turn away anyone who joined the queue before the cutoff time." },
  { q: 'Can someone else vote on my behalf?', a: "No. Proxy voting is only allowed for Armed Forces personnel, government employees posted abroad, and their spouses. All others must vote in person." },
  { q: 'What if there is violence at the booth?', a: "The Presiding Officer can adjourn polling. Security forces are deployed at every booth. Report to the Election Commission immediately via 1950 helpline. A re-poll will be ordered if necessary." },
];

export default function ScenarioSim() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [customQ, setCustomQ] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 16 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="text-title">What If? Scenarios 🎭</h1>
          <div className="text-body">Learn what to do in tricky voting situations</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {SCENARIOS.map((s, i) => (
          <div key={i} className={expanded === i ? 'card-accent' : 'card'} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-card">{s.q}</div>
              <span style={{ fontSize: 16, transform: expanded === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </div>
            {expanded === i && (
              <div className="animate-in" style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <div className="text-body" style={{ lineHeight: 1.6 }}>{s.a}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="text-label" style={{ marginBottom: 8 }}>ASK YOUR OWN QUESTION</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" style={{ flex: 1 }} placeholder="What if...?" value={customQ} onChange={e => setCustomQ(e.target.value)} />
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>Ask AI</button>
        </div>
      </div>
    </div>
  );
}
