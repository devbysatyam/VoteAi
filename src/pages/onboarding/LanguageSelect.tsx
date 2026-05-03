import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
];

export default function LanguageSelect() {
  const navigate = useNavigate();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [selected, setSelected] = useState('en');

  const handleContinue = () => {
    setLanguage(selected);
    navigate('/profile-setup');
  };

  return (
    <div className="page animate-in" style={{ minHeight: '100vh' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/welcome')} aria-label="Go back">←</button>
        <h1 className="text-title">Choose Your Language</h1>
      </div>
      <p className="text-body" style={{ marginBottom: 20 }}>Select your preferred language</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 32 }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className="card"
            onClick={() => setSelected(lang.code)}
            style={{
              textAlign: 'center',
              padding: '12px 8px',
              border: selected === lang.code ? '1.5px solid var(--color-accent)' : undefined,
              background: selected === lang.code ? 'var(--color-accent-light)' : undefined,
            }}
            aria-pressed={selected === lang.code}
          >
            <div style={{ fontSize: 13, fontWeight: 500 }}>{lang.name}</div>
            <div className="text-caption">{lang.native}</div>
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-full" onClick={handleContinue}>Continue</button>

      <div className="step-pills" style={{ justifyContent: 'center', marginTop: 24 }}>
        {[0,1,2,3,4].map(i => <div key={i} className={`step-pill${i <= 1 ? ' active' : ''}`} />)}
      </div>
    </div>
  );
}
