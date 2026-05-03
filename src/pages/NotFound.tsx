import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main
      role="main"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>🗳️</div>
      <h1 className="text-display" style={{ marginBottom: 8 }}>Page Not Found</h1>
      <p className="text-body" style={{ marginBottom: 24, maxWidth: 400 }}>
        The page you are looking for does not exist. Let us guide you back to your voting journey.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>
          Go Home
        </button>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </main>
  );
}
