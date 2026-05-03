import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import { useJourneyStore } from '../../src/store/journeyStore';
import { useSettingsStore } from '../../src/store/settingsStore';

vi.mock('../../src/services/firebase', () => ({
  isFirebaseConfigured: false,
  auth: null,
  googleProvider: {},
  db: null,
  initAnalytics: vi.fn(),
}));

vi.mock('../../src/services/auth', () => ({
  signInWithGoogle: vi.fn(),
  initAuthListener: vi.fn(() => () => {}),
}));

vi.mock('../../src/services/storeSync', () => ({
  initStoreSync: vi.fn(() => () => {}),
}));

vi.mock('../../src/services/gemini', () => ({
  sendChatMessage: vi.fn((msg: string) => Promise.resolve(`Response to: ${msg}`)),
  generateQuizQuestions: vi.fn(() => Promise.resolve([
    { q: 'Test Q?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'Test' },
  ])),
}));

function resetAllStores() {
  useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
  useJourneyStore.setState({ currentStep: 1, completedSteps: [], readinessScore: 0, badges: [], quizScores: [], xp: 0 });
  useSettingsStore.setState({ theme: 'light', language: 'en', onboardingComplete: false });
}

describe('Full User Journey E2E', () => {
  beforeEach(resetAllStores);

  it('should complete onboarding → guest login → dashboard flow', async () => {
    const { default: WelcomeSplash } = await import('../../src/pages/onboarding/WelcomeSplash');
    const { unmount } = render(<MemoryRouter><WelcomeSplash /></MemoryRouter>);
    expect(screen.getByText('Vote Smart. Vote Right.')).toBeInTheDocument();
    unmount();

    useAuthStore.getState().loginAsGuest();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Guest/)).toBeInTheDocument();
  });

  it('should complete full journey with all 7 steps', () => {
    useAuthStore.getState().loginAsGuest();

    for (let i = 1; i <= 7; i++) {
      useJourneyStore.getState().completeStep(i);
    }

    expect(useJourneyStore.getState().readinessScore).toBe(100);
    expect(useJourneyStore.getState().completedSteps.length).toBe(7);
    expect(useJourneyStore.getState().currentStep).toBe(8);
  });

  it('should earn XP and badges through journey', () => {
    useAuthStore.getState().loginAsGuest();

    useJourneyStore.getState().completeStep(1);
    useJourneyStore.getState().addXP(100);
    useJourneyStore.getState().addBadge('first-step');

    useJourneyStore.getState().completeStep(2);
    useJourneyStore.getState().addXP(100);

    useJourneyStore.getState().addQuizScore(5);
    useJourneyStore.getState().addXP(250);
    useJourneyStore.getState().addBadge('quiz-master');

    expect(useJourneyStore.getState().xp).toBe(450);
    expect(useJourneyStore.getState().badges).toEqual(['first-step', 'quiz-master']);
    expect(useJourneyStore.getState().quizScores).toEqual([5]);
  });

  it('should handle language change during journey', () => {
    useSettingsStore.getState().setLanguage('hi');
    expect(useSettingsStore.getState().language).toBe('hi');

    useAuthStore.getState().loginAsGuest();
    useJourneyStore.getState().completeStep(1);

    useSettingsStore.getState().setLanguage('ta');
    expect(useSettingsStore.getState().language).toBe('ta');
    expect(useJourneyStore.getState().completedSteps).toContain(1);
  });

  it('should handle theme toggle during journey', () => {
    useAuthStore.getState().loginAsGuest();
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('dark');

    useJourneyStore.getState().completeStep(1);
    expect(useJourneyStore.getState().completedSteps).toContain(1);

    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('light');
  });
});

describe('AI Chat E2E', () => {
  beforeEach(resetAllStores);

  it('should handle multiple messages in sequence', async () => {
    useAuthStore.getState().loginAsGuest();
    const { default: AIChat } = await import('../../src/pages/chat/AIChat');
    render(<MemoryRouter><AIChat /></MemoryRouter>);

    const input = screen.getByPlaceholderText(/ask about elections/i);

    fireEvent.change(input, { target: { value: 'What is NOTA?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('What is NOTA?')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Response to: What is NOTA?')).toBeInTheDocument();
    });
  });

  it('should show quick replies initially', async () => {
    useAuthStore.getState().loginAsGuest();
    const { default: AIChat } = await import('../../src/pages/chat/AIChat');
    render(<MemoryRouter><AIChat /></MemoryRouter>);

    expect(screen.getByText('How to check voter list?')).toBeInTheDocument();
    expect(screen.getByText('What is NOTA?')).toBeInTheDocument();
    expect(screen.getByText('Documents needed?')).toBeInTheDocument();
  });

  it('should have proper ARIA roles for chat', async () => {
    useAuthStore.getState().loginAsGuest();
    const { default: AIChat } = await import('../../src/pages/chat/AIChat');
    render(<MemoryRouter><AIChat /></MemoryRouter>);

    expect(screen.getByRole('region', { name: /ai chat/i })).toBeInTheDocument();
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('should disable send button when input is empty', async () => {
    useAuthStore.getState().loginAsGuest();
    const { default: AIChat } = await import('../../src/pages/chat/AIChat');
    render(<MemoryRouter><AIChat /></MemoryRouter>);

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeDisabled();
  });
});

describe('NotFound Page', () => {
  it('should render 404 page with navigation options', async () => {
    const { default: NotFound } = await import('../../src/pages/NotFound');
    render(<MemoryRouter><NotFound /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
