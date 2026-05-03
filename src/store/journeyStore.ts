import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JourneyState {
  currentStep: number;
  completedSteps: number[];
  readinessScore: number;
  badges: string[];
  quizScores: number[];
  xp: number;
  setStep: (step: number) => void;
  completeStep: (step: number) => void;
  addBadge: (badge: string) => void;
  addQuizScore: (score: number) => void;
  addXP: (amount: number) => void;
  hydrate: (data: Partial<Omit<JourneyState, 'setStep' | 'completeStep' | 'addBadge' | 'addQuizScore' | 'addXP' | 'hydrate'>>) => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      readinessScore: 0,
      badges: [],
      quizScores: [],
      xp: 0,
      setStep: (step) => set({ currentStep: step }),
      completeStep: (step) => {
        const completed = [...new Set([...get().completedSteps, step])];
        const readiness = Math.round((completed.length / 7) * 100);
        set({ completedSteps: completed, readinessScore: readiness, currentStep: step + 1 });
      },
      addBadge: (badge) => set((s) => ({ badges: [...new Set([...s.badges, badge])] })),
      addQuizScore: (score) => set((s) => ({ quizScores: [...s.quizScores, score] })),
      addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
      hydrate: (data) => set((state) => ({ ...state, ...data })),
    }),
    { name: 'voteai-journey' }
  )
);
