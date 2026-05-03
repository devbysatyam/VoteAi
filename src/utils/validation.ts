/**
 * Input validation utilities.
 * Sanitizes all user inputs before storing in Firestore.
 */
import DOMPurify from 'dompurify';

/** Max field lengths to prevent abuse */
const MAX_LENGTHS: Record<string, number> = {
  name: 100,
  constituency: 100,
  state: 60,
  message: 2000,
  age: 3,
};

/** Sanitize HTML/XSS from user input */
export function sanitize(input: string): string {
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
}

/** Validate and sanitize a user profile form */
export function validateProfile(data: {
  name: string;
  state: string;
  constituency: string;
  age: string;
}): { valid: boolean; errors: string[]; sanitized: typeof data } {
  const errors: string[] = [];
  const sanitized = {
    name: sanitize(data.name).slice(0, MAX_LENGTHS['name']!),
    state: sanitize(data.state).slice(0, MAX_LENGTHS['state']!),
    constituency: sanitize(data.constituency).slice(0, MAX_LENGTHS['constituency']!),
    age: data.age.replace(/\D/g, '').slice(0, MAX_LENGTHS['age']!),
  };

  if (!sanitized.name || sanitized.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!sanitized.state) {
    errors.push('Please select a state');
  }

  const ageNum = parseInt(sanitized.age);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
    errors.push('Age must be between 18 and 120');
  }

  return { valid: errors.length === 0, errors, sanitized };
}

/** Validate a chat message */
export function validateMessage(text: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitize(text).slice(0, MAX_LENGTHS['message']!);
  if (!sanitized || sanitized.length < 1) {
    return { valid: false, sanitized: '', error: 'Message cannot be empty' };
  }
  return { valid: true, sanitized };
}

/** Validate voter type */
export function isValidVoterType(type: string): type is 'general' | 'nri' | 'service' {
  return ['general', 'nri', 'service'].includes(type);
}

/** Validate language code */
export function isValidLanguage(code: string): boolean {
  const valid = ['en','hi','ta','te','bn','mr','gu','kn','ml','or','pa','as','ur','mai','sa','mni','kok','ne','doi','brx','ks','sat'];
  return valid.includes(code);
}
