import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PediatricDosingEngineService } from './pediatric-dosing-engine.service';

describe('PediatricDosingEngineService (WHO EMLc & IMCI Pediatric Dosing)', () => {
  let service: PediatricDosingEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PediatricDosingEngineService]
    });
    service = TestBed.inject(PediatricDosingEngineService);
  });

  describe('1. Artemether + Lumefantrine (Coartem) Pediatric Weight Bands', () => {
    it('should warn and mark ineligible when infant is under 5 kg', () => {
      service.setWeightKg(4.2);
      const dose = service.artemetherLumefantrine();
      expect(dose.isEligible).toBe(false);
      expect(dose.tabletsPerDose).toBe(0);
      expect(dose.specialWarning).toContain('under 5 kg');
    });

    it('should calculate 1 tablet per dose (6 tablets total) for 5 to <15 kg toddler', () => {
      service.setWeightKg(11.5);
      const dose = service.artemetherLumefantrine();
      expect(dose.isEligible).toBe(true);
      expect(dose.tabletsPerDose).toBe(1);
      expect(dose.totalTablets).toBe(6);
      expect(dose.scheduleHours).toEqual([0, 8, 24, 36, 48, 60]);
      expect(dose.preparationAdvice).toContain('fat');
      expect(dose.vomitRuleAdvice).toContain('repeat the full dose');
    });

    it('should calculate 2 tablets per dose (12 tablets total) for 15 to <25 kg child', () => {
      service.setWeightKg(18.0);
      const dose = service.artemetherLumefantrine();
      expect(dose.tabletsPerDose).toBe(2);
      expect(dose.totalTablets).toBe(12);
      expect(dose.weightBandLabel).toContain('15 to <25 kg');
    });

    it('should calculate 3 tablets per dose (18 tablets total) for 25 to <35 kg child', () => {
      service.setWeightKg(29.0);
      const dose = service.artemetherLumefantrine();
      expect(dose.tabletsPerDose).toBe(3);
      expect(dose.totalTablets).toBe(18);
      expect(dose.weightBandLabel).toContain('25 to <35 kg');
    });

    it('should calculate 4 tablets per dose (24 tablets total) for ≥35 kg patient', () => {
      service.setWeightKg(42.0);
      const dose = service.artemetherLumefantrine();
      expect(dose.tabletsPerDose).toBe(4);
      expect(dose.totalTablets).toBe(24);
      expect(dose.weightBandLabel).toContain('≥35 kg');
    });
  });

  describe('2. WHO Reduced Osmolarity ORS Protocols', () => {
    it('should calculate Plan B 4-hour rehydration volume (75 mL/kg) accurately', () => {
      service.setWeightKg(10.0);
      service.setOrsPlan('PLAN_B');

      const ors = service.orsCalculation();
      expect(ors.plan).toBe('PLAN_B');
      expect(ors.totalVolumeMl4Hours).toBe(750); // 10 * 75 = 750 mL
      expect(ors.hourlyRateMlHour).toBe(188);     // 750 / 4 = 187.5 -> 188 mL/h
      expect(ors.sachetsToPrepare).toBe(1);
      expect(ors.mixingInstructions).toContain('1.0 Liter');
      expect(ors.zincAdjunctRequired).toBe(true);
    });

    it('should recommend Plan A per-stool fluid volume for home maintenance', () => {
      service.setAgeMonths(14);
      service.setOrsPlan('PLAN_A');

      const ors = service.orsCalculation();
      expect(ors.plan).toBe('PLAN_A');
      expect(ors.perStoolVolumeMl).toContain('50–100 mL');
      expect(ors.clinicalMonitoringRule).toContain('Continue regular feeding');
    });

    it('should trigger emergent IV volume for Plan C severe dehydration', () => {
      service.setWeightKg(8.0);
      service.setAgeMonths(9); // Infant <12 months
      service.setOrsPlan('PLAN_C');

      const ors = service.orsCalculation();
      expect(ors.plan).toBe('PLAN_C');
      expect(ors.ivFluidVolumeMl).toBe(800); // 8 * 100 = 800 mL
      expect(ors.firstPhaseDuration).toContain('over 1 hour');
      expect(ors.secondPhaseDuration).toContain('over 5 hours');
      expect(ors.clinicalMonitoringRule).toContain('MEDICAL EMERGENCY');
    });
  });

  describe('3. Zinc Sulfate Dispersible Tablets', () => {
    it('should prescribe 10 mg (1/2 tablet) once daily for infants under 6 months', () => {
      service.setAgeMonths(4);
      const zinc = service.zincDose();
      expect(zinc.dailyDoseMg).toBe(10);
      expect(zinc.tabletFractionLabel).toBe('1/2 tablet');
      expect(zinc.durationDays).toBe(14);
      expect(zinc.totalTabletsDispensed).toBe(7);
      expect(zinc.clinicalImpactSummary).toContain('Reduces episode duration by 25%');
    });

    it('should prescribe 20 mg (1 tablet) once daily for children 6 months and older', () => {
      service.setAgeMonths(22);
      const zinc = service.zincDose();
      expect(zinc.dailyDoseMg).toBe(20);
      expect(zinc.tabletFractionLabel).toBe('1 tablet');
      expect(zinc.durationDays).toBe(14);
      expect(zinc.totalTabletsDispensed).toBe(14);
    });
  });

  describe('4. Amoxicillin Dispersible (Fast-Breathing Pneumonia)', () => {
    it('should prescribe 1 tablet (250 mg) BID for infant under 10 kg', () => {
      service.setWeightKg(7.5);
      service.setAgeMonths(7);

      const amox = service.amoxicillinDose();
      expect(amox.tabletsPerDose).toBe(1);
      expect(amox.doseMg).toBe(250);
      expect(amox.durationDays).toBe(5);
      expect(amox.totalTabletsDispensed).toBe(10);
      expect(amox.frequency).toContain('Twice daily');
    });

    it('should prescribe 2 tablets (500 mg) BID for child 10 kg or older', () => {
      service.setWeightKg(13.5);
      service.setAgeMonths(30);

      const amox = service.amoxicillinDose();
      expect(amox.tabletsPerDose).toBe(2);
      expect(amox.doseMg).toBe(500);
      expect(amox.durationDays).toBe(5);
      expect(amox.totalTabletsDispensed).toBe(20);
    });
  });
});
