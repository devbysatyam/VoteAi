/**
 * Firestore Data Service — CRUD operations for users, journey, quiz scores, chat history.
 * All data is encrypted at rest by Google Cloud (AES-256).
 * Uses merge writes to prevent data loss on partial updates.
 */
import { doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';

/* ---------- USER PROFILE ---------- */
export async function saveUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<Record<string, unknown> | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

/* ---------- JOURNEY PROGRESS ---------- */
export async function saveJourneyProgress(uid: string, data: {
  currentStep: number;
  completedSteps: number[];
  readinessScore: number;
  badges: string[];
  xp: number;
}): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'journey', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getJourneyProgress(uid: string): Promise<Record<string, unknown> | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'journey', uid));
  return snap.exists() ? snap.data() : null;
}

/* ---------- QUIZ SCORES ---------- */
export async function saveQuizScore(uid: string, score: number, total: number): Promise<void> {
  if (!db) return;
  const ref = doc(collection(db, 'quiz_scores'));
  await setDoc(ref, {
    uid,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: serverTimestamp(),
  });
  /* Update user aggregate */
  await updateDoc(doc(db, 'users', uid), {
    totalQuizzes: increment(1),
    totalXP: increment(score * 50),
  });
}

/* ---------- CHAT HISTORY ---------- */
export async function saveChatMessage(uid: string, role: 'user' | 'ai', text: string): Promise<void> {
  if (!db) return;
  const ref = doc(collection(db, 'chat_history'));
  await setDoc(ref, { uid, role, text, timestamp: serverTimestamp() });
}

export async function getChatHistory(uid: string, maxMessages = 50): Promise<Array<{ role: string; text: string }>> {
  if (!db) return [];
  const q = query(
    collection(db, 'chat_history'),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(maxMessages)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ role: d.data().role as string, text: d.data().text as string }))
    .reverse();
}

/* ---------- LEADERBOARD ---------- */
export async function getLeaderboard(topN = 10): Promise<Array<{ name: string; xp: number }>> {
  if (!db) return [];
  const q = query(
    collection(db, 'users'),
    orderBy('totalXP', 'desc'),
    limit(topN)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    name: d.data().name as string || 'Voter',
    xp: (d.data().totalXP as number) || 0,
  }));
}
