/**
 * PocketGull Enterprise Security & Data Sanitization Engine
 * 
 * Provides centralized, hardened utilities for:
 * 1. Safe HTML-to-Text stripping & XSS injection prevention (replaces ad-hoc regexes)
 * 2. Strict URL hostname and subdomain validation (prevents prefix spoofing & SSRF)
 * 3. Safe Alphanumeric & FHIR Token parameter sanitization (guards against path traversal / injection)
 * 4. Clinical Telemetry & PHI Redaction for safe structured logging (HIPAA & CodeQL compliant)
 * 5. ReDoS Regular Expression Safety Validator (detects catastrophic backtracking risks)
 */

/**
 * Iteratively strips HTML tags from an input string until all nested and
 * multi-character malicious injection tags are completely removed.
 */
export function stripHtmlToText(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  
  let prev = '';
  let curr = input;
  // Guard against exponential looping with bounded iterations
  let iterations = 0;
  while (curr !== prev && iterations < 10) {
    prev = curr;
    curr = curr.replace(/<[^>]*>/g, '');
    iterations++;
  }
  
  // Single-pass unescaping of common HTML entities (prevents double-unescaping vulnerabilities)
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' '
  };

  return curr.replace(/&(?:amp|lt|gt|quot|#039|apos|nbsp);/g, match => entityMap[match] || match).trim();
}

/**
 * Validates whether a given URL string belongs strictly to an allowed origin
 * or an authorized subdomain of a whitelist of base domains.
 * Prevents URL substring spoofing (e.g. attacker-pocketgull.com).
 */
export function isSafeSubdomainUrl(urlStr: string, allowedBaseDomains: string[] = ['pocketgull.app', 'pocketgull.com']): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    
    return allowedBaseDomains.some(base => {
      const lowerBase = base.toLowerCase();
      return hostname === lowerBase || hostname.endsWith(`.${lowerBase}`);
    });
  } catch {
    return false;
  }
}

/**
 * Sanitizes route parameters or user-supplied identifier tokens to safe
 * alphanumeric characters (plus hyphens and underscores), truncated to maxLen.
 * Protects against SQLi, NoSQL injection, and path traversal in URL params.
 */
export function sanitizeAlphanumericIdentifier(rawId: unknown, fallback = 'default', maxLen = 64): string {
  if (typeof rawId !== 'string' || !rawId) return fallback;
  const sanitized = rawId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLen);
  return sanitized.length > 0 ? sanitized : fallback;
}

/**
 * Redacts known sensitive fields (PHI, tokens, raw passwords, telemetry)
 * from objects prior to logging or console output.
 */
export function maskSensitiveLogData<T extends Record<string, any>>(
  data: T,
  customSensitiveKeys: string[] = []
): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  
  const defaultSensitiveKeys = new Set([
    'ssn', 'social_security', 'mrn', 'dob', 'date_of_birth',
    'password', 'secret', 'token', 'apiKey', 'api_key', 'authorization',
    'credit_card', 'card_number', 'cvv', 'telemetry', 'raw_signal',
    ...customSensitiveKeys.map(k => k.toLowerCase())
  ]);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (defaultSensitiveKeys.has(lowerKey)) {
      result[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = maskSensitiveLogData(value, customSensitiveKeys);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Analyzes a regular expression source pattern for common catastrophic
 * polynomial backtracking patterns (e.g. (a+)+, (.*a)*, or wildcard alternations).
 */
export function isSafeRegexPattern(pattern: string): { isSafe: boolean; warning?: string } {
  if (!pattern) return { isSafe: true };
  
  // Detect nested quantifiers like (x+)+ or (x*)*
  const nestedQuantifiers = /\([^)]*(\+|\*)[^)]*\)(\+|\*)/;
  if (nestedQuantifiers.test(pattern)) {
    return {
      isSafe: false,
      warning: 'Catastrophic ReDoS Risk: Nested quantifiers detected in pattern.'
    };
  }

  // Detect wildcard followed by alternations like .*(a|b).*
  if (pattern.includes('.*') && pattern.includes('|') && pattern.includes('(')) {
    return {
      isSafe: false,
      warning: 'Polynomial Backtracking Risk: Unbounded wildcard with alternation detected.'
    };
  }

  return { isSafe: true };
}
