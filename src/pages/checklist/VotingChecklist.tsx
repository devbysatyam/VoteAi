import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../../store/journeyStore';

const CHECKLIST = [
  { section: 'DOCUMENTS', items: [
    { id: 'epic', label: 'Voter ID Card (EPIC)', required: true },
    { id: 'aadhaar', label: 'Aadhaar Card (backup ID)', required: false },
    { id: 'slip', label: 'Voter slip from BLO', required: false },
  ]},
  { section: 'WHAT TO WEAR', items: [
    { id: 'shoes', label: 'Comfortable walking shoes', required: false },
    { id: 'clothes', label: 'Light cotton clothes', required: false },
    { id: 'sun', label: 'Sun protection (hat/umbrella)', required: false },
  ]},
  { section: 'WHAT TO AVOID', items: [
    { id: 'phone', label: 'No phones in voting booth', required: true },
    { id: 'symbols', label: 'No party symbols on clothing', required: true },
    { id: 'influence', label: 'No influencing others in queue', required: true },
  ]},
];

export default function VotingChecklist() {
  const navigate = useNavigate();
  const { completeStep, addXP } = useJourneyStore();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalItems = CHECKLIST.reduce((acc, s) => acc + s.items.length, 0);
  const progress = Math.round((checked.size / totalItems) * 100);

  const handleComplete = () => {
    completeStep(5);
    addXP(100);
    navigate('/journey');
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="text-title">Voting Day Checklist ✅</h1>
      </div>
      <p className="text-body" style={{ marginBottom: 16 }}>Everything you need for May 23</p>

      {CHECKLIST.map(section => (
        <div key={section.section} style={{ marginBottom: 20 }}>
          <div className="text-label" style={{ marginBottom: 8 }}>{section.section}</div>
          {section.items.map(item => (
            <button key={item.id} className="card" onClick={() => toggle(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, width: '100%', textAlign: 'left' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, border: checked.has(item.id) ? 'none' : '2px solid var(--color-border)',
                background: checked.has(item.id) ? 'var(--color-success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 14, flexShrink: 0
              }}>
                {checked.has(item.id) && '✓'}
              </div>
              <span className="text-card" style={{ textDecoration: checked.has(item.id) ? 'line-through' : 'none', opacity: checked.has(item.id) ? 0.6 : 1 }}>
                {item.label}
              </span>
              {item.required && <span className="badge badge-saffron" style={{ marginLeft: 'auto' }}>Required</span>}
            </button>
          ))}
        </div>
      ))}

      {/* AI tip */}
      <div className="card" style={{ background: 'var(--saffron-50)', marginBottom: 16 }}>
        <div className="text-card" style={{ marginBottom: 4 }}>🤖 AI Suggests</div>
        <div className="text-body">Best time to visit: <strong>9:00 — 10:00 AM</strong> (lowest queue based on historical data)</div>
      </div>

      {/* Progress */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div className="readiness-ring" style={{ margin: '0 auto' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle className="ring-bg" cx="50" cy="50" r="38" />
            <circle className="ring-fill" cx="50" cy="50" r="38"
              strokeDasharray={238.76} strokeDashoffset={238.76 - (progress / 100) * 238.76} />
          </svg>
          <div className="readiness-value" style={{ fontSize: 18 }}>{progress}%</div>
        </div>
        <div className="text-caption" style={{ marginTop: 8 }}>Complete checklist to boost readiness</div>
      </div>

      {progress >= 60 && (
        <button className="btn btn-primary btn-full" onClick={handleComplete}>Mark Step Complete ✓</button>
      )}
    </div>
  );
}
