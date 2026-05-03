import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../../store/journeyStore';

const STEPS = [
  { id: 1, title: 'Check Eligibility', desc: 'Verify you meet the age and citizenship requirements', icon: '✅' },
  { id: 2, title: 'Verify Voter ID', desc: 'Check your name on the voter roll or register', icon: '🪪' },
  { id: 3, title: 'Know Candidates', desc: 'Read about candidates in your constituency', icon: '🧑‍💼' },
  { id: 4, title: 'Find Your Booth', desc: 'Locate your assigned polling station', icon: '📍' },
  { id: 5, title: 'Voting Day Checklist', desc: 'Prepare documents and know what to carry', icon: '📝' },
  { id: 6, title: 'Practice on EVM', desc: 'Try the simulated Electronic Voting Machine', icon: '🗳️' },
  { id: 7, title: 'You\'re Ready! 🎉', desc: 'Congratulations — go cast your real vote!', icon: '🎉' },
];

const STEP_PATHS = [null, null, null, '/explore', '/booth-map', '/checklist', '/vote', null];

export default function VotingJourney() {
  const navigate = useNavigate();
  const { currentStep, completedSteps, completeStep, addXP } = useJourneyStore();

  const handleStepAction = (stepId: number) => {
    const path = STEP_PATHS[stepId];
    if (path) { navigate(path); return; }
    completeStep(stepId);
    addXP(100);
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="text-title">My Voting Journey</h1>
      </div>

      {/* Step pills */}
      <div className="step-pills" style={{ marginBottom: 16 }}>
        {STEPS.map((s) => (
          <div key={s.id} className={`step-pill ${completedSteps.includes(s.id) ? 'complete' : s.id === currentStep ? 'active' : ''}`}
            style={{ flex: 1 }} />
        ))}
        <span className="text-caption" style={{ marginLeft: 8 }}>{completedSteps.length}/7</span>
      </div>

      {/* AI Coach */}
      <div className="card" style={{ background: 'var(--navy-50)', borderLeft: '3px solid var(--navy-900)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div className="text-card" style={{ color: 'var(--navy-900)' }}>AI Coach</div>
            <div className="text-body">
              {currentStep <= 3 ? 'Great progress! Learn about your constituency candidates before election day.' :
               currentStep <= 5 ? 'Almost there! Find your booth and prepare your documents.' :
               currentStep <= 6 ? 'Practice with the EVM simulator to feel confident on voting day.' :
               '🎉 You\'re fully prepared! Go cast your vote with confidence!'}
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          return (
            <div key={step.id} className={isCurrent ? 'card-accent' : isCompleted ? 'card-success' : 'card'}
              style={{ opacity: !isCompleted && !isCurrent ? 0.5 : 1 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 24, minWidth: 32, textAlign: 'center' }}>
                  {isCompleted ? '✅' : step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="text-card">{step.title}</div>
                    {isCompleted && <span className="badge badge-green">Done</span>}
                    {isCurrent && <span className="badge badge-saffron">Current</span>}
                  </div>
                  <div className="text-body">{step.desc}</div>
                </div>
              </div>
              {isCurrent && (
                <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={() => handleStepAction(step.id)}>
                  Continue →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
