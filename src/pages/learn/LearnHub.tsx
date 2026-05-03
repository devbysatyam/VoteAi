import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMOCRACY_CONTENT } from '../../data/educationContent';

type Tab = 'overview' | 'structure' | 'state' | 'elections' | 'rights';

export default function LearnHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'overview', label: 'Overview', emoji: '📚' },
    { id: 'structure', label: 'Parliament', emoji: '🏛️' },
    { id: 'state', label: 'State Govt', emoji: '🏢' },
    { id: 'elections', label: 'How It Works', emoji: '🗳️' },
    { id: 'rights', label: 'Your Rights', emoji: '⚖️' },
  ];

  const getContent = () => {
    const map: Record<string, string> = {
      structure: 'structure',
      state: 'stateGovt',
      elections: 'elections',
      rights: 'voterRights',
    };
    const key = map[activeTab];
    return key ? DEMOCRACY_CONTENT[key] ?? null : null;
  };

  const content = getContent();

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="text-title">Learn About Democracy</h1>
      </div>

      {/* Tab Bar */}
      <div className="carousel" style={{ marginBottom: 16, paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id}
            className={`btn btn-sm ${activeTab === t.id ? 'btn-accent-light' : 'btn-secondary'}`}
            onClick={() => setActiveTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab — Quick Actions */}
      {activeTab === 'overview' && (
        <div>
          {/* Featured Quiz Card */}
          <div className="card-accent" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => navigate('/quiz')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 36 }}>🧠</div>
              <div>
                <div className="text-card">Election Quiz</div>
                <div className="text-caption">Test your knowledge — 5 questions</div>
                <div className="badge badge-green badge-pill" style={{ marginTop: 6, fontSize: 10 }}>+250 XP</div>
              </div>
            </div>
          </div>

          {/* Learning Modules Grid */}
          <div className="text-label" style={{ marginBottom: 8 }}>LEARNING MODULES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { emoji: '🏛️', title: 'Parliament of India', desc: 'Lok Sabha & Rajya Sabha', tab: 'structure' as Tab },
              { emoji: '🏢', title: 'State Government', desc: 'MLA, MLC & their roles', tab: 'state' as Tab },
              { emoji: '🗳️', title: 'How Elections Work', desc: 'FPTP, ECI, MCC, EVM', tab: 'elections' as Tab },
              { emoji: '⚖️', title: 'Your Rights', desc: 'Constitutional provisions', tab: 'rights' as Tab },
            ].map(m => (
              <div key={m.title} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: 16 }}
                onClick={() => setActiveTab(m.tab)}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                <div className="text-caption">{m.desc}</div>
              </div>
            ))}
          </div>

          {/* More Activities */}
          <div className="text-label" style={{ marginBottom: 8 }}>MORE ACTIVITIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { emoji: '⏰', title: 'Election Timeline', desc: 'Key dates and phases', to: '/timeline' },
              { emoji: '⚖️', title: 'Voter Rights Shield', desc: '10 essential rights', to: '/rights' },
              { emoji: '🚶', title: 'Booth Walk-Through', desc: '5-step booth guide', to: '/walkthrough' },
              { emoji: '🤔', title: 'What-If Scenarios', desc: 'Explore edge cases', to: '/scenarios' },
            ].map(a => (
              <div key={a.title} className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => navigate(a.to)}>
                <span style={{ fontSize: 24 }}>{a.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                  <div className="text-caption">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Tabs */}
      {content && (
        <div className="animate-in">
          <h2 className="text-section" style={{ marginBottom: 16 }}>{content.title}</h2>
          {content.sections.map((section, i) => (
            <div key={i} className="card" style={{ marginBottom: 12 }}>
              <div className="text-card" style={{ marginBottom: 8 }}>{section.title}</div>
              <div className="text-body" style={{ lineHeight: 1.6, marginBottom: section.facts ? 12 : 0 }}>
                {section.body}
              </div>
              {section.facts && (
                <div style={{ background: 'var(--color-bg)', borderRadius: 6, padding: 10, marginTop: 8 }}>
                  <div className="text-label" style={{ marginBottom: 6 }}>KEY FACTS</div>
                  {section.facts.map((fact, j) => (
                    <div key={j} style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '3px 0', display: 'flex', gap: 6 }}>
                      <span>•</span> <span>{fact}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
