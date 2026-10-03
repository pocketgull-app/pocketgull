import { RenalClearanceService } from './renal-clearance.service';

describe('RenalClearanceService (Clinical Model P5)', () => {
  let service: RenalClearanceService;

  beforeEach(() => {
    service = new RenalClearanceService();
  });

  it('1. Calculates CKD-EPI 2021 race-free eGFR for female and male patients accurately', () => {
    // 62yo female, SCr 1.1 mg/dL
    const egfrFemale = service.calculateCkdEpi2021(1.1, 62, 'female');
    expect(egfrFemale).toBeGreaterThan(50);
    expect(egfrFemale).toBeLessThan(65);

    // 62yo male, SCr 1.1 mg/dL
    const egfrMale = service.calculateCkdEpi2021(1.1, 62, 'male');
    expect(egfrMale).toBeGreaterThan(egfrFemale); // Male has higher kappa (0.9 vs 0.7) and sex factor (1.0 vs 1.012)
  });

  it('2. Correctly determines KDIGO CKD Stages G1 through G5', () => {
    expect(service.determineCkdStage(95)).toBe('G1');
    expect(service.determineCkdStage(75)).toBe('G2');
    expect(service.determineCkdStage(52)).toBe('G3a');
    expect(service.determineCkdStage(38)).toBe('G3b');
    expect(service.determineCkdStage(22)).toBe('G4');
    expect(service.determineCkdStage(10)).toBe('G5');
  });

  it('3. Computes Cockcroft-Gault CrCl with IBW and Adjusted Body Weight for obesity', () => {
    // Non-obese female: 62yo, 70kg, 165cm (5'5"), SCr 1.1
    const nonObese = service.calculateCockcroftGault(1.1, 62, 70, 165, 'female');
    expect(nonObese.crClActual).toBeGreaterThan(45);
    expect(nonObese.isObese).toBe(false);

    // Obese female: 62yo, 110kg, 165cm (BMI > 40), SCr 1.1
    const obese = service.calculateCockcroftGault(1.1, 62, 110, 165, 'female');
    expect(obese.isObese).toBe(true);
    // Adjusted CrCl should be lower than raw actual weight CrCl to prevent drug overdosing
    expect(obese.crClAdjusted).toBeLessThan(obese.crClActual);
  });

  it('4. Staging KDIGO Acute Kidney Injury (AKI) correctly detects Stages 1, 2, and 3', () => {
    // Normal baseline (1.0 -> 1.1): No AKI
    const noAki = service.evaluateAkiStage(1.1, 1.0);
    expect(noAki.stage).toBe('No AKI');
    expect(noAki.isAki).toBe(false);

    // Acute rise >= 0.3 mg/dL (1.0 -> 1.35): Stage 1
    const stage1 = service.evaluateAkiStage(1.35, 1.0);
    expect(stage1.stage).toBe('KDIGO Stage 1');
    expect(stage1.isAki).toBe(true);

    // 2.0x baseline rise (1.0 -> 2.2): Stage 2
    const stage2 = service.evaluateAkiStage(2.2, 1.0);
    expect(stage2.stage).toBe('KDIGO Stage 2');
    expect(stage2.isAki).toBe(true);

    // 3.0x baseline rise or Cr >= 4.0 (1.0 -> 3.2): Stage 3
    const stage3 = service.evaluateAkiStage(3.2, 1.0);
    expect(stage3.stage).toBe('KDIGO Stage 3');
    expect(stage3.isAki).toBe(true);
  });

  it('5. Contraindicates Metformin when eGFR falls below 30 mL/min/1.73m2 (Black Box)', () => {
    // Normal eGFR: 75 -> standard
    const normal = service.evaluateMedicationRenalDosing('Metformin', 75, 75);
    expect(normal?.actionRequired).toBe('standard');

    // Moderate CKD eGFR: 40 -> dose reduction
    const mod = service.evaluateMedicationRenalDosing('Metformin', 40, 40);
    expect(mod?.actionRequired).toBe('dose_reduction');
    expect(mod?.recommendedDosage).toContain('Max 500 mg');

    // Severe CKD eGFR: 24 -> contraindicated with Black Box Warning
    const severe = service.evaluateMedicationRenalDosing('Metformin', 24, 24);
    expect(severe?.actionRequired).toBe('contraindicated');
    expect(severe?.fdaBlackBoxWarning).toBe(true);
    expect(severe?.clinicalRationale).toContain('lactic acidosis');
  });

  it('6. Titrates Gabapentin dose downward according to CrCl cutoffs to prevent neurotoxicity', () => {
    // CrCl 45 (30-59 range): max 1400 mg BID
    const gaba45 = service.evaluateMedicationRenalDosing('Gabapentin', 45, 45);
    expect(gaba45?.actionRequired).toBe('dose_reduction');
    expect(gaba45?.recommendedDosage).toContain('400 mg to 1400 mg');

    // CrCl 20 (15-29 range): max 700 mg once daily
    const gaba20 = service.evaluateMedicationRenalDosing('Gabapentin', 20, 20);
    expect(gaba20?.actionRequired).toBe('dose_reduction');
    expect(gaba20?.recommendedDosage).toContain('once daily at bedtime');

    // CrCl 10 (< 15 range): severe reduction / hemodialysis schedule
    const gaba10 = service.evaluateMedicationRenalDosing('Gabapentin', 10, 10);
    expect(gaba10?.recommendedDosage).toContain('every other day or post-hemodialysis');
  });

  it('7. Contraindicates Dabigatran when CrCl < 15 mL/min due to 80% renal excretion', () => {
    const dab10 = service.evaluateMedicationRenalDosing('Dabigatran', 10, 10);
    expect(dab10?.actionRequired).toBe('contraindicated');
    expect(dab10?.fdaBlackBoxWarning).toBe(true);
    expect(dab10?.clinicalRationale).toContain('80%');

    const dab25 = service.evaluateMedicationRenalDosing('Dabigatran', 25, 25);
    expect(dab25?.actionRequired).toBe('dose_reduction');
    expect(dab25?.recommendedDosage).toContain('75 mg orally twice daily');
  });

  it('8. Flags Empagliflozin initiation limit when eGFR < 20 mL/min/1.73m2', () => {
    const empa15 = service.evaluateMedicationRenalDosing('Empagliflozin', 15, 15);
    expect(empa15?.actionRequired).toBe('contraindicated');
    expect(empa15?.clinicalRationale).toContain('Glomerular filtration threshold');
  });

  it('9. Reacts dynamically when setCreatinine simulates acute kidney injury', () => {
    // Initial normal creatinine
    service.setCreatinine(1.0, 1.0);
    expect(service.akiRiskFlag()).toBe(false);

    // Simulate septic AKI spike: Cr 1.0 -> 2.6
    service.setCreatinine(2.6, 1.0);
    expect(service.akiRiskFlag()).toBe(true);
    expect(service.akiStage()).toBe('KDIGO Stage 2');
    expect(service.ckdStage()).toBe('G4');

    // High risk medications flagged
    expect(service.highRiskMedicationsCount()).toBeGreaterThan(0);
    const assessment = service.fullAssessment();
    expect(assessment.akiRiskFlag).toBe(true);
    expect(assessment.akiStage).toBe('KDIGO Stage 2');
  });

  it('10. Dynamically adds and removes medications from the renal safety audit', () => {
    service.addMedication('Dabigatran');
    expect(service.currentMedications()).toContain('Dabigatran');

    service.removeMedication('Dabigatran');
    expect(service.currentMedications()).not.toContain('Dabigatran');
  });
});
