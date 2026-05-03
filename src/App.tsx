/**
 * App — Root application component.
 * Handles routing, theme management, language (lang attribute), Firebase initialization,
 * and provides skip-navigation + offline indicator for accessibility.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { initAuthListener } from './services/auth';
import { initStoreSync } from './services/storeSync';
import { initAnalytics, isFirebaseConfigured } from './services/firebase';
import AppLayout from './components/layout/AppLayout';
import OnboardingLayout from './components/layout/OnboardingLayout';
import AuthGuard from './components/layout/AuthGuard';
import OfflineIndicator from './components/OfflineIndicator';

/** Maps internal language codes to BCP-47 lang attributes */

const LANG_MAP: Record<string, string> = {
  en: 'en', hi: 'hi', ta: 'ta', te: 'te', bn: 'bn', mr: 'mr',
  gu: 'gu', kn: 'kn', ml: 'ml', or: 'or', pa: 'pa', as: 'as',
  ur: 'ur', mai: 'mai', sa: 'sa', mni: 'mni', kok: 'kok',
  ne: 'ne', doi: 'doi', brx: 'brx', ks: 'ks', sat: 'sat',
};

/* Lazy-loaded pages */
const WelcomeSplash = lazy(() => import('./pages/onboarding/WelcomeSplash'));
const LanguageSelect = lazy(() => import('./pages/onboarding/LanguageSelect'));
const ProfileSetup = lazy(() => import('./pages/onboarding/ProfileSetup'));
const SignIn = lazy(() => import('./pages/onboarding/SignIn'));
const VoterIDCard = lazy(() => import('./pages/onboarding/VoterIDCard'));
const Dashboard = lazy(() => import('./pages/home/Dashboard'));
const VotingJourney = lazy(() => import('./pages/journey/VotingJourney'));
const CandidateList = lazy(() => import('./pages/explore/CandidateList'));
const EVMSimulator = lazy(() => import('./pages/vote/EVMSimulator'));
const LearnHub = lazy(() => import('./pages/learn/LearnHub'));
const QuizSession = lazy(() => import('./pages/learn/QuizSession'));
const Timeline = lazy(() => import('./pages/learn/Timeline'));
const RightsShield = lazy(() => import('./pages/learn/RightsShield'));
const BoothWalkthrough = lazy(() => import('./pages/learn/BoothWalkthrough'));
const BoothMap = lazy(() => import('./pages/map/BoothMap'));
const AIChat = lazy(() => import('./pages/chat/AIChat'));
const VotingChecklist = lazy(() => import('./pages/checklist/VotingChecklist'));
const BadgesProfile = lazy(() => import('./pages/profile/BadgesProfile'));
const ScenarioSim = lazy(() => import('./pages/scenario/ScenarioSim'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div role="status" aria-label="Loading page" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 32, width: '60%' }} />
      <div className="skeleton" style={{ height: 16, width: '80%' }} />
      <div className="skeleton" style={{ height: 120, width: '100%', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 120, width: '100%', borderRadius: 8 }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function App() {
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = LANG_MAP[language] || 'en';
  }, [language]);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubAuth = initAuthListener();
      const unsubSync = initStoreSync();
      initAnalytics();
      return () => {
        unsubAuth();
        unsubSync();
      };
    }
  }, []);

  return (
    <div data-theme={theme}>
      <OfflineIndicator />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public: Onboarding (no auth required) */}
            <Route element={<OnboardingLayout />}>
              <Route path="/welcome" element={<WelcomeSplash />} />
              <Route path="/language" element={<LanguageSelect />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/voter-card" element={<VoterIDCard />} />
            </Route>

            {/* Protected: Main App (requires login) */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Dashboard />} />
                <Route path="/journey" element={<VotingJourney />} />
                <Route path="/explore" element={<CandidateList />} />
                <Route path="/learn" element={<LearnHub />} />
                <Route path="/profile" element={<BadgesProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/checklist" element={<VotingChecklist />} />
              </Route>

              {/* Protected fullscreen pages */}
              <Route path="/vote" element={<EVMSimulator />} />
              <Route path="/quiz" element={<QuizSession />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/rights" element={<RightsShield />} />
              <Route path="/walkthrough" element={<BoothWalkthrough />} />
              <Route path="/booth-map" element={<BoothMap />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/scenarios" element={<ScenarioSim />} />
            </Route>

            {/* Default & 404 */}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}
