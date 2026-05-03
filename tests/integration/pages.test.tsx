import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';

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

describe('SignIn Page', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
  });

  it('should render sign-in page with heading', async () => {
    const { default: SignIn } = await import('../../src/pages/onboarding/SignIn');
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /welcome to voteai/i })).toBeInTheDocument();
  });

  it('should render Google sign-in button with aria-label', async () => {
    const { default: SignIn } = await import('../../src/pages/onboarding/SignIn');
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('should render guest button with aria-label', async () => {
    const { default: SignIn } = await import('../../src/pages/onboarding/SignIn');
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /continue as guest/i })).toBeInTheDocument();
  });

  it('should login as guest when guest button clicked', async () => {
    const { default: SignIn } = await import('../../src/pages/onboarding/SignIn');
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /continue as guest/i }));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isGuest).toBe(true);
  });
});

describe('ProfileSetup Page', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
  });

  it('should render profile setup form', async () => {
    const { default: ProfileSetup } = await import('../../src/pages/onboarding/ProfileSetup');
    render(<MemoryRouter><ProfileSetup /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /set up your profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty form', async () => {
    const { default: ProfileSetup } = await import('../../src/pages/onboarding/ProfileSetup');
    render(<MemoryRouter><ProfileSetup /></MemoryRouter>);
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should have voter type radio group', async () => {
    const { default: ProfileSetup } = await import('../../src/pages/onboarding/ProfileSetup');
    render(<MemoryRouter><ProfileSetup /></MemoryRouter>);
    expect(screen.getByRole('radiogroup', { name: /voter type/i })).toBeInTheDocument();
  });

  it('should have first-time voter toggle', async () => {
    const { default: ProfileSetup } = await import('../../src/pages/onboarding/ProfileSetup');
    render(<MemoryRouter><ProfileSetup /></MemoryRouter>);
    expect(screen.getByRole('switch', { name: /first time voter/i })).toBeInTheDocument();
  });
});
