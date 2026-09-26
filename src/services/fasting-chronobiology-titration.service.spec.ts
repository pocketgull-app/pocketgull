import { describe, it, expect, beforeEach } from 'vitest';
import { FastingChronobiologyTitrationService, IMedicationToTitrate } from './fasting-chronobiology-titration.service';

describe('FastingChronobiologyTitrationService', () => {
  let service: FastingChronobiologyTitrationService;

  beforeEach(() => {
    service = new FastingChronobiologyTitrationService();
  });

  it('should initialize with RAMADAN_DAWN_TO_DUSK default', () => {
    expect(service.selectedFastingType()).toBe('RAMADAN_DAWN_TO_DUSK');
  });

  it('should titrate insulin and generate critical warnings for Ramadan dry fast', () => {
    const meds: IMedicationToTitrate[] = [
      {
        drugName: 'Insulin Glargine (Lantus)',
        category: 'DIABETIC_INSULIN',
        standardDoseSchedule: '24 units subcutaneous every morning',
        baselineTiming: 'MORNING'
      }
    ];

    const result = service.titrateRegimen(meds, 'RAMADAN_DAWN_TO_DUSK');
    expect(result.adjustedMedications.length).toBe(1);
    expect(result.adjustedMedications[0].hypoglycemiaOrCrisisRisk).toBe('CRITICAL');
    expect(result.adjustedMedications[0].titratedFastingSchedule).toContain('Reduce basal dose by 20–30%');
    expect(result.criticalWarnings.length).toBeGreaterThan(0);
    expect(result.criticalWarnings[0]).toContain('Insulin titration active');
    expect(result.dawnMealName).toBe('Suhoor (Pre-Dawn)');
    expect(result.sunsetMealName).toBe('Iftar (Sunset Break-Fast)');
  });

  it('should flag sulfonylureas for daytime hypoglycemia during dry fasting', () => {
    const meds: IMedicationToTitrate[] = [
      {
        drugName: 'Glipizide XL',
        category: 'DIABETIC_ORAL',
        standardDoseSchedule: '10mg PO every morning with breakfast',
        baselineTiming: 'MORNING'
      }
    ];

    const result = service.titrateRegimen(meds, 'RAMADAN_DAWN_TO_DUSK');
    expect(result.adjustedMedications[0].hypoglycemiaOrCrisisRisk).toBe('HIGH');
    expect(result.adjustedMedications[0].titratedFastingSchedule).toContain('Switch morning dose to Iftar');
  });

  it('should prevent diuretics from being taken at pre-dawn Suhoor meal', () => {
    const meds: IMedicationToTitrate[] = [
      {
        drugName: 'Hydrochlorothiazide (HCTZ)',
        category: 'ANTIHYPERTENSIVE',
        standardDoseSchedule: '25mg PO daily in morning',
        baselineTiming: 'MORNING'
      }
    ];

    const result = service.titrateRegimen(meds, 'RAMADAN_DAWN_TO_DUSK');
    expect(result.adjustedMedications[0].titratedFastingSchedule).toContain('Do NOT take at Suhoor pre-dawn');
    expect(result.criticalWarnings.some(w => w.includes('Diuretic'))).toBe(true);
  });

  it('should generate critical warnings for narrow therapeutic index Lithium during fasting', () => {
    const meds: IMedicationToTitrate[] = [
      {
        drugName: 'Lithium Carbonate ER',
        category: 'PSYCHIATRIC',
        standardDoseSchedule: '450mg PO BID',
        baselineTiming: 'BID'
      }
    ];

    const result = service.titrateRegimen(meds, 'YOM_KIPPUR_25HR_TOTAL');
    expect(result.adjustedMedications[0].hypoglycemiaOrCrisisRisk).toBe('CRITICAL');
    expect(result.adjustedMedications[0].titratedFastingSchedule).toContain('lithium toxicity');
    expect(result.adjustedMedications[0].clinicalRationale).toContain('toxic ranges');
  });
});
