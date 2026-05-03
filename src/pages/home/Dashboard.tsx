import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import { useState, useEffect } from 'react';

/** Calculate days until election */
function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { readinessScore, xp, completedSteps } = useJourneyStore();
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const electionDate = '2026-05-23T07:00:00';
  const daysLeft = daysUntil(electionDate);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(electionDate).getTime() - Date.now());
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const features = [
    { icon: '🗺️', label: 'My Journey', path: '/journey' },
    { icon: '📍', label: 'Find Booth', path: '/booth-map' },
    { icon: '🧑‍💼', label: 'Candidates', path: '/explore' },
    { icon: '🗳️', label: 'Simulate Vote', path: '/vote' },
    { icon: '🧠', label: 'Take Quiz', path: '/quiz' },
    { icon: '💬', label: 'AI Chat', path: '/chat' },
  ];

  const circleRadius = 38;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="page animate-in">
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="text-section">{greeting}, {user?.name?.split(' ')[0] || 'Voter'} 👋</div>
          <div className="text-body">Your election journey awaits</div>
        </div>
        <button 
          onClick={() => navigate('/profile')} 
          style={{ 
            width: 40, height: 40, borderRadius: 20, 
            background: 'var(--color-accent)', color: '#FFF', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 18, border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }} 
          aria-label="Profile"
        >
          {user?.name?.charAt(0)?.toUpperCase() || '👤'}
        </button>
      </div>

      <div className="bento-grid">
        {/* Today Briefing Card */}
        <div className="card bento-full" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <div className="text-label" style={{ marginBottom: 8 }}>TODAY'S BRIEFING</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
            <span className="text-section">{daysLeft} Days to Election</span>
          </div>
          <div className="text-body">🏫 Booth opens at 7:00 AM • 🌡️ 32°C expected</div>
          <div className="text-body" style={{ marginTop: 4 }}>💡 AI tip: Check your voter ID validity this week</div>
        </div>

        {/* Readiness Ring */}
        <div className="card bento-half" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="readiness-ring" role="img" aria-label={`Voter readiness: ${readinessScore} percent`}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r={circleRadius} />
              <circle className="ring-fill" cx="50" cy="50" r={circleRadius}
                strokeDasharray={circumference} strokeDashoffset={dashOffset} />
            </svg>
            <div className="readiness-value">{readinessScore}%</div>
          </div>
          <div className="text-caption" style={{ marginTop: 8 }}>Voter Readiness</div>
        </div>

        {/* Countdown */}
        <div className="card bento-half" style={{ textAlign: 'center' }}>
          <div className="text-label" style={{ marginBottom: 8 }}>COUNTDOWN</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {[{ v: countdown.d, l: 'D' }, { v: countdown.h, l: 'H' }, { v: countdown.m, l: 'M' }, { v: countdown.s, l: 'S' }].map(({ v, l }) => (
              <div key={l} style={{ background: 'var(--color-surface)', borderRadius: 6, padding: '8px 6px', minWidth: 36, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{String(v).padStart(2, '0')}</div>
                <div className="text-caption">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Carousel */}
        <div className="bento-full">
          <div className="text-label" style={{ marginBottom: 8 }}>QUICK ACCESS</div>
          <div className="carousel">
            {features.map((f) => (
              <button key={f.path} className="carousel-item card" onClick={() => navigate(f.path)} aria-label={f.label} style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">{f.icon}</div>
                <div className="text-caption">{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mission Card */}
        <div className="card-accent bento-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="text-card">🎯 Today's Mission</div>
            <span className="badge badge-saffron">+50 XP</span>
          </div>
          <div className="text-body" style={{ marginBottom: 8 }}>Read 1 candidate profile to earn your "Explorer" badge</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, (completedSteps.length / 7) * 100)}%` }} />
          </div>
          <div className="text-caption" style={{ marginTop: 4 }}>Total XP: {xp}</div>
        </div>

        {/* Trending Widget */}
        <div className="bento-full card" style={{ padding: 16 }}>
          <div className="text-label" style={{ marginBottom: 12 }}>TRENDING CIVIC TOPICS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button role="link" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0 }} onClick={() => navigate('/learn')} aria-label="How EVMs Work">
              <div style={{ fontSize: 24, background: 'var(--color-surface)', padding: 8, borderRadius: 8 }} aria-hidden="true">🗳️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>How EVMs Work</div>
                <div className="text-caption">Understanding the voting machine</div>
              </div>
              <div style={{ color: 'var(--color-accent)' }} aria-hidden="true">→</div>
            </button>
            <div style={{ height: 1, background: 'var(--color-border)' }} />
            <button role="link" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0 }} onClick={() => navigate('/rights')} aria-label="Know Your Rights">
              <div style={{ fontSize: 24, background: 'var(--color-surface)', padding: 8, borderRadius: 8 }} aria-hidden="true">⚖️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Know Your Rights</div>
                <div className="text-caption">Voter rights guaranteed by the Constitution</div>
              </div>
              <div style={{ color: 'var(--color-accent)' }} aria-hidden="true">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
