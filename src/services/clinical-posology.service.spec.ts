import { ClinicalPosologyService } from './clinical-posology.service';

describe('ClinicalPosologyService', () => {
  let service: ClinicalPosologyService;

  beforeEach(() => {
    service = new ClinicalPosologyService();
  });

  describe('1. Neonate / Infant Posology (Fried\'s Rule & Microdrip)', () => {
    it('calculates Fried\'s rule correctly with microbore syringe resolution and leading zero', () => {
      // 6-month-old infant, adult dose 500 mg, concentration 10 mg/mL
      // (6 / 150) * 500 = 20 mg
      // volume = 20 / 10 = 2.00 mL
      const res = service.calculateFriedRule(6, 500, 10);
      expect(res.calculatedDoseMg).toBe(20);
      expect(res.microboreSyringeVolumeMl).toBe(2);
      expect(res.formulaString).toContain('(6 mo / 150) × 500 mg = 20.00 mg');
      expect(res.microdripGttMin).toBe(120);
    });

    it('handles a 2-month-old infant with small dose requiring microbore precision', () => {
      // 2-month-old, adult dose 100 mg, concentration 10 mg/mL
      // (2 / 150) * 100 = 1.33 mg
      // volume = 1.33 / 10 = 0.13 mL (leading zero mandatory)
      const res = service.calculateFriedRule(2, 100, 10);
      expect(res.calculatedDoseMg).toBe(1.33);
      expect(res.microboreSyringeVolumeMl).toBe(0.13);
    });
  });

  describe('2. Pediatric / Child Posology (Young\'s & Clark\'s Rules, Mosteller BSA, Holliday-Segar)', () => {
    it('calculates Young\'s rule for a 4-year-old child', () => {
      // 4-year-old, adult dose 400 mg
      // factor = 4 / (4 + 12) = 4 / 16 = 0.25
      // 0.25 * 400 = 100 mg
      const res = service.calculateYoungRule(4, 400);
      expect(res.calculatedDoseMg).toBe(100);
      expect(res.formulaString).toContain('(4 yr / (4 + 12)) × 400 mg = 100 mg');
    });

    it('calculates Clark\'s rule for a 45-pound child', () => {
      // 45 lbs, adult dose 500 mg
      // (45 / 150) * 500 = 150 mg
      const res = service.calculateClarkRule(45, 500);
      expect(res.calculatedDoseMg).toBe(150);
      expect(res.formulaString).toContain('(45 lbs / 150) × 500 mg = 150 mg');
    });

    it('calculates Mosteller BSA correctly', () => {
      // Height 110 cm, Weight 20 kg, Dose 100 mg/m2
      // BSA = sqrt((110 * 20) / 3600) = sqrt(2200 / 3600) = sqrt(0.6111) = 0.78 m2
      // Dose = 0.78 * 100 = 78 mg
      const res = service.calculateMostellerBsa(110, 20, 100);
      expect(res.bsaM2).toBe(0.78);
      expect(res.calculatedDoseMg).toBe(78);
    });

    it('calculates Holliday-Segar 4-2-1 maintenance fluid hourly rate', () => {
      // 24 kg child:
      // First 10 kg: 10 * 4 = 40 mL/hr
      // Second 10 kg: 10 * 2 = 20 mL/hr
      // Remaining 4 kg: 4 * 1 = 4 mL/hr
      // Total = 64 mL/hr (1536 mL/day)
      const res = service.calculateHollidaySegarFluid(24);
      expect(res.hourlyRateMlHr).toBe(64);
      expect(res.dailyRateMlDay).toBe(1536);
      expect(res.breakdown.first10kgMlHr).toBe(40);
      expect(res.breakdown.second10kgMlHr).toBe(20);
      expect(res.breakdown.remainingKgMlHr).toBe(4);
    });

    it('calculates Holliday-Segar for infant under 10 kg', () => {
      // 8 kg infant:
      // 8 * 4 = 32 mL/hr
      const res = service.calculateHollidaySegarFluid(8);
      expect(res.hourlyRateMlHr).toBe(32);
      expect(res.dailyRateMlDay).toBe(768);
    });
  });

  describe('3. Geriatric / Elder Posology (Cockcroft-Gault CrCl & Beers Criteria)', () => {
    it('calculates Cockcroft-Gault CrCl for an elder with renal titration', () => {
      // 78yo male, 65 kg, Scr 1.6 mg/dL
      // CrCl = ((140 - 78) * 65) / (72 * 1.6) = (62 * 65) / 115.2 = 4030 / 115.2 = 35.0 mL/min
      const res = service.calculateCockcroftGaultCrCl(78, 65, 1.6, false);
      expect(res.crClMlMin).toBe(35);
      expect(res.renalDosingTier).toBe('Moderate (30-49 mL/min)');
      expect(res.renalDoseReductionPct).toBe(35);
      expect(res.recommendation).toContain('Reduce dose by 30-40%');
    });

    it('applies 0.85 female multiplier in Cockcroft-Gault', () => {
      // 80yo female, 50 kg, Scr 1.2 mg/dL
      // CrCl male = ((140 - 80) * 50) / (72 * 1.2) = 3000 / 86.4 = 34.72
      // Female = 34.72 * 0.85 = 29.5 mL/min
      const res = service.calculateCockcroftGaultCrCl(80, 50, 1.2, true);
      expect(res.crClMlMin).toBe(29.5);
      expect(res.renalDosingTier).toBe('Severe (<30 mL/min)');
      expect(res.renalDoseReductionPct).toBe(60);
    });

    it('maintains 2023 AGS Beers Criteria registry with safer alternatives', () => {
      expect(service.BEERS_CRITERIA_REGISTRY.length).toBeGreaterThanOrEqual(5);
      const diphen = service.BEERS_CRITERIA_REGISTRY.find(b => b.medication === 'Diphenhydramine');
      expect(diphen).toBeDefined();
      expect(diphen?.severity).toBe('HIGH_RISK_AVOID');
      expect(diphen?.saferAlternatives.length).toBeGreaterThan(0);
    });
  });

  describe('4. Clinical Alignment & Improper Dosage Spellcheck Engine', () => {
    it('detects naked decimals and prompts mandatory leading zero', () => {
      const audit = service.auditDosageText('Administer .5 mg Clonazepam IV');
      expect(audit.isCompliant).toBe(false);
      const v = audit.violations.find(x => x.type === 'NAKED_DECIMAL');
      expect(v).toBeDefined();
      expect(v?.originalSnippet).toBe('.5 mg');
      expect(v?.correctedSnippet).toBe('0.5 mg');
      expect(v?.cssClass).toContain('naked-decimal-error');
      expect(audit.sanitizedText).toContain('0.5 mg');
    });

    it('detects trailing zeros and flags with trailing-zero-error', () => {
      const audit = service.auditDosageText('Order Lisinopril 5.0 mg oral tablet');
      expect(audit.isCompliant).toBe(false);
      const v = audit.violations.find(x => x.type === 'TRAILING_ZERO');
      expect(v).toBeDefined();
      expect(v?.originalSnippet).toBe('5.0 mg');
      expect(v?.correctedSnippet).toBe('5 mg');
      expect(v?.cssClass).toContain('trailing-zero-error');
      expect(audit.sanitizedText).toContain('5 mg');
    });

    it('detects prohibited abbreviations (U, QD, QOD, MSO4)', () => {
      const audit = service.auditDosageText('Regular Insulin 10 U QD before breakfast');
      expect(audit.isCompliant).toBe(false);
      const abbrevViolations = audit.violations.filter(x => x.type === 'PROHIBITED_ABBREVIATION');
      expect(abbrevViolations.length).toBeGreaterThanOrEqual(2);
      expect(audit.sanitizedText).toContain('10 units daily');
    });

    it('detects adult dose in pediatric field as an age mismatch', () => {
      const audit = service.auditDosageText('Amoxicillin 875 mg BID', 4, 35);
      expect(audit.isCompliant).toBe(false);
      const v = audit.violations.find(x => x.type === 'AGE_MISMATCH');
      expect(v).toBeDefined();
      expect(v?.cssClass).toContain('posology-age-mismatch');
      expect(v?.explanation).toContain('Posology Age Mismatch');
    });

    it('detects multi-paradigm styling classes correctly', () => {
      const allopathic = service.auditDosageText('Metformin 500 mg BID');
      expect(allopathic.multiParadigmFontClass).toBe('font-paradigm-allopathic');

      const ayurvedic = service.auditDosageText('Ashwagandha 600 mg with warm ghee for Vata grounding');
      expect(ayurvedic.multiParadigmFontClass).toBe('font-paradigm-ayurvedic');

      const tcm = service.auditDosageText('Xiao Yao San 6g decoction for Liver Qi and LV-3 harmony');
      expect(tcm.multiParadigmFontClass).toBe('font-paradigm-tcm');

      const osteopathic = service.auditDosageText('C1-C2 articulation Fryette somatic dysfunction');
      expect(osteopathic.multiParadigmFontClass).toBe('font-paradigm-osteopathic');

      const homeopathic = service.auditDosageText('Arnica Montana 30C sublingual pellets');
      expect(homeopathic.multiParadigmFontClass).toBe('font-paradigm-homeopathic');
    });
  });
});
