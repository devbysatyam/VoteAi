import { useNavigate } from 'react-router-dom';

const TIMELINE = [
  { date: 'Mar 15', title: 'Election Announced', desc: 'ECI announces schedule for 543 constituencies', status: 'complete' },
  { date: 'Mar 25', title: 'Nominations Open', desc: 'Candidates file papers with district office', status: 'complete' },
  { date: 'Apr 5', title: 'Nominations Close', desc: 'Last date for filing and withdrawal', status: 'complete' },
  { date: 'Apr 10', title: 'Campaign Period', desc: 'Rallies, door-to-door campaigns, and advertisements begin', status: 'current' },
  { date: 'May 21', title: 'Campaign Silence', desc: '48 hours before voting — no campaigning allowed', status: 'future' },
  { date: 'May 23', title: 'VOTING DAY ★', desc: 'Polls open 7:00 AM to 6:00 PM. Cast your vote!', status: 'future' },
  { date: 'May 27', title: 'Counting Day', desc: 'Votes counted at counting centres, results declared', status: 'future' },
  { date: 'Jun 1', title: 'Results & Oath', desc: 'Winning candidates take oath of office', status: 'future' },
];

export default function Timeline() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 16 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="text-title">Election Timeline</h1>
          <div className="text-body">Lok Sabha Elections 2026 — Key Dates</div>
        </div>
      </div>

      <div className="timeline" style={{ marginTop: 16 }}>
        {TIMELINE.map((node, i) => (
          <div className="timeline-node" key={i}>
            <div className={`timeline-dot ${node.status}`} />
            <div className="text-caption" style={{ marginBottom: 4, fontWeight: 500 }}>{node.date}</div>
            <div className={node.status === 'current' ? 'card-accent' : 'card'}
              style={{ opacity: node.status === 'future' ? 0.5 : 1 }}>
              <div className="text-card">{node.title}</div>
              <div className="text-body">{node.desc}</div>
              {node.status === 'current' && <span className="badge badge-saffron badge-pill" style={{ marginTop: 8 }}>📍 Current Phase</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
