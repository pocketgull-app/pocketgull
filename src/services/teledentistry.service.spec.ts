import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { TeledentistryService } from './teledentistry.service';

describe('TeledentistryService', () => {
  let service: TeledentistryService;

  beforeEach(() => {
    service = new TeledentistryService();
  });

  it('should initialize complete FDI 32-tooth odontogram (Teeth 11-48)', () => {
    expect(service).toBeTruthy();
    expect(service.teeth().length).toBe(32);
    
    // Check FDI Quadrants 1 to 4
    const fdiCodes = service.teeth().map(t => t.fdiNumber);
    expect(fdiCodes).toContain(11);
    expect(fdiCodes).toContain(21);
    expect(fdiCodes).toContain(31);
    expect(fdiCodes).toContain(41);
  });

  it('should calculate Systemic Inflammatory Burden Index (SIBI 0-100) correctly', () => {
    // Default baseline SIBI check
    const sibi = service.sibiScore();
    expect(sibi).toBeGreaterThanOrEqual(0);
    expect(sibi).toBeLessThanOrEqual(100);

    // Deep Pockets count (PPD >= 4mm)
    const deepPockets = service.deepPocketsCount();
    const bop = service.bleedingPercentage();
    const crp = service.hsCRP();
    const expectedSibi = Math.min(100, Math.round((deepPockets * 6) + (bop * 0.8) + (crp * 12)));

    expect(sibi).toBe(expectedSibi);
  });

  it('should calculate Cardiovascular Risk Multiplier (1.0x to 2.8x)', () => {
    const cvRisk = service.cvRiskMultiplier();
    expect(cvRisk).toBeGreaterThanOrEqual(1.0);
    expect(cvRisk).toBeLessThanOrEqual(2.8);
  });

  it('should calculate Predicted HbA1c Elevation (+0.0% to +0.8%)', () => {
    const hba1cDelta = service.predictedHbA1cElevation();
    expect(hba1cDelta).toBeGreaterThanOrEqual(0.0);
    expect(hba1cDelta).toBeLessThanOrEqual(0.8);
  });

  it('should update tooth probing depth and recalculate SIBI score dynamically', () => {
    const initialDeepCount = service.deepPocketsCount();
    
    // Increase probing depth of Tooth 11 to 6mm
    service.setProbingDepth(11, 6);
    expect(service.deepPocketsCount()).toBe(initialDeepCount + 1);

    // Toggle Bleeding on Probing for Tooth 11
    service.toggleBOP(11);
    expect(service.bleedingPercentage()).toBeGreaterThan(0);
  });

  it('should update Smith & Knight TWI grade (Grades 0-4)', () => {
    service.setTWIGrade(11, 3);
    const tooth11 = service.teeth().find(t => t.fdiNumber === 11)!;
    expect(tooth11.twiGrade).toBe(3);
  });
});
