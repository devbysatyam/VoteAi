/**
 * Chat route — Gemini AI powered election assistant.
 * 4-tier fallback: cache → Gemini Flash → Gemini Pro → hardcoded.
 */
import { Router } from 'express';

export const chatRouter = Router();

/** In-memory cache (Tier 1) */
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/** System prompt for election assistant */
const SYSTEM_PROMPT = `You are VoteAI, an expert AI assistant for Indian elections. You help voters understand the election process, find booths, learn about candidates, and exercise their democratic rights.

Rules:
1. Always be factually accurate about Indian election laws.
2. Never endorse or recommend any political party or candidate.
3. Remain politically neutral and non-partisan at all times.
4. Cite relevant laws (RPA 1951, Constitution articles) when applicable.
5. If unsure, say "I'm not certain about this — please verify with the Election Commission at 1950."
6. Keep responses under 200 words.
7. Use simple language accessible to first-time voters.
8. For booth locations, suggest using the ECI website or our Booth Finder feature.`;

/** Hardcoded fallbacks (Tier 4) */
const FALLBACKS = {
  eligibility: 'To vote in India, you must be an Indian citizen aged 18+ on the qualifying date and registered on the electoral roll. Check at nvsp.in or call 1950.',
  booth: 'Find your polling booth at eci.gov.in using your EPIC number or search by name. You can also use our Booth Finder map feature!',
  evm: 'An EVM has two parts: Ballot Unit (shows candidates) and Control Unit (operated by officer). Press the blue button next to your chosen candidate. A beep confirms your vote. The VVPAT slip appears for 7 seconds.',
  documents: 'Carry your Voter ID (EPIC). Acceptable alternates: Aadhaar, Passport, PAN Card, Driving License, MNREGA Job Card. Also bring the voter slip from your BLO.',
  nota: 'NOTA (None Of The Above) lets you reject all candidates. Introduced in 2013 by Supreme Court ruling. If NOTA gets the most votes, the runner-up still wins under current rules.',
  general: 'I can help with voter eligibility, booth finding, candidate info, election rules, EVM usage, and voting rights. What would you like to know?',
};

chatRouter.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sanitized = message.trim().slice(0, 2000);
    const cacheKey = sanitized.toLowerCase().slice(0, 100);

    /* Tier 1: Cache */
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.json({ data: { reply: cached.text, source: 'cache' } });
    }

    /* Tier 2: Gemini Flash */
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const reply = await callGemini(apiKey, sanitized, 'gemini-2.0-flash');
        if (reply) {
          cache.set(cacheKey, { text: reply, ts: Date.now() });
          return res.json({ data: { reply, source: 'gemini-flash' } });
        }
      } catch (err) {
        console.warn('Gemini Flash failed, trying Pro:', err.message);
      }

      /* Tier 3: Gemini Pro */
      try {
        const reply = await callGemini(apiKey, sanitized, 'gemini-2.0-pro');
        if (reply) {
          cache.set(cacheKey, { text: reply, ts: Date.now() });
          return res.json({ data: { reply, source: 'gemini-pro' } });
        }
      } catch (err) {
        console.warn('Gemini Pro failed, using fallback:', err.message);
      }
    }

    /* Tier 4: Hardcoded fallback */
    const fallback = getFallbackResponse(sanitized);
    return res.json({ data: { reply: fallback, source: 'fallback' } });
  } catch (err) {
    next(err);
  }
});

/** Call Gemini API */
async function callGemini(apiKey, message, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser question: ${message}` }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

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
