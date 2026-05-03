import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../../src/store/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'light',
      language: 'en',
      onboardingComplete: false,
    });
  });

  it('should start with default values', () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe('light');
    expect(state.language).toBe('en');
    expect(state.onboardingComplete).toBe(false);
  });

  it('should toggle theme from light to dark', () => {
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('should toggle theme back from dark to light', () => {
    useSettingsStore.getState().toggleTheme();
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('should set language', () => {
    useSettingsStore.getState().setLanguage('hi');
    expect(useSettingsStore.getState().language).toBe('hi');
  });

  it('should complete onboarding', () => {
    useSettingsStore.getState().completeOnboarding();
    expect(useSettingsStore.getState().onboardingComplete).toBe(true);
  });
});
