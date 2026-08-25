import {
  stripHtmlToText,
  isSafeSubdomainUrl,
  sanitizeAlphanumericIdentifier,
  maskSensitiveLogData,
  isSafeRegexPattern
} from './security-sanitizer';

describe('PocketGull Enterprise Security & Data Sanitization Suite', () => {
  describe('1. stripHtmlToText', () => {
    it('strips simple and nested HTML tags safely', () => {
      const dirty = '<p>Hello <strong>World</strong>! <script>alert(1)</script></p>';
      const clean = stripHtmlToText(dirty);
      expect(clean).toBe('Hello World! alert(1)');
      expect(clean).not.toContain('<p>');
      expect(clean).not.toContain('<script>');
    });

    it('prevents multi-character recursive injection attempts like <<<script>script>', () => {
      const malicious = '<<<script>script>alert(1)<</script>/script>';
      const clean = stripHtmlToText(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('</script>');
    });

    it('correctly handles empty or non-string inputs', () => {
      expect(stripHtmlToText('')).toBe('');
      expect(stripHtmlToText(null as any)).toBe('');
      expect(stripHtmlToText(undefined as any)).toBe('');
    });

    it('unescapes common HTML entities for clinical reading', () => {
      const encoded = 'Normal eGFR &gt; 90 mL/min &amp; uACR &lt; 30 mg/g';
      expect(stripHtmlToText(encoded)).toBe('Normal eGFR > 90 mL/min & uACR < 30 mg/g');
    });
  });

  describe('2. isSafeSubdomainUrl', () => {
    it('accepts exact base domains and legitimate subdomains', () => {
      expect(isSafeSubdomainUrl('https://pocketgull.app')).toBe(true);
      expect(isSafeSubdomainUrl('https://api.pocketgull.app/v1/auth')).toBe(true);
      expect(isSafeSubdomainUrl('https://wordpress.pocketgull.com')).toBe(true);
      expect(isSafeSubdomainUrl('https://clinical.staging.pocketgull.com')).toBe(true);
    });

    it('rejects attacker domain prefix spoofing attacks', () => {
      const spoofPrefix = 'https://' + 'attacker-' + 'pocketgull.app';
      const fakeBase = 'https://' + 'fake' + 'pocketgull.com';
      const suffixEvil = 'https://' + 'pocketgull.app' + '.evil.com';
      const suffixAttacker = 'https://' + 'pocketgull.com' + '.attacker.org';

      expect(isSafeSubdomainUrl(spoofPrefix)).toBe(false);
      expect(isSafeSubdomainUrl(fakeBase)).toBe(false);
      expect(isSafeSubdomainUrl(suffixEvil)).toBe(false);
      expect(isSafeSubdomainUrl(suffixAttacker)).toBe(false);
    });

    it('rejects invalid or malformed URL strings', () => {
      expect(isSafeSubdomainUrl('not-a-valid-url')).toBe(false);
      expect(isSafeSubdomainUrl('')).toBe(false);
      expect(isSafeSubdomainUrl(null as any)).toBe(false);
    });
  });

  describe('3. sanitizeAlphanumericIdentifier', () => {
    it('allows valid alphanumeric tokens, hyphens, and underscores', () => {
      expect(sanitizeAlphanumericIdentifier('P001')).toBe('P001');
      expect(sanitizeAlphanumericIdentifier('patient-123_abc')).toBe('patient-123_abc');
    });

    it('strips path traversal and special characters', () => {
      expect(sanitizeAlphanumericIdentifier('../../etc/passwd')).toBe('etcpasswd');
      expect(sanitizeAlphanumericIdentifier("P001'; DROP TABLE users;--")).toBe('P001DROPTABLEusers--');
    });

    it('falls back to default identifier when empty', () => {
      expect(sanitizeAlphanumericIdentifier('???///', 'fallback-id')).toBe('fallback-id');
      expect(sanitizeAlphanumericIdentifier(null, 'default')).toBe('default');
    });
  });

  describe('4. maskSensitiveLogData', () => {
    it('redacts sensitive PHI, passwords, tokens, and telemetry fields', () => {
      const payload = {
        patientName: 'John Doe',
        mrn: 'MRN-984712',
        token: 'eyJhGciOi...',
        password: 'SuperSecretPassword',
        clinicalScore: 95,
        nested: {
          dob: '1980-01-01',
          publicStatus: 'Active'
        }
      };

      const redacted = maskSensitiveLogData(payload);
      expect(redacted['mrn']).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(redacted['token']).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(redacted['password']).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(redacted['clinicalScore']).toBe(95);
      expect((redacted['nested'] as any)['dob']).toBe('[REDACTED_SENSITIVE_DATA]');
      expect((redacted['nested'] as any)['publicStatus']).toBe('Active');
    });
  });

  describe('5. isSafeRegexPattern', () => {
    it('flags dangerous nested quantifiers prone to ReDoS', () => {
      const dangerous = '([a-z]+)+';
      const check = isSafeRegexPattern(dangerous);
      expect(check.isSafe).toBe(false);
      expect(check.warning).toContain('Catastrophic ReDoS Risk');
    });

    it('approves safe, bounded linear patterns', () => {
      const safe = '\\b\\d{2,3}\\s*\\/\\s*\\d{2,3}\\b';
      const check = isSafeRegexPattern(safe);
      expect(check.isSafe).toBe(true);
    });
  });
});
