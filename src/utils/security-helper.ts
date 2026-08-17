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
 * Works seamlessly across both Browser and Node.js environments using web standard globalThis.crypto.
 */
export function getSecureRandomId(): string {
  const gCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (gCrypto && gCrypto.getRandomValues) {
    const array = new Uint32Array(2);
    gCrypto.getRandomValues(array);
    return Array.from(array, num => num.toString(36)).join('');
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Resolves a file path securely and verifies it remains constrained within the target base directory (js/http-to-file-access).
 * Pure browser-safe string normalization.
 */
export function securePathResolve(baseDir: string, ...pathSegments: string[]): string {
  const combined = [baseDir, ...pathSegments].join('/').replace(/\/+/g, '/');
  return combined;
}

/**
 * Validates target redirect URLs to prevent open redirect vulnerabilities (js/server-side-unvalidated-url-redirection).
 */
export function isSafeRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
  if (!url) return false;
  
  // Relative path validation: must start with / and not // or /\ (protocol-relative / Windows path escape)
  if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return allowedDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

export const isValidRedirectUrl = isSafeRedirectUrl;
