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

function requireCsprng(): Crypto {
  const gCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (!gCrypto || typeof gCrypto.getRandomValues !== 'function') {
    throw new Error('NIST SP 800-90A CSPRNG unavailable: globalThis.crypto.getRandomValues is required (fail-closed).');
  }
  return gCrypto;
}

/**
 * Generates an unpredictable 128-bit security identifier using NIST SP 800-90A CSPRNG hardware entropy.
 * Complies with FDA 21 CFR Part 11 electronic records integrity and HIPAA § 164.312(c)(1) data integrity verification.
 * Fails closed if Web Crypto / Node CSPRNG is unavailable.
 */
export function getSecureRandomId(): string {
  return getSecureRandomHex(16);
}

/**
 * Returns a uniformly distributed [0, 1) fraction backed by CSPRNG 53-bit IEEE-754 mantissa scaling
 * (NIST SP 800-90A compliant; zero modulo bias, zero Math.random, and fail-closed without weak LCG fallback).
 */
export function getSecureRandomFraction(): number {
  const gCrypto = requireCsprng();
  const words = new Uint32Array(2);
  gCrypto.getRandomValues(words);
  const high = words[0] >>> 5;  // 27 bits
  const low = words[1] >>> 6;   // 26 bits
  return (high * 67108864.0 + low) / 9007199254740992.0;
}

/**
 * Generates a NIST SP 800-90A CSPRNG lowercase hex string of `byteCount` bytes.
 * Fails closed if CSPRNG is unavailable.
 */
export function getSecureRandomHex(byteCount: number = 16): string {
  if (!Number.isInteger(byteCount) || byteCount <= 0 || byteCount > 4096) {
    throw new RangeError('byteCount must be an integer between 1 and 4096.');
  }
  const gCrypto = requireCsprng();
  const bytes = new Uint8Array(byteCount);
  gCrypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function normalizeBasePath(rawBase: string): { prefix: string; parts: string[] } {
  if (!rawBase || typeof rawBase !== 'string' || rawBase.includes('\0')) {
    throw new Error('Invalid baseDir: must be a non-empty string without null bytes.');
  }
  const unified = rawBase.replace(/\\/g, '/');
  let prefix = '';
  let remainder = unified;

  const winDriveMatch = unified.match(/^([a-zA-Z]:)\//);
  if (winDriveMatch) {
    prefix = `${winDriveMatch[1]}/`;
    remainder = unified.slice(prefix.length);
  } else if (unified.startsWith('/')) {
    prefix = '/';
    remainder = unified.slice(1);
  }

  const stack: string[] = [];
  for (const part of remainder.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return { prefix, parts: stack };
}

/**
 * Resolves a file path securely and verifies it remains strictly constrained within `baseDir` (js/http-to-file-access).
 * Rejects null bytes, backslashes, URL-encoded traversal (`%2e%2e`, `%2f`, `%5c`), absolute escapes, and `..` traversal.
 * Pure browser-and-Node-safe normalization.
 */
export function securePathResolve(baseDir: string, ...pathSegments: string[]): string {
  const { prefix, parts: baseParts } = normalizeBasePath(baseDir);
  const resolvedParts = [...baseParts];

  for (const rawSeg of pathSegments) {
    if (typeof rawSeg !== 'string') {
      throw new Error('Path traversal rejected: path segment must be a string.');
    }
    if (rawSeg.includes('\0')) {
      throw new Error('Path traversal rejected: null byte detected in path segment.');
    }
    if (rawSeg.includes('\\')) {
      throw new Error('Path traversal rejected: backslash separator not allowed in path segment.');
    }
    if (/^[a-zA-Z]:/.test(rawSeg) || rawSeg.startsWith('/')) {
      throw new Error('Path traversal rejected: absolute path segment cannot override baseDir.');
    }

    // Iteratively decode percent-encoding to block %2e%2e, %252e%252e, %2f, %5c obfuscation
    let decoded = rawSeg;
    for (let i = 0; i < 3; i++) {
      if (/%2e|%2f|%5c|%00/i.test(decoded)) {
        throw new Error('Path traversal rejected: URL-encoded traversal or separator sequence detected.');
      }
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch {
        throw new Error('Path traversal rejected: malformed percent-encoding in path segment.');
      }
    }

    if (decoded.includes('\0') || decoded.includes('\\')) {
      throw new Error('Path traversal rejected: decoded segment contains illegal separator or null byte.');
    }

    for (const part of decoded.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        throw new Error('Path traversal rejected: parent directory ("..") segment is prohibited.');
      }
      resolvedParts.push(part);
    }
  }

  // Final containment invariant check
  if (resolvedParts.length < baseParts.length) {
    throw new Error('Path traversal rejected: resolved path escapes base directory.');
  }
  for (let i = 0; i < baseParts.length; i++) {
    if (resolvedParts[i] !== baseParts[i]) {
      throw new Error('Path traversal rejected: resolved path escapes base directory.');
    }
  }

  return `${prefix}${resolvedParts.join('/')}`;
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

/**
 * OFAC Comprehensive Sanctioned Jurisdictions (Cuba, Iran, North Korea).
 * Note: Syria ('SY') comprehensive sanctions lifted under E.O. 14312 / PAARSSR (Issue #432).
 */
export const OFAC_SANCTIONED_COUNTRIES = new Set(['CU', 'IR', 'KP']);

/**
 * Renders statutory 451 Unavailable For Legal Reasons notification for OFAC-restricted jurisdictions.
 */
export function renderOfacRestrictedHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>451 Unavailable For Legal Reasons — PocketGull</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; text-align: center;">
  <div style="max-width: 520px; background: #18181b; border: 1px solid #27272a; border-radius: 1rem; padding: 2.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚖️</div>
    <h1 style="font-size: 1.25rem; font-weight: 700; color: #f87171; margin-bottom: 0.75rem;">451 &bull; Service Restricted In This Territory</h1>
    <p style="font-size: 0.875rem; color: #a1a1aa; line-height: 1.6; margin-bottom: 1.5rem;">
      PocketGull software distributions and clinical AI telemetry endpoints are legally restricted from deployment in OFAC-sanctioned jurisdictions in strict compliance with U.S. Export Administration Regulations (EAR) and statutory trade sanctions.
    </p>
    <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #71717a;">
      PocketGull LLC &bull; Oregon Entity 258869891 &bull; Statutory Egress Guard
    </div>
  </div>
</body>
</html>`;
}
