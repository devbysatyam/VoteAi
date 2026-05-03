import { useNavigate } from 'react-router-dom';

export default function WelcomeSplash() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', background: 'linear-gradient(180deg, rgba(230,81,0,0.06) 0%, #FAFAFA 40%, rgba(27,94,32,0.04) 100%)' }}>
      <div className="animate-in">
        <div style={{ fontSize: 72, marginBottom: 24 }}>🗳️</div>
        <h1 className="text-display" style={{ marginBottom: 8 }}>Vote Smart. Vote Right.</h1>
        <p className="text-body" style={{ maxWidth: 320, margin: '0 auto 32px' }}>
          Your AI-powered guide to India's elections. Learn, prepare, and vote with confidence.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          <span className="badge badge-saffron badge-pill">🤖 AI Guide</span>
          <span className="badge badge-navy badge-pill">🖥️ EVM Simulator</span>
          <span className="badge badge-green badge-pill">📍 Booth Finder</span>
        </div>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/language')} style={{ maxWidth: 320 }}>
          Get Started →
        </button>
      </div>
      <div className="step-pills" style={{ marginTop: 48 }}>
        {[0,1,2,3,4].map(i => <div key={i} className={`step-pill${i === 0 ? ' active' : ''}`} />)}
      </div>
    </div>
  );
}
