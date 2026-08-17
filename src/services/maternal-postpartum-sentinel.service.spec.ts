import { TestBed } from '@angular/core/testing';
import { MaternalPostpartumSentinelService } from './maternal-postpartum-sentinel.service';

describe('MaternalPostpartumSentinelService (4th-Trimester ACOG AIM Guardian, EPDS & Doula Protocol)', () => {
  let service: MaternalPostpartumSentinelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaternalPostpartumSentinelService]
    });
    service = TestBed.inject(MaternalPostpartumSentinelService);
  });

  it('should accurately calculate Mean Arterial Pressure (MAP)', () => {
    const map = service.calculateMap(160, 110);
    expect(map).toBe(126.7);
  });

  it('should trigger CRITICAL_EMERGENCY and ACOG AIM Magnesium Sulfate protocol for severe postpartum preeclampsia', () => {
    const assessment = service.evaluatePostpartumMorbidity({
      systolicBp: 165,
      diastolicBp: 112,
      heartRate: 88,
      spO2Percent: 98,
      daysPostpartum: 14,
      symptoms: {
        severeHeadacheUnrelievedByMeds: true,
        visualScotomaOrBlurring: true
      }
    });

    expect(assessment.riskTier).toBe('CRITICAL_EMERGENCY');
    expect(assessment.urgentActionRequired).toBe(true);
    expect(assessment.flaggedConditions[0]).toContain('Late Postpartum Preeclampsia');
    expect(assessment.acogAimBundleRecommendations.some(r => r.includes('Magnesium Sulfate'))).toBe(true);
    expect(assessment.disparityMitigationNotice).toContain('ACOG AIM Equity Protocol');
  });

  it('should detect Peripartum Cardiomyopathy (PPCM) when orthopnea and tachycardia are present', () => {
    const assessment = service.evaluatePostpartumMorbidity({
      systolicBp: 124,
      diastolicBp: 82,
      heartRate: 118,
      spO2Percent: 93,
      daysPostpartum: 28,
      symptoms: {
        shortnessOfBreathOrOrthopnea: true
      }
    });

    expect(assessment.urgentActionRequired).toBe(true);
    expect(assessment.flaggedConditions.some(c => c.includes('Peripartum Cardiomyopathy'))).toBe(true);
    expect(assessment.acogAimBundleRecommendations.some(r => r.includes('Echocardiogram'))).toBe(true);
  });

  it('should correctly score EPDS, detect probable depression, and trigger Item 10 crisis hotline escalation', () => {
    // Normal case (low score)
    const normalEpds = service.evaluateEpds([0, 0, 1, 0, 1, 0, 0, 1, 0, 0], 14);
    expect(normalEpds.totalScore).toBe(3);
    expect(normalEpds.riskTier).toBe('NORMAL');
    expect(normalEpds.item10Positive).toBe(false);
    expect(normalEpds.crisisProtocolTriggered).toBe(false);

    // Probable depression with Item 10 positive
    const criticalEpds = service.evaluateEpds([2, 2, 2, 2, 2, 2, 2, 2, 2, 1], 21);
    expect(criticalEpds.totalScore).toBe(19);
    expect(criticalEpds.riskTier).toBe('PROBABLE_DEPRESSION');
    expect(criticalEpds.item10Positive).toBe(true);
    expect(criticalEpds.crisisProtocolTriggered).toBe(true);
    expect(criticalEpds.clinicalRecommendations.some(r => r.includes('988'))).toBe(true);
    expect(service.isUrgentAlertActive()).toBe(true);
  });

  it('should evaluate LATCH score, identify mastitis symptoms, and recommend Level A galactagogues', () => {
    const latchResult = service.evaluateLactation({
      latch: 1,
      audibleSwallowing: 1,
      typeOfNipple: 1,
      comfort: 0,
      hold: 1
    }, { localizedBreastErythema: true, fever: true });

    expect(latchResult.totalLatchScore).toBe(4);
    expect(latchResult.supportLevel).toBe('INTENSIVE_LACTATION_CONSULT');
    expect(latchResult.mastitisRisk).toBe(true);
    expect(latchResult.galactagogueRecommendations.some(g => g.herb.includes('Moringa'))).toBe(true);
    expect(latchResult.doulaCareTips.some(t => t.includes('Mastitis suspected'))).toBe(true);
  });

  it('should assess infant circadian synchrony and compute maternal sleep fragmentation index', () => {
    const circadian = service.evaluateCircadianSynchrony({
      dailyFeedingCount: 10,
      longestSleepStretchHours: 2,
      nightWakeningCount: 6,
      maternalSleepHours: 3.5
    });

    expect(circadian.circadianMaturityScore).toBeGreaterThan(0);
    expect(circadian.maternalSleepFragmentationIndex).toBe('SEVERE');
    expect(circadian.recommendations.some(r => r.includes('Doula Night Support'))).toBe(true);
  });

  it('should generate a valid FHIR R4 Bundle containing LOINC observations', () => {
    service.evaluatePostpartumMorbidity({
      systolicBp: 125,
      diastolicBp: 80,
      heartRate: 72,
      spO2Percent: 99,
      daysPostpartum: 14,
      symptoms: {}
    });
    service.evaluateEpds([0, 1, 0, 1, 0, 0, 0, 0, 0, 0], 14);
    service.evaluateLactation({ latch: 2, audibleSwallowing: 2, typeOfNipple: 2, comfort: 2, hold: 2 });

    const bundleJson = service.generateFhirMaternalBundle('p_maternal_test');
    expect(bundleJson).toBeTruthy();
    const parsed = JSON.parse(bundleJson);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.entry.length).toBe(3);
    expect(parsed.entry.some((e: any) => e.resource.code?.coding?.[0]?.code === '89209-1')).toBe(true);
    expect(parsed.entry.some((e: any) => e.resource.code?.coding?.[0]?.code === '92801-0')).toBe(true);
  });
});
