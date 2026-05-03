import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { validateProfile, isValidVoterType } from '../../utils/validation';
import { getConstituencies, detectLocationFromPincode } from '../../data/constituencies';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','J&K','Ladakh','Puducherry','Lakshadweep','A&N Islands','Dadra & Nagar Haveli'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const existingUser = useAuthStore((s) => s.user);

  /* Pre-fill from existing user data (back navigation) */
  const [form, setForm] = useState<{
    name: string; state: string; constituency: string; age: string;
    isFirst: boolean; voterType: 'general' | 'nri' | 'service';
    pincode: string; epicNumber: string;
  }>({
    name: existingUser?.name || '',
    state: existingUser?.state || 'Uttar Pradesh',
    constituency: existingUser?.constituency || '',
    age: existingUser?.age ? String(existingUser.age) : '',
    isFirst: existingUser?.isFirstTimeVoter ?? true,
    voterType: (existingUser?.voterType as 'general' | 'nri' | 'service') || 'general',
    pincode: '',
    epicNumber: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);

  /* Update constituencies when state changes */
  useEffect(() => {
    const list = getConstituencies(form.state);
    setConstituencies(list);
    /* Reset constituency if it's not in the new list */
    if (list.length > 0 && !list.includes(form.constituency)) {
      setForm(f => ({ ...f, constituency: '' }));
    }
  }, [form.state]);

  /* Auto-detect state and constituency from pincode */
  useEffect(() => {
    if (form.pincode.length >= 2) {
      const { state, constituency } = detectLocationFromPincode(form.pincode);
      if (state) {
        setForm(f => ({ ...f, state, ...(constituency ? { constituency } : {}) }));
      }
    }
  }, [form.pincode]);

  const handleContinue = () => {
    const result = validateProfile({
      name: form.name,
      state: form.state,
      constituency: form.constituency,
      age: form.age,
    });

    const fieldErrors = [...result.errors];

    /* Constituency is required */
    if (!form.constituency) {
      fieldErrors.push('Please select a constituency');
    }

    if (fieldErrors.length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const vType = isValidVoterType(form.voterType) ? form.voterType : 'general';

    setUser({
      name: result.sanitized.name || 'Voter',
      state: result.sanitized.state,
      constituency: form.constituency,
      age: parseInt(result.sanitized.age) || 21,
      isFirstTimeVoter: form.isFirst,
      voterType: vType,
      photoUrl: existingUser?.photoUrl || '',
    });

    setErrors([]);
    navigate('/signin');
  };

  return (
    <div className="page animate-in" style={{ minHeight: '100vh' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/language')} aria-label="Go back">←</button>
        <h1 className="text-title">Set Up Your Profile</h1>
      </div>
      <p className="text-body" style={{ marginBottom: 20 }}>Help us personalise your voting journey</p>

      {errors.length > 0 && (
        <div role="alert" style={{ background: 'var(--red-50)', border: '1px solid var(--red-500)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          {errors.map((err, i) => (
            <div key={i} className="text-body" style={{ color: 'var(--red-500)', fontSize: 12 }}>⚠️ {err}</div>
          ))}
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div>
          <label className="input-label" htmlFor="name">Full Name *</label>
          <input id="name" className="input" placeholder="Enter your full name" value={form.name} maxLength={100}
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        {/* Pincode with auto-detect */}
        <div>
          <label className="input-label" htmlFor="pincode">Pincode (auto-detects state)</label>
          <input id="pincode" className="input" type="text" inputMode="numeric" placeholder="e.g. 221001"
            value={form.pincode} maxLength={6}
            onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
          {form.pincode.length >= 2 && detectLocationFromPincode(form.pincode).state && (
            <div className="text-caption" style={{ marginTop: 4, color: 'var(--color-success)' }}>
              ✅ Detected: {detectLocationFromPincode(form.pincode).state} {detectLocationFromPincode(form.pincode).constituency ? `(${detectLocationFromPincode(form.pincode).constituency})` : ''}
            </div>
          )}
        </div>

        <div>
          <label className="input-label" htmlFor="state">State / Union Territory *</label>
          <select id="state" className="input" value={form.state}
            onChange={e => setForm({ ...form, state: e.target.value })}>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Constituency dropdown */}
        <div>
          <label className="input-label" htmlFor="constituency">Constituency * ({constituencies.length} in {form.state})</label>
          {constituencies.length > 0 ? (
            <select id="constituency" className="input" value={form.constituency}
              onChange={e => setForm({ ...form, constituency: e.target.value })}
              style={{ borderColor: !form.constituency ? 'var(--red-500)' : undefined }}>
              <option value="">— Select your constituency —</option>
              {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input id="constituency" className="input" placeholder="Enter constituency name"
              value={form.constituency} maxLength={100}
              onChange={e => setForm({ ...form, constituency: e.target.value })} />
          )}
        </div>

        <div>
          <label className="input-label" htmlFor="age">Age *</label>
          <input id="age" className="input" type="number" min={18} max={120} placeholder="18" value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
        </div>

        {/* EPIC Card Number */}
        <div>
          <label className="input-label" htmlFor="epic">Voter ID (EPIC Number)</label>
          <input id="epic" className="input" placeholder="e.g. ABC1234567" value={form.epicNumber} maxLength={10}
            onChange={e => setForm({ ...form, epicNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })} />
          <div className="text-caption" style={{ marginTop: 4 }}>Optional — found on your Voter ID card</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-card">First-time voter?</span>
          <button className={`toggle${form.isFirst ? ' active' : ''}`}
            onClick={() => setForm({ ...form, isFirst: !form.isFirst })}
            role="switch" aria-checked={form.isFirst} aria-label="First time voter toggle">
            <div className="toggle-knob" />
          </button>
        </div>

        <div>
          <label className="input-label">Voter Type</label>
          <div style={{ display: 'flex', gap: 8 }} role="radiogroup" aria-label="Voter type">
            {(['general', 'nri', 'service'] as const).map(t => (
              <button key={t}
                className={`btn btn-sm ${form.voterType === t ? 'btn-accent-light' : 'btn-secondary'}`}
                onClick={() => setForm({ ...form, voterType: t })}
                role="radio" aria-checked={form.voterType === t}
                aria-label={`Voter type: ${t === 'nri' ? 'NRI' : t}`}
                style={{ flex: 1, textTransform: 'capitalize' }}>
                {t === 'nri' ? 'NRI' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleContinue}>Continue</button>
      <div className="step-pills" style={{ justifyContent: 'center', marginTop: 24 }}>
        {[0, 1, 2, 3, 4].map(i => <div key={i} className={`step-pill${i <= 2 ? ' active' : ''}`} />)}
      </div>
    </div>
  );
}
