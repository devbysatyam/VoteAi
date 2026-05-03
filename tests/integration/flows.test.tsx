/**
 * Integration tests — multi-component flows.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/authStore';
import { useJourneyStore } from '../../src/store/journeyStore';
import { useSettingsStore } from '../../src/store/settingsStore';

function resetStores() {
  useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
  useJourneyStore.setState({ currentStep: 1, completedSteps: [], readinessScore: 0, badges: [], quizScores: [], xp: 0 });
  useSettingsStore.setState({ theme: 'light', language: 'en', onboardingComplete: false });
}

describe('Onboarding → Auth flow integration', () => {
  beforeEach(resetStores);

  it('should start as unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should allow guest login and set default profile', () => {
    useAuthStore.getState().loginAsGuest();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isGuest).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Guest Voter');
  });

  it('should preserve user data through profile setup', () => {
    useAuthStore.getState().setUser({
      name: 'Priya',
      state: 'Maharashtra',
      constituency: 'Mumbai South',
      age: 25,
      isFirstTimeVoter: false,
      voterType: 'general',
      photoUrl: '',
    });

    const user = useAuthStore.getState().user;
    expect(user?.name).toBe('Priya');
    expect(user?.constituency).toBe('Mumbai South');
    expect(user?.state).toBe('Maharashtra');
  });

  it('should preserve data when going back and forth', () => {
    /* First set */
    useAuthStore.getState().setUser({
      name: 'Priya', state: 'Maharashtra', constituency: 'Mumbai South',
      age: 25, isFirstTimeVoter: false, voterType: 'general', photoUrl: '',
    });

    /* Simulate going back and coming back */
    const user = useAuthStore.getState().user;
    expect(user?.name).toBe('Priya');
    expect(user?.constituency).toBe('Mumbai South');

    /* Update should merge */
    useAuthStore.getState().setUser({
      ...user!,
      constituency: 'Pune',
    });
    expect(useAuthStore.getState().user?.constituency).toBe('Pune');
    expect(useAuthStore.getState().user?.name).toBe('Priya');
  });
});

describe('Journey → Gamification integration', () => {
  beforeEach(resetStores);

  it('should progress through all 7 steps and earn badges', () => {
    const { completeStep, addXP, addBadge, addQuizScore } = useJourneyStore.getState();

    completeStep(1);
    addXP(100);
    expect(useJourneyStore.getState().readinessScore).toBe(Math.round((1 / 7) * 100));

    for (let i = 2; i <= 6; i++) completeStep(i);

    addBadge('first-vote');
    addXP(200);

    completeStep(7);
    addBadge('journey-done');

    addQuizScore(5);
    addBadge('quiz-master');
    addXP(250);

    const state = useJourneyStore.getState();
    expect(state.readinessScore).toBe(100);
    expect(state.completedSteps.length).toBe(7);
    expect(state.badges).toContain('first-vote');
    expect(state.badges).toContain('journey-done');
    expect(state.badges).toContain('quiz-master');
    expect(state.xp).toBe(550);
  });
});

describe('Settings integration', () => {
  beforeEach(resetStores);

  it('should persist theme across stores', () => {
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('dark');

    useSettingsStore.getState().setLanguage('hi');
    expect(useSettingsStore.getState().language).toBe('hi');

    useSettingsStore.getState().completeOnboarding();
    expect(useSettingsStore.getState().onboardingComplete).toBe(true);
  });

  it('should maintain auth state independently of settings', () => {
    useAuthStore.getState().loginAsGuest();
    useSettingsStore.getState().toggleTheme();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useSettingsStore.getState().theme).toBe('dark');
  });
});

describe('Validation integration', () => {
  it('should validate profile data end-to-end', async () => {
    const { validateProfile } = await import('../../src/utils/validation');

    /* Valid profile */
    const good = validateProfile({ name: 'Priya Sharma', state: 'Maharashtra', constituency: 'Mumbai South', age: '25' });
    expect(good.valid).toBe(true);

    /* XSS in name */
    const xss = validateProfile({ name: '<script>alert(1)</script>Priya', state: 'Delhi', constituency: 'New Delhi', age: '25' });
    expect(xss.sanitized.name).toBe('Priya');

    /* Missing required fields */
    const bad = validateProfile({ name: '', state: '', constituency: '', age: '15' });
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThanOrEqual(2);
  });
});
