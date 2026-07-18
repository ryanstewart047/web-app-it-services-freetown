/**
 * Centralized, robust email validation utility to prevent spammers and bot registrations.
 * Checks for correct syntax, blocks disposable email domains, and prevents dot-stuffing (alias spam).
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'A valid email address is required.' };
  }

  const trimmed = email.trim();

  // 1. Strict format check
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  const [localPart, domainPart] = parts;

  // 2. Prevent dot-stuffing (dots randomization in username, e.g. a.y.i.g.u.gu.j.u.f.u510@gmail.com)
  // Flag any email with more than 2 dots in the local part as fake and invalid.
  const dotCount = (localPart.match(/\./g) || []).length;
  if (dotCount > 2) {
    return { 
      isValid: false, 
      error: 'Invalid email address.' 
    };
  }

  // 3. Block disposable/obviously fake email domains
  const BLOCKED_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'trashmail.com', 'tempmail.com',
    'throwam.com', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'mailnull.com', 'spamgourmet.com', 'fakeinbox.com', 'dispostable.com',
    'maildrop.cc', 'spamgourmet.org', 'spam4.me', 'tempr.email', 'discard.email',
    'example.com', 'test.com', 'sample.com'
  ];

  if (BLOCKED_DOMAINS.includes(domainPart.toLowerCase())) {
    return { 
      isValid: false, 
      error: 'This email domain is not allowed. Please use a real email address.' 
    };
  }

  return { isValid: true };
}
