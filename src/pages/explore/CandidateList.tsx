import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { REAL_CANDIDATES } from '../../data/educationContent';

export default function CandidateList() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState('All');
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [compareList, setCompareList] = useState<number[]>([]);

  const parties = ['All', ...new Set(REAL_CANDIDATES.map(c => c.party.split(' ').pop() || c.party))];

  const filtered = filter === 'All'
    ? REAL_CANDIDATES
    : REAL_CANDIDATES.filter(c => c.party.includes(filter));

  const toggleFlip = (id: number) => {
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: number) => {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="text-title">Know Your Candidates</h1>
      </div>
      <div className="badge badge-navy badge-pill" style={{ marginBottom: 12 }}>
        {user?.constituency || 'Unknown Constituency'} — {user?.state || 'Unknown State'}
      </div>

      {/* Filters */}
      <div className="carousel" style={{ marginBottom: 16, paddingBottom: 4 }}>
        {parties.map(p => (
          <button key={p} className={`btn btn-sm ${filter === p ? 'btn-accent-light' : 'btn-secondary'}`}
            onClick={() => setFilter(p)}>{p}</button>
        ))}
      </div>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div className="card-accent" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-caption">{compareList.length} selected for comparison</div>
          <button className="btn btn-sm btn-primary" onClick={() => {
            const names = compareList.map(id => REAL_CANDIDATES.find(c => c.id === id)?.name).join(' vs ');
            navigate('/chat', { state: { prompt: `Compare candidates: ${names}` } });
          }}>⚖️ Compare with AI</button>
        </div>
      )}

      {/* Candidate Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {filtered.map(c => (
          <div key={c.id} className="card" style={{ minHeight: 200, padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
            {/* Compare checkbox */}
            <label style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, cursor: 'pointer' }}
              onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={compareList.includes(c.id)}
                onChange={() => toggleCompare(c.id)} style={{ width: 18, height: 18 }} />
            </label>

            <div onClick={() => toggleFlip(c.id)} style={{ padding: 14 }}>
              {!flipped.has(c.id) ? (
                /* Front */
                <>
                  <div style={{ height: 4, background: c.color, borderRadius: 4, marginBottom: 12, width: '100%' }} />
                  <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>{c.symbol}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{c.name}</div>
                  <div className="text-caption" style={{ textAlign: 'center' }}>{c.party}</div>
                  <div className="text-caption" style={{ textAlign: 'center', marginTop: 4 }}>Age: {c.age}</div>
                  <div className="text-caption" style={{ textAlign: 'center', color: 'var(--color-accent)', marginTop: 8, fontSize: 10 }}>
                    Tap for details →
                  </div>
                </>
              ) : (
                /* Back */
                <div className="animate-in">
                  <div className="text-label" style={{ marginBottom: 6 }}>PROFILE</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11 }}>
                    <div>📚 <strong>Education:</strong> {c.education}</div>
                    <div>💰 <strong>Assets:</strong> {c.assets}</div>
                    <div>📊 <strong>Liabilities:</strong> {c.liabilities}</div>
                    <div>⚖️ <strong>Cases:</strong> {c.cases > 0 ? `${c.cases} pending` : 'None'}</div>
                    <div>🏅 <strong>Exp:</strong> {c.experience}</div>
                    {c.promises.total > 0 && (
                      <div>
                        📈 <strong>Promises:</strong> {c.promises.kept}/{c.promises.total} kept
                        <div className="progress-bar" style={{ marginTop: 4 }}>
                          <div className="progress-fill" style={{ width: `${(c.promises.kept / c.promises.total) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-label" style={{ marginTop: 8, marginBottom: 4 }}>MANIFESTO</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                    {c.manifesto.map((m, i) => <div key={i}>• {m}</div>)}
                  </div>
                  <div className="text-caption" style={{ textAlign: 'center', color: 'var(--color-accent)', marginTop: 6, fontSize: 10 }}>
                    ← Tap to flip back
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary btn-full" onClick={() => navigate('/chat')}>
        💬 Ask AI About Candidates
      </button>
    </div>
  );
}
