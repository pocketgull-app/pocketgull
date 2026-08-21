import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export interface ICanaryThreatEvent {
  id: string;
  timestamp: string;
  trapRoute: string;
  remoteIp: string;
  userAgent: string;
  referrer: string;
  threatActorClassification: 'ROGUE_LLM_SCRAPER' | 'AUTOMATED_RECON_BOT' | 'EXPLOIT_SCANNER' | 'SUSPICIOUS_CURL_PROBER';
  mitreAtlasId: string;
  forensicTraceId: string;
}

// In-Memory Ring Buffer of Captured Canary Hits
const canaryThreatLedger: ICanaryThreatEvent[] = [];
const MAX_LEDGER_SIZE = 100;

export function classifyThreatActor(userAgent: string, route: string): ICanaryThreatEvent['threatActorClassification'] {
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('python') || ua.includes('scrapy') || ua.includes('aiohttp') || ua.includes('httpx') || ua.includes('curl') || ua.includes('wget')) {
    return 'SUSPICIOUS_CURL_PROBER';
  }
  if (ua.includes('gptbot') || ua.includes('claudebot') || ua.includes('bytespider') || ua.includes('ccbot') || ua.includes('diffbot')) {
    return 'ROGUE_LLM_SCRAPER';
  }
  if (route.includes('cohort-backup') || route.includes('vault-canary')) {
    return 'EXPLOIT_SCANNER';
  }
  return 'AUTOMATED_RECON_BOT';
}

export function recordCanaryHit(req: Request, trapRoute: string): ICanaryThreatEvent {
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const remoteIp = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(',')[0].trim();
  const userAgent = String(req.headers['user-agent'] || 'Unknown-User-Agent');
  const referrer = String(req.headers['referer'] || 'Direct-No-Referrer');

  const traceId = `TRACE-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  const classification = classifyThreatActor(userAgent, trapRoute);

  const event: ICanaryThreatEvent = {
    id: `CANARY-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    trapRoute,
    remoteIp,
    userAgent,
    referrer,
    threatActorClassification: classification,
    mitreAtlasId: classification === 'ROGUE_LLM_SCRAPER' ? 'AML.T0043' : 'AML.T0054',
    forensicTraceId: traceId,
  };

  canaryThreatLedger.unshift(event);
  if (canaryThreatLedger.length > MAX_LEDGER_SIZE) {
    canaryThreatLedger.pop();
  }

  return event;
}

export function getCanaryThreatLedger(): ICanaryThreatEvent[] {
  return [...canaryThreatLedger];
}

export function clearCanaryThreatLedger(): void {
  canaryThreatLedger.length = 0;
}

export function createCanaryRouter(): Router {
  const router = Router();

  // Handler for honeypot traps
  const handleHoneypot = (trapName: string) => (req: Request, res: Response) => {
    const event = recordCanaryHit(req, trapName);
    
    // Return synthetic decoy payload with forensic marker
    res.status(403).json({
      error: 'Access Denied: Restricted Clinical Boundary',
      incidentTraceId: event.forensicTraceId,
      classification: event.threatActorClassification,
      notice: 'This honeypot interaction has been recorded in the Mandiant forensic threat ledger (HIPAA §164.312(b)).',
    });
  };

  // 1. Direct Honeypot Trap Routes
  router.get('/contracts/clinical-vault-canary.json', handleHoneypot('/contracts/clinical-vault-canary.json'));
  router.get('/api/v1/internal-research-telemetry', handleHoneypot('/api/v1/internal-research-telemetry'));
  router.get('/api/internal/patient-cohort-backup.json', handleHoneypot('/api/internal/patient-cohort-backup.json'));

  // 2. Security HUD Telemetry Feed Endpoint
  router.get('/api/canary/threat-feed', (_req: Request, res: Response) => {
    res.json({
      activeHoneypots: [
        '/contracts/clinical-vault-canary.json',
        '/api/v1/internal-research-telemetry',
        '/api/internal/patient-cohort-backup.json',
      ],
      totalAttacksCaptured: canaryThreatLedger.length,
      recentThreats: canaryThreatLedger.slice(0, 20),
    });
  });

  // 3. Canary Stats Endpoint
  router.get('/api/canary/stats', (_req: Request, res: Response) => {
    const stats = {
      totalHits: canaryThreatLedger.length,
      byClassification: {
        ROGUE_LLM_SCRAPER: canaryThreatLedger.filter(e => e.threatActorClassification === 'ROGUE_LLM_SCRAPER').length,
        AUTOMATED_RECON_BOT: canaryThreatLedger.filter(e => e.threatActorClassification === 'AUTOMATED_RECON_BOT').length,
        EXPLOIT_SCANNER: canaryThreatLedger.filter(e => e.threatActorClassification === 'EXPLOIT_SCANNER').length,
        SUSPICIOUS_CURL_PROBER: canaryThreatLedger.filter(e => e.threatActorClassification === 'SUSPICIOUS_CURL_PROBER').length,
      },
    };
    res.json(stats);
  });

  return router;
}
