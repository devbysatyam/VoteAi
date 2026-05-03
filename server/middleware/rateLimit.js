/**
 * Rate Limiter Middleware — IP-based request throttling.
 * General API: 100 requests per 15 minutes.
 * AI endpoints (/chat, /quiz): 20 requests per minute (stricter to prevent abuse).
 * Uses in-memory Map for tracking; resets automatically per window.
 */

const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;
const AI_MAX_REQUESTS = 20; // Stricter for AI endpoints
const AI_WINDOW_MS = 60 * 1000; // 1 minute

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const isAI = req.path.includes('/chat') || req.path.includes('/quiz');
  const key = `${ip}:${isAI ? 'ai' : 'general'}`;
  const windowMs = isAI ? AI_WINDOW_MS : WINDOW_MS;
  const maxReq = isAI ? AI_MAX_REQUESTS : MAX_REQUESTS;

  const now = Date.now();
  const entry = requestCounts.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  requestCounts.set(key, entry);

  res.setHeader('X-RateLimit-Limit', maxReq);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxReq - entry.count));

  if (entry.count > maxReq) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
  }

  next();
}
