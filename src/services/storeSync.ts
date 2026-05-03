/**
 * Store Sync Service — bidirectional synchronization between Zustand stores and Firestore.
 * Only syncs for authenticated (non-guest) users with valid Firebase connection.
 * Uses JSON comparison to avoid unnecessary writes on unchanged state.
 */
import { useAuthStore } from '../store/authStore';
import { useJourneyStore } from '../store/journeyStore';
import { saveUserProfile, saveJourneyProgress } from './firestore';
import { auth, isFirebaseConfigured } from './firebase';

export function initStoreSync() {
  if (!isFirebaseConfigured) return () => {};

  // Subscribe to authStore changes (User Profile)
  const unsubscribeAuth = useAuthStore.subscribe((state, prevState) => {
    // Only sync if user is authenticated and not a guest
    if (state.isAuthenticated && !state.isGuest && state.user && auth?.currentUser) {
      // Check if user object actually changed
      if (JSON.stringify(state.user) !== JSON.stringify(prevState.user)) {
        saveUserProfile(auth.currentUser.uid, state.user as unknown as Record<string, unknown>).catch(err => {
          console.error("Failed to sync user profile to Firestore:", err);
        });
      }
    }
  });

  // Subscribe to journeyStore changes (Progress, XP, Badges)
  const unsubscribeJourney = useJourneyStore.subscribe((state, prevState) => {
    const authState = useAuthStore.getState();
    if (authState.isAuthenticated && !authState.isGuest && auth?.currentUser) {
      // Check if relevant journey data changed
      const currentSyncData = {
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        readinessScore: state.readinessScore,
        badges: state.badges,
        xp: state.xp,
        quizScores: state.quizScores
      };
      const prevSyncData = {
        currentStep: prevState.currentStep,
        completedSteps: prevState.completedSteps,
        readinessScore: prevState.readinessScore,
        badges: prevState.badges,
        xp: prevState.xp,
        quizScores: prevState.quizScores
      };

      if (JSON.stringify(currentSyncData) !== JSON.stringify(prevSyncData)) {
        saveJourneyProgress(auth.currentUser.uid, currentSyncData).catch(err => {
          console.error("Failed to sync journey progress to Firestore:", err);
        });
      }
    }
  });

  return () => {
    unsubscribeAuth();
    unsubscribeJourney();
  };
}
