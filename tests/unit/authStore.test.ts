import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      isGuest: false,
      user: null,
    });
  });

  it('should start unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should login as guest with default profile', () => {
    useAuthStore.getState().loginAsGuest();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isGuest).toBe(true);
    expect(state.user?.name).toBe('Guest Voter');
    expect(state.user?.isFirstTimeVoter).toBe(true);
  });

  it('should set user profile on login', () => {
    useAuthStore.getState().setUser({
      name: 'Priya Sharma',
      state: 'Maharashtra',
      constituency: 'Mumbai South',
      age: 25,
      isFirstTimeVoter: false,
      voterType: 'general',
      photoUrl: 'https://example.com/photo.jpg',
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isGuest).toBe(false);
    expect(state.user?.name).toBe('Priya Sharma');
    expect(state.user?.state).toBe('Maharashtra');
  });

  it('should logout and clear state', () => {
    useAuthStore.getState().loginAsGuest();
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
