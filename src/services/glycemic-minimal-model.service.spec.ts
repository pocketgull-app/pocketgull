import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { GlycemicMinimalModelService } from './glycemic-minimal-model.service';

describe('GlycemicMinimalModelService', () => {
  let service: GlycemicMinimalModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlycemicMinimalModelService]
    });
    service = TestBed.inject(GlycemicMinimalModelService);
  });

  it('should be created and initialize with healthy athlete baseline', () => {
    expect(service).toBeDefined();
    expect(service.activePreset()).toBe('healthy_athlete');

    const kinetics = service.bergmanKinetics();
    expect(kinetics.insulinSensitivityIndexSi).toBeGreaterThan(6.0);
    expect(kinetics.dispositionIndexDi).toBeGreaterThan(1500);
    expect(kinetics.betaCellCompensationTier).toBe('Robust Hyperbolic Compensation');
    expect(kinetics.trajectory.length).toBeGreaterThan(50);
  });

  it('should compute valid consensus CGM AGP metrics for healthy athlete', () => {
    const cgm = service.cgmMetrics();
    expect(cgm.meanGlucoseMgDl).toBeGreaterThan(90);
    expect(cgm.meanGlucoseMgDl).toBeLessThan(140);
    expect(cgm.coefficientOfVariationPercent).toBeLessThanOrEqual(36);
    expect(cgm.cvStatus).toBe('Stable Glycemic Profile (CV <= 36%)');
    expect(cgm.timeInRangeTirPercent).toBeGreaterThanOrEqual(70);
    expect(cgm.glucoseManagementIndicatorGmiPercent).toBeGreaterThan(5.0);
    expect(cgm.glucoseManagementIndicatorGmiPercent).toBeLessThan(6.5);
    expect(cgm.clinicalAttdCompliance).toBe('Meets Consensus Targets');
  });

  it('should accurately discriminate the Somogyi Rebound Effect', () => {
    service.applyPreset('somogyi_rebound');

    const nocturnal = service.nocturnalReport();
    expect(nocturnal.phenotype).toBe('Somogyi Rebound Effect');
    expect(nocturnal.nadir0300MgDl).toBeLessThan(70);
    expect(nocturnal.morning0700MgDl).toBeGreaterThanOrEqual(140);
    expect(nocturnal.recommendationTier).toBe('De-escalate Evening Basal / Add Complex Snack');
    expect(nocturnal.clinicalAction).toContain('Reduce evening/bedtime basal');

    const cgm = service.cgmMetrics();
    expect(cgm.timeBelowRangeTbrLevel2Percent).toBeGreaterThan(0);
    expect(cgm.clinicalAttdCompliance).toBe('Critical Hypoglycemia Alert');
  });

  it('should accurately discriminate the Dawn Phenomenon', () => {
    service.applyPreset('type_1_brittle_dawn');

    const nocturnal = service.nocturnalReport();
    expect(nocturnal.phenotype).toBe('Dawn Phenomenon');
    expect(nocturnal.nadir0300MgDl).toBeGreaterThanOrEqual(90);
    expect(nocturnal.morning0700MgDl).toBeGreaterThanOrEqual(140);
    expect(nocturnal.deltaDawnMgDl).toBeGreaterThanOrEqual(30);
    expect(nocturnal.recommendationTier).toBe('Adjust Evening Basal Timing/Dose');

    const kinetics = service.bergmanKinetics();
    expect(kinetics.betaCellCompensationTier).toBe('Severe Beta-Cell Failure');
  });

  it('should model compensated insulin resistance in metabolic syndrome', () => {
    service.applyPreset('metabolic_syndrome_ir');

    const kinetics = service.bergmanKinetics();
    expect(kinetics.insulinSensitivityIndexSi).toBeLessThan(3.5);
    expect(kinetics.betaCellCompensationTier).toBe('Compensated Insulin Resistance');
    expect(service.bergmanParams().basalInsulinUuMl).toBeGreaterThan(15);
  });

  it('should detect severe beta-cell failure in decompensated type 2 diabetes', () => {
    service.applyPreset('type_2_decompensated');

    const kinetics = service.bergmanKinetics();
    expect(kinetics.insulinSensitivityIndexSi).toBeLessThan(2.0);
    expect(kinetics.betaCellCompensationTier).toBe('Severe Beta-Cell Failure');

    const cgm = service.cgmMetrics();
    expect(cgm.timeInRangeTirPercent).toBeLessThan(70);
    expect(cgm.clinicalAttdCompliance).toBe('Suboptimal TIR');
    expect(cgm.glucoseManagementIndicatorGmiPercent).toBeGreaterThan(8.0);
  });

  it('should gracefully handle empty sensor readings without crashing', () => {
    service.cgmInputs.set({
      sensorReadingsMgDl: [],
      bedtimeGlucose2300MgDl: 100,
      nocturnalNadir0300MgDl: 90,
      fastingMorning0700MgDl: 95
    });

    const cgm = service.cgmMetrics();
    expect(cgm.meanGlucoseMgDl).toBe(100);
    expect(cgm.timeInRangeTirPercent).toBe(100);
    expect(cgm.cvStatus).toBe('Stable Glycemic Profile (CV <= 36%)');
  });
});
