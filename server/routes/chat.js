/**
 * Chat Route — Gemini AI powered election assistant.
 * Implements 4-tier fallback for maximum resilience:
 * Tier 1: In-memory cache (1hr TTL)
 * Tier 2: Gemini SDK (server-side)
 * Tier 4: Hardcoded domain-specific responses
 * Includes server-side HTML sanitization for all inputs.
 */
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const chatRouter = Router();

/** In-memory cache (Tier 1) */
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/** System prompt for election assistant */
const SYSTEM_PROMPT = `You are VoteAI, an expert AI assistant for Indian elections. You help voters understand the election process, find booths, learn about candidates, and exercise their democratic rights.
Keep responses brief, polite, and neutral. Never endorse any party. If unsure, tell them to call 1950.`;

/** Hardcoded fallbacks (Tier 4) */
const FALLBACKS = {
  eligibility: 'To vote in India, you must be an Indian citizen aged 18+ and registered on the electoral roll. Check at nvsp.in or call 1950.',
  booth: 'Find your polling booth at eci.gov.in using your EPIC number. You can also use our Booth Finder map feature!',
  evm: 'An EVM has a Ballot Unit and Control Unit. Press the blue button next to your chosen candidate. A beep confirms your vote.',
  documents: 'Carry your Voter ID (EPIC). Alternates: Aadhaar, Passport, PAN Card, Driving License. Also bring the voter slip.',
  nota: 'NOTA (None Of The Above) lets you reject all candidates. If NOTA wins, the runner-up still wins under current rules.',
  general: 'I can help with voter eligibility, booth finding, candidate info, election rules, and voting rights. What would you like to know?',
};

chatRouter.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters' });
    }

    const sanitized = message.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
    if (!sanitized) {
      return res.status(400).json({ error: 'Message cannot be empty after sanitization' });
    }

    const cacheKey = sanitized.toLowerCase().slice(0, 100);

    /* Tier 1: Cache */
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.json({ data: { reply: cached.text, source: 'cache' } });
    }

    /* Tier 2: Gemini SDK */
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          systemInstruction: SYSTEM_PROMPT 
        });

        const result = await model.generateContent(sanitized);
        const reply = result.response.text();
        
        if (reply) {
          cache.set(cacheKey, { text: reply, ts: Date.now() });
          return res.json({ data: { reply, source: 'gemini' } });
        }
      } catch (err) {
        console.warn('Gemini failed:', err.message);
      }
    }

    /* Tier 4: Hardcoded fallback */
    const fallback = getFallbackResponse(sanitized);
    return res.json({ data: { reply: fallback, source: 'fallback' } });
  } catch (err) {
    next(err);
  }
});

/** Match fallback category */
function getFallbackResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes('eligib') || lower.includes('age') || lower.includes('register')) return FALLBACKS.eligibility;
  if (lower.includes('booth') || lower.includes('poll') || lower.includes('where')) return FALLBACKS.booth;
  if (lower.includes('evm') || lower.includes('machine')) return FALLBACKS.evm;
  if (lower.includes('document') || lower.includes('carry') || lower.includes('id card')) return FALLBACKS.documents;
  if (lower.includes('nota') || lower.includes('none of')) return FALLBACKS.nota;
  return FALLBACKS.general;
}
