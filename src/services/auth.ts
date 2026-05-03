/**
 * Auth service — wraps Firebase Auth with Google Sign-In.
 * Handles authentication state and Firestore user profile sync.
 */
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from './firebase';
import { useAuthStore } from '../store/authStore';
import { useJourneyStore } from '../store/journeyStore';
import { getJourneyProgress } from './firestore';

/** Sign in with Google OAuth */
export async function signInWithGoogle(): Promise<boolean> {
  if (!auth || !isFirebaseConfigured) {
    console.warn('Firebase not configured — using guest mode');
    useAuthStore.getState().loginAsGuest();
    return true;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserToFirestore(user);
    return true;
  } catch (error: unknown) {
    console.error('Google sign-in failed:', error);
    const message = error instanceof Error ? error.message : 'Google sign-in failed';
    throw new Error(message);
  }
}

/** Sign out */
export async function signOutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
  useAuthStore.getState().logout();
}

/** Sync user data to Firestore on login */
async function syncUserToFirestore(user: User): Promise<void> {
  if (!db) return;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    /* Existing user — update last login */
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    const data = userDoc.data();
    useAuthStore.getState().setUser({
      name: data.name || user.displayName || 'Voter',
      state: data.state || 'Uttar Pradesh',
      constituency: data.constituency || '',
      age: data.age || 21,
      isFirstTimeVoter: data.isFirstTimeVoter ?? true,
      voterType: data.voterType || 'general',
      photoUrl: user.photoURL || '',
    });
  } else {
    /* New user — create profile */
    const profile = {
      name: user.displayName || 'Voter',
      email: user.email,
      photoUrl: user.photoURL || '',
      state: '',
      constituency: '',
      age: 0,
      isFirstTimeVoter: true,
      voterType: 'general',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    await setDoc(userRef, profile);
    useAuthStore.getState().setUser({
      name: profile.name,
      state: profile.state,
      constituency: profile.constituency,
      age: profile.age,
      isFirstTimeVoter: profile.isFirstTimeVoter,
      voterType: 'general',
      photoUrl: profile.photoUrl,
    });
  }

  /* Hydrate journey data from Firestore */
  const journeyData = await getJourneyProgress(user.uid);
  if (journeyData) {
    useJourneyStore.getState().hydrate({
      currentStep: journeyData.currentStep as number || 1,
      completedSteps: journeyData.completedSteps as number[] || [],
      readinessScore: journeyData.readinessScore as number || 0,
      badges: journeyData.badges as string[] || [],
      xp: journeyData.xp as number || 0,
      quizScores: journeyData.quizScores as number[] || [],
    });
  }
}

/** Listen for auth state changes */
export function initAuthListener(): () => void {
  if (!auth) return () => {};

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await syncUserToFirestore(user);
    } else {
      useAuthStore.getState().logout();
    }
  });
}
