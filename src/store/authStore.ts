import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  name: string;
  state: string;
  constituency: string;
  age: number;
  isFirstTimeVoter: boolean;
  voterType: 'general' | 'nri' | 'service';
  photoUrl: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isGuest: false,
      user: null,
      setUser: (user) => set({ user, isAuthenticated: true, isGuest: false }),
      loginAsGuest: () =>
        set({
          isGuest: true,
          isAuthenticated: true,
          user: {
            name: 'Guest Voter',
            state: 'Uttar Pradesh',
            constituency: 'Varanasi North',
            age: 21,
            isFirstTimeVoter: true,
            voterType: 'general',
            photoUrl: '',
          },
        }),
      logout: () => set({ isAuthenticated: false, isGuest: false, user: null }),
    }),
    { name: 'voteai-auth' }
  )
);
