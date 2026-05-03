import { describe, it, expect } from 'vitest';
import { sanitize, validateProfile, validateMessage, isValidVoterType, isValidLanguage } from '../../src/utils/validation';

describe('Security: XSS Prevention', () => {
  it('should strip script tags', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('');
  });

  it('should strip event handlers', () => {
    expect(sanitize('<img onerror="alert(1)" src="x">')).toBe('');
  });

  it('should strip iframe tags', () => {
    expect(sanitize('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('should strip style tags', () => {
    expect(sanitize('<style>body{display:none}</style>')).toBe('');
  });

  it('should strip link tags', () => {
    expect(sanitize('<link rel="stylesheet" href="evil.css">')).toBe('');
  });

  it('should strip SVG with embedded scripts', () => {
    const result = sanitize('<svg onload="alert(1)"><circle r="10"/></svg>');
    expect(result).not.toContain('onload');
    expect(result).not.toContain('alert');
  });

  it('should strip data URIs in attributes', () => {
    const result = sanitize('<a href="data:text/html,<script>alert(1)</script>">click</a>');
    expect(result).not.toContain('data:');
  });

  it('should handle nested XSS attempts', () => {
    const result = sanitize('<<script>script>alert(1)<</script>/script>');
    expect(result).not.toContain('<script>');
  });

  it('should handle encoded XSS attempts', () => {
    const result = sanitize('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result).not.toContain('<script>');
  });
});

describe('Security: Input Length Limits', () => {
  it('should truncate name to 100 chars', () => {
    const result = validateProfile({ name: 'A'.repeat(200), state: 'Delhi', constituency: '', age: '25' });
    expect(result.sanitized.name.length).toBeLessThanOrEqual(100);
  });

  it('should truncate state to 60 chars', () => {
    const result = validateProfile({ name: 'Test', state: 'A'.repeat(100), constituency: '', age: '25' });
    expect(result.sanitized.state.length).toBeLessThanOrEqual(60);
  });

  it('should truncate constituency to 100 chars', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: 'A'.repeat(200), age: '25' });
    expect(result.sanitized.constituency.length).toBeLessThanOrEqual(100);
  });

  it('should truncate message to 2000 chars', () => {
    const result = validateMessage('A'.repeat(5000));
    expect(result.sanitized.length).toBeLessThanOrEqual(2000);
  });

  it('should strip non-numeric from age', () => {
    const result = validateProfile({ name: 'Test', state: 'Delhi', constituency: '', age: '2a5b' });
    expect(result.sanitized.age).toBe('25');
  });
});

describe('Security: SQL/NoSQL Injection Prevention', () => {
  // Firestore uses parameterized queries, so SQL injection text is harmless plain text
  it('should pass SQL-like strings through as plain text (Firestore is not SQL)', () => {
    const result = validateProfile({ name: "'; DROP TABLE users; --", state: 'Delhi', constituency: '', age: '25' });
    expect(result.valid).toBe(true);
    expect(result.sanitized.name).toBe("'; DROP TABLE users; --");
  });

  it('should sanitize potential injection in message', () => {
    const result = validateMessage('{"$gt": ""}');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('{"$gt": ""}');
  });
});

describe('Security: Type Validation', () => {
  it('should reject invalid voter types', () => {
    expect(isValidVoterType('admin')).toBe(false);
    expect(isValidVoterType('__proto__')).toBe(false);
    expect(isValidVoterType('constructor')).toBe(false);
  });

  it('should reject invalid language codes', () => {
    expect(isValidLanguage('__proto__')).toBe(false);
    expect(isValidLanguage('constructor')).toBe(false);
  });
});
