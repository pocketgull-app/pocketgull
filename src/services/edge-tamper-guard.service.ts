import { Injectable, signal, computed } from '@angular/core';

export interface IEdgeTamperTelemetry {
  isAutomationDetected: boolean;
  tamperRiskScore: number; // 0 to 100
  detectedFlags: string[];
  clientFingerprintHash: string;
  recommendedAction: 'ALLOW' | 'MOCK_DECOY_SUBSTITUTION' | 'QUARANTINE_BLOCK';
}

@Injectable({
  providedIn: 'root',
})
export class EdgeTamperGuardService {
  /**
   * Tamper Detection State Signal
   */
  readonly telemetry = signal<IEdgeTamperTelemetry>({
    isAutomationDetected: false,
    tamperRiskScore: 0,
    detectedFlags: [],
    clientFingerprintHash: 'HASH-INITIALIZING',
    recommendedAction: 'ALLOW',
  });

  readonly isAutomationDetected = computed(() => this.telemetry().isAutomationDetected);
  readonly tamperRiskScore = computed(() => this.telemetry().tamperRiskScore);

  constructor() {
    this.runEdgeSecurityAudit();
  }

  /**
   * Executes client-side environment inspection for headless scrapers & debuggers
   */
  runEdgeSecurityAudit(): IEdgeTamperTelemetry {
    const flags: string[] = [];
    let riskScore = 0;

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // 1. Check navigator.webdriver (Puppeteer, Selenium, Playwright)
      if (navigator.webdriver) {
        flags.push('NAVIGATOR_WEBDRIVER_ACTIVE');
        riskScore += 45;
      }

      // 2. Check for missing language or platform anomalies
      if (!navigator.languages || navigator.languages.length === 0) {
        flags.push('ANOMALOUS_LANGUAGES_ARRAY');
        riskScore += 20;
      }

      // 3. Check for Headless Chrome User-Agent strings
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('headlesschrome') || ua.includes('phantomjs') || ua.includes('electron')) {
        flags.push('HEADLESS_USER_AGENT_SIGNATURE');
        riskScore += 35;
      }

      // 4. Check for DevTools window size anomalies
      if (window.outerWidth === 0 && window.outerHeight === 0) {
        flags.push('ZERO_DIMENSION_WINDOW');
        riskScore += 30;
      }
    }

    const isAutomation = riskScore >= 40;
    const action: IEdgeTamperTelemetry['recommendedAction'] = 
      riskScore >= 70 ? 'QUARANTINE_BLOCK' : 
      riskScore >= 40 ? 'MOCK_DECOY_SUBSTITUTION' : 'ALLOW';

    const result: IEdgeTamperTelemetry = {
      isAutomationDetected: isAutomation,
      tamperRiskScore: Math.min(100, riskScore),
      detectedFlags: flags,
      clientFingerprintHash: `FP-${flags.length}-${Date.now().toString(36)}`,
      recommendedAction: action,
    };

    this.telemetry.set(result);
    return result;
  }
}
