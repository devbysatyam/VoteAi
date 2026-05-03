import { describe, it, expect } from 'vitest';
import { validateProfile, validateMessage, isValidVoterType, isValidLanguage, sanitize } from '../../src/utils/validation';

describe('sanitize', () => {
  it('should strip HTML tags', () => {
    expect(sanitize('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('should trim whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('should handle empty strings', () => {
    expect(sanitize('')).toBe('');
  });
});

describe('validateProfile', () => {
  it('should pass with valid data', () => {
    const result = validateProfile({ name: 'Priya', state: 'Maharashtra', constituency: 'Mumbai', age: '25' });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should fail with empty name', () => {
    const result = validateProfile({ name: '', state: 'Delhi', constituency: '', age: '25' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name must be at least 2 characters');
  });

  it('should fail with name too short', () => {
    const result = validateProfile({ name: 'A', state: 'Delhi', constituency: '', age: '25' });
    expect(result.valid).toBe(false);
  });

  it('should fail with no state', () => {
    const result = validateProfile({ name: 'Priya', state: '', constituency: '', age: '25' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Please select a state');
  });

  it('should fail with age under 18', () => {
    const result = validateProfile({ name: 'Priya', state: 'Delhi', constituency: '', age: '16' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Age must be between 18 and 120');
  });

  it('should fail with age over 120', () => {
    const result = validateProfile({ name: 'Priya', state: 'Delhi', constituency: '', age: '150' });
    expect(result.valid).toBe(false);
  });

  it('should sanitize XSS in name', () => {
    const result = validateProfile({ name: '<img onerror=alert(1)>Priya', state: 'Delhi', constituency: '', age: '25' });
    expect(result.sanitized.name).toBe('Priya');
  });

  it('should truncate long names', () => {
    const longName = 'A'.repeat(200);
    const result = validateProfile({ name: longName, state: 'Delhi', constituency: '', age: '25' });
    expect(result.sanitized.name.length).toBeLessThanOrEqual(100);
  });
});

describe('validateMessage', () => {
  it('should pass valid messages', () => {
    const result = validateMessage('How do I vote?');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('How do I vote?');
  });

  it('should fail empty messages', () => {
    const result = validateMessage('');
    expect(result.valid).toBe(false);
  });

  it('should fail whitespace-only messages', () => {
    const result = validateMessage('   ');
    expect(result.valid).toBe(false);
  });

  it('should strip HTML', () => {
    const result = validateMessage('<b>Bold</b> text');
    expect(result.sanitized).toBe('Bold text');
  });

  it('should truncate long messages', () => {
    const long = 'A'.repeat(3000);
    const result = validateMessage(long);
    expect(result.sanitized.length).toBeLessThanOrEqual(2000);
  });
});

describe('isValidVoterType', () => {
  it('should accept general', () => expect(isValidVoterType('general')).toBe(true));
  it('should accept nri', () => expect(isValidVoterType('nri')).toBe(true));
  it('should accept service', () => expect(isValidVoterType('service')).toBe(true));
  it('should reject invalid', () => expect(isValidVoterType('alien')).toBe(false));
  it('should reject empty', () => expect(isValidVoterType('')).toBe(false));
});

describe('isValidLanguage', () => {
  it('should accept en', () => expect(isValidLanguage('en')).toBe(true));
  it('should accept hi', () => expect(isValidLanguage('hi')).toBe(true));
  it('should accept ta', () => expect(isValidLanguage('ta')).toBe(true));
  it('should reject invalid codes', () => expect(isValidLanguage('xx')).toBe(false));
  it('should reject empty', () => expect(isValidLanguage('')).toBe(false));
});
