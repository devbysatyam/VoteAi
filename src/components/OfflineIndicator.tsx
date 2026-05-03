/**
 * OfflineIndicator — displays a fixed banner when the user loses network connectivity.
 * Uses browser online/offline events for real-time detection.
 * Includes aria-live="assertive" for screen reader announcements.
 */
import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--color-danger)',
        color: '#FFF',
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      You are offline. Some features may be unavailable.
    </div>
  );
}
