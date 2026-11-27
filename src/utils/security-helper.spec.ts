// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  OFAC_SANCTIONED_COUNTRIES,
  renderOfacRestrictedHtml,
  securePathResolve,
  getSecureRandomId,
  getSecureRandomFraction,
  getSecureRandomHex,
  isSafeRedirectUrl
} from './security-helper';

describe('OFAC Sanctioned Jurisdictions & Regulatory Compliance (Issue #432)', () => {
  it('enforces comprehensive embargo status for active sanctioned jurisdictions (CU, IR, KP)', () => {
    expect(OFAC_SANCTIONED_COUNTRIES.has('CU')).toBe(true);
    expect(OFAC_SANCTIONED_COUNTRIES.has('IR')).toBe(true);
    expect(OFAC_SANCTIONED_COUNTRIES.has('KP')).toBe(true);
  });

  it('permits Syria (SY) access following E.O. 14312 / termination of comprehensive sanctions', () => {
    // Under E.O. 14312 / PAARSSR, broad territory-wide economic blockades on Syria were lifted.
    // Syria must no longer be subject to blanket HTTP 451 geographic denial of service.
    expect(OFAC_SANCTIONED_COUNTRIES.has('SY')).toBe(false);
  });

  it('renders HTTP 451 legal restriction response document correctly', () => {
    const html = renderOfacRestrictedHtml();
    expect(html).toContain('451 &bull; Service Restricted In This Territory');
    expect(html).toContain('OFAC-sanctioned jurisdictions');
  });
});

describe('CSPRNG & Path Traversal Hardening (security-helper)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates 128-bit (32 hex char) CSPRNG IDs and bounded [0, 1) fractions', () => {
    const id1 = getSecureRandomId();
    const id2 = getSecureRandomId();
    expect(id1).toMatch(/^[0-9a-f]{32}$/);
    expect(id2).toMatch(/^[0-9a-f]{32}$/);
    expect(id1).not.toBe(id2);

    const frac = getSecureRandomFraction();
    expect(frac).toBeGreaterThanOrEqual(0);
    expect(frac).toBeLessThan(1);
    expect(getSecureRandomHex(8)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('fails closed when CSPRNG is unavailable (zero weak LCG fallback)', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => getSecureRandomFraction()).toThrow(/CSPRNG unavailable/i);
    expect(() => getSecureRandomId()).toThrow(/CSPRNG unavailable/i);
  });

  it('resolves valid relative segments inside baseDir and rejects all traversal vectors', () => {
    expect(securePathResolve('/srv/pocketgull/data', 'exports', 'bundle.json')).toBe(
      '/srv/pocketgull/data/exports/bundle.json'
    );
    expect(securePathResolve('C:\\Users\\app\\data', 'safe/file.txt')).toBe(
      'C:/Users/app/data/safe/file.txt'
    );

    const malicious = [
      '../etc/passwd',
      'a/../../etc/passwd',
      '%2e%2e/secret',
      '%252e%252e/secret',
      'sub%2f..%2fsecret',
      'sub\\..\\secret',
      'safe\0.png',
      '/etc/passwd',
      'C:/Windows/System32'
    ];
    for (const seg of malicious) {
      expect(() => securePathResolve('/srv/pocketgull/data', seg)).toThrow(/Path traversal rejected/i);
    }
  });

  it('validates safe redirect URLs and blocks protocol-relative & untrusted origins', () => {
    expect(isSafeRedirectUrl('/dashboard', ['pocketgull.app'])).toBe(true);
    expect(isSafeRedirectUrl('https://pocketgull.app/billing', ['pocketgull.app'])).toBe(true);
    expect(isSafeRedirectUrl('//example.com/phish', ['pocketgull.app'])).toBe(false);
    expect(isSafeRedirectUrl('/\\example.com/phish', ['pocketgull.app'])).toBe(false);
    expect(isSafeRedirectUrl('javascript:alert(1)', ['pocketgull.app'])).toBe(false);
    expect(isSafeRedirectUrl('https://example.com', ['pocketgull.app'])).toBe(false);
  });
});
