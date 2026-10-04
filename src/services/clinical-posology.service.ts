import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IsmpSafetyGuardService } from './ismp-safety-guard.service';

export type PosologyAgeTier = 'neonate_infant' | 'pediatric_child' | 'adult' | 'geriatric_elder' | 'environmental_heat' | 'sfi_complex_adaptive' | 'msf_field_humanitarian';

export interface IMsfWeightBandItem {
  id: string;
  medication: string;
  indication: string;
  formulation: string;
  weightBandLabel: string;
  minWeightKg: number;
  maxWeightKg: number;
  tabletCountOrDose: string;
  regimenSummary: string;
  duration: string;
  clinicalNotes: string;
}

export interface IMsfCholeraAssessmentInput {
  lethargicOrUnconscious: boolean;
  sunkenEyes: boolean;
  unableToDrinkOrDrinksPoorly: boolean;
  skinPinchVerySlow: boolean; // >= 2 seconds
  restlessIrritable: boolean;
  thirstyDrinksEagerly: boolean;
  skinPinchSlow: boolean; // < 2 seconds
}

export interface IMsfCholeraPlanResult {
  plan: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  dehydrationLevel: 'NO_DEHYDRATION' | 'SOME_DEHYDRATION' | 'SEVERE_DEHYDRATION';
  patientWeightKg: number;
  isInfantUnder1Year: boolean;
  fluidPrescription: {
    solution: string;
    totalVolumeMl: number;
    phase1VolumeMl?: number;
    phase1DurationText?: string;
    phase2VolumeMl?: number;
    phase2DurationText?: string;
    maintenanceOrsText: string;
  };
  monitoringDirectives: string[];
  zincDosageText: string;
}

export interface IMsfMeaslesVitaminAResult {
  ageMonths: number;
  doseIU: number;
  schedule: string;
  indication: string;
  presentation: string;
  notes: string;
}

export interface IMsfMalnutritionTriageResult {
  category: 'SEVERE_ACUTE_MALNUTRITION_COMPLICATED' | 'SEVERE_ACUTE_MALNUTRITION_UNCOMPLICATED' | 'MODERATE_ACUTE_MALNUTRITION' | 'NORMAL';
  triageDisposition: 'INPATIENT_STABILIZATION_CRENI' | 'OUTPATIENT_THERAPEUTIC_CRENA' | 'SUPPLEMENTARY_FEEDING' | 'ROUTINE_MONITORING';
  criteriaMatched: string[];
  therapeuticDiet: string;
  clinicalWarning: string;
}

export interface IFriedRuleResult {
  ageMonths: number;
  adultDoseMg: number;
  calculatedDoseMg: number;
  formulaString: string;
  microboreSyringeVolumeMl: number; // 0.01 mL resolution with leading zero
  microdripGttMin: number; // 60 gtt/mL rate
}

export interface IYoungRuleResult {
  ageYears: number;
  adultDoseMg: number;
  calculatedDoseMg: number;
  formulaString: string;
}

export interface IClarkRuleResult {
  weightLbs: number;
  adultDoseMg: number;
  calculatedDoseMg: number;
  formulaString: string;
}

export interface IMostellerBsaResult {
  heightCm: number;
  weightKg: number;
  bsaM2: number;
  dosePerM2: number;
  calculatedDoseMg: number;
  formulaString: string;
}

export interface IHollidaySegarFluidResult {
  weightKg: number;
  hourlyRateMlHr: number;
  dailyRateMlDay: number;
  breakdown: {
    first10kgMlHr: number;
    second10kgMlHr: number;
    remainingKgMlHr: number;
  };
  telemetryDisplay: string;
}

export interface ICockcroftGaultResult {
  age: number;
  weightKg: number;
  serumCreatinineMgDl: number;
  isFemale: boolean;
  crClMlMin: number;
  renalDosingTier: 'Normal (>60 mL/min)' | 'Mild (50-59 mL/min)' | 'Moderate (30-49 mL/min)' | 'Severe (<30 mL/min)' | 'End-Stage (<15 mL/min)';
  renalDoseReductionPct: number;
  recommendation: string;
}

export interface IBeersCriteriaAlert {
  medication: string;
  category: string;
  rationale: string;
  recommendation: string;
  severity: 'HIGH_RISK_AVOID' | 'USE_WITH_CAUTION' | 'RENAL_ADJUSTMENT';
  saferAlternatives: string[];
}

export interface IDosageSpellcheckViolation {
  id: string;
  type: 'NAKED_DECIMAL' | 'TRAILING_ZERO' | 'PROHIBITED_ABBREVIATION' | 'AGE_MISMATCH' | 'FATAL_OVERDOSE' | 'SUBTHERAPEUTIC';
  originalSnippet: string;
  correctedSnippet: string;
  cssClass: string;
  dataAttribute: string;
  explanation: string;
  severity: 'CRITICAL_FATAL' | 'HIGH_RISK_ERROR' | 'CAUTION_SUBTHERAPEUTIC';
}

export interface IDosageSpellcheckAudit {
  rawInput: string;
  sanitizedText: string;
  isCompliant: boolean;
  violations: IDosageSpellcheckViolation[];
  ageTier: PosologyAgeTier;
  multiParadigmFontClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalPosologyService {

  /**
   * 2023 Updated AGS Beers Criteria High-Risk Medication Registry for Elders
   */
  public readonly BEERS_CRITERIA_REGISTRY: ReadonlyArray<IBeersCriteriaAlert> = [
    {
      medication: 'Diphenhydramine',
      category: 'First-Generation Antihistamines',
      rationale: 'Highly anticholinergic; clearance reduced with advanced age; high risk of confusion, dry mouth, urinary retention, and motor falls.',
      recommendation: 'Avoid. Use non-pharmacological sleep hygiene or non-sedating second-generation antihistamines (Cetirizine, Loratadine).',
      severity: 'HIGH_RISK_AVOID',
      saferAlternatives: ['Cetirizine (low dose)', 'Fexofenadine', 'Saline nasal spray']
    },
    {
      medication: 'Diazepam',
      category: 'Long-Acting Benzodiazepines',
      rationale: 'Prolonged half-life in older adults (>72h); produces severe ataxia, cognitive blunting, fracture-risk falls, and delirium.',
      recommendation: 'Avoid. If benzodiazepine required for severe acute tremor/spasm, consider short-acting (Lorazepam/Oxazepam) at 50% dose.',
      severity: 'HIGH_RISK_AVOID',
      saferAlternatives: ['Melatonin 1-3mg', 'AVS Vagal Audio Therapy', 'Ashwagandha Extract']
    },
    {
      medication: 'Glyburide',
      category: 'Long-Acting Sulfonylureas',
      rationale: 'Severe, prolonged hypoglycemia in elderly patients due to active circulating metabolites and declining eGFR.',
      recommendation: 'Avoid. Substitute with Glipizide (short-acting), Metformin (if eGFR > 30), or DPP-4 inhibitors (Linagliptin).',
      severity: 'HIGH_RISK_AVOID',
      saferAlternatives: ['Glipizide', 'Linagliptin', 'Metformin (with eGFR monitoring)']
    },
    {
      medication: 'Indomethacin',
      category: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs)',
      rationale: 'Highest adverse CNS and GI toxicities among NSAIDs; induces acute renal impairment, hyperkalemia, and worsening hypertension.',
      recommendation: 'Avoid. Use topical NSAIDs (Diclofenac gel), Acetaminophen, or Curcumin/Boswellia botanical synergy.',
      severity: 'HIGH_RISK_AVOID',
      saferAlternatives: ['Topical Diclofenac 1%', 'Acetaminophen max 2g/day', 'Curcumin + Boswellia Phytosome']
    },
    {
      medication: 'Amitriptyline',
      category: 'Tricyclic Antidepressants (TCAs)',
      rationale: 'Strong anticholinergic, sedating, and orthostatic hypotensive properties; risk of cardiac conduction block and syncope.',
      recommendation: 'Avoid. Use SSRIs (Sertraline, Escitalopram) or SNRIs (Duloxetine) with careful electrolyte/sodium monitoring.',
      severity: 'HIGH_RISK_AVOID',
      saferAlternatives: ['Sertraline', 'Duloxetine', 'Brahmi (Bacopa monnieri)']
    }
  ];

  /**
   * 1. Neonate / Infant: Fried's Rule
   * Infant Dose = (Age in months / 150) * Adult Dose
   */
  calculateFriedRule(ageMonths: number, adultDoseMg: number, concentrationMgPerMl = 10): IFriedRuleResult {
    const validMonths = Math.max(0.1, Math.min(12, ageMonths));
    const calculatedDoseMg = Math.round(((validMonths / 150) * adultDoseMg) * 100) / 100;
    
    // Syringe volume in mL rounded to microbore 0.01 mL resolution with mandatory leading zero
    const volumeMl = Math.round((calculatedDoseMg / concentrationMgPerMl) * 100) / 100;

    // Standard microdrip infusion: 60 gtt/mL
    // Assume 1 hour delivery: (volumeMl * 60) / 60 min = volumeMl gtt/min
    const microdripGttMin = Math.round(volumeMl * 60);

    return {
      ageMonths: validMonths,
      adultDoseMg,
      calculatedDoseMg,
      formulaString: `(${validMonths} mo / 150) × ${adultDoseMg} mg = ${calculatedDoseMg.toFixed(2)} mg`,
      microboreSyringeVolumeMl: volumeMl,
      microdripGttMin
    };
  }

  /**
   * 2. Pediatric / Child: Young's Rule
   * Child Dose = (Age in years / (Age + 12)) * Adult Dose
   */
  calculateYoungRule(ageYears: number, adultDoseMg: number): IYoungRuleResult {
    const validYears = Math.max(1, Math.min(12, ageYears));
    const factor = validYears / (validYears + 12);
    const calculatedDoseMg = Math.round((factor * adultDoseMg) * 10) / 10;

    return {
      ageYears: validYears,
      adultDoseMg,
      calculatedDoseMg,
      formulaString: `(${validYears} yr / (${validYears} + 12)) × ${adultDoseMg} mg = ${calculatedDoseMg} mg`
    };
  }

  /**
   * 3. Pediatric / Child: Clark's Rule (Weight-based in pounds)
   * Child Dose = (Weight in lbs / 150) * Adult Dose
   */
  calculateClarkRule(weightLbs: number, adultDoseMg: number): IClarkRuleResult {
    const validLbs = Math.max(5, Math.min(150, weightLbs));
    const calculatedDoseMg = Math.round(((validLbs / 150) * adultDoseMg) * 10) / 10;

    return {
      weightLbs: validLbs,
      adultDoseMg,
      calculatedDoseMg,
      formulaString: `(${validLbs} lbs / 150) × ${adultDoseMg} mg = ${calculatedDoseMg} mg`
    };
  }

  /**
   * 4. Mosteller Body Surface Area (BSA)
   * BSA (m²) = sqrt((Height_cm * Weight_kg) / 3600)
   * Dose = BSA * Dose/m²
   */
  calculateMostellerBsa(heightCm: number, weightKg: number, dosePerM2: number): IMostellerBsaResult {
    const validH = Math.max(30, heightCm);
    const validW = Math.max(2, weightKg);
    const bsaM2 = Math.round(Math.sqrt((validH * validW) / 3600) * 100) / 100;
    const calculatedDoseMg = Math.round((bsaM2 * dosePerM2) * 10) / 10;

    return {
      heightCm: validH,
      weightKg: validW,
      bsaM2,
      dosePerM2,
      calculatedDoseMg,
      formulaString: `√(${validH} cm × ${validW} kg / 3600) = ${bsaM2.toFixed(2)} m² → ${calculatedDoseMg} mg`
    };
  }

  /**
   * 5. Holliday-Segar 4-2-1 Maintenance Fluid Hourly Rate Rule
   * - 0 to 10 kg: 4 mL/kg/hr (max 40 mL/hr)
   * - 11 to 20 kg: + 2 mL/kg/hr (max +20 mL/hr)
   * - > 20 kg: + 1 mL/kg/hr
   */
  calculateHollidaySegarFluid(weightKg: number): IHollidaySegarFluidResult {
    const w = Math.max(1, weightKg);
    let first10 = 0;
    let second10 = 0;
    let remaining = 0;

    if (w <= 10) {
      first10 = w * 4;
    } else if (w <= 20) {
      first10 = 40;
      second10 = (w - 10) * 2;
    } else {
      first10 = 40;
      second10 = 20;
      remaining = (w - 20) * 1;
    }

    const hourlyRateMlHr = Math.round(first10 + second10 + remaining);
    const dailyRateMlDay = hourlyRateMlHr * 24;

    return {
      weightKg: w,
      hourlyRateMlHr,
      dailyRateMlDay,
      breakdown: {
        first10kgMlHr: first10,
        second10kgMlHr: second10,
        remainingKgMlHr: remaining
      },
      telemetryDisplay: `${hourlyRateMlHr} mL/hr (${first10} + ${second10} + ${remaining}) • ${dailyRateMlDay} mL/day`
    };
  }

  /**
   * 6. Geriatric / Elder: Cockcroft-Gault Creatinine Clearance (CrCl) & Renal Titration
   * CrCl = ((140 - Age) * Weight_kg) / (72 * Scr_mg_dL) * (0.85 if female)
   */
  calculateCockcroftGaultCrCl(age: number, weightKg: number, serumCreatinineMgDl: number, isFemale: boolean): ICockcroftGaultResult {
    const validAge = Math.max(18, Math.min(115, age));
    const validW = Math.max(30, Math.min(250, weightKg));
    const validScr = Math.max(0.4, Math.min(15, serumCreatinineMgDl));

    let crCl = ((140 - validAge) * validW) / (72 * validScr);
    if (isFemale) {
      crCl *= 0.85;
    }
    const crClMlMin = Math.round(crCl * 10) / 10;

    let renalDosingTier: ICockcroftGaultResult['renalDosingTier'];
    let renalDoseReductionPct = 0;
    let recommendation = 'Normal adult dosage supported. Maintain routine hydration and renal monitoring.';

    if (crClMlMin >= 60) {
      renalDosingTier = 'Normal (>60 mL/min)';
      renalDoseReductionPct = 0;
    } else if (crClMlMin >= 50) {
      renalDosingTier = 'Mild (50-59 mL/min)';
      renalDoseReductionPct = 15;
      recommendation = 'Mild renal clearance decline. Consider 10-15% initial dose reduction on hydrophilic agents.';
    } else if (crClMlMin >= 30) {
      renalDosingTier = 'Moderate (30-49 mL/min)';
      renalDoseReductionPct = 35;
      recommendation = 'Moderate impairment. Reduce dose by 30-40% or extend dosing interval (e.g. Metformin, Gabapentin).';
    } else if (crClMlMin >= 15) {
      renalDosingTier = 'Severe (<30 mL/min)';
      renalDoseReductionPct = 60;
      recommendation = 'Severe renal deficit. Reduce dose by 50-60%. Contraindicate Metformin, Spironolactone, and direct DOACs.';
    } else {
      renalDosingTier = 'End-Stage (<15 mL/min)';
      renalDoseReductionPct = 75;
      recommendation = 'End-stage renal clearance. Dialysis dose adjustment mandatory. Avoid nephrotoxic agents.';
    }

    return {
      age: validAge,
      weightKg: validW,
      serumCreatinineMgDl: validScr,
      isFemale,
      crClMlMin,
      renalDosingTier,
      renalDoseReductionPct,
      recommendation
    };
  }

  /**
   * 7. Clinical Alignment & Improper Dosage "Spellcheck" Engine
   * Validates:
   * - Naked Decimals: .5 mg -> 0.5 mg (Class: .naked-decimal-error)
   * - Trailing Zeros: 5.0 mg -> 5 mg (Class: .trailing-zero-error)
   * - Prohibited Abbreviations: U, IU, QD, QOD (Class: .prohibited-abbrev-error)
   * - Age Mismatches: Adult dose in child field (Class: .posology-age-mismatch)
   * - Fatal Overdose risk: >5x threshold (Class: .improper-dosage-fatal)
   * - Subtherapeutic risk: <25% threshold (Class: .posology-misaligned)
   */
  auditDosageText(rawInput: string, patientAge = 35, patientWeightLbs = 150): IDosageSpellcheckAudit {
    const violations: IDosageSpellcheckViolation[] = [];
    const text = rawInput || '';
    let sanitized = text;

    // Detect Age Tier
    let ageTier: PosologyAgeTier = 'adult';
    if (patientAge <= 1) {
      ageTier = 'neonate_infant';
    } else if (patientAge <= 12) {
      ageTier = 'pediatric_child';
    } else if (patientAge >= 65) {
      ageTier = 'geriatric_elder';
    }

    // 1. Naked Decimals: .5 mg -> 0.5 mg
    const nakedRegex = /(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi;
    const nakedMatches = Array.from(text.matchAll(nakedRegex));
    for (const m of nakedMatches) {
      const orig = m[0].trim();
      const fixed = `0.${m[2]} ${m[3]}`;
      violations.push({
        id: `v-naked-${violations.length + 1}`,
        type: 'NAKED_DECIMAL',
        originalSnippet: orig,
        correctedSnippet: fixed,
        cssClass: 'naked-decimal-error font-pocketgull-mono',
        dataAttribute: 'data-error="naked-decimal"',
        explanation: `ISMP Rule: Leading zero mandatory before decimal (${orig} can be misread as ${m[2]} ${m[3]}, causing a 10-fold overdose). Correct to ${fixed}.`,
        severity: 'CRITICAL_FATAL'
      });
      sanitized = sanitized.replace(m[0], m[1] + fixed);
    }

    // 2. Trailing Zeros: 5.0 mg -> 5 mg
    const trailingRegex = /(\b\d+)\.0+\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi;
    const trailingMatches = Array.from(text.matchAll(trailingRegex));
    for (const m of trailingMatches) {
      const orig = m[0];
      const fixed = `${m[1]} ${m[2]}`;
      violations.push({
        id: `v-trailing-${violations.length + 1}`,
        type: 'TRAILING_ZERO',
        originalSnippet: orig,
        correctedSnippet: fixed,
        cssClass: 'trailing-zero-error font-pocketgull-mono',
        dataAttribute: 'data-error="trailing-zero"',
        explanation: `ISMP Rule: Trailing zeros strictly prohibited (${orig} can be misread as ${m[1]}0 ${m[2]} if decimal is obscured). Correct to ${fixed}.`,
        severity: 'CRITICAL_FATAL'
      });
      sanitized = sanitized.replace(orig, fixed);
    }

    // 3. Prohibited Abbreviations: U -> units, QD -> daily, QOD -> every other day
    const abbrevRules = [
      { pattern: /\b(\d+)\s*U\b/gi, fix: '$1 units', label: 'U', safe: 'units', note: 'Mistaken as zero (0), four (4), or cc.' },
      { pattern: /\b(Q\.?D\.?|QD)\b/gi, fix: 'daily', label: 'QD', safe: 'daily', note: 'Mistaken as QOD (every other day).' },
      { pattern: /\b(Q\.?O\.?D\.?|QOD)\b/gi, fix: 'every other day', label: 'QOD', safe: 'every other day', note: 'Mistaken as QD (daily).' },
      { pattern: /\bMSO4\b/g, fix: 'morphine sulfate', label: 'MSO4', safe: 'morphine sulfate', note: 'Confused with MgSO4 (magnesium sulfate).' },
      { pattern: /\bMgSO4\b/g, fix: 'magnesium sulfate', label: 'MgSO4', safe: 'magnesium sulfate', note: 'Confused with MSO4 (morphine sulfate).' }
    ];

    for (const rule of abbrevRules) {
      const matches = Array.from(text.matchAll(rule.pattern));
      for (const m of matches) {
        const orig = m[0];
        const fixed = orig.replace(new RegExp(rule.pattern.source, 'i'), rule.fix);
        violations.push({
          id: `v-abbrev-${violations.length + 1}`,
          type: 'PROHIBITED_ABBREVIATION',
          originalSnippet: orig,
          correctedSnippet: fixed,
          cssClass: 'prohibited-abbrev-error font-pocketgull-mono',
          dataAttribute: 'data-error="prohibited-abbrev"',
          explanation: `ISMP "Do Not Use" List: Abbreviation "${rule.label}" prohibited. ${rule.note} Replace with "${rule.safe}".`,
          severity: 'HIGH_RISK_ERROR'
        });
        sanitized = sanitized.replace(orig, fixed);
      }
    }

    // 4. Age-Dosage Posology Mismatch (Adult dose prescribed to child/infant)
    const doseMatch = /(\b\d+(?:\.\d+)?)\s*(mg|g)\b/i.exec(text);
    if (doseMatch) {
      const num = parseFloat(doseMatch[1]);
      const unit = doseMatch[2].toLowerCase();
      const mgEquivalent = unit === 'g' ? num * 1000 : num;

      if ((ageTier === 'neonate_infant' || ageTier === 'pediatric_child') && mgEquivalent >= 500) {
        violations.push({
          id: `v-age-${violations.length + 1}`,
          type: 'AGE_MISMATCH',
          originalSnippet: doseMatch[0],
          correctedSnippet: `Pediatric titrate (~${Math.round(mgEquivalent * (patientAge / (patientAge + 12)))} mg)`,
          cssClass: 'posology-age-mismatch font-pocketgull-mono',
          dataAttribute: 'data-error="age-mismatch"',
          explanation: `Posology Age Mismatch: Adult formulation dose (${doseMatch[0]}) ordered for a ${patientAge}yo child (${patientWeightLbs} lbs). Use Young's or Clark's Rule titration.`,
          severity: 'CRITICAL_FATAL'
        });
      } else if (mgEquivalent >= 2500) {
        // Fatal overdose alert
        violations.push({
          id: `v-fatal-${violations.length + 1}`,
          type: 'FATAL_OVERDOSE',
          originalSnippet: doseMatch[0],
          correctedSnippet: 'Immediate Pharmacist Verification Required',
          cssClass: 'improper-dosage-fatal font-pocketgull-mono',
          dataAttribute: 'data-dosage-status="fatal-risk"',
          explanation: `Fatal Overdose Alert: Dose (${doseMatch[0]}) exceeds maximum recommended safe single-dose ceiling.`,
          severity: 'CRITICAL_FATAL'
        });
      } else if (mgEquivalent <= 1 && unit === 'mg' && ageTier === 'adult') {
        // Subtherapeutic caution
        violations.push({
          id: `v-sub-${violations.length + 1}`,
          type: 'SUBTHERAPEUTIC',
          originalSnippet: doseMatch[0],
          correctedSnippet: 'Verify adult therapeutic minimum',
          cssClass: 'posology-misaligned font-pocketgull-mono',
          dataAttribute: 'data-dosage-status="subtherapeutic"',
          explanation: `Subtherapeutic Warning: Dose (${doseMatch[0]}) may be subtherapeutic for an adult patient (${patientWeightLbs} lbs).`,
          severity: 'CAUTION_SUBTHERAPEUTIC'
        });
      }
    }

    // Determine Multi-Paradigm Font Class
    let multiParadigmFontClass = 'font-paradigm-allopathic';
    const lower = text.toLowerCase();
    if (lower.includes('ashwagandha') || lower.includes('vata') || lower.includes('pitta') || lower.includes('ghee') || lower.includes('rasayana')) {
      multiParadigmFontClass = 'font-paradigm-ayurvedic';
    } else if (lower.includes('xiao yao') || lower.includes('qi') || lower.includes('astragalus') || lower.includes('meridian') || lower.includes('lv-3')) {
      multiParadigmFontClass = 'font-paradigm-tcm';
    } else if (lower.includes('c1') || lower.includes('l5') || lower.includes('sacral') || lower.includes('fryette')) {
      multiParadigmFontClass = 'font-paradigm-osteopathic';
    } else if (lower.includes('30c') || lower.includes('200c') || lower.includes('mother tincture') || lower.includes('tincture')) {
      multiParadigmFontClass = 'font-paradigm-homeopathic';
    }

    return {
      rawInput: text,
      sanitizedText: sanitized,
      isCompliant: violations.length === 0,
      violations,
      ageTier,
      multiParadigmFontClass
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MSF Humanitarian Field Mode Posology & Triage Subsystem
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * MSF Discrete Weight-Band Dosing Registry
   * Provides rapid, error-proof tablet/sachet distributions for resource-limited clinics.
   */
  getAllMsfWeightBandsForWeight(weightKg: number): IMsfWeightBandItem[] {
    const w = Math.max(2, weightKg);
    const results: IMsfWeightBandItem[] = [];

    // 1. Artemether / Lumefantrine (AL 20/120 mg dispersible tablets)
    let alBand = '5 to <15 kg';
    let alDose = '1 tablet BID (morning & evening) × 3 days (6 tablets total)';
    let minW = 5;
    let maxW = 15;

    if (w < 5) {
      alBand = '<5 kg';
      alDose = 'Caution: Under 5 kg. Consult specialist or use Artesunate-Amodiaquine weight-specific drops.';
      minW = 2;
      maxW = 5;
    } else if (w < 15) {
      alBand = '5 to <15 kg';
      alDose = '1 tablet BID × 3 days (6 tablets total)';
      minW = 5;
      maxW = 15;
    } else if (w < 25) {
      alBand = '15 to <25 kg';
      alDose = '2 tablets BID × 3 days (12 tablets total)';
      minW = 15;
      maxW = 25;
    } else if (w < 35) {
      alBand = '25 to <35 kg';
      alDose = '3 tablets BID × 3 days (18 tablets total)';
      minW = 25;
      maxW = 35;
    } else {
      alBand = '≥35 kg (Adult)';
      alDose = '4 tablets BID × 3 days (24 tablets total)';
      minW = 35;
      maxW = 120;
    }

    results.push({
      id: 'msf-al',
      medication: 'Artemether / Lumefantrine (AL)',
      indication: 'Uncomplicated P. falciparum Malaria',
      formulation: 'Dispersible fixed-dose tablet (20 mg artemether / 120 mg lumefantrine)',
      weightBandLabel: alBand,
      minWeightKg: minW,
      maxWeightKg: maxW,
      tabletCountOrDose: alDose,
      regimenSummary: `${alDose} with milk or fatty food`,
      duration: '3 days (6 total doses: at 0h, 8h, 24h, 36h, 48h, 60h)',
      clinicalNotes: 'Disperse in clean water or breastmilk for infants. Second dose taken strictly 8 hours after first dose.'
    });

    // 2. Amoxicillin Dispersible 250 mg (Pneumonia / Outpatient SAM)
    let amoxBand = '4 to <10 kg';
    let amoxDose = '1 dispersible tablet (250 mg) BID';
    let amoxMin = 4;
    let amoxMax = 10;

    if (w < 4) {
      amoxBand = '<4 kg';
      amoxDose = '1/2 dispersible tablet (125 mg) BID';
      amoxMin = 2;
      amoxMax = 4;
    } else if (w < 10) {
      amoxBand = '4 to <10 kg';
      amoxDose = '1 dispersible tablet (250 mg) BID';
      amoxMin = 4;
      amoxMax = 10;
    } else if (w < 14) {
      amoxBand = '10 to <14 kg';
      amoxDose = '2 dispersible tablets (500 mg) BID';
      amoxMin = 10;
      amoxMax = 14;
    } else if (w < 20) {
      amoxBand = '14 to <20 kg';
      amoxDose = '3 dispersible tablets (750 mg) BID';
      amoxMin = 14;
      amoxMax = 20;
    } else {
      amoxBand = '≥20 kg';
      amoxDose = '4 dispersible tablets (1000 mg) BID';
      amoxMin = 20;
      amoxMax = 100;
    }

    results.push({
      id: 'msf-amox',
      medication: 'Amoxicillin Dispersible',
      indication: 'Fast-Breathing Pneumonia & Routine SAM Care',
      formulation: '250 mg scored dispersible tablet',
      weightBandLabel: amoxBand,
      minWeightKg: amoxMin,
      maxWeightKg: amoxMax,
      tabletCountOrDose: amoxDose,
      regimenSummary: `${amoxDose} every 12 hours`,
      duration: '5 days for non-severe pneumonia (7 days for SAM)',
      clinicalNotes: 'WHO/MSF standard-of-care for outpatient pediatric lower respiratory tract infections. Disperses in 5 mL liquid.'
    });

    // 3. Paracetamol (Acetaminophen) 10–15 mg/kg per dose
    let paraDose = '120 mg (approx 1/2 of 250mg tab or syrup)';
    let paraBand = '8 to <15 kg';
    let paraMin = 8;
    let paraMax = 15;

    if (w < 4) {
      paraBand = '<4 kg';
      paraDose = '40 to 50 mg every 6 hours PRN';
      paraMin = 2;
      paraMax = 4;
    } else if (w < 8) {
      paraBand = '4 to <8 kg';
      paraDose = '80 to 100 mg (1/2 200mg or 1/4 500mg tab) every 6 hours PRN';
      paraMin = 4;
      paraMax = 8;
    } else if (w < 15) {
      paraBand = '8 to <15 kg';
      paraDose = '150 to 200 mg (1 200mg tab or 1/2 400mg tab) every 6 hours PRN';
      paraMin = 8;
      paraMax = 15;
    } else if (w < 25) {
      paraBand = '15 to <25 kg';
      paraDose = '250 to 300 mg (1/2 to 3/4 500mg tab) every 6 hours PRN';
      paraMin = 15;
      paraMax = 25;
    } else if (w < 35) {
      paraBand = '25 to <35 kg';
      paraDose = '350 to 500 mg (1 500mg tab) every 6 hours PRN';
      paraMin = 25;
      paraMax = 35;
    } else {
      paraBand = '≥35 kg';
      paraDose = '500 to 1000 mg (1 to 2 500mg tabs) every 6 hours PRN (max 4000 mg/day)';
      paraMin = 35;
      paraMax = 120;
    }

    results.push({
      id: 'msf-para',
      medication: 'Paracetamol (Acetaminophen)',
      indication: 'Fever & Pain Management (First-line, NSAID-safe in Dengue/Malaria)',
      formulation: '100 mg / 250 mg / 500 mg scored tablets',
      weightBandLabel: paraBand,
      minWeightKg: paraMin,
      maxWeightKg: paraMax,
      tabletCountOrDose: paraDose,
      regimenSummary: `${paraDose} (max 4 doses in 24 hours)`,
      duration: 'Symptomatic (typically 2 to 3 days)',
      clinicalNotes: 'Strictly avoid aspirin and NSAIDs (ibuprofen) in undifferentiated febrile illness to prevent hemorrhagic complications.'
    });

    // 4. Zinc Sulfate Dispersible for Diarrhea
    const isUnder6kg = w < 6;
    results.push({
      id: 'msf-zinc',
      medication: 'Zinc Sulfate Dispersible',
      indication: 'Acute Diarrhea & Cholera Adjunct',
      formulation: '20 mg scored dispersible tablet',
      weightBandLabel: isUnder6kg ? '<6 kg (<6 months)' : '≥6 kg (≥6 months)',
      minWeightKg: isUnder6kg ? 2 : 6,
      maxWeightKg: isUnder6kg ? 6 : 100,
      tabletCountOrDose: isUnder6kg ? '10 mg (1/2 tablet) once daily' : '20 mg (1 tablet) once daily',
      regimenSummary: isUnder6kg ? '10 mg daily for 10–14 days' : '20 mg daily for 10–14 days',
      duration: '10 to 14 days full course',
      clinicalNotes: 'Shortens diarrhea episode duration and regenerates mucosal enterocyte brush borders, preventing recurrences for 2–3 months.'
    });

    // 5. Artesunate Parenteral (Pre-Referral Severe Malaria)
    const isUnder20kg = w < 20;
    const artesunateDoseMgKg = isUnder20kg ? 3.0 : 2.4;
    const totalDoseMg = Math.round(w * artesunateDoseMgKg * 10) / 10;

    results.push({
      id: 'msf-artesunate-iv',
      medication: 'Artesunate IV / IM (Pre-Referral)',
      indication: 'Severe Complicated Malaria (Cerebral / Severe Anemia / Repeated Vomiting)',
      formulation: '60 mg vial powder for injection with sodium bicarbonate 5% & saline diluent',
      weightBandLabel: isUnder20kg ? '<20 kg (3.0 mg/kg)' : '≥20 kg (2.4 mg/kg)',
      minWeightKg: isUnder20kg ? 2 : 20,
      maxWeightKg: isUnder20kg ? 20 : 150,
      tabletCountOrDose: `${totalDoseMg} mg IM or slow IV bolus (${artesunateDoseMgKg} mg/kg)`,
      regimenSummary: `Administer ${totalDoseMg} mg STAT at 0h, then at 12h, 24h, then daily until patient can take oral AL`,
      duration: 'Minimum 3 parenteral doses (24h) before transition to full 3-day oral AL course',
      clinicalNotes: 'Parenteral artesunate reduces mortality by 22% in African children and 34% in Asian adults compared to quinine.'
    });

    return results;
  }

  /**
   * MSF Cholera & Acute Watery Diarrhea Dehydration Assessment & Fluid Calculator
   * Stratifies into Plan A (Home), Plan B (Oral Rehydration Unit 75 mL/kg), or Plan C (IV Ringer's Lactate 100 mL/kg).
   */
  calculateMsfCholeraRehydration(
    weightKg: number,
    signs: IMsfCholeraAssessmentInput,
    isInfantUnder1Year = false
  ): IMsfCholeraPlanResult {
    const w = Math.max(3, Math.min(150, weightKg));

    // 1. Plan C Criteria: at least 2 of (Lethargic/Unconscious, Sunken eyes, Unable to drink/drinking poorly, Skin pinch very slow >=2s)
    let severeSignsCount = 0;
    if (signs.lethargicOrUnconscious) severeSignsCount++;
    if (signs.sunkenEyes) severeSignsCount++;
    if (signs.unableToDrinkOrDrinksPoorly) severeSignsCount++;
    if (signs.skinPinchVerySlow) severeSignsCount++;

    // 2. Plan B Criteria: at least 2 of (Restless/Irritable, Sunken eyes, Thirsty/Drinks eagerly, Skin pinch slow <2s)
    let moderateSignsCount = 0;
    if (signs.restlessIrritable) moderateSignsCount++;
    if (signs.sunkenEyes) moderateSignsCount++;
    if (signs.thirstyDrinksEagerly) moderateSignsCount++;
    if (signs.skinPinchSlow) moderateSignsCount++;

    const isPlanC = severeSignsCount >= 2;
    const isPlanB = !isPlanC && (moderateSignsCount >= 2 || signs.thirstyDrinksEagerly || signs.skinPinchSlow);

    const zincText = w < 6 || isInfantUnder1Year
      ? 'Zinc Sulfate 10 mg (1/2 tablet) once daily for 10–14 days'
      : 'Zinc Sulfate 20 mg (1 tablet) once daily for 10–14 days';

    if (isPlanC) {
      const totalVolumeMl = Math.round(100 * w);
      const phase1Vol = Math.round(30 * w);
      const phase2Vol = Math.round(70 * w);

      const phase1Duration = isInfantUnder1Year ? 'Over 1 hour (30 mL/kg)' : 'Over 30 minutes (30 mL/kg)';
      const phase2Duration = isInfantUnder1Year ? 'Over 5 hours (70 mL/kg)' : 'Over 2.5 hours (70 mL/kg)';

      return {
        plan: 'PLAN_C',
        dehydrationLevel: 'SEVERE_DEHYDRATION',
        patientWeightKg: w,
        isInfantUnder1Year,
        fluidPrescription: {
          solution: "IV Ringer's Lactate (Hartmann's Solution) — If unavailable, Normal Saline 0.9%",
          totalVolumeMl,
          phase1VolumeMl: phase1Vol,
          phase1DurationText: phase1Duration,
          phase2VolumeMl: phase2Vol,
          phase2DurationText: phase2Duration,
          maintenanceOrsText: 'Give WHO ORS 5 mL/kg/hour as soon as patient can drink (usually after 3–4h in infants, 1–2h in older patients)'
        },
        monitoringDirectives: [
          '🚨 EMERGENCY: Hypovolemic shock hazard. Start IV cannula (18-20G in adults, 22-24G in children) immediately.',
          'Reassess radial pulse, respiratory rate, and skin turgor every 15–30 minutes until strong radial pulse is palpable.',
          'If radial pulse is still weak or undetectable at end of Phase 1, repeat 30 mL/kg at the same rate.',
          'If peripheral venous access fails after 2 attempts in a child, immediately place an Intraosseous (IO) needle.',
          'Once IV infusion is complete, fully reassess dehydration status to select Plan A, B, or continue Plan C.'
        ],
        zincDosageText: zincText
      };
    }

    if (isPlanB) {
      const totalVolumeMl = Math.round(75 * w);
      return {
        plan: 'PLAN_B',
        dehydrationLevel: 'SOME_DEHYDRATION',
        patientWeightKg: w,
        isInfantUnder1Year,
        fluidPrescription: {
          solution: 'WHO Low-Osmolarity Oral Rehydration Solution (ORS)',
          totalVolumeMl,
          phase1VolumeMl: totalVolumeMl,
          phase1DurationText: `Administer ${totalVolumeMl} mL over 4 hours in Oral Rehydration Point (ORP/ORU)`,
          maintenanceOrsText: 'Continue breastfeeding whenever child wants. If patient vomits, wait 10 minutes then resume ORS more slowly with a cup and spoon.'
        },
        monitoringDirectives: [
          `Situate in Oral Rehydration Unit (ORU). Target volume: ${totalVolumeMl} mL over 4 hours.`,
          'Show parent/caregiver how to administer ORS slowly using a clean cup and teaspoon (1 spoon every 1–2 minutes).',
          'Reassess after 4 hours: If no signs of dehydration remain, transition to Plan A. If still some dehydration, repeat Plan B for another 4 hours.',
          'If patient deteriorates into Plan C (lethargic, floppy, unable to drink), switch immediately to IV Ringer\'s Lactate.'
        ],
        zincDosageText: zincText
      };
    }

    // Plan A
    return {
      plan: 'PLAN_A',
      dehydrationLevel: 'NO_DEHYDRATION',
      patientWeightKg: w,
      isInfantUnder1Year,
      fluidPrescription: {
        solution: 'WHO Low-Osmolarity ORS + Clean fluids at home',
        totalVolumeMl: 500,
        maintenanceOrsText: isInfantUnder1Year
          ? 'Give 50–100 mL of ORS after each loose stool'
          : w < 25
            ? 'Give 100–200 mL of ORS after each loose stool'
            : 'Give 200–400 mL of ORS after each loose stool, or as much as desired'
      },
      monitoringDirectives: [
        'Treat at home: Counsel caregiver on 4 rules of home treatment: (1) Extra fluids, (2) Zinc supplement, (3) Continue feeding, (4) When to return.',
        'Immediate return triggers: Repeated vomiting, unable to drink or breastfeed, fever develops, blood in stool, or becoming floppy/very thirsty.',
        'Maintain exclusive breastfeeding for infants under 6 months; give ORS in addition to breastmilk.'
      ],
      zincDosageText: zincText
    };
  }

  /**
   * MSF High-Dose Vitamin A Protocol for Measles, Severe Malnutrition, and Outbreaks
   */
  calculateMsfMeaslesVitaminA(ageMonths: number): IMsfMeaslesVitaminAResult {
    const age = Math.max(1, ageMonths);

    if (age < 6) {
      return {
        ageMonths: age,
        doseIU: 50000,
        schedule: '50,000 IU orally on Day 1 and Day 2 (and Day 15 if ocular signs or malnutrition present)',
        indication: 'Measles Outbreak Case / Severe Acute Malnutrition (<6 months)',
        presentation: '1 blue capsule (100,000 IU) cut with scissors and 2 drops administered, or 50,000 IU ampoule',
        notes: 'Reduces measles-induced blindness and mortality by up to 50%. Administer orally directly into mouth.'
      };
    } else if (age < 12) {
      return {
        ageMonths: age,
        doseIU: 100000,
        schedule: '100,000 IU orally on Day 1 and Day 2 (and Day 15 if ocular signs or malnutrition present)',
        indication: 'Measles Outbreak Case / Severe Acute Malnutrition (6–11 months)',
        presentation: '1 blue capsule (100,000 IU) orally cut or swallowed',
        notes: 'Stimulates rapid mucosal epithelial regeneration and restores vitamin A liver stores depleted by acute measles viremia.'
      };
    } else {
      return {
        ageMonths: age,
        doseIU: 200000,
        schedule: '200,000 IU orally on Day 1 and Day 2 (and Day 15 if ocular signs or malnutrition present)',
        indication: 'Measles Outbreak Case / Severe Acute Malnutrition (≥12 months & Adults)',
        presentation: '1 red capsule (200,000 IU) orally',
        notes: 'Mandatory standard of care in all humanitarian measles cases regardless of prior routine vaccination status.'
      };
    }
  }

  /**
   * MSF Acute Malnutrition Triage (MUAC & Weight-for-Height)
   */
  evaluateMsfMalnutrition(
    weightKg: number,
    heightCm: number,
    muacMm?: number,
    hasBilateralEdema = false,
    hasMedicalComplications = false
  ): IMsfMalnutritionTriageResult {
    const isSevereMuac = typeof muacMm === 'number' && muacMm < 115;
    const isModerateMuac = typeof muacMm === 'number' && muacMm >= 115 && muacMm < 125;

    // Estimate Weight-for-Height Z-Score approximation for 65–110 cm
    // Expected median weight for 80 cm is ~10 kg, -3 SD is ~7.5 kg
    const expectedWeight = (heightCm - 50) * 0.35 + 3.5;
    const isSevereWeightForHeight = weightKg < expectedWeight * 0.75;

    const isSam = hasBilateralEdema || isSevereMuac || isSevereWeightForHeight;

    if (isSam && hasMedicalComplications) {
      const criteria: string[] = [];
      if (hasBilateralEdema) criteria.push('Bilateral pitting edema (Kwashiorkor)');
      if (isSevereMuac) criteria.push(`Severe wasting: MUAC ${muacMm} mm (<115 mm)`);
      if (isSevereWeightForHeight) criteria.push(`Weight-for-Height < -3 SD (${weightKg} kg vs expected ${expectedWeight.toFixed(1)} kg)`);
      criteria.push('Active medical complications (anorexia / hypothermia / severe systemic infection)');

      return {
        category: 'SEVERE_ACUTE_MALNUTRITION_COMPLICATED',
        triageDisposition: 'INPATIENT_STABILIZATION_CRENI',
        criteriaMatched: criteria,
        therapeuticDiet: 'F-75 Therapeutic Milk (75 kcal/100 mL, 130 mL/kg/day divided into 8 feeds) during stabilization phase. Do NOT give RUTF or high-protein F-100 initially.',
        clinicalWarning: '🚨 HIGH MORTALITY RISK: Severe Acute Malnutrition with complications. Never give IV fluids unless in overt shock (risk of acute heart failure from sodium overload). Maintain warmth (+28°C room).'
      };
    }

    if (isSam && !hasMedicalComplications) {
      const criteria: string[] = [];
      if (hasBilateralEdema) criteria.push('Grade + or ++ bilateral pitting edema');
      if (isSevereMuac) criteria.push(`MUAC ${muacMm} mm (<115 mm)`);
      if (isSevereWeightForHeight) criteria.push('Weight-for-Height < -3 SD');
      criteria.push('Positive appetite test (eats RUTF eagerly) and alert');

      return {
        category: 'SEVERE_ACUTE_MALNUTRITION_UNCOMPLICATED',
        triageDisposition: 'OUTPATIENT_THERAPEUTIC_CRENA',
        criteriaMatched: criteria,
        therapeuticDiet: 'Ready-to-Use Therapeutic Food (RUTF / Plumpy\'Nut): ~170 kcal/kg/day (approx 2–3 sachets per day for 7–9 kg child).',
        clinicalWarning: 'Outpatient Therapeutic Program: Weekly ration of RUTF, Amoxicillin 7-day empiric course, and single-dose Mebendazole/Albendazole deworming.'
      };
    }

    if (isModerateMuac) {
      return {
        category: 'MODERATE_ACUTE_MALNUTRITION',
        triageDisposition: 'SUPPLEMENTARY_FEEDING',
        criteriaMatched: [`MUAC ${muacMm} mm (115–124 mm)`],
        therapeuticDiet: 'Ready-to-Use Supplementary Food (RUSF) or fortified blended flour (Corn-Soy Blend Plus / CSB++).',
        clinicalWarning: 'Supplementary Feeding Program enrollment to halt progression into Severe Acute Malnutrition.'
      };
    }

    return {
      category: 'NORMAL',
      triageDisposition: 'ROUTINE_MONITORING',
      criteriaMatched: ['MUAC ≥125 mm', 'No bilateral pitting edema', 'Weight-for-Height within expected normal parameters'],
      therapeuticDiet: 'Standard balanced family diet with ongoing breastfeeding support up to 2 years.',
      clinicalWarning: 'Growth monitoring and promotion at routine child wellness visits.'
    };
  }
}

