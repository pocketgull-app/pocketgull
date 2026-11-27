// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import {
  IIsmpSafetyAudit,
  IIsmpViolation,
  ILasaDrugPair,
  ILasaTrainingCard
} from './types.js';
import { TALL_MAN_MAP } from './tall-man-map.js';
import { CANONICAL_LASA_PAIRS } from './lasa-catalog.js';
import { DANGEROUS_ABBREVIATIONS } from './abbreviations.js';

function stripTrailingDecimalZeros(numStr: string): string {
  let cleaned = numStr;
  while (cleaned.endsWith('0')) {
    cleaned = cleaned.slice(0, -1);
  }
  if (cleaned.endsWith('.')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

export class IsmpClinicalGuard {
  private readonly tallManMap = TALL_MAN_MAP;
  private readonly lasaPairs = CANONICAL_LASA_PAIRS;
  private readonly dangerousAbbreviations = DANGEROUS_ABBREVIATIONS;

  /**
   * Sanitizes a clinical dosage string according to ISMP & FDA standards:
   * 1. Strips integer and fractional trailing zeros (5.0 mg -> 5 mg, 5.50 mg -> 5.5 mg, 0.250 mL -> 0.25 mL)
   * 2. Prepends leading zero to naked decimals (.5 mg -> 0.5 mg, -.5 mg -> -0.5 mg)
   * 3. Replaces error-prone abbreviations (U, IU, QD, QOD, QHS, HS, cc, MSO4, MgSO4, ug/µg, TIW, D/C, SQ) with standardized terms
   * 4. Converts known look-alike/sound-alike drug names to FDA Tall Man Lettering
   */
  sanitizeClinicalDosage(text: string): string {
    if (!text) return '';
    let result = text;

    // 1. Strip integer & fractional trailing zeros in O(N) linear time: 5.0 mg -> 5 mg, 5.50 mg -> 5.5 mg, 0.250 mL -> 0.25 mL
    result = result.replace(/(\b\d+\.\d+)\s*(mg|mcg|g|mL|units?|mEq|IU|cc)\b/gi, (full, numStr: string, unit: string) => {
      return numStr.endsWith('0') ? `${stripTrailingDecimalZeros(numStr)} ${unit}` : full;
    });

    // 2. Prepend leading zero to naked decimals: .5 mg -> 0.5 mg, -.5 mg -> -0.5 mg
    result = result.replace(/(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU|cc)\b/gi, '$10.$2 $3');

    // 3. Replace dangerous abbreviations
    for (const abbrev of this.dangerousAbbreviations) {
      result = result.replace(abbrev.pattern, abbrev.replacement);
    }

    // 4. Apply Tall Man Lettering
    result = this.applyTallManLettering(result);

    return result.trim();
  }

  /**
   * Formats a numeric calculation or laboratory value according to strict ISMP posology rules:
   * 1. Mandatory leading zero: values between -1 and 1 (non-zero) strictly include '0.' (e.g. 0.5, -0.25, never .5 or -.5)
   * 2. Absolute prohibition of trailing zeros: whole numbers or numbers ending in '.0' have trailing zeros stripped (e.g. 5, not 5.0)
   * 3. Max significant decimals without trailing zeros (e.g. 1.2500 -> 1.25)
   * 4. Optional metric unit standardization (e.g. 'mL' capitalized, 'mcg' instead of 'ug')
   */
  formatIsmpNumber(value: number | string, unit?: string, maxDecimals: number = 3): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : parseFloat(value.toString().trim());
    if (isNaN(num)) return typeof value === 'string' ? value : '';

    const factor = Math.pow(10, maxDecimals);
    const roundedMagnitude = Math.round((Math.abs(num) + Number.EPSILON) * factor) / factor;
    const rounded = roundedMagnitude === 0 ? 0 : (num < 0 ? -roundedMagnitude : roundedMagnitude);

    let numStr = rounded.toString();

    if (numStr.startsWith('.')) {
      numStr = '0' + numStr;
    } else if (numStr.startsWith('-.')) {
      numStr = '-0.' + numStr.substring(2);
    }

    if (numStr.includes('.')) {
      numStr = stripTrailingDecimalZeros(numStr);
    }

    if (!unit) return numStr;

    let cleanUnit = unit.trim();
    if (/^(ml|milliliters?)$/i.test(cleanUnit)) cleanUnit = 'mL';
    if (/^(ug|µg|micrograms?)$/i.test(cleanUnit)) cleanUnit = 'mcg';
    if (/^(mg|milligrams?)$/i.test(cleanUnit)) cleanUnit = 'mg';
    if (/^(g|grams?)$/i.test(cleanUnit)) cleanUnit = 'g';

    return `${numStr} ${cleanUnit}`;
  }

  /**
   * Formats a mathematical or pharmacokinetic formula string to adhere to ISMP standards:
   * 1. Replaces naked decimals with mandatory leading zero (.5 -> 0.5, -.5 -> -0.5)
   * 2. Strips trailing zeros from integers (5.0 -> 5)
   * 3. Slashes mathematical zero subscripts (C_0 -> C_{0̸}, k_0 -> k_{0̸}) to disambiguate from O, \theta, \emptyset
   */
  formatIsmpMathFormula(formula: string): string {
    if (!formula) return '';
    let result = formula;

    // 1. Mandatory leading zero for naked decimals in math (e.g., .5 or -.5 or = .5)
    result = result.replace(/(^|[^0-9.])(\.\d+)/g, '$10$2');

    // 2. Strip trailing zero for integers in math expressions (e.g., 5.0 -> 5, 10.00 -> 10)
    result = result.replace(/(\b\d+)\.0+(?!\d)/g, '$1');

    // 3. Slashed zero disambiguation for pharmacokinetics subscripts (C_0 -> C_{0̸}, k_0 -> k_{0̸})
    result = result.replace(/\b([CA-Za-z])_0\b/g, '$1_{0̸}');
    result = result.replace(/\b([CA-Za-z])_\{0\}\b/g, '$1_{0̸}');

    return result;
  }

  /**
   * Formats a drug name using official FDA/ISMP Tall Man casing if present in catalog.
   */
  formatTallMan(drugName: string): string {
    if (!drugName) return '';
    const clean = drugName.trim().toLowerCase();
    return this.tallManMap.get(clean) || drugName;
  }

  /**
   * Finds the canonical LASA drug pair profile for a given medication name.
   */
  getLasaPair(drugName: string): ILasaDrugPair | undefined {
    if (!drugName) return undefined;
    const clean = drugName.trim().toLowerCase();
    return this.lasaPairs.find(
      p => p.drugA.name.toLowerCase() === clean || p.drugB.name.toLowerCase() === clean
    );
  }

  /**
   * Returns all canonical LASA drug pairs.
   */
  getAllLasaPairs(): ReadonlyArray<ILasaDrugPair> {
    return this.lasaPairs;
  }

  /**
   * Generates interactive clinical training flashcards for educational drills.
   */
  getLasaTrainingDeck(): ILasaTrainingCard[] {
    return this.lasaPairs.map(pair => ({
      id: pair.id,
      category: pair.category,
      promptScenario: `A clinician inputs an order for "${pair.drugA.name}". How must this order be optically formatted, and what confusable medication must be guarded against?`,
      prescribedDrug: pair.drugA.name,
      confusableDrug: pair.drugB.name,
      tallManA: pair.drugA.tallMan,
      tallManB: pair.drugB.tallMan,
      indicationA: pair.drugA.indication,
      indicationB: pair.drugB.indication,
      clinicalTrapExplanation: pair.confusionMechanism,
      criticalSafetyWarning: pair.fatalRiskSummary
    }));
  }

  /**
   * Alias for auditPrescription for ergonomic clinical usage.
   */
  auditSafety(text: string): IIsmpSafetyAudit {
    return this.auditPrescription(text);
  }

  /**
   * Performs an exhaustive ISMP safety audit against a clinical order or note,
   * detecting decimal errors, prohibited abbreviations, and look-alike/sound-alike drugs.
   */
  auditPrescription(text: string): IIsmpSafetyAudit {
    const originalText = text || '';
    const violations: IIsmpViolation[] = [];
    const tallManApplied: string[] = [];

    // Check Trailing Zeros (both integer and fractional) in O(N) linear time: 5.0 mg, 10.00 mL, 5.50 mg, 0.250 mL
    const trailingZeroRegex = /(\b\d+\.\d+)\s*(mg|mcg|g|mL|units?|mEq|IU|cc)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = trailingZeroRegex.exec(originalText)) !== null) {
      if (match[1].endsWith('0')) {
        const cleanedNum = stripTrailingDecimalZeros(match[1]);
        const isFractional = cleanedNum.includes('.');
        violations.push({
          type: 'TRAILING_ZERO',
          original: match[0],
          corrected: `${cleanedNum} ${match[2]}`,
          rule: isFractional
            ? 'ISMP Rule: Fractional trailing zeros prohibited (e.g., 5.50 mg -> 5.5 mg)'
            : 'ISMP Rule: Trailing zeros prohibited (e.g., 5.0 mg mistaken as 50 mg)',
          severity: 'CRITICAL_SAFETY_DEFECT'
        });
      }
    }

    // Check Naked Decimals: .5 mg -> 0.5 mg, -.5 mg -> -0.5 mg
    const nakedDecimalRegex = /(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU|cc)\b/gi;
    while ((match = nakedDecimalRegex.exec(originalText)) !== null) {
      const signPrefix = match[1] === '-' ? '-' : '';
      violations.push({
        type: 'NAKED_DECIMAL',
        original: match[0].trim(),
        corrected: `${signPrefix}0.${match[2]} ${match[3]}`,
        rule: 'ISMP Rule: Leading zero mandatory before decimal point (e.g., .5 mg mistaken as 5 mg)',
        severity: 'CRITICAL_SAFETY_DEFECT'
      });
    }

    // Check Error-Prone Abbreviations
    for (const abbrev of this.dangerousAbbreviations) {
      const abbrevRegex = new RegExp(abbrev.pattern.source, abbrev.pattern.flags);
      while ((match = abbrevRegex.exec(originalText)) !== null) {
        violations.push({
          type: 'ERROR_PRONE_ABBREVIATION',
          original: match[0],
          corrected: match[0].replace(abbrev.pattern, abbrev.replacement),
          rule: `ISMP Do Not Use List: ${abbrev.description}`,
          severity: 'HIGH_RISK_WARNING'
        });
      }
    }

    // Check LASA Look-Alike / Sound-Alike Pairs & Apply Tall Man
    const sanitizedText = this.sanitizeClinicalDosage(originalText);
    for (const [lower, tall] of this.tallManMap.entries()) {
      const wordRegex = new RegExp(`\\b${lower}\\b`, 'i');
      const lasaMatch = wordRegex.exec(originalText);
      if (lasaMatch) {
        if (!tallManApplied.includes(tall)) {
          tallManApplied.push(tall);
        }

        const pair = this.getLasaPair(lower);
        if (pair) {
          const isA = pair.drugA.name.toLowerCase() === lower;
          const currentProfile = isA ? pair.drugA : pair.drugB;
          const otherProfile = isA ? pair.drugB : pair.drugA;
          const warningClause = currentProfile.boxedWarning ? ` [BOXED WARNING: ${currentProfile.boxedWarning}]` : '';

          violations.push({
            type: 'LOOK_ALIKE_SOUND_ALIKE',
            original: lasaMatch[0],
            corrected: tall,
            rule: `FDA/ISMP LASA Guard: Confusable with ${otherProfile.tallMan}`,
            severity: pair.category === 'ONCOLOGY' || pair.category === 'ANALGESIC'
              ? 'CRITICAL_SAFETY_DEFECT'
              : 'HIGH_RISK_WARNING',
            lasaPair: pair,
            confusableWith: otherProfile.tallMan,
            clinicalDisambiguation: `Prescribed: ${currentProfile.tallMan} (${currentProfile.pharmacologicalClass} — ${currentProfile.indication}) vs Confusable: ${otherProfile.tallMan} (${otherProfile.pharmacologicalClass} — ${otherProfile.indication}).${warningClause} ${pair.fatalRiskSummary}`
          });
        }
      }
    }

    return {
      originalText,
      sanitizedText,
      hasViolations: violations.length > 0,
      violations,
      violationsCount: violations.length,
      tallManApplied,
      isSafe: violations.length === 0
    };
  }

  /**
   * Internal helper to scan and replace words with Tall Man equivalents
   */
  private applyTallManLettering(text: string): string {
    let output = text;
    for (const [lower, tall] of this.tallManMap.entries()) {
      const regex = new RegExp(`\\b${lower}\\b`, 'gi');
      output = output.replace(regex, tall);
    }
    return output;
  }
}

/**
 * Singleton instance helper for zero-overhead imports
 */
export const ismpGuard = new IsmpClinicalGuard();
