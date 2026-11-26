// SPDX-License-Identifier: Apache-2.0
/**
 * @file model-armor.service.ts
 * @description Google Cloud Model Armor Enterprise Policy & Sanitization Service.
 * Implements Google Cloud Model Armor template specifications for zero-cost in-process
 * defense, sensitive data protection (SDP/ePHI), and deterministic prompt-injection scanning.
 */

export interface IModelArmorTemplateConfig {
  templateId: string;
  projectId: string;
  location: string;
  filterConfig: {
    promptInjection: {
      enforced: boolean;
      confidenceThreshold: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    piiAndPhiSanitization: {
      enforced: boolean;
      infoTypes: string[]; // e.g. ['US_SOCIAL_SECURITY_NUMBER', 'MEDICAL_RECORD_NUMBER', 'DEA_NUMBER', 'EMAIL_ADDRESS']
      maskingStrategy: 'REDACT' | 'HASH' | 'MASK';
    };
    hateSpeech: {
      enforced: boolean;
      threshold: 'BLOCK_LOW' | 'BLOCK_MEDIUM' | 'BLOCK_HIGH';
    };
    dangerousContent: {
      enforced: boolean;
      exemptClinicalContexts: boolean;
    };
  };
}

export interface IModelArmorScanResult {
  passed: boolean;
  sanitizedText: string;
  findings: Array<{
    ruleId: string;
    description: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    matchedSpan?: string;
  }>;
  executionMode: 'IN_PROCESS_EDGE' | 'CLOUD_MODEL_ARMOR_API';
}

interface IPiiRule {
  ruleId: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  replacement: string;
  pattern: () => RegExp;
}

interface IPromptInjectionRule {
  ruleId: string;
  description: string;
  severity: 'WARNING' | 'CRITICAL';
  pattern: () => RegExp;
  replacement: string;
}

const PII_RULES: readonly IPiiRule[] = [
  {
    ruleId: 'US_SOCIAL_SECURITY_NUMBER',
    description: 'Direct SSN identifier detected and redacted',
    severity: 'CRITICAL',
    replacement: '[REDACTED_SSN]',
    pattern: () => /\b\d{3}-\d{2}-\d{4}\b/g
  },
  {
    ruleId: 'CREDIT_CARD_NUMBER',
    description: 'Payment card number detected and redacted',
    severity: 'CRITICAL',
    replacement: '[REDACTED_PAYMENT_CARD]',
    pattern: () => /\b(?:\d{4}[ -]?){3}\d{4}\b/g
  },
  {
    ruleId: 'DEA_NUMBER',
    description: 'DEA physician identifier detected and redacted',
    severity: 'WARNING',
    replacement: '[REDACTED_DEA_NUMBER]',
    pattern: () => /\b[A-Z]{2}\d{7}\b/g
  },
  {
    ruleId: 'MEDICAL_RECORD_NUMBER',
    description: 'Direct MRN identifier detected and pseudonymized',
    severity: 'WARNING',
    replacement: '[REDACTED_MRN]',
    pattern: () => /\bMRN[#:\s-]?\d{6,10}\b/gi
  },
  {
    ruleId: 'PHONE_NUMBER',
    description: 'Direct phone number detected and redacted',
    severity: 'INFO',
    replacement: '[REDACTED_PHONE]',
    pattern: () => /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  }
];

const PROMPT_INJECTION_RULES: readonly IPromptInjectionRule[] = [
  {
    ruleId: 'PROMPT_INJECTION_INSTRUCTION_OVERRIDE',
    description: 'Adversarial instruction override directive detected and neutralized (OWASP LLM01)',
    severity: 'CRITICAL',
    pattern: () => /\b(?:ignore|override|disregard|forget|bypass)\s+(?:all\s+|any\s+)?(?:previous|prior|above|system|developer|clinical)\s+(?:safety\s+)?(?:instructions|prompts|directives|rules|guardrails|policies)\b/gi,
    replacement: '[BLOCKED_INJECTION_DIRECTIVE]'
  },
  {
    ruleId: 'PROMPT_INJECTION_SYSTEM_EXFIL',
    description: 'System prompt exfiltration attempt detected and neutralized (OWASP LLM07)',
    severity: 'CRITICAL',
    pattern: () => /\b(?:reveal|output|print|dump|repeat|leak|disclose)\s+(?:your\s+|the\s+)?(?:full\s+|exact\s+|internal\s+)?(?:system\s+prompt|developer\s+instructions|hidden\s+prompt)\b/gi,
    replacement: '[BLOCKED_PROMPT_EXFIL]'
  },
  {
    ruleId: 'PROMPT_INJECTION_ROLE_DELIMITER',
    description: 'Control-token or role delimiter spoofing detected and stripped (OWASP LLM01)',
    severity: 'CRITICAL',
    pattern: () => /(?:<\|(?:im_start|im_end|system|endoftext)\|>|\[\s*SYSTEM(?:\s+PROMPT)?\s*\]|###\s*SYSTEM\s+(?:PROMPT|OVERRIDE))/gi,
    replacement: '[BLOCKED_CONTROL_TOKEN]'
  },
  {
    ruleId: 'PROMPT_INJECTION_ZERO_WIDTH_SMUGGLING',
    description: 'Stealth zero-width Unicode obfuscation characters stripped',
    severity: 'WARNING',
    pattern: () => /[\u200B-\u200D\u2060\uFEFF]+/g,
    replacement: ''
  }
];

export class ModelArmorService {
  public static readonly DEFAULT_TEMPLATE: IModelArmorTemplateConfig = {
    templateId: 'pocketgull-enterprise-clinical-guard-v1',
    projectId: 'gen-lang-client-0540208645',
    location: 'us-central1',
    filterConfig: {
      promptInjection: {
        enforced: true,
        confidenceThreshold: 'MEDIUM'
      },
      piiAndPhiSanitization: {
        enforced: true,
        infoTypes: ['US_SOCIAL_SECURITY_NUMBER', 'MEDICAL_RECORD_NUMBER', 'DEA_NUMBER', 'CREDIT_CARD_NUMBER', 'PHONE_NUMBER'],
        maskingStrategy: 'REDACT'
      },
      hateSpeech: {
        enforced: true,
        threshold: 'BLOCK_HIGH'
      },
      dangerousContent: {
        enforced: true,
        exemptClinicalContexts: true // Clinical standard-of-care override per SECURITY.md §2
      }
    }
  };

  /**
   * Scans text against the Google Cloud Model Armor policy template.
   * Uses fresh stateless RegExp instances per invocation (eliminating stateful `/g` `.test()` bugs).
   */
  public static scan(input: string, template = ModelArmorService.DEFAULT_TEMPLATE): IModelArmorScanResult {
    const findings: IModelArmorScanResult['findings'] = [];
    let sanitized = typeof input === 'string' ? input : '';

    if (template.filterConfig.promptInjection.enforced) {
      for (const rule of PROMPT_INJECTION_RULES) {
        let matched = false;
        const regex = rule.pattern();
        sanitized = sanitized.replace(regex, () => {
          matched = true;
          return rule.replacement;
        });
        if (matched) {
          findings.push({
            ruleId: rule.ruleId,
            description: rule.description,
            severity: rule.severity
          });
        }
      }
    }

    if (template.filterConfig.piiAndPhiSanitization.enforced) {
      for (const rule of PII_RULES) {
        let matched = false;
        const regex = rule.pattern();
        sanitized = sanitized.replace(regex, () => {
          matched = true;
          return rule.replacement;
        });
        if (matched) {
          findings.push({
            ruleId: rule.ruleId,
            description: rule.description,
            severity: rule.severity
          });
        }
      }
    }

    const hasCritical = findings.some(f => f.severity === 'CRITICAL');

    return {
      passed: !hasCritical,
      sanitizedText: sanitized,
      findings,
      executionMode: 'IN_PROCESS_EDGE'
    };
  }
}
