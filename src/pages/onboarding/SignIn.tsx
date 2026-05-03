import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { signInWithGoogle } from '../../services/auth';
import { isFirebaseConfigured } from '../../services/firebase';

export default function SignIn() {
  const navigate = useNavigate();
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigate('/voter-card');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/voter-card');
  };

  return (
    <div className="page animate-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🗳️</div>
      <h1 className="text-title" style={{ marginBottom: 8 }}>Welcome to VoteAI</h1>
      <p className="text-body" style={{ maxWidth: 300, margin: '0 auto 32px' }}>
        Sign in to save your progress and get personalised guidance
      </p>

      {error && (
        <div className="card-accent" style={{ maxWidth: 320, marginBottom: 16, background: 'var(--red-50)', border: '1px solid var(--red-500)' }}>
          <div className="text-body" style={{ color: 'var(--red-500)' }}>⚠️ {error}</div>
        </div>
      )}

      <button
        className="btn btn-full"
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{ maxWidth: 320, background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', marginBottom: 16, opacity: loading ? 0.6 : 1 }}
      >
        {loading ? (
          <span className="animate-pulse">Signing in...</span>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
            Sign in with Google
          </>
        )}
      </button>

      <button className="btn btn-ghost" onClick={handleGuest} style={{ fontSize: 13 }}>
        Or continue as guest →
      </button>

      {!isFirebaseConfigured && (
        <div className="badge badge-saffron badge-pill" style={{ marginTop: 16 }}>⚠️ Firebase not configured — guest mode only</div>
      )}

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>🔒</span>
        <span className="text-caption">Secured by Firebase</span>
      </div>

      <p className="text-caption" style={{ maxWidth: 280, margin: '16px auto 0' }}>
        By signing in, you agree to our <a href="#" style={{ textDecoration: 'underline' }}>Terms</a> and <a href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</a>
      </p>

      <div className="step-pills" style={{ justifyContent: 'center', marginTop: 32 }}>
        {[0,1,2,3,4].map(i => <div key={i} className={`step-pill${i <= 3 ? ' active' : ''}`} />)}
      </div>
    </div>
  );
}
