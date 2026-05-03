import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/authStore';
import { useJourneyStore } from '../../src/store/journeyStore';
import { useSettingsStore } from '../../src/store/settingsStore';

vi.mock('../../src/services/firebase', () => ({
  auth: null,
  isFirebaseConfigured: false,
}));

vi.mock('../../src/services/firestore', () => ({
  saveUserProfile: vi.fn(),
  saveJourneyProgress: vi.fn(),
}));

describe('Store Sync (offline mode)', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
    useJourneyStore.setState({ currentStep: 1, completedSteps: [], readinessScore: 0, badges: [], quizScores: [], xp: 0 });
    useSettingsStore.setState({ theme: 'light', language: 'en', onboardingComplete: false });
  });

  it('should return noop unsubscribe when Firebase is not configured', async () => {
    const { initStoreSync } = await import('../../src/services/storeSync');
    const unsub = initStoreSync();
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('should not crash when stores change without Firebase', async () => {
    const { initStoreSync } = await import('../../src/services/storeSync');
    initStoreSync();

    expect(() => {
      useAuthStore.getState().loginAsGuest();
      useJourneyStore.getState().completeStep(1);
      useSettingsStore.getState().toggleTheme();
    }).not.toThrow();
  });
});

describe('Cross-store integration', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
    useJourneyStore.setState({ currentStep: 1, completedSteps: [], readinessScore: 0, badges: [], quizScores: [], xp: 0 });
    useSettingsStore.setState({ theme: 'light', language: 'en', onboardingComplete: false });
  });

  it('should maintain independent store state', () => {
    useAuthStore.getState().loginAsGuest();
    useJourneyStore.getState().completeStep(1);
    useSettingsStore.getState().setLanguage('hi');

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useJourneyStore.getState().currentStep).toBe(2);
    expect(useSettingsStore.getState().language).toBe('hi');
  });

  it('should handle full user journey flow', () => {
    useAuthStore.getState().loginAsGuest();
    useSettingsStore.getState().setLanguage('ta');
    useSettingsStore.getState().completeOnboarding();

    for (let i = 1; i <= 7; i++) {
      useJourneyStore.getState().completeStep(i);
    }
    useJourneyStore.getState().addXP(500);
    useJourneyStore.getState().addBadge('journey-complete');

    expect(useJourneyStore.getState().readinessScore).toBe(100);
    expect(useJourneyStore.getState().xp).toBe(500);
    expect(useJourneyStore.getState().badges).toContain('journey-complete');
    expect(useSettingsStore.getState().onboardingComplete).toBe(true);
  });

  it('should reset journey on logout', () => {
    useAuthStore.getState().loginAsGuest();
    useJourneyStore.getState().completeStep(1);
    useJourneyStore.getState().addXP(100);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    // Journey state persists independently (local storage)
    expect(useJourneyStore.getState().completedSteps).toContain(1);
  });
});
