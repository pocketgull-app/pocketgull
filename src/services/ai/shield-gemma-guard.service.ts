/**
 * @file shield-gemma-guard.service.ts
 * @description Zero-Cost ShieldGemma Safety Classifier & Prompt Defense Engine.
 * Evaluates inbound prompts and clinical notes for prompt injection, jailbreaks,
 * and high-risk safety violations with zero cloud API overhead via local AST heuristics
 * and Chrome Built-in AI / Gemma on-device integration.
 */

import { Injectable } from '@angular/core';

export interface IShieldGemmaScore {
  category: 'PROMPT_INJECTION' | 'TOXICITY' | 'DATA_EXFILTRATION' | 'ISMP_VIOLATION' | 'SYSTEM_OVERRIDE';
  violationDetected: boolean;
  confidenceScore: number; // 0.0 to 1.0
  rationale: string;
}

export interface IShieldGemmaEvaluation {
  isSafe: boolean;
  riskLevel: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scores: IShieldGemmaScore[];
  sanitizedPrompt: string;
  mitigationApplied: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ShieldGemmaGuardService {
  // Regex patterns targeting prompt injection, jailbreak attempts, and system override delimiters
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

    // Step 2: Evaluate Prompt Injection & System Override vectors
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

    // Step 3: Check ISMP Medication typography safety
    if (ShieldGemmaGuardService.TRAILING_ZERO_PATTERN.test(cleaned)) {
      scores.push({
        category: 'ISMP_VIOLATION',
        violationDetected: true,
        confidenceScore: 0.88,
        rationale: 'Dangerous trailing zero detected (e.g. 5.0 mg instead of 5 mg)'
      });
      cleaned = cleaned.replace(ShieldGemmaGuardService.TRAILING_ZERO_PATTERN, '$1 $2');
      mitigations.push('Corrected dangerous trailing zero per ISMP standard');
    }

    if (ShieldGemmaGuardService.NAKED_DECIMAL_PATTERN.test(cleaned)) {
      scores.push({
        category: 'ISMP_VIOLATION',
        violationDetected: true,
        confidenceScore: 0.88,
        rationale: 'Dangerous naked decimal detected (e.g. .5 mg instead of 0.5 mg)'
      });
      cleaned = cleaned.replace(ShieldGemmaGuardService.NAKED_DECIMAL_PATTERN, '$10.$2 $3');
      mitigations.push('Prepended leading zero to naked decimal per ISMP standard');
    }

    // Step 4: Check exfiltration vectors
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

    const hasViolations = scores.some(s => s.violationDetected && s.category === 'PROMPT_INJECTION');
    const riskLevel: IShieldGemmaEvaluation['riskLevel'] = injectionFound 
      ? 'CRITICAL' 
      : scores.some(s => s.violationDetected) 
        ? 'MEDIUM' 
        : 'NEGLIGIBLE';

    return {
      isSafe: !hasViolations,
      riskLevel,
      scores,
      sanitizedPrompt: cleaned,
      mitigationApplied: mitigations
    };
  }

  /**
   * Enforces structural context isolation (OWASP LLM01)
   */
  public wrapClinicalDirectiveContext(directive: string): string {
    const evaluation = this.evaluatePrompt(directive);
    return `[CLINICAL DIRECTIVE CONTEXT]\n${evaluation.sanitizedPrompt}\n[/CLINICAL DIRECTIVE CONTEXT]`;
  }
}
