import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import QRCode from 'qrcode';

export default function VoterIDCard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  /** Stable VIC number (generated once per user) */
  const vicNumber = useMemo(() => {
    const seed = user?.name || 'Guest';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return `VIC-2026-${Math.abs(hash).toString(36).toUpperCase().slice(0, 5).padEnd(5, '0')}`;
  }, [user?.name]);

  /** Generate QR code on mount */
  useEffect(() => {
    const qrData = JSON.stringify({
      name: user?.name || 'Guest Voter',
      state: user?.state || 'N/A',
      constituency: user?.constituency || 'N/A',
      vic: vicNumber,
      type: user?.voterType || 'general',
      issued: new Date().toISOString().split('T')[0],
    });

    QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: { dark: '#1A237E', light: '#FFFFFF' },
    }).then(setQrDataUrl).catch(console.error);
  }, [user, vicNumber]);

  /** Download card as PNG */
  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      /* Use canvas to render the card */
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 250;

      /* Card background */
      const grad = ctx.createLinearGradient(0, 0, 400, 0);
      grad.addColorStop(0, '#D84315');
      grad.addColorStop(1, '#4A148C');
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, 400, 250, 12);
      ctx.fill();

      /* White card body */
      ctx.fillStyle = '#FFF';
      ctx.roundRect(10, 60, 380, 180, 8);
      ctx.fill();

      /* Header text */
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('VOTER IDENTITY CARD', 16, 35);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Election Commission of India', 16, 50);

      /* Body text */
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(user?.name || 'Guest Voter', 80, 100);
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(`${user?.state || 'N/A'} — ${user?.constituency || 'N/A'}`, 80, 118);

      ctx.fillStyle = '#E65100';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(user?.isFirstTimeVoter ? '🆕 First-Time Voter' : '✅ Registered Voter', 80, 140);

      ctx.fillStyle = '#999';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(vicNumber, 80, 160);

      /* QR code */
      if (qrDataUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 290, 80, 90, 90);
          const link = document.createElement('a');
          link.download = `VoteAI-Card-${vicNumber}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setShareStatus('✅ Downloaded!');
          setTimeout(() => setShareStatus(''), 2000);
        };
        img.src = qrDataUrl;
      }
    } catch {
      setShareStatus('❌ Download failed');
    }
  };

  /** Share card */
  const handleShare = async () => {
    const shareData = {
      title: 'My VoteAI Voter Card',
      text: `🗳️ I'm ready to vote! Check out VoteAI for your election guide.\n\n${user?.name} | ${user?.constituency}, ${user?.state}\n${vicNumber}`,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('✅ Shared!');
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setShareStatus('📋 Copied to clipboard!');
      }
    } catch {
      setShareStatus('❌ Share cancelled');
    }
    setTimeout(() => setShareStatus(''), 2000);
  };

  return (
    <div className="page animate-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <h1 className="text-title" style={{ marginBottom: 24 }}>Your Voter Identity Card</h1>

      {/* Card */}
      <div ref={cardRef} style={{
        width: '100%', maxWidth: 380, borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', marginBottom: 20,
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #D84315, #4A148C)', padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ color: '#FFF', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
            VOTER IDENTITY CARD
          </div>
          <div style={{ fontSize: 24 }}>🏛️</div>
        </div>

        {/* Body */}
        <div style={{ background: '#FFF', padding: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--color-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              border: '2px solid #E0E0E0', flexShrink: 0,
            }}>
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : '👤'}
            </div>

            {/* Info */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{user?.name || 'Guest Voter'}</div>
              <div style={{ fontSize: 12, color: '#E65100', fontWeight: 500 }}>{user?.state || 'Uttar Pradesh'}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{user?.constituency || 'Not Set'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span className="badge badge-green badge-pill" style={{ fontSize: 10, marginBottom: 6, display: 'inline-block' }}>
                {user?.isFirstTimeVoter ? '🆕 First-Time Voter' : '✅ Registered'}
              </span>
              <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{vicNumber}</div>
              <div style={{ fontSize: 10, color: '#BBB' }}>Issued: {new Date().toLocaleDateString('en-IN')}</div>
            </div>

            {/* QR Code */}
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Voter QR Code" style={{ width: 80, height: 80, borderRadius: 4 }} />
            ) : (
              <div style={{ width: 80, height: 80, background: '#F5F5F5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#999' }}>
                Generating...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {shareStatus && (
        <div className="badge badge-green badge-pill" style={{ marginBottom: 12, fontSize: 12 }}>{shareStatus}</div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%', maxWidth: 380 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDownload}>📥 Download</button>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleShare}>📤 Share</button>
      </div>

      <button className="btn btn-primary btn-full" style={{ maxWidth: 380 }} onClick={() => navigate('/home')}>
        Start Your Journey →
      </button>

      <div className="step-pills" style={{ justifyContent: 'center', marginTop: 24 }}>
        {[0, 1, 2, 3, 4].map(i => <div key={i} className={`step-pill${i <= 4 ? ' active' : ''}`} />)}
      </div>
    </div>
  );
}
