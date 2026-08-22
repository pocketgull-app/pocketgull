import { createCanaryRouter, recordCanaryHit, getCanaryThreatLedger, clearCanaryThreatLedger, classifyThreatActor } from './canary.routes';
import { Request } from 'express';

describe('Canary Honeypot Router Suite', () => {
  beforeEach(() => {
    clearCanaryThreatLedger();
  });

  it('1. Correctly classifies scraper threat actor types based on user-agent and path', () => {
    expect(classifyThreatActor('Python-urllib/3.10', '/contracts/clinical-vault-canary.json')).toBe('SUSPICIOUS_CURL_PROBER');
    expect(classifyThreatActor('Mozilla/5.0 (compatible; Bytespider/2.0)', '/api/v1/internal-research-telemetry')).toBe('ROGUE_LLM_SCRAPER');
    expect(classifyThreatActor('RedditBot/2.1', '/api/v1/internal-research-telemetry')).toBe('AUTOMATED_RECON_BOT');
    expect(classifyThreatActor('Mozilla/5.0 (Windows NT 10.0)', '/api/internal/patient-cohort-backup.json')).toBe('EXPLOIT_SCANNER');
    expect(classifyThreatActor('Custom-Scanner/1.0', '/other-path')).toBe('AUTOMATED_RECON_BOT');
  });

  it('2. Records canary hit into immutable in-memory ledger with forensic trace ID', () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': '198.51.100.42',
        'user-agent': 'Scrapy/2.11.0',
        'referer': 'https://pocketgull.app/robots.txt',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;

    const event = recordCanaryHit(mockReq, '/contracts/clinical-vault-canary.json');
    expect(event.remoteIp).toBe('198.51.100.42');
    expect(event.threatActorClassification).toBe('SUSPICIOUS_CURL_PROBER');
    expect(event.forensicTraceId).toContain('TRACE-');

    const ledger = getCanaryThreatLedger();
    expect(ledger.length).toBe(1);
    expect(ledger[0].id).toBe(event.id);
  });

  it('3. Initializes Express canary router with trap routes', () => {
    const router = createCanaryRouter();
    expect(router).toBeDefined();
    expect(router.stack.length).toBeGreaterThanOrEqual(5);
  });
});
