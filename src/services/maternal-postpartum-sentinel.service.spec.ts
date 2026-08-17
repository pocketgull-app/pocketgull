import { TestBed } from '@angular/core/testing';
import { MaternalPostpartumSentinelService } from './maternal-postpartum-sentinel.service';

describe('MaternalPostpartumSentinelService (4th-Trimester ACOG AIM Guardian)', () => {
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
});
