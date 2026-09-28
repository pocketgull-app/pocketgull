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

export class IsmpClinicalGuard {
  private readonly tallManMap = TALL_MAN_MAP;
  private readonly lasaPairs = CANONICAL_LASA_PAIRS;
  private readonly dangerousAbbreviations = DANGEROUS_ABBREVIATIONS;

  /**
   * Sanitizes a clinical dosage string according to ISMP & FDA standards:
   * 1. Strips trailing zeros (5.0 mg -> 5 mg)
   * 2. Prepends leading zero to naked decimals (.5 mg -> 0.5 mg)
   * 3. Replaces error-prone abbreviations with standardized terms
   * 4. Converts known look-alike/sound-alike drug names to FDA Tall Man Lettering
   */
  sanitizeClinicalDosage(text: string): string {
    if (!text) return '';
    let result = text;

    // 1. Strip trailing zeros: 5.0 mg -> 5 mg, 10.00 mL -> 10 mL
    result = result.replace(/(\b\d+)\.0+\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi, '$1 $2');

    // 2. Prepend leading zero to naked decimals: .5 mg -> 0.5 mg
    result = result.replace(/(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi, '$10.$2 $3');

    // 3. Replace dangerous abbreviations
    for (const abbrev of this.dangerousAbbreviations) {
      result = result.replace(abbrev.pattern, abbrev.replacement);
    }

    // 4. Apply Tall Man Lettering
    result = this.applyTallManLettering(result);

    return result.trim();
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
   * Performs an exhaustive ISMP safety audit against a clinical order or note,
   * detecting decimal errors, prohibited abbreviations, and look-alike/sound-alike drugs.
   */
  auditPrescription(text: string): IIsmpSafetyAudit {
    const originalText = text || '';
    const violations: IIsmpViolation[] = [];
    const tallManApplied: string[] = [];

    // Check Trailing Zeros: 5.0 mg, 10.00 mL
    const trailingZeroRegex = /(\b\d+)\.0+\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = trailingZeroRegex.exec(originalText)) !== null) {
      violations.push({
        type: 'TRAILING_ZERO',
        original: match[0],
        corrected: `${match[1]} ${match[2]}`,
        rule: 'ISMP Rule: Trailing zeros prohibited (e.g., 5.0 mg mistaken as 50 mg)',
        severity: 'CRITICAL_SAFETY_DEFECT'
      });
    }

    // Check Naked Decimals: .5 mg -> 0.5 mg
    const nakedDecimalRegex = /(^|[^\d.])\.(\d+)\s*(mg|mcg|g|mL|units?|mEq|IU)\b/gi;
    while ((match = nakedDecimalRegex.exec(originalText)) !== null) {
      violations.push({
        type: 'NAKED_DECIMAL',
        original: match[0].trim(),
        corrected: `0.${match[2]} ${match[3]}`,
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
      const wordRegex = new RegExp(`\\b${lower}\\b`, 'gi');
      if (wordRegex.test(originalText)) {
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
            original: lower,
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
