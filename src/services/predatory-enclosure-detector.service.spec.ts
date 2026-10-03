import { describe, it, expect, beforeEach } from 'vitest';
import { PredatoryEnclosureDetectorService } from './predatory-enclosure-detector.service';

describe('PredatoryEnclosureDetectorService', () => {
  let service: PredatoryEnclosureDetectorService;

  beforeEach(() => {
    service = new PredatoryEnclosureDetectorService();
  });

  it('1. Initializes 6 forensic canary vectors and computes baseline hazard score', () => {
    const vectors = service.canaryVectors();
    expect(vectors.length).toBe(6);
    const score = service.enclosureHazardScore();
    expect(score).toBeGreaterThanOrEqual(50);
  });

  it('2. Escalates to CRITICAL_IMMINENT_ENCLOSURE when all vectors spike to maximum', () => {
    service.setDebtBalloonRisk(95);
    service.setDeferredMaintenanceRatio(90);
    service.setBoardDonationClustering(85);
    service.setTransitFeederSabotage(90);
    service.setSaasBudgetBleedRatio(85);
    service.setClosedDoorNdaActivity(95);

    const report = service.forensicReport();
    expect(report.threatLevel).toBe('CRITICAL_IMMINENT_ENCLOSURE');
    expect(report.currentPhase).toBe('Phase 4: Asset Liquidation & Private Enclosure');
    expect(report.hazardScore).toBeGreaterThanOrEqual(85);
  });

  it('3. Drops to NOMINAL_STABLE when metrics reflect healthy, transparent public governance', () => {
    service.setDebtBalloonRisk(15);
    service.setDeferredMaintenanceRatio(10);
    service.setBoardDonationClustering(10);
    service.setTransitFeederSabotage(10);
    service.setSaasBudgetBleedRatio(15);
    service.setClosedDoorNdaActivity(5);

    const report = service.forensicReport();
    expect(report.threatLevel).toBe('NOMINAL_STABLE');
    expect(report.currentPhase).toBe('Phase 1: Financial Infiltration & Debt Trapping');
    expect(report.hazardScore).toBeLessThan(30);
    expect(report.flaggedVectors.length).toBe(0);
  });

  it('4. Generates legal FOIA demand letter targeting flagged vectors', () => {
    service.setDebtBalloonRisk(75);
    service.setClosedDoorNdaActivity(80);
    const letter = service.generateFoiaDemandLetter();

    expect(letter).toContain('FORMAL REQUEST FOR PUBLIC RECORDS');
    expect(letter).toContain('MSRB Form G-37');
    expect(letter).toContain('Toxic Debt & Capital Appreciation Bonds');
    expect(letter).toContain('Executive Session Secrecy & Real Estate NDAs');
  });

  it('5. Recommends urgent Community Land Trust countermeasures when threat is acute', () => {
    service.setDebtBalloonRisk(70);
    service.setDeferredMaintenanceRatio(75);
    const report = service.forensicReport();
    expect(report.urgentCounterMeasures.some(m => m.includes('Community Land Trust'))).toBe(true);
  });
});
