import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/home', icon: '🏠', label: 'Home' },
  { path: '/journey', icon: '🗺️', label: 'Journey' },
  { path: '/vote', icon: '🗳️', label: 'Vote', isFab: true },
  { path: '/explore', icon: '🧑‍💼', label: 'Explore' },
  { path: '/learn', icon: '🧠', label: 'Learn' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <main id="main-content" role="main">
        <Outlet />
      </main>
      {/* Global AI Chat FAB */}
      <button
        onClick={() => navigate('/chat')}
        className="animate-bounce"
        style={{
          position: 'fixed',
          bottom: 80, // Above the bottom nav
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: 'var(--color-accent)',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 100,
        }}
        aria-label="Open AI Assistant"
      >
        💬
      </button>

      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {tabs.map((tab) =>
          tab.isFab ? (
            <button
              key={tab.path}
              className="nav-fab"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
            >
              <div className="nav-fab-btn">{tab.icon}</div>
              <span className="nav-label">{tab.label}</span>
            </button>
          ) : (
            <button
              key={tab.path}
              className={`nav-item${location.pathname === tab.path ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={location.pathname === tab.path ? 'page' : undefined}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          )
        )}
      </nav>
    </>
  );
}
