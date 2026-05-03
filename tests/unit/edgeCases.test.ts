import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessage, generateQuizQuestions } from '../../src/services/gemini';

vi.mock('../../src/services/firebase', () => ({
  isFirebaseConfigured: false,
  auth: null,
  db: null,
}));

describe('Gemini service edge cases', () => {
  it('should handle special characters in messages', async () => {
    const reply = await sendChatMessage('What about <script>alert("xss")</script> voting?');
    expect(reply.length).toBeGreaterThan(0);
  });

  it('should handle very short messages', async () => {
    const reply = await sendChatMessage('hi');
    expect(reply.length).toBeGreaterThan(0);
  });

  it('should handle unicode messages', async () => {
    const reply = await sendChatMessage('मतदान कैसे करें?');
    expect(reply.length).toBeGreaterThan(0);
  });

  it('should return quiz questions from defaults', async () => {
    const questions = await generateQuizQuestions();
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]).toHaveProperty('q');
    expect(questions[0]).toHaveProperty('options');
    expect(questions[0]).toHaveProperty('correct');
    expect(questions[0]).toHaveProperty('explanation');
  });

  it('should return quiz questions with valid structure', async () => {
    const questions = await generateQuizQuestions();
    for (const q of questions) {
      expect(typeof q.q).toBe('string');
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBe(4);
      expect(typeof q.correct).toBe('number');
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(4);
    }
  });
});

describe('Validation edge cases', () => {
  let validateProfile: typeof import('../../src/utils/validation').validateProfile;
  let validateMessage: typeof import('../../src/utils/validation').validateMessage;
  let sanitize: typeof import('../../src/utils/validation').sanitize;
  let isValidLanguage: typeof import('../../src/utils/validation').isValidLanguage;

  beforeEach(async () => {
    const mod = await import('../../src/utils/validation');
    validateProfile = mod.validateProfile;
    validateMessage = mod.validateMessage;
    sanitize = mod.sanitize;
    isValidLanguage = mod.isValidLanguage;
  });

  it('should handle names with special characters', () => {
    const result = validateProfile({ name: "O'Brien-Smith", state: 'Delhi', constituency: '', age: '25' });
    expect(result.valid).toBe(true);
    expect(result.sanitized.name).toContain("O'Brien");
  });

  it('should handle names with unicode', () => {
    const result = validateProfile({ name: 'प्रिया शर्मा', state: 'Delhi', constituency: '', age: '25' });
    expect(result.valid).toBe(true);
  });

  it('should reject age exactly 17', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: '', age: '17' });
    expect(result.valid).toBe(false);
  });

  it('should accept age exactly 18', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: '', age: '18' });
    expect(result.valid).toBe(true);
  });

  it('should accept age exactly 120', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: '', age: '120' });
    expect(result.valid).toBe(true);
  });

  it('should reject age 121', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: '', age: '121' });
    expect(result.valid).toBe(false);
  });

  it('should handle non-numeric age', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: '', age: 'abc' });
    expect(result.valid).toBe(false);
  });

  it('should sanitize nested XSS attempts', () => {
    const result = sanitize('<img src=x onerror="alert(1)"><div onmouseover="alert(2)">text</div>');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('onmouseover');
    expect(result).toContain('text');
  });

  it('should handle messages at exact max length', () => {
    const msg = 'A'.repeat(2000);
    const result = validateMessage(msg);
    expect(result.valid).toBe(true);
    expect(result.sanitized.length).toBe(2000);
  });

  it('should validate all supported languages', () => {
    const supported = ['en','hi','ta','te','bn','mr','gu','kn','ml','or','pa','as','ur','mai','sa','mni','kok','ne','doi','brx','ks','sat'];
    for (const lang of supported) {
      expect(isValidLanguage(lang)).toBe(true);
    }
  });

  it('should reject unsupported languages', () => {
    expect(isValidLanguage('fr')).toBe(false);
    expect(isValidLanguage('de')).toBe(false);
    expect(isValidLanguage('zh')).toBe(false);
    expect(isValidLanguage('ja')).toBe(false);
  });
});
