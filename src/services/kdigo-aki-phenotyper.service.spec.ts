import { describe, it, expect, beforeEach } from 'vitest';
import { KdigoAkiPhenotyperService } from './kdigo-aki-phenotyper.service';

describe('KdigoAkiPhenotyperService (Clinical Model P9)', () => {
  let service: KdigoAkiPhenotyperService;

  beforeEach(() => {
    service = new KdigoAkiPhenotyperService();
  });

  it('1. Initializes and evaluates healthy homeostasis baseline', () => {
    service.applyPreset('homeostasis');

    const gfr = service.gfrReport();
    expect(gfr.egfrComposite).toBeGreaterThanOrEqual(80);
    expect(gfr.sarcopeniaWarning).toBe(false);
    expect(gfr.confidenceTier).toBe('Optimal Concordance');

    const aki = service.akiAssessment();
    expect(aki.currentStage).toBe('Stage 0 (No AKI)');
    expect(aki.stageNumeric).toBe(0);
    expect(aki.isRrtIndicated).toBe(false);

    const excretion = service.excretionPhenotype();
    expect(excretion.etiology).toBe('Homeostatic Glomerular Filtration');
  });

  it('2. Detects Prerenal Azotemia with intact tubular reabsorption (FE_Na < 1%)', () => {
    service.applyPreset('prerenal_dehydration');

    const aki = service.akiAssessment();
    expect(aki.currentStage).toBe('KDIGO Stage 1');
    expect(aki.creatinineRatio).toBe(1.6);
    expect(aki.creatinineDelta48h).toBe(0.6);

    const excretion = service.excretionPhenotype();
    expect(excretion.feNaPercent).toBeLessThan(1.0);
    expect(excretion.etiology).toBe('Prerenal Azotemia (Hemodynamic Hypoperfusion)');
    expect(excretion.tubularReabsorptionIntegrity).toBe('Preserved (Avid Na/Urea Reabsorption)');

    const fst = service.fstReport();
    expect(fst.category).toBe('FST Robust Responder (Intact Tubular Integrity)');
    expect(fst.progressionToStage3RiskPercent).toBeLessThan(15);
  });

  it('3. Classifies Acute Tubular Necrosis (ATN) with impaired tubular handling (FE_Na > 2%)', () => {
    service.applyPreset('atn_septic_shock');

    const aki = service.akiAssessment();
    expect(aki.currentStage).toBe('KDIGO Stage 2');
    expect(aki.stageNumeric).toBe(2);

    const excretion = service.excretionPhenotype();
    expect(excretion.feNaPercent).toBeGreaterThan(2.0);
    expect(excretion.etiology).toBe('Intrinsic Acute Tubular Necrosis (ATN)');
    expect(excretion.tubularReabsorptionIntegrity).toBe('Disrupted (Tubular Epithelial Necrosis)');

    const fst = service.fstReport();
    expect(fst.category).toBe('FST Non-Responder (High RRT / Progression Hazard)');
    expect(fst.progressionToStage3RiskPercent).toBeGreaterThan(75);
    expect(fst.rrtNeedRiskPercent).toBeGreaterThan(60);
  });

  it('4. Unmasks occult renal dysfunction in sarcopenic elderly via Cystatin C composite', () => {
    service.applyPreset('sarcopenic_elderly');

    const gfr = service.gfrReport();
    // Serum creatinine is falsely low (0.75 mg/dL) -> eGFR_Cr ~ 75-80
    // Serum cystatin C is elevated (1.75 mg/L) -> eGFR_Cys ~ 32
    expect(gfr.egfrCreatinine).toBeGreaterThan(70);
    expect(gfr.egfrCystatinC).toBeLessThan(45);
    expect(gfr.sarcopeniaWarning).toBe(true);
    expect(gfr.confidenceTier).toBe('Sarcopenia Discrepancy (eGFR_Cys < eGFR_Cr)');
  });

  it('5. Evaluates FST Non-Responder in Severe Stage 3 AKI and switches to FE_Urea with loop diuretics', () => {
    service.applyPreset('fst_non_responder');

    const aki = service.akiAssessment();
    expect(aki.currentStage).toBe('KDIGO Stage 3 (Severe / RRT Risk)');
    expect(aki.stageNumeric).toBe(3);
    expect(aki.isRrtIndicated).toBe(true);

    const excretion = service.excretionPhenotype();
    expect(excretion.diureticConfounderActive).toBe(true);
    expect(excretion.feUreaPercent).toBeDefined();

    const fst = service.fstReport();
    expect(fst.category).toBe('FST Non-Responder (High RRT / Progression Hazard)');
    expect(fst.urineVolume2hMl).toBe(60);
  });

  it('6. Dialysis requirement immediately escalates to Stage 3 and flags RRT indicated', () => {
    service.applyPreset('homeostasis');
    service.isDialysisRequired.set(true);

    const aki = service.akiAssessment();
    expect(aki.currentStage).toBe('KDIGO Stage 3 (Severe / RRT Risk)');
    expect(aki.stageNumeric).toBe(3);
    expect(aki.isRrtIndicated).toBe(true);
    expect(aki.stagingRationale).toContain('RRT Required');
  });

  it('7. Synthesizes complete composite report with clinical summary narrative', () => {
    service.applyPreset('prerenal_dehydration');
    const comp = service.compositeReport();

    expect(comp.clinicalSummary).toContain('KDIGO Stage 1');
    expect(comp.clinicalSummary).toContain('Prerenal Azotemia');
    expect(comp.gfr.egfrComposite).toBeGreaterThan(0);
    expect(comp.aki.currentStage).toBeTruthy();
  });
});
