/**
 * @pocketgull/open-scribe
 * ISMP / FDA High-Risk Medication Safety Guard.
 * Enforces Institute for Safe Medication Practices (ISMP) zero-tolerance rules for clinical dosage expressions.
 */

import { IIsmpSafetyViolation, IIsmpAuditResult } from './types';

export class IsmpSafetyGuard {
  /**
   * Prohibited dangerous clinical abbreviations that lead to 10-fold or fatal dosage errors.
   */
  private static readonly DANGEROUS_ABBREVIATIONS: Array<{ regex: RegExp; replacement: string; desc: string }> = [
    {
      regex: /\bU\b/gi,
      replacement: 'units',
      desc: 'Abbreviation "U" easily mistaken for "0" or "4", resulting in 10-fold overdose. Write "units".'
    },
    {
      regex: /\bIU\b/gi,
      replacement: 'international units',
      desc: 'Abbreviation "IU" mistaken for "IV" (intravenous). Write "international units".'
    },
    {
      regex: /\bQ\.?D\.?\b/gi,
      replacement: 'daily',
      desc: 'Abbreviation "Q.D." mistaken for "Q.I.D." (4 times daily). Write "daily".'
    },
    {
      regex: /\bQ\.?O\.?D\.?\b/gi,
      replacement: 'every other day',
      desc: 'Abbreviation "Q.O.D." mistaken for "Q.D." (daily). Write "every other day".'
    },
    {
      regex: /\bMS\b/g,
      replacement: 'morphine sulfate',
      desc: 'Abbreviation "MS" can mean morphine sulfate or magnesium sulfate. Write full drug name.'
    },
    {
      regex: /\bMgSO4\b/gi,
      replacement: 'magnesium sulfate',
      desc: 'Chemical formula "MgSO4" mistaken for "MSO4" (morphine sulfate). Write full drug name.'
    }
  ];

  /**
   * Audits clinical text against ISMP safety rules and returns detected violations.
   */
  public static audit(text: string): IIsmpAuditResult {
    if (!text) {
      return { isSafe: true, violations: [], sanitizedText: '' };
    }

    const violations: IIsmpSafetyViolation[] = [];
    let sanitized = text;

    // 1. Check Trailing Zeroes (e.g. "5.0 mg" or "10.00 mL") -> High risk of 10x overdose if decimal is missed
    const trailingZeroRegex = /\b(\d+)\.0+(\s*(?:mg|mcg|g|ml|mL|units|meq|mEq))\b/g;
    let match: RegExpExecArray | null;

    while ((match = trailingZeroRegex.exec(text)) !== null) {
      const fullMatch = match[0];
      const wholeNumber = match[1];
      const unit = match[2];
      const correction = `${wholeNumber}${unit}`;

      violations.push({
        originalText: fullMatch,
        suggestedCorrection: correction,
        ruleCode: 'TRAILING_ZERO',
        description: `Trailing zero in "${fullMatch}" creates fatal 10-fold misinterpretation risk if decimal point is faint or obscured. Express as "${correction}".`,
        severity: 'HIGH'
      });
    }
    sanitized = sanitized.replace(trailingZeroRegex, '$1$2');

    // 2. Check Naked Decimals (e.g. ".5 mg" or ".25 mL") -> High risk of 10x overdose if leading decimal is missed
    const nakedDecimalRegex = /(^|\s)\.(\d+)(\s*(?:mg|mcg|g|ml|mL|units|meq|mEq))\b/g;
    while ((match = nakedDecimalRegex.exec(text)) !== null) {
      const fullMatch = match[0].trim();
      const decimalDigits = match[2];
      const unit = match[3];
      const correction = `0.${decimalDigits}${unit}`;

      violations.push({
        originalText: fullMatch,
        suggestedCorrection: correction,
        ruleCode: 'NAKED_DECIMAL',
        description: `Naked decimal in "${fullMatch}" must always include leading zero ("${correction}") to prevent tenfold dosage overdose.`,
        severity: 'HIGH'
      });
    }
    sanitized = sanitized.replace(nakedDecimalRegex, '$10.$2$3');

    // 3. Check Prohibited Abbreviations
    for (const item of this.DANGEROUS_ABBREVIATIONS) {
      if (item.regex.test(text)) {
        violations.push({
          originalText: item.regex.source,
          suggestedCorrection: item.replacement,
          ruleCode: 'PROHIBITED_ABBREVIATION',
          description: item.desc,
          severity: 'MEDIUM'
        });
        sanitized = sanitized.replace(item.regex, item.replacement);
      }
    }

    return {
      isSafe: violations.length === 0,
      violations,
      sanitizedText: sanitized
    };
  }

  /**
   * Sanitizes medication dosage expressions into strict ISMP-compliant format.
   */
  public static sanitize(text: string): string {
    return this.audit(text).sanitizedText;
  }
}
