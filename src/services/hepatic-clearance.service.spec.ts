import { HepaticClearanceService } from './hepatic-clearance.service';

describe('HepaticClearanceService (Clinical Model P6)', () => {
  let service: HepaticClearanceService;

  beforeEach(() => {
    service = new HepaticClearanceService();
  });

  it('1. Accurately calculates Child-Pugh Class A for well-compensated patient', () => {
    // Normal labs: Bili 1.0 (1pt), Alb 4.0 (1pt), INR 1.1 (1pt), No Ascites (1pt), No Enceph (1pt) = 5 pts
    const result = service.calculateChildPugh(1.0, 4.0, 1.1, 'none', 'none');
    expect(result.totalScore).toBe(5);
    expect(result.cirrhosisClass).toBe('Class A');
    expect(result.oneYearSurvivalPercent).toBe(100);
    expect(result.twoYearSurvivalPercent).toBe(85);
    expect(result.perioperativeMortalityPercent).toBe(10);
  });

  it('2. Accurately calculates Child-Pugh Class B for moderate functional impairment', () => {
    // Bili 2.4 (2pts), Alb 3.2 (2pts), INR 1.9 (2pts), Mild Ascites (2pts), No Enceph (1pt) = 9 pts
    const result = service.calculateChildPugh(2.4, 3.2, 1.9, 'mild', 'none');
    expect(result.totalScore).toBe(9);
    expect(result.cirrhosisClass).toBe('Class B');
    expect(result.oneYearSurvivalPercent).toBe(80);
    expect(result.twoYearSurvivalPercent).toBe(60);
    expect(result.perioperativeMortalityPercent).toBe(30);
  });

  it('3. Accurately calculates Child-Pugh Class C for decompensated end-stage cirrhosis', () => {
    // Bili 4.2 (3pts), Alb 2.3 (3pts), INR 2.6 (3pts), Severe Ascites (3pts), Grade 3-4 Enceph (3pts) = 15 pts
    const result = service.calculateChildPugh(4.2, 2.3, 2.6, 'moderate_severe', 'grade_3_4');
    expect(result.totalScore).toBe(15);
    expect(result.cirrhosisClass).toBe('Class C');
    expect(result.oneYearSurvivalPercent).toBe(45);
    expect(result.twoYearSurvivalPercent).toBe(35);
    expect(result.perioperativeMortalityPercent).toBe(76);
  });

  it('4. Handles cholestatic liver disease (PBC/PSC) bilirubin scale', () => {
    // In PBC: Bili 3.5 mg/dL is 1 pt (cutoff is 4.0), whereas standard is 3 pts (cutoff is 3.0)
    const standard = service.calculateChildPugh(3.5, 4.0, 1.0, 'none', 'none', false);
    expect(standard.bilirubinPoints).toBe(3);

    const cholestatic = service.calculateChildPugh(3.5, 4.0, 1.0, 'none', 'none', true);
    expect(cholestatic.bilirubinPoints).toBe(1);
  });

  it('5. Computes UNOS 2016 MELD-Na score accurately with sodium correction when MELD(i) > 11', () => {
    // Cr 1.8, Bili 3.2, INR 1.9, Na 130, no dialysis
    const meld = service.calculateMeldNa(1.8, 3.2, 1.9, 130, false);
    expect(meld.meldInitial).toBeGreaterThan(11);
    expect(meld.meldNa).toBeGreaterThan(meld.meldInitial); // Hyponatremia (130 < 137) adds points
    expect(meld.cappedNa).toBe(130);
    expect(meld.transplantListingPriority).toBe('Urgent');
  });

  it('6. Does not apply sodium correction in MELD-Na when MELD(i) <= 11', () => {
    // Normal / near-normal labs: Cr 1.0, Bili 1.0, INR 1.0, Na 128
    // meldRaw = 9.57*0 + 3.78*0 + 11.20*0 + 6.43 = 6.43 (<= 11)
    const meld = service.calculateMeldNa(1.0, 1.0, 1.0, 128, false);
    expect(meld.meldInitial).toBeCloseTo(6.4, 1);
    expect(meld.meldNa).toBe(6); // When <= 11, meldNa = meldInitial (rounded)
  });

  it('7. Enforces UNOS 4.0 mg/dL creatinine assignment for patients on hemodialysis in the past 7 days', () => {
    // Patient on dialysis with low lab Cr (e.g. 0.8 post-dialysis) MUST be assigned Cr 4.0
    const dialyzed = service.calculateMeldNa(0.8, 2.5, 1.5, 135, true);
    expect(dialyzed.cappedCr).toBe(4.0);
    expect(dialyzed.dialysisAssigned).toBe(true);

    const nonDialyzed = service.calculateMeldNa(0.8, 2.5, 1.5, 135, false);
    expect(nonDialyzed.cappedCr).toBe(1.0); // Clamped to min 1.0 per UNOS rules
    expect(dialyzed.meldNa).toBeGreaterThan(nonDialyzed.meldNa);
  });

  it('8. Clamps MELD-Na upper bound to 40 and assigns STAT emergency transplant priority', () => {
    // Extreme end-stage labs: Cr 4.0, Bili 25.0, INR 4.5, Na 125, dialysis true
    const extreme = service.calculateMeldNa(4.0, 25.0, 4.5, 125, true);
    expect(extreme.meldNa).toBe(40);
    expect(extreme.estimated90DayMortalityPercent).toBe(71.3);
    expect(extreme.transplantListingPriority).toBe('STAT Emergency MELD >= 35');
  });

  it('9. Strictly flags NSAIDs (Ibuprofen, Naproxen) as absolute contraindication with Black Box warning', () => {
    const ibup = service.evaluateMedicationHepaticDosing('Ibuprofen');
    expect(ibup).not.toBeNull();
    expect(ibup?.actionRequired).toBe('contraindicated');
    expect(ibup?.fdaBlackBoxWarning).toBe(true);
    expect(ibup?.clinicalRationale).toContain('Hepatorenal Syndrome');
    expect(ibup?.safeAnalgesicAlternative).toContain('Acetaminophen');

    const napr = service.evaluateMedicationHepaticDosing('Naproxen');
    expect(napr?.actionRequired).toBe('contraindicated');
    expect(napr?.fdaBlackBoxWarning).toBe(true);
  });

  it('10. Safely endorses Acetaminophen as preferred first-line analgesic over NSAIDs with daily dose limits', () => {
    // Compensated Class A: Standard dosing with liver protection rationale
    const cpA = service.calculateChildPugh(1.0, 4.0, 1.0, 'none', 'none');
    const apapA = service.evaluateMedicationHepaticDosing('Acetaminophen', cpA);
    expect(apapA?.actionRequired).toBe('standard');
    expect(apapA?.recommendedDosage).toContain('Max 2000 mg to 3000 mg');
    expect(apapA?.clinicalRationale).toContain('Safe first-line analgesic');

    // Decompensated Class C: Dose reduction to max 1-1.5g/day or avoidance
    const cpC = service.calculateChildPugh(4.0, 2.2, 2.5, 'moderate_severe', 'grade_3_4');
    const apapC = service.evaluateMedicationHepaticDosing('Acetaminophen', cpC);
    expect(apapC?.actionRequired).toBe('dose_reduction');
    expect(apapC?.recommendedDosage).toContain('1000 mg to 1500 mg');
  });

  it('11. Flags high-extraction Opioid (Morphine) portosystemic shunt surge and encephalopathy hazard', () => {
    const cpC = service.calculateChildPugh(4.0, 2.2, 2.5, 'moderate_severe', 'grade_3_4');
    const morphC = service.evaluateMedicationHepaticDosing('Morphine', cpC);
    expect(morphC?.actionRequired).toBe('contraindicated');
    expect(morphC?.hepaticExtractionRatio).toBe('high');
    expect(morphC?.fdaBlackBoxWarning).toBe(true);
    expect(morphC?.clinicalRationale).toContain('Portosystemic shunting');

    const cpB = service.calculateChildPugh(2.2, 3.1, 1.8, 'mild', 'none');
    const morphB = service.evaluateMedicationHepaticDosing('Morphine', cpB);
    expect(morphB?.actionRequired).toBe('dose_reduction');
    expect(morphB?.recommendedDosage).toContain('50% to 75%');
  });

  it('12. Differentiates Diazepam Phase-I failure from Lorazepam Phase-II glucuronidation preservation', () => {
    const cpB = service.calculateChildPugh(2.5, 3.2, 1.8, 'mild', 'none');

    // Diazepam: Phase-I CYP oxidation severely impaired -> contraindicated
    const diaz = service.evaluateMedicationHepaticDosing('Diazepam', cpB);
    expect(diaz?.actionRequired).toBe('contraindicated');
    expect(diaz?.safeAnalgesicAlternative).toContain('LOT');

    // Lorazepam: Direct Phase-II UGT glucuronidation preserved -> standard reduced dose
    const lora = service.evaluateMedicationHepaticDosing('Lorazepam', cpB);
    expect(lora?.actionRequired).toBe('standard');
    expect(lora?.clinicalRationale).toContain('Phase-II glucuronidation');
  });

  it('13. Supports Atorvastatin safety in Class A while contraindicating in decompensated Class C', () => {
    const cpA = service.calculateChildPugh(1.0, 4.0, 1.1, 'none', 'none');
    const statinA = service.evaluateMedicationHepaticDosing('Atorvastatin', cpA);
    expect(statinA?.actionRequired).toBe('standard');
    expect(statinA?.clinicalRationale).toContain('reduce sinusoidal resistance');

    const cpC = service.calculateChildPugh(4.0, 2.4, 2.5, 'moderate_severe', 'grade_3_4');
    const statinC = service.evaluateMedicationHepaticDosing('Atorvastatin', cpC);
    expect(statinC?.actionRequired).toBe('contraindicated');
    expect(statinC?.fdaBlackBoxWarning).toBe(true);
  });

  it('14. Assesses Propranolol variceal prophylaxis and Window Hypothesis in decompensation', () => {
    const cpA = service.calculateChildPugh(1.0, 4.0, 1.1, 'none', 'none');
    const meldLow = service.calculateMeldNa(1.0, 1.0, 1.0, 138, false);
    const propA = service.evaluateMedicationHepaticDosing('Propranolol', cpA, meldLow);
    expect(propA?.actionRequired).toBe('standard');
    expect(propA?.recommendedDosage).toContain('55-60 bpm');

    const cpC = service.calculateChildPugh(4.0, 2.2, 2.6, 'moderate_severe', 'grade_3_4');
    const meldHigh = service.calculateMeldNa(3.0, 5.0, 3.0, 126, false);
    const propC = service.evaluateMedicationHepaticDosing('Propranolol', cpC, meldHigh);
    expect(propC?.actionRequired).toBe('interval_extension');
    expect(propC?.recommendedDosage).toContain('Window Hypothesis');
  });

  it('15. Flags PPI (Pantoprazole) bacterial translocation, SBP, and dysbiosis hazard', () => {
    const cpB = service.calculateChildPugh(2.4, 3.0, 1.9, 'mild', 'none');
    const ppi = service.evaluateMedicationHepaticDosing('Pantoprazole', cpB);
    expect(ppi?.actionRequired).toBe('dose_reduction');
    expect(ppi?.clinicalRationale).toContain('Spontaneous Bacterial Peritonitis');
  });

  it('16. Dynamically updates computed signals across simulated clinical scenarios', () => {
    // 1. Compensated Class A
    service.simulateScenario('compensated_class_a');
    expect(service.childPughClass()).toBe('Class A');
    expect(service.decompensatedFlag()).toBe(false);
    expect(service.hepatorenalSyndromeRisk()).toBe(false);

    // 2. Decompensated Class C
    service.simulateScenario('decompensated_class_c');
    expect(service.childPughClass()).toBe('Class C');
    expect(service.decompensatedFlag()).toBe(true);
    expect(service.highRiskMedicationsCount()).toBeGreaterThan(3);

    // 3. Hepatorenal syndrome scenario
    service.simulateScenario('hepatorenal_syndrome');
    expect(service.hepatorenalSyndromeRisk()).toBe(true);
  });

  it('17. Allows adding and removing medications dynamically from the hepatic safety audit', () => {
    service.addMedication('Naproxen');
    expect(service.currentMedications()).toContain('Naproxen');

    service.removeMedication('Naproxen');
    expect(service.currentMedications()).not.toContain('Naproxen');
  });

  it('18. Generates complete comprehensive assessment snapshot with all clinical telemetry', () => {
    service.simulateScenario('compensated_class_a');
    const assessment = service.fullAssessment();
    expect(assessment.timestamp).toBeDefined();
    expect(assessment.childPugh.cirrhosisClass).toBe('Class A');
    expect(assessment.meldNa.meldNa).toBeDefined();
    expect(assessment.decompensatedFlag).toBe(false);
  });
});
