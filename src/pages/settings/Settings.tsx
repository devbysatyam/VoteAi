import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme, language } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/welcome'); };

  const sections = [
    {
      title: 'PREFERENCES', items: [
        { label: 'Language', value: language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : language, action: () => navigate('/language') },
        { label: 'Dark Mode', toggle: true, value: theme === 'dark', action: toggleTheme },
        { label: 'Notifications', toggle: true, value: true, action: () => {} },
      ],
    },
    {
      title: 'ACCOUNT', items: [
        { label: 'Profile', value: user?.name || 'Guest', action: () => navigate('/profile') },
        { label: 'Voter ID Card', value: 'View / Download', action: () => navigate('/voter-card') },
        { label: 'Constituency', value: user?.constituency || 'Not set', action: () => navigate('/profile-setup') },
      ],
    },
    {
      title: 'ABOUT', items: [
        { label: 'About VoteAI', value: '', action: () => {} },
        { label: 'Privacy Policy', value: '', action: () => {} },
        { label: 'Terms of Service', value: '', action: () => {} },
        { label: 'Version', value: '1.0.0', action: () => {} },
      ],
    },
  ];

  return (
    <div className="page animate-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="text-title">Settings</h1>
      </div>

      {sections.map(section => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div className="text-label" style={{ marginBottom: 8 }}>{section.title}</div>
          <div className="card" style={{ padding: 0 }}>
            {section.items.map((item, i) => (
              <button key={item.label} onClick={item.action}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  padding: '14px 16px', borderBottom: i < section.items.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                  background: 'none', textAlign: 'left',
                }}>
                <span className="text-card">{item.label}</span>
                {item.toggle ? (
                  <div className={`toggle${item.value ? ' active' : ''}`} onClick={e => { e.stopPropagation(); item.action(); }}>
                    <div className="toggle-knob" />
                  </div>
                ) : (
                  <span className="text-body" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {item.value} →
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn-danger btn-full" onClick={handleLogout} style={{ marginBottom: 16 }}>
        Sign Out
      </button>

      <div className="text-caption" style={{ textAlign: 'center' }}>Made with ❤️ for Indian Democracy</div>
    </div>
  );
}
