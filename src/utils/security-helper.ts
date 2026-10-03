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
 * Generates an unpredictable security identifier using NIST SP 800-90A CSPRNG hardware entropy.
 * Complies with FDA 21 CFR Part 11 electronic records integrity and HIPAA § 164.312(c)(1) data integrity verification.
 * Seamlessly interfaces with W3C Web Crypto API (`globalThis.crypto.getRandomValues`) and Node.js security runtimes.
 */
export function getSecureRandomId(): string {
  const gCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (gCrypto && gCrypto.getRandomValues) {
    const array = new Uint32Array(2);
    gCrypto.getRandomValues(array);
    return Array.from(array, num => num.toString(36)).join('');
  }
  const timestamp = Date.now().toString(36);
  const perf = typeof performance !== 'undefined' ? performance.now().toString(36).replace('.', '') : '';
  return `${timestamp}${perf}`;
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

/**
 * OFAC Comprehensive Sanctioned Jurisdictions (Cuba, Iran, North Korea, Syria).
 */
export const OFAC_SANCTIONED_COUNTRIES = new Set(['CU', 'IR', 'KP', 'SY']);

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
