import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../../store/journeyStore';

const CANDIDATES = [
  { id: 1, name: 'Rajesh Kumar', party: 'Bharatiya Janata Party', symbol: '🪷', color: '#FF9933' },
  { id: 2, name: 'Priya Singh', party: 'Indian National Congress', symbol: '🖐️', color: '#19AAED' },
  { id: 3, name: 'Amit Patel', party: 'Aam Aadmi Party', symbol: '🧹', color: '#0066B3' },
  { id: 4, name: 'Sunita Devi', party: 'Bahujan Samaj Party', symbol: '🐘', color: '#22409A' },
  { id: 5, name: 'Mohammed Khan', party: 'Independent', symbol: '⭐', color: '#666' },
  { id: 6, name: 'Vikram Yadav', party: 'Samajwadi Party', symbol: '🚲', color: '#FF0000' },
];

/** Generate a stable serial number (not on every render) */
function generateSerial(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function EVMSimulator() {
  const navigate = useNavigate();
  const { completeStep, addXP, addBadge } = useJourneyStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const [vvpatTimer, setVvpatTimer] = useState(7);

  /** Stable serial number — generated once, not on every render */
  const serialNumber = useMemo(() => generateSerial(), []);
  const voteTimestamp = useMemo(() => new Date().toLocaleString('en-IN'), []);

  const handleVote = (candidateId: number) => {
    if (voted || selected !== null) return;
    setSelected(candidateId);

    /* Beep sound */
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 200);
    } catch {
      /* Audio unavailable */
    }

    setTimeout(() => {
      setVoted(true);
      setShowVVPAT(true);
      let t = 7;
      const interval = setInterval(() => {
        t -= 1;
        setVvpatTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          completeStep(6);
          addXP(200);
          addBadge('first-vote');
        }
      }, 1000);
    }, 600);
  };

  const selectedCandidate = CANDIDATES.find(c => c.id === selected);

  /* ---- VVPAT SLIP SCREEN ---- */
  if (showVVPAT && selectedCandidate) {
    return (
      <div style={{ minHeight: '100vh', background: '#121212', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, color: '#E8E8E8' }}>
        <h2 className="text-title" style={{ color: '#E8E8E8', marginBottom: 24 }}>VVPAT Verification</h2>

        <div className="animate-in" style={{ background: '#FFF', color: '#121212', borderRadius: 8, padding: 24, width: '100%', maxWidth: 280, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', color: '#888', marginBottom: 12 }}>
            VOTER VERIFIABLE PAPER AUDIT TRAIL
          </div>
          <hr style={{ border: 'none', borderTop: '1px dashed #CCC', margin: '12px 0' }} />
          <div style={{ fontSize: 36, marginBottom: 8 }}>{selectedCandidate.symbol}</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedCandidate.name}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{selectedCandidate.party}</div>
          <hr style={{ border: 'none', borderTop: '1px dashed #CCC', margin: '12px 0' }} />
          <div style={{ fontSize: 11, color: '#999' }}>Serial: EVM-2026-{serialNumber}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{voteTimestamp}</div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ color: '#4CAF50', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
            ✅ Your vote has been recorded securely
          </div>
          {vvpatTimer > 0 ? (
            <div style={{ color: '#888', fontSize: 12 }}>
              Slip visible for <strong style={{ color: '#FFA726' }}>{vvpatTimer}</strong> seconds
            </div>
          ) : (
            <div style={{ color: '#4CAF50', fontSize: 12 }}>✓ VVPAT verified successfully</div>
          )}
        </div>

        {vvpatTimer <= 0 && (
          <div className="animate-in" style={{ marginTop: 24, width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/home')}>
              Back to Home
            </button>
            <button className="btn btn-full" onClick={() => navigate('/profile')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#E8E8E8', border: '1px solid #555' }}>
              View Badge 🏅
            </button>
          </div>
        )}

        <div className="text-caption" style={{ marginTop: 24, color: '#555', textAlign: 'center' }}>
          ⚠️ This is a practice simulation. No real vote was cast.
        </div>
      </div>
    );
  }

  /* ---- EVM MAIN SCREEN ---- */
  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#E8E8E8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #2A2A2A' }}>
        <button onClick={() => navigate(-1)} style={{ color: '#E8E8E8', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close">✕</button>
        <div className="text-section" style={{ color: '#E8E8E8' }}>EVM Simulator</div>
        <span className="badge badge-green badge-pill">Practice Mode</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Instructions */}
        <div style={{ background: '#1A237E', borderRadius: 8, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div style={{ fontSize: 12, color: '#C5CAE9' }}>
            Press the <strong style={{ color: '#64B5F6' }}>BLUE</strong> button next to your chosen candidate. Your vote is secret and final.
          </div>
        </div>

        {/* Ballot Unit */}
        <div style={{ background: '#1E1E1E', borderRadius: 8, border: '1px solid #333', overflow: 'hidden' }}>
          <div style={{ background: '#1A237E', padding: '10px 16px', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
            <span>BALLOT UNIT — VARANASI NORTH</span>
            <span>S/N: {serialNumber}</span>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', gap: 8, padding: '8px 16px', borderBottom: '1px solid #333', alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: voted ? '#4CAF50' : '#F44336' }} />
            <span style={{ fontSize: 11, color: '#888' }}>{voted ? 'VOTE RECORDED ✓' : 'READY — SELECT YOUR CANDIDATE'}</span>
          </div>

          {CANDIDATES.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderBottom: '1px solid #2A2A2A',
              background: selected === c.id ? 'rgba(76,175,80,0.1)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: 12, color: '#666', width: 20, textAlign: 'center' }}>{c.id}</span>
              <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{c.symbol}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#E8E8E8' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{c.party}</div>
              </div>
              <button
                onClick={() => handleVote(c.id)}
                disabled={voted || selected !== null}
                aria-label={`Vote for ${c.name}`}
                style={{
                  width: 40, height: 40, borderRadius: 6,
                  background: selected === c.id ? '#4CAF50' : '#2196F3',
                  border: 'none',
                  cursor: (voted || selected !== null) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: (voted || selected !== null) && selected !== c.id ? 0.2 : 1,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, padding: 12, background: '#1E1E1E', borderRadius: 8 }}>
          <div className="text-caption" style={{ color: '#666' }}>
            ⚠️ This is a practice simulation. No real vote is cast.
          </div>
        </div>
      </div>
    </div>
  );
}
