/**
 * Settings Store — manages user preferences (theme, language, onboarding status).
 * Persisted to localStorage via Zustand middleware.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  onboardingComplete: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: string) => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      onboardingComplete: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    { name: 'voteai-settings' }
  )
);
