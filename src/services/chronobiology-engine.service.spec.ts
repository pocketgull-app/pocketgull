import { ChronobiologyEngineService } from './chronobiology-engine.service';

describe('ChronobiologyEngineService', () => {
  let service: ChronobiologyEngineService;

  beforeEach(() => {
    service = new ChronobiologyEngineService();
  });

  it('1. Classifies normal physiological blood pressure dipper phenotype (10-20% drop)', () => {
    // Daytime 130/85, Nocturnal 110/70 -> (130 - 110) / 130 = 15.4% dip
    const bp = service.classifyBpDippingPhenotype(130, 85, 110, 70);

    expect(bp.phenotype).toBe('NORMAL_DIPPER');
    expect(bp.systolicDippingPercent).toBeCloseTo(15.4, 1);
    expect(bp.cardiovascularEventRiskRatio).toBe(1.0);
    expect(bp.chronotherapyRecommendation).toContain('Maintain morning or standard split dosing');
  });

  it('2. Classifies non-dipper phenotype (<10% drop) and recommends bedtime RAAS inhibitor', () => {
    // Daytime 140/90, Nocturnal 134/86 -> (140 - 134) / 140 = 4.3% dip
    const bp = service.classifyBpDippingPhenotype(140, 90, 134, 86);

    expect(bp.phenotype).toBe('NON_DIPPER');
    expect(bp.systolicDippingPercent).toBeCloseTo(4.3, 1);
    expect(bp.cardiovascularEventRiskRatio).toBe(2.1);
    expect(bp.chronotherapyRecommendation).toContain('Shift RAAS inhibitor (ACEi/ARB) or CCB from morning to bedtime');
  });

  it('3. Classifies reverse riser phenotype (nocturnal surge) with severe risk and OSA screening', () => {
    // Daytime 135/85, Nocturnal 142/90 -> (135 - 142) / 135 = -5.2% dip
    const bp = service.classifyBpDippingPhenotype(135, 85, 142, 90);

    expect(bp.phenotype).toBe('REVERSE_RISER');
    expect(bp.systolicDippingPercent).toBeLessThan(0);
    expect(bp.cardiovascularEventRiskRatio).toBe(3.2);
    expect(bp.chronotherapyRecommendation).toContain('polysomnography for OSA');
  });

  it('4. Classifies extreme dipper (>20% drop) and strictly prohibits bedtime dosing', () => {
    // Daytime 140/90, Nocturnal 105/65 -> (140 - 105) / 140 = 25.0% dip
    const bp = service.classifyBpDippingPhenotype(140, 90, 105, 65);

    expect(bp.phenotype).toBe('EXTREME_DIPPER');
    expect(bp.systolicDippingPercent).toBe(25.0);
    expect(bp.cardiovascularEventRiskRatio).toBe(1.8);
    expect(bp.chronotherapyRecommendation).toContain('Prohibit bedtime antihypertensive administration');
  });

  it('5. Recommends mandatory evening shift for short half-life statins dosed in the morning', () => {
    const simvastatinSchedule = service.optimizeMedicationTiming({
      name: 'Simvastatin',
      dose: '20mg',
      currentHour: 8 // 08:00 AM
    });

    expect(simvastatinSchedule.drugClass).toBe('STATIN');
    expect(simvastatinSchedule.timingShiftRecommended).toBe(true);
    expect(simvastatinSchedule.optimalDosingTimeWindow).toContain('Evening / Bedtime');
    expect(simvastatinSchedule.efficacyGainPercent).toBe(28);
    expect(simvastatinSchedule.recommendationPriority).toBe('MANDATORY');
    expect(simvastatinSchedule.circadianBiologicalMechanism).toContain('HMG-CoA reductase');
  });

  it('6. Evaluates long half-life statins as supportive without mandatory shift', () => {
    const atorvastatinSchedule = service.optimizeMedicationTiming({
      name: 'Atorvastatin',
      dose: '40mg',
      currentHour: 8
    });

    expect(atorvastatinSchedule.drugClass).toBe('STATIN');
    expect(atorvastatinSchedule.timingShiftRecommended).toBe(false);
    expect(atorvastatinSchedule.recommendationPriority).toBe('SUPPORTIVE');
  });

  it('7. Recommends mandatory morning shift for evening-dosed glucocorticoids to preserve HPA axis', () => {
    const prednisoneSchedule = service.optimizeMedicationTiming({
      name: 'Prednisone',
      dose: '10mg',
      currentHour: 20 // 08:00 PM
    });

    expect(prednisoneSchedule.drugClass).toBe('GLUCOCORTICOID');
    expect(prednisoneSchedule.timingShiftRecommended).toBe(true);
    expect(prednisoneSchedule.optimalDosingTimeWindow).toContain('Early Morning upon Awakening');
    expect(prednisoneSchedule.adverseEventReductionPercent).toBe(55);
    expect(prednisoneSchedule.recommendationPriority).toBe('MANDATORY');
  });

  it('8. Evaluates cortisol diurnal slope across balanced, burnout, and nocturnal spikes', () => {
    // Normal steep diurnal slope
    const normal = service.evaluateCortisolDiurnalProfile(16.0, 7.0, 1.2);
    expect(normal.diurnalSlope).toBe('PHYSIOLOGICAL_STEEP');
    expect(normal.hpaAxisAcuity).toBe('BALANCED_EUSTRESS');

    // Flattened burnout slope
    const burnout = service.evaluateCortisolDiurnalProfile(6.0, 3.0, 1.5);
    expect(burnout.diurnalSlope).toBe('FLATTENED_CHRONIC_EXHAUSTION');
    expect(burnout.hpaAxisAcuity).toBe('BURNOUT_HYPOCORTISOLEMIA');
    expect(burnout.recommendedPacingInterventions.some(p => p.includes('10,000 lux'))).toBe(true);

    // Paradoxical nocturnal spike
    const spike = service.evaluateCortisolDiurnalProfile(14.0, 5.0, 8.5);
    expect(spike.diurnalSlope).toBe('PARADOXICAL_NOCTURNAL_SPIKE');
    expect(spike.hpaAxisAcuity).toBe('ACUTE_HYPERCORTISOLEMIA');
    expect(spike.recommendedPacingInterventions.some(p => p.includes('Phosphatidylserine'))).toBe(true);
  });

  it('9. Generates comprehensive chronotherapy audit with overall alignment score and integrity digest', () => {
    const audit = service.generateComprehensiveChronotherapyAudit(
      'PAT-CHRONO-001',
      {
        daytimeSystolic: 142,
        daytimeDiastolic: 88,
        nocturnalSystolic: 138,
        nocturnalDiastolic: 85,
        awakeningCortisol: 14.0,
        afternoonCortisol: 6.0,
        nocturnalCortisol: 1.5
      },
      [
        { name: 'Simvastatin', dose: '40mg', currentHour: 8 },
        { name: 'Lisinopril', dose: '20mg', currentHour: 8 }
      ]
    );

    expect(audit.patientId).toBe('PAT-CHRONO-001');
    expect(audit.bpChronobiology.phenotype).toBe('NON_DIPPER');
    expect(audit.optimizedMedications.length).toBe(2);
    expect(audit.overallCircadianAlignmentScore).toBeLessThan(100);
    expect(audit.keyClinicalDirectives.length).toBeGreaterThan(1);
    expect(audit.integrityDigest).toMatch(/^0x_chrono_[a-f0-9]{32}$/);
    expect(service.lastAudit()).toEqual(audit);
  });
});
