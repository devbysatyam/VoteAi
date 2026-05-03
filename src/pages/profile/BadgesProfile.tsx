import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import { validateProfile, isValidVoterType } from '../../utils/validation';
import { getConstituencies } from '../../data/constituencies';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','J&K','Ladakh','Puducherry','Lakshadweep','A&N Islands','Dadra & Nagar Haveli'];

export default function BadgesProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { badges, xp, readinessScore, completedSteps, quizScores } = useJourneyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    state: user?.state || '',
    constituency: user?.constituency || '',
    age: String(user?.age || ''),
    voterType: user?.voterType || 'general',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const constituencies = getConstituencies(editForm.state);

  const allBadges = [
    { id: 'first-login', emoji: '🎉', label: 'First Login', desc: 'Signed into VoteAI' },
    { id: 'profile-complete', emoji: '📋', label: 'Profile Ready', desc: 'Completed profile setup' },
    { id: 'quiz-master', emoji: '🧠', label: 'Quiz Master', desc: 'Scored 100% on a quiz' },
    { id: 'first-vote', emoji: '🗳️', label: 'EVM Trained', desc: 'Completed EVM simulation' },
    { id: 'booth-found', emoji: '📍', label: 'Booth Finder', desc: 'Located your polling booth' },
    { id: 'rights-expert', emoji: '⚖️', label: 'Rights Expert', desc: 'Read all voter rights' },
    { id: 'journey-done', emoji: '🏆', label: 'Journey Complete', desc: 'Finished all 7 steps' },
    { id: 'helper', emoji: '🤝', label: 'Community Helper', desc: 'Shared VoteAI with a friend' },
  ];

  const handleSave = () => {
    const result = validateProfile({
      name: editForm.name,
      state: editForm.state,
      constituency: editForm.constituency,
      age: editForm.age,
    });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    if (!editForm.constituency) {
      setErrors(['Please select a constituency']);
      return;
    }

    const vType = isValidVoterType(editForm.voterType) ? editForm.voterType : 'general' as const;

    setUser({
      name: result.sanitized.name,
      state: result.sanitized.state,
      constituency: editForm.constituency,
      age: parseInt(result.sanitized.age) || 21,
      isFirstTimeVoter: user?.isFirstTimeVoter ?? true,
      voterType: vType,
      photoUrl: user?.photoUrl || '',
    });

    setErrors([]);
    setIsEditing(false);
  };

  const civicScore = Math.min(100, Math.round(
    (completedSteps.length / 7) * 40 +
    (badges.length / allBadges.length) * 30 +
    (quizScores.length > 0 ? (quizScores.reduce((a, b) => a + b, 0) / (quizScores.length * 5)) * 30 : 0)
  ));

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="text-title">My Profile</h1>
        <button className="btn btn-sm btn-ghost" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '✕ Cancel' : '✏️ Edit'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="card-accent" style={{ marginBottom: 20, textAlign: 'center', position: 'relative' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
          background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, border: '3px solid var(--color-accent)',
        }}>
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>

        {isEditing ? (
          /* Edit Mode */
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {errors.length > 0 && (
              <div style={{ background: 'var(--red-50)', borderRadius: 6, padding: 8 }}>
                {errors.map((e, i) => <div key={i} style={{ fontSize: 11, color: 'var(--red-500)' }}>⚠️ {e}</div>)}
              </div>
            )}
            <div>
              <label className="input-label">Name</label>
              <input className="input" value={editForm.name} maxLength={100}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="input-label">State</label>
              <select className="input" value={editForm.state}
                onChange={e => setEditForm({ ...editForm, state: e.target.value, constituency: '' })}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Constituency</label>
              <select className="input" value={editForm.constituency}
                onChange={e => setEditForm({ ...editForm, constituency: e.target.value })}>
                <option value="">— Select —</option>
                {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Age</label>
              <input className="input" type="number" min={18} max={120} value={editForm.age}
                onChange={e => setEditForm({ ...editForm, age: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
            </div>
            <div>
              <label className="input-label">Voter Type</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['general', 'nri', 'service'] as const).map(t => (
                  <button key={t} className={`btn btn-sm ${editForm.voterType === t ? 'btn-accent-light' : 'btn-secondary'}`}
                    onClick={() => setEditForm({ ...editForm, voterType: t })} style={{ flex: 1 }}>
                    {t === 'nri' ? 'NRI' : t}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSave}>💾 Save Changes</button>
          </div>
        ) : (
          /* View Mode */
          <>
            <div className="text-section">{user?.name || 'Guest Voter'}</div>
            <div className="text-caption">{user?.state} — {user?.constituency}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              <span className="badge badge-green badge-pill">{user?.isFirstTimeVoter ? '🆕 First-Time' : '✅ Experienced'}</span>
              <span className="badge badge-saffron badge-pill" style={{ textTransform: 'capitalize' }}>{user?.voterType}</span>
            </div>
          </>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-accent)' }}>{civicScore}</div>
          <div className="text-caption">Civic Score</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-accent)' }}>{xp}</div>
          <div className="text-caption">Total XP</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-accent)' }}>{readinessScore}%</div>
          <div className="text-caption">Readiness</div>
        </div>
      </div>

      {/* Readiness Ring */}
      <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <div className="text-label" style={{ marginBottom: 12 }}>VOTING READINESS</div>
        <svg viewBox="0 0 100 100" style={{ width: 100, height: 100 }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-accent)" strokeWidth="8"
            strokeDasharray={`${readinessScore * 2.64} 264`} strokeLinecap="round"
            transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.5s' }} />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            fontSize="20" fontWeight="700" fill="var(--color-text-primary)">{readinessScore}%</text>
        </svg>
        <div className="text-caption" style={{ marginTop: 8 }}>
          {completedSteps.length}/7 journey steps completed
        </div>
      </div>

      {/* Badges */}
      <div className="text-section" style={{ marginBottom: 12 }}>Achievements ({badges.length}/{allBadges.length})</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {allBadges.map(b => {
          const earned = badges.includes(b.id);
          return (
            <div key={b.id} className="card" style={{
              opacity: earned ? 1 : 0.4,
              textAlign: 'center', padding: 12,
              border: earned ? '1px solid var(--color-accent)' : undefined,
            }}>
              <div style={{ fontSize: 28 }}>{b.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{b.label}</div>
              <div className="text-caption">{b.desc}</div>
              {earned && <div className="badge badge-green badge-pill" style={{ fontSize: 9, marginTop: 4 }}>✅ Earned</div>}
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/voter-card')}>
          🪪 View Card
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/settings')}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
