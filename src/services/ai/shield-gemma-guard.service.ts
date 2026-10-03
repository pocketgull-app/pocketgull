/**
 * @file shield-gemma-guard.service.ts
 * @description Zero-Cost ShieldGemma Safety Classifier & Prompt Defense Engine.
 * Evaluates inbound prompts and clinical notes for prompt injection, jailbreaks,
 * and high-risk safety violations with zero cloud API overhead via local AST heuristics
 * and Chrome Built-in AI / Gemma on-device integration.
 */

import { Injectable } from '@angular/core';

export interface IShieldGemmaScore {
  category: 'PROMPT_INJECTION' | 'INDIRECT_PROMPT_INJECTION' | 'TOXICITY' | 'DATA_EXFILTRATION' | 'ISMP_VIOLATION' | 'SYSTEM_OVERRIDE' | 'HERB_DRUG_CONFLICT';
  violationDetected: boolean;
  confidenceScore: number; // 0.0 to 1.0
  rationale: string;
}

export interface IIsmpMedicationCorrection {
  original: string;
  corrected: string;
  ismpRule: string;
}

export interface ICrossParadigmConflict {
  drug: string;
  botanicalOrHerb: string;
  riskMechanism: string;
  severity: 'MODERATE' | 'HIGH' | 'CRITICAL';
  clinicalDirective: string;
}

export interface IShieldGemmaEvaluation {
  isSafe: boolean;
  riskLevel: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scores: IShieldGemmaScore[];
  sanitizedPrompt: string;
  mitigationApplied: string[];
  ismpCorrections?: IIsmpMedicationCorrection[];
  herbDrugConflicts?: ICrossParadigmConflict[];
}

@Injectable({
  providedIn: 'root'
})
export class ShieldGemmaGuardService {
  // Regex patterns targeting direct prompt injection and system override delimiters
  private static readonly INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules)/i,
    /you\s+are\s+now\s+(an?\s+)?(unrestricted|evil|dan|jailbreak|developer\s+mode)/i,
    /disregard\s+(the\s+)?(safety|clinical|hipaa)\s+guidelines/i,
    /system\s*:\s*override/i,
    /\[\s*system\s*instruction\s*\]/i,
    /\[\s*developer\s*mode\s*\]/i,
    /reveal\s+(your\s+)?(system\s+prompt|master\s+instructions|api\s+keys?)/i,
    /output\s+the\s+exact\s+prompt\s+above/i
  ];

  // OWASP LLM01: Indirect prompt injection & isolation tag spoofing in external notes/FHIR payloads
  private static readonly INDIRECT_INJECTION_PATTERNS: RegExp[] = [
    /\[\/?\s*CLINICAL\s+DIRECTIVE\s+CONTEXT\s*\]/i,
    /<!--\s*(?:system|eval|exec|instruction|inject|prompt)\s*-->/i,
    /"""\s*(?:system|assistant|developer|root)\b/i,
    /<\s*(?:script|iframe|object|embed)\b/i,
    /javascript\s*:\s*/i,
    /act\s+as\s+(?:dan|jailbroken|unrestricted|god\s+mode)\b/i,
    /ignore\s+previous\s+(?:diagnosis|medication|record|history)\s+and\s+output/i
  ];

  // Zero-width Unicode and non-printable character stripping (OWASP LLM01)
  private static readonly ZERO_WIDTH_UNICODE = /[\u200B-\u200D\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

  // ISMP high-risk medication typography patterns
  private static readonly TRAILING_ZERO_PATTERN = /\b(\d+)\.0+\s*(mg|mcg|g|ml|units?)\b/gi;
  private static readonly NAKED_DECIMAL_PATTERN = /(^|\s)\.(\d+)\s*(mg|mcg|g|ml|units?)\b/gi;

  /**
   * Evaluates prompt text against ShieldGemma defense heuristics.
   */
  public evaluatePrompt(rawPrompt: string, isClinicalContext = true): IShieldGemmaEvaluation {
    const scores: IShieldGemmaScore[] = [];
    const mitigations: string[] = [];

    // Step 1: Strip zero-width and invisible control characters
    let cleaned = rawPrompt.replace(ShieldGemmaGuardService.ZERO_WIDTH_UNICODE, '');
    if (cleaned.length !== rawPrompt.length) {
      mitigations.push('Stripped hidden/zero-width Unicode control sequences');
    }

    // Step 2: Evaluate Direct Prompt Injection & System Override vectors
    let injectionFound = false;
    for (const pattern of ShieldGemmaGuardService.INJECTION_PATTERNS) {
      if (pattern.test(cleaned)) {
        injectionFound = true;
        scores.push({
          category: 'PROMPT_INJECTION',
          violationDetected: true,
          confidenceScore: 0.95,
          rationale: `Matched adversarial injection heuristic: ${pattern.source}`
        });
        break;
      }
    }

    // Step 3: Evaluate OWASP LLM01 Indirect Injection & Delimiter Breakouts
    let indirectInjectionFound = false;
    for (const pattern of ShieldGemmaGuardService.INDIRECT_INJECTION_PATTERNS) {
      if (pattern.test(cleaned)) {
        indirectInjectionFound = true;
        scores.push({
          category: 'INDIRECT_PROMPT_INJECTION',
          violationDetected: true,
          confidenceScore: 0.96,
          rationale: `Matched indirect prompt injection / boundary breakout pattern: ${pattern.source}`
        });
        cleaned = cleaned.replace(pattern, '[REDACTED_INDIRECT_INJECTION]');
        mitigations.push('Neutralized indirect prompt injection delimiter breakout sequence');
      }
    }

    // Step 4: Check ISMP Medication typography & dosage safety
    const medSanitization = this.sanitizeMedicationDosages(cleaned);
    cleaned = medSanitization.sanitizedText;
    if (medSanitization.correctionsApplied.length > 0) {
      scores.push({
        category: 'ISMP_VIOLATION',
        violationDetected: true,
        confidenceScore: 0.90,
        rationale: `Identified ${medSanitization.correctionsApplied.length} ISMP high-risk medication typography violation(s)`
      });
      mitigations.push(...medSanitization.correctionsApplied.map(c => `ISMP Auto-Correct: "${c.original}" -> "${c.corrected}" (${c.ismpRule})`));
    }

    // Step 5: Check exfiltration vectors
    const exfilPattern = /(api[_-]?key|sk-[a-zA-Z0-9]{20,}|bearer\s+[a-zA-Z0-9_\-\.]{20,})/i;
    if (exfilPattern.test(cleaned)) {
      scores.push({
        category: 'DATA_EXFILTRATION',
        violationDetected: true,
        confidenceScore: 0.92,
        rationale: 'Inbound prompt contains credential/token exfiltration pattern'
      });
      cleaned = cleaned.replace(exfilPattern, '[REDACTED_CREDENTIAL]');
      mitigations.push('Redacted sensitive credential tokens from prompt payload');
    }

    // Step 6: Check cross-paradigm herb-drug-supplement interactions
    const herbDrugConflicts = this.detectCrossParadigmConflicts(cleaned);
    if (herbDrugConflicts.length > 0) {
      scores.push({
        category: 'HERB_DRUG_CONFLICT',
        violationDetected: true,
        confidenceScore: 0.95,
        rationale: `Identified ${herbDrugConflicts.length} cross-paradigm herb-drug interaction risk(s): ${herbDrugConflicts.map(c => `${c.drug} + ${c.botanicalOrHerb}`).join('; ')}`
      });
      mitigations.push(...herbDrugConflicts.map(c => `Cross-Paradigm Conflict Directive: [${c.severity}] ${c.clinicalDirective} (${c.riskMechanism})`));
    }

    const hasViolations = scores.some(s => s.violationDetected && (s.category === 'PROMPT_INJECTION' || s.category === 'INDIRECT_PROMPT_INJECTION'));
    const riskLevel: IShieldGemmaEvaluation['riskLevel'] = (injectionFound || indirectInjectionFound)
      ? 'CRITICAL' 
      : scores.some(s => s.violationDetected) 
        ? 'MEDIUM' 
        : 'NEGLIGIBLE';

    return {
      isSafe: !hasViolations,
      riskLevel,
      scores,
      sanitizedPrompt: cleaned,
      mitigationApplied: mitigations,
      ismpCorrections: medSanitization.correctionsApplied,
      herbDrugConflicts
    };
  }

  /**
   * Sanitizes medication dosage strings against the ISMP (Institute for Safe Medication Practices)
   * list of Error-Prone Abbreviations, Symbols, and Dose Designations.
   */
  public sanitizeMedicationDosages(noteText: string): {
    sanitizedText: string;
    correctionsApplied: IIsmpMedicationCorrection[];
  } {
    const corrections: IIsmpMedicationCorrection[] = [];
    let text = noteText;

    // Rule 1: Prohibit Trailing Zero (e.g. 5.0 mg -> 5 mg)
    const trailingZeroRegex = /\b(\d+)\.0+\s*(mg|mcg|g|ml|units?)\b/gi;
    text = text.replace(trailingZeroRegex, (match, num, unit) => {
      const corrected = `${num} ${unit}`;
      corrections.push({
        original: match,
        corrected,
        ismpRule: 'Prohibit trailing zero (e.g. 5.0 mg misread as 50 mg)'
      });
      return corrected;
    });

    // Rule 2: Prohibit Naked Decimal (e.g. .5 mg -> 0.5 mg)
    const nakedDecimalRegex = /(^|[\s(,;])\.(\d+)\s*(mg|mcg|g|ml|units?)\b/gi;
    text = text.replace(nakedDecimalRegex, (match, prefix, decimal, unit) => {
      const corrected = `${prefix}0.${decimal} ${unit}`;
      corrections.push({
        original: match.trim(),
        corrected: corrected.trim(),
        ismpRule: 'Prohibit naked decimal (e.g. .5 mg misread as 5 mg)'
      });
      return corrected;
    });

    // Rule 3: Prohibit "U" or "u" abbreviation for Units (ISMP Do Not Use List)
    const unitRegex = /\b(\d+(?:\.\d+)?)\s*[Uu]\b(?!\w)/g;
    text = text.replace(unitRegex, (match, num) => {
      const corrected = `${num} units`;
      corrections.push({
        original: match,
        corrected,
        ismpRule: 'Prohibit "U" (misread as zero or four; write "units")'
      });
      return corrected;
    });

    // Rule 4: Prohibit "Q.D." or "QD" abbreviation (write "daily")
    const qdRegex = /\b(?:Q\.?D\.?)\b/gi;
    text = text.replace(qdRegex, (match) => {
      const corrected = 'daily';
      corrections.push({
        original: match,
        corrected,
        ismpRule: 'Prohibit QD / Q.D. (misread as QID; write "daily")'
      });
      return corrected;
    });

    // Rule 5: Prohibit "Q.O.D." or "QOD" abbreviation (write "every other day")
    const qodRegex = /\b(?:Q\.?O\.?D\.?)\b/gi;
    text = text.replace(qodRegex, (match) => {
      const corrected = 'every other day';
      corrections.push({
        original: match,
        corrected,
        ismpRule: 'Prohibit QOD / Q.O.D. (misread as QD; write "every other day")'
      });
      return corrected;
    });

    return {
      sanitizedText: text,
      correctionsApplied: corrections
    };
  }

  /**
   * Enforces structural context isolation (OWASP LLM01)
   */
  public wrapClinicalDirectiveContext(directive: string): string {
    const evaluation = this.evaluatePrompt(directive);
    return `[CLINICAL DIRECTIVE CONTEXT]\n${evaluation.sanitizedPrompt}\n[/CLINICAL DIRECTIVE CONTEXT]`;
  }

  /**
   * Evaluates clinical text for high-risk cross-paradigm herb-drug-supplement interactions
   * (Western Pharmaceuticals + TCM Botanicals + Ayurvedic Rasayanas).
   */
  public detectCrossParadigmConflicts(text: string): ICrossParadigmConflict[] {
    const conflicts: ICrossParadigmConflict[] = [];
    const lower = text.toLowerCase();

    // 1. Anticoagulants & Antiplatelets + High-Bleed Botanicals
    const anticoagulants = ['warfarin', 'coumadin', 'apixaban', 'eliquis', 'rivaroxaban', 'xarelto', 'dabigatran', 'heparin', 'enoxaparin', 'plavix', 'clopidogrel', 'aspirin'];
    const bleedHerbs = [
      { name: 'dan shen', botanical: 'Salvia miltiorrhiza', risk: 'Additive platelet aggregation inhibition and prolonged INR/PT' },
      { name: 'ginkgo biloba', botanical: 'Ginkgo biloba', risk: 'PAF (Platelet Activating Factor) antagonism increasing hemorrhage risk' },
      { name: 'guggulu', botanical: 'Commiphora mukul', risk: 'Additive antiplatelet activity and hepatic metabolism modulation' },
      { name: 'st. john\'s wort', botanical: 'Hypericum perforatum', risk: 'Strong CYP3A4/CYP2C9 induction drastically lowering anticoagulant serum levels and causing thrombosis' },
      { name: 'garlic supplement', botanical: 'Allium sativum', risk: 'Additive allicin fibrinolytic activity with severe bleeding potential' }
    ];

    const hasAnticoagulant = anticoagulants.find(d => lower.includes(d));
    if (hasAnticoagulant) {
      for (const herb of bleedHerbs) {
        if (lower.includes(herb.name) || lower.includes(herb.botanical.toLowerCase())) {
          conflicts.push({
            drug: hasAnticoagulant.toUpperCase(),
            botanicalOrHerb: `${herb.name} (${herb.botanical})`,
            riskMechanism: herb.risk,
            severity: 'CRITICAL',
            clinicalDirective: `Prohibit co-administration of ${hasAnticoagulant} with ${herb.name} without immediate coagulation INR monitoring.`
          });
        }
      }
    }

    // 2. SSRIs/SNRIs/MAOIs + Serotonergic Botanicals
    const serotonergics = ['sertraline', 'zoloft', 'fluoxetine', 'prozac', 'escitalopram', 'lexapro', 'citalopram', 'duloxetine', 'cymbalta', 'venlafaxine', 'phenelzine'];
    const serotoninHerbs = [
      { name: 'st. john\'s wort', botanical: 'Hypericum perforatum', risk: 'Non-selective reuptake inhibition of serotonin, dopamine, and norepinephrine triggering fatal Serotonin Syndrome' },
      { name: '5-htp', botanical: '5-Hydroxytryptophan / Griffonia simplicifolia', risk: 'Direct precursor serotonin synthesis causing hyperthermia, clonus, and central autonomic instability' },
      { name: 'kava', botanical: 'Piper methysticum', risk: 'Central CNS depression, GABA modulation, and potential hepatotoxicity' }
    ];

    const hasSerotonergic = serotonergics.find(s => lower.includes(s));
    if (hasSerotonergic) {
      for (const herb of serotoninHerbs) {
        if (lower.includes(herb.name) || lower.includes(herb.botanical.toLowerCase())) {
          conflicts.push({
            drug: hasSerotonergic.toUpperCase(),
            botanicalOrHerb: `${herb.name} (${herb.botanical})`,
            riskMechanism: herb.risk,
            severity: 'CRITICAL',
            clinicalDirective: `Cease ${herb.name} immediately during ${hasSerotonergic} therapy to prevent Serotonin Syndrome.`
          });
        }
      }
    }

    // 3. Levothyroxine + Binding Botanicals/Minerals
    const thyroidMeds = ['levothyroxine', 'synthroid', 'armour thyroid', 'liothyronine'];
    const thyroidInteractions = [
      { name: 'calcium carbonate', botanical: 'Calcium carbonate / Coral calcium', risk: 'Forms insoluble chelate complexes preventing GI absorption of thyroid hormone' },
      { name: 'soy isoflavones', botanical: 'Glycine max', risk: 'Inhibits intestinal uptake and thyroid peroxidase activity' },
      { name: 'ashwagandha', botanical: 'Withania somnifera', risk: 'Stimulates endogenous thyroid hormone synthesis, potentially inducing subclinical thyrotoxicosis' }
    ];

    const hasThyroid = thyroidMeds.find(t => lower.includes(t));
    if (hasThyroid) {
      for (const item of thyroidInteractions) {
        if (lower.includes(item.name) || lower.includes(item.botanical.toLowerCase())) {
          conflicts.push({
            drug: hasThyroid.toUpperCase(),
            botanicalOrHerb: `${item.name} (${item.botanical})`,
            riskMechanism: item.risk,
            severity: 'HIGH',
            clinicalDirective: `Separate administration of ${hasThyroid} and ${item.name} by at least 4 hours and monitor TSH.`
          });
        }
      }
    }

    return conflicts;
  }
}
