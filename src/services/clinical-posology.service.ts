import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IsmpSafetyGuardService } from './ismp-safety-guard.service';

export type PosologyAgeTier = 'neonate_infant' | 'pediatric_child' | 'adult' | 'geriatric_elder' | 'environmental_heat';

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
}
