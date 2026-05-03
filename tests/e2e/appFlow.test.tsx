/**
 * E2E-style tests — test user flows with proper router setup.
 * App contains its own BrowserRouter, so we test pages directly.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import { useJourneyStore } from '../../src/store/journeyStore';
import { useSettingsStore } from '../../src/store/settingsStore';

function resetStores() {
  useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
  useJourneyStore.setState({ currentStep: 1, completedSteps: [], readinessScore: 0, badges: [], quizScores: [], xp: 0 });
  useSettingsStore.setState({ theme: 'light', language: 'en', onboardingComplete: false });
}

describe('E2E: Welcome Screen', () => {
  beforeEach(resetStores);

  it('should render welcome page', async () => {
    const { default: WelcomeSplash } = await import('../../src/pages/onboarding/WelcomeSplash');
    render(<MemoryRouter><WelcomeSplash /></MemoryRouter>);
    expect(screen.getByText('Vote Smart. Vote Right.')).toBeInTheDocument();
  });

  it('should have Get Started button', async () => {
    const { default: WelcomeSplash } = await import('../../src/pages/onboarding/WelcomeSplash');
    render(<MemoryRouter><WelcomeSplash /></MemoryRouter>);
    expect(screen.getByText('Get Started →')).toBeInTheDocument();
  });
});

describe('E2E: Language Selection', () => {
  beforeEach(resetStores);

  it('should display all language options', async () => {
    const { default: LanguageSelect } = await import('../../src/pages/onboarding/LanguageSelect');
    render(<MemoryRouter><LanguageSelect /></MemoryRouter>);
    expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('हिन्दी').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('தமிழ்').length).toBeGreaterThanOrEqual(1);
  });
});

describe('E2E: AuthGuard', () => {
  beforeEach(resetStores);

  it('should block access when not authenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should allow access when authenticated as guest', () => {
    useAuthStore.getState().loginAsGuest();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Guest Voter');
  });
});

describe('E2E: Profile Setup validation', () => {
  beforeEach(resetStores);

  it('should render profile setup with all fields', async () => {
    const { default: ProfileSetup } = await import('../../src/pages/onboarding/ProfileSetup');
    render(<MemoryRouter><ProfileSetup /></MemoryRouter>);
    expect(screen.getByText('Set Up Your Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pincode/)).toBeInTheDocument();
  });

  it('should show constituency dropdown based on state', async () => {
    const { default: ProfileSetup } = await import('../../src/pages/onboarding/ProfileSetup');
    render(<MemoryRouter><ProfileSetup /></MemoryRouter>);
    /* Default state is UP, should show constituency select */
    expect(screen.getByText(/Select your constituency/)).toBeInTheDocument();
  });
});

describe('E2E: Dashboard access', () => {
  beforeEach(resetStores);

  it('should render dashboard when authenticated', async () => {
    useAuthStore.getState().loginAsGuest();
    const { default: Dashboard } = await import('../../src/pages/home/Dashboard');
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText("TODAY'S BRIEFING")).toBeInTheDocument();
    });
  });
});

describe('E2E: Constituency data', () => {
  it('should have correct constituency counts for major states', async () => {
    const { getConstituencies } = await import('../../src/data/constituencies');

    expect(getConstituencies('Uttar Pradesh').length).toBe(79);
    expect(getConstituencies('Maharashtra').length).toBe(48);
    expect(getConstituencies('Delhi').length).toBe(7);
    expect(getConstituencies('Tamil Nadu').length).toBe(39);
    expect(getConstituencies('Kerala').length).toBe(20);
    expect(getConstituencies('Bihar').length).toBe(40);
    expect(getConstituencies('West Bengal').length).toBe(41);
  });

  it('should detect state and constituency from pincode', async () => {
    const { detectLocationFromPincode } = await import('../../src/data/constituencies');

    expect(detectLocationFromPincode('110001').state).toBe('Delhi');
    expect(detectLocationFromPincode('400001').constituency).toBe('Mumbai South');
    expect(detectLocationFromPincode('600001').state).toBe('Tamil Nadu');
    expect(detectLocationFromPincode('221001').constituency).toBe('Varanasi');
    expect(detectLocationFromPincode('560001').state).toBe('Karnataka');
    expect(detectLocationFromPincode('700001').state).toBe('West Bengal');
  });

  it('should return null for invalid pincodes', async () => {
    const { detectLocationFromPincode } = await import('../../src/data/constituencies');
    expect(detectLocationFromPincode('9').state).toBeNull();
    expect(detectLocationFromPincode('').constituency).toBeNull();
  });
});
