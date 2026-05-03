/**
 * Gemini AI Service — handles chat and quiz generation with 4-tier resilience.
 * Tier 1: In-memory cache (1hr TTL)
 * Tier 2: Backend API (/api/chat)
 * Tier 3: Client-side Gemini SDK (direct)
 * Tier 4: Hardcoded fallback responses (never fails)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/** In-memory response cache (Tier 1) */
const responseCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/** Hardcoded fallback responses (Tier 4) */
const FALLBACK: Record<string, string> = {
  eligibility: 'To vote in India, you must be an Indian citizen aged 18+ and registered on the electoral roll. Check your status at nvsp.in or call 1950.',
  booth: 'Find your polling booth at eci.gov.in using your EPIC number. You can also search by name and constituency.',
  evm: 'An EVM has a Ballot Unit (with candidates) and Control Unit. Press the blue button next to your candidate. A beep confirms your vote. The VVPAT slip appears for 7 seconds.',
  documents: 'Carry your Voter ID (EPIC). Alternates: Aadhaar, Passport, PAN, DL, or MNREGA Job Card. Also bring the voter slip from your BLO.',
  nota: 'NOTA (None Of The Above) lets you reject all candidates. Introduced in 2013 by Supreme Court ruling.',
  general: 'I can help you with voter eligibility, booth finding, candidate info, election rules, EVM usage, and voting rights. What would you like to know?',
};

/**
 * Send a message to the AI chat service.
 * Implements 4-tier fallback for resilience.
 */
export async function sendChatMessage(message: string): Promise<string> {
  const cacheKey = message.toLowerCase().trim().slice(0, 100);

  /* Tier 1: Check cache */
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.text;
  }

  /* Tier 2: Try Backend API (Preferred) */
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.data?.reply || data.reply;
      if (text) {
        responseCache.set(cacheKey, { text, timestamp: Date.now() });
        return text;
      }
    }
  } catch (err) {
    console.warn("Backend Chat failed, falling back to client-side SDK:", err);
  }

  /* Tier 3: Try Gemini API directly on client side (Fallback) */
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest", 
        systemInstruction: "You are an AI election assistant for Indian voters. Keep responses brief, polite, and neutral. Answer questions about voting processes, eligibility, and the Indian democratic system." 
      });
      
      const result = await model.generateContent(message);
      const text = result.response.text();
      if (text) {
        responseCache.set(cacheKey, { text, timestamp: Date.now() });
        return text;
      }
    }
  } catch (err) {
    console.error("Gemini Client API Error:", err);
  }

  /* Tier 4: Hardcoded fallback (never fail the user) */
  return getFallback(message);
}

/** Generate quiz questions via AI or return defaults */
export async function generateQuizQuestions(): Promise<QuizQuestion[]> {
  try {
    const res = await fetch('/api/quiz', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return data.data?.questions || DEFAULT_QUESTIONS;
    }
  } catch {
    /* Fallback */
  }
  return DEFAULT_QUESTIONS;
}

/** Match user query to fallback category */
function getFallback(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('eligib') || lower.includes('age') || lower.includes('register')) return FALLBACK['eligibility']!;
  if (lower.includes('booth') || lower.includes('poll') || lower.includes('where')) return FALLBACK['booth']!;
  if (lower.includes('evm') || lower.includes('machine')) return FALLBACK['evm']!;
  if (lower.includes('document') || lower.includes('carry') || lower.includes('id card')) return FALLBACK['documents']!;
  if (lower.includes('nota') || lower.includes('none of')) return FALLBACK['nota']!;
  return FALLBACK['general']!;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  { q: 'What is the minimum voting age in India?', options: ['16 years', '18 years', '21 years', '25 years'], correct: 1, explanation: 'Article 326 sets the minimum voting age at 18, changed from 21 by the 61st Amendment in 1988.' },
  { q: 'What does EVM stand for?', options: ['Electronic Voting Machine', 'Election Verification Method', 'Electronic Vote Manager', 'Election Voting Module'], correct: 0, explanation: 'EVMs were first used in 1982 in Kerala and used nationwide since 2004.' },
  { q: 'Who appoints the Chief Election Commissioner?', options: ['Prime Minister', 'Parliament', 'President of India', 'Supreme Court'], correct: 2, explanation: 'The President appoints the CEC under Article 324 of the Constitution.' },
  { q: 'What is NOTA?', options: ['National Org for Transparent Admin', 'None Of The Above', 'New Online Tally App', 'National Office of Tech Auditing'], correct: 1, explanation: 'NOTA was introduced in 2013 by Supreme Court ruling, allowing voters to reject all candidates.' },
  { q: 'How long is the "silence period" before voting?', options: ['24 hours', '48 hours', '72 hours', '1 week'], correct: 1, explanation: 'Campaigning must stop 48 hours before polling to allow uninfluenced decisions.' },
];
