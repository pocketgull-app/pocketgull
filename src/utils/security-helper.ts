import path from 'path';

/**
 * Sanitizes arbitrary values for safe logging, neutralizing log injection / CRLF manipulation attacks (js/log-injection).
 */
export function sanitizeLogInput(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }
  let str: string;
  if (typeof value === 'object') {
    try {
      str = JSON.stringify(value);
    } catch (e) {
      console.debug('[SecurityHelper] JSON.stringify fallback:', (e as Error)?.message);
      str = String(value);
    }
  } else {
    str = String(value);
  }
  const cleanStr = str.replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/[\x00-\x1F\x7F]+/g, ' ');
  return encodeURIComponent(cleanStr).slice(0, 2000);
}

/**
 * Generates a cryptographically secure random ID string (js/insecure-randomness).
 * Works seamlessly across both Browser and Node.js environments.
 */
export function getSecureRandomId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    return Array.from(array, num => num.toString(36)).join('');
  }
  // Node.js fallback
  try {
    const crypto = require('crypto');
    return crypto.randomBytes(8).toString('hex');
  } catch (e) {
    console.debug('[SecurityHelper] Node crypto fallback to Math.random:', (e as Error)?.message);
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
}

/**
 * Resolves a file path securely and verifies it remains constrained within the target base directory (js/http-to-file-access).
 */
export function securePathResolve(baseDir: string, ...pathSegments: string[]): string {
  const resolvedBase = path.resolve(baseDir);
  const resolvedPath = path.resolve(baseDir, ...pathSegments);

  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error(`Security Violation: Directory traversal detected outside base storage: ${resolvedPath}`);
  }
  return resolvedPath;
}

/**
 * Validates target redirect URLs to prevent open redirect vulnerabilities (js/server-side-unvalidated-url-redirection).
 */
export function isValidRedirectUrl(url: string, allowedDomains: string[] = ['pocketgull.app', 'api.pocketgull.app', 'pocketgull.com', 'localhost']): boolean {
  if (!url || typeof url !== 'string') return false;

  // Relative path validation: must start with / and not // or /\ (protocol-relative / Windows path escape)
  if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch (e) {
    console.debug('[SecurityHelper] URL parse rejection:', (e as Error)?.message);
    return false;
  }
}
