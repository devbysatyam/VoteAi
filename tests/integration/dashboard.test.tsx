import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import { useJourneyStore } from '../../src/store/journeyStore';

vi.mock('../../src/services/firebase', () => ({
  isFirebaseConfigured: false,
  auth: null,
  googleProvider: {},
  db: null,
  initAnalytics: vi.fn(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuest: true,
      user: { name: 'Test User', state: 'Delhi', constituency: 'New Delhi', age: 25, isFirstTimeVoter: true, voterType: 'general', photoUrl: '' },
    });
    useJourneyStore.setState({ currentStep: 1, completedSteps: [], readinessScore: 0, badges: [], quizScores: [], xp: 0 });
  });

  it('should render greeting with user name', async () => {
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Test/)).toBeInTheDocument();
  });

  it('should render readiness ring with aria-label', async () => {
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole('img', { name: /voter readiness/i })).toBeInTheDocument();
  });

  it('should render quick access buttons with aria-labels', async () => {
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'My Journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Find Booth' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Candidates' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simulate Vote' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take Quiz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI Chat' })).toBeInTheDocument();
  });

  it('should render profile button with aria-label', async () => {
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
  });

  it('should render trending topics as buttons', async () => {
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /how evms work/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /know your rights/i })).toBeInTheDocument();
  });

  it('should display countdown timer', async () => {
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('COUNTDOWN')).toBeInTheDocument();
  });

  it('should display XP total', async () => {
    useJourneyStore.setState({ xp: 250 });
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Total XP: 250/)).toBeInTheDocument();
  });
});

describe('Settings Page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuest: true,
      user: { name: 'Test User', state: 'Delhi', constituency: 'New Delhi', age: 25, isFirstTimeVoter: true, voterType: 'general', photoUrl: '' },
    });
  });

  it('should render settings heading', async () => {
    const { default: Settings } = await import('../../src/pages/settings/Settings');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('should render back button with aria-label', async () => {
    const { default: Settings } = await import('../../src/pages/settings/Settings');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('should render sign out button', async () => {
    const { default: Settings } = await import('../../src/pages/settings/Settings');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should have dark mode toggle with switch role', async () => {
    const { default: Settings } = await import('../../src/pages/settings/Settings');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    const toggle = screen.getByRole('switch', { name: /dark mode/i });
    expect(toggle).toBeInTheDocument();
  });
});
