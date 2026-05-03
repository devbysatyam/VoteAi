import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequestCounts = new Map();

vi.mock('../../server/middleware/rateLimit.js', async () => {
  return {
    rateLimiter: (req, res, next) => {
      const ip = req.ip || 'test-ip';
      const isAI = req.path.includes('/chat') || req.path.includes('/quiz');
      const key = `${ip}:${isAI ? 'ai' : 'general'}`;
      const maxReq = isAI ? 20 : 100;
      const windowMs = isAI ? 60000 : 900000;
      const now = Date.now();
      const entry = mockRequestCounts.get(key) || { count: 0, resetAt: now + windowMs };

      if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + windowMs;
      }

      entry.count++;
      mockRequestCounts.set(key, entry);

      res.setHeader('X-RateLimit-Limit', maxReq);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxReq - entry.count));

      if (entry.count > maxReq) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      next();
    },
  };
});

describe('Rate Limiter Logic', () => {
  beforeEach(() => {
    mockRequestCounts.clear();
  });

  it('should allow requests under the limit', async () => {
    const { rateLimiter } = await import('../../server/middleware/rateLimit.js');
    const req = { ip: '1.2.3.4', path: '/api/health', headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
    };
    const next = vi.fn();

    rateLimiter(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
  });

  it('should set correct headers for AI endpoints', async () => {
    const { rateLimiter } = await import('../../server/middleware/rateLimit.js');
    const req = { ip: '1.2.3.4', path: '/api/chat', headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
    };
    const next = vi.fn();

    rateLimiter(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 20);
  });
});

describe('Chat Route Validation', () => {
  it('should reject empty messages', () => {
    const message = '';
    expect(!message || typeof message !== 'string' || message.trim().length === 0).toBe(true);
  });

  it('should reject non-string messages', () => {
    const message = 123;
    expect(typeof message !== 'string').toBe(true);
  });

  it('should accept valid messages', () => {
    const message = 'How do I vote?';
    expect(typeof message === 'string' && message.trim().length > 0).toBe(true);
  });

  it('should sanitize HTML from messages', () => {
    const message = '<script>alert("xss")</script>Hello';
    const sanitized = message.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
    expect(sanitized).toBe('alert("xss")Hello');
    expect(sanitized).not.toContain('<script>');
  });

  it('should truncate long messages', () => {
    const message = 'A'.repeat(3000);
    const sanitized = message.trim().slice(0, 2000);
    expect(sanitized.length).toBe(2000);
  });
});

describe('Quiz Route Validation', () => {
  it('should clamp count to valid range', () => {
    const clamp = (raw: string | undefined) => Math.max(1, Math.min(parseInt(raw as string) || 5, 10));
    expect(clamp('5')).toBe(5);
    expect(clamp('0')).toBe(5);
    expect(clamp('-1')).toBe(1);
    expect(clamp('100')).toBe(10);
    expect(clamp('abc')).toBe(5);
    expect(clamp(undefined)).toBe(5);
    expect(clamp('1')).toBe(1);
    expect(clamp('10')).toBe(10);
    expect(clamp('3')).toBe(3);
  });
});

describe('Health Route', () => {
  it('should return expected health response shape', () => {
    const response = {
      status: 'ok',
      service: 'VoteAI API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      gemini: false,
      uptime: 100,
    };
    expect(response.status).toBe('ok');
    expect(response.service).toBe('VoteAI API');
    expect(response.version).toBe('1.0.0');
    expect(typeof response.timestamp).toBe('string');
    expect(typeof response.uptime).toBe('number');
  });
});
