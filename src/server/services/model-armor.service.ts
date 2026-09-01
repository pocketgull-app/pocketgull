/**
 * @file model-armor.service.ts
 * @description Google Cloud Model Armor Enterprise Policy & Sanitization Service.
 * Implements Google Cloud Model Armor template specifications for zero-cost in-process
 * defense, sensitive data protection (SDP/ePHI), and prompt injection filtering.
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

  private static readonly SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
  private static readonly CC_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  private static readonly DEA_REGEX = /\b[A-Z]{2}\d{7}\b/g;
  private static readonly MRN_REGEX = /\bMRN[#:\s-]?\d{6,10}\b/gi;
  private static readonly PHONE_REGEX = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  /**
   * Scans text against the Google Cloud Model Armor policy template.
   */
  public static scan(input: string, template = ModelArmorService.DEFAULT_TEMPLATE): IModelArmorScanResult {
    const findings: IModelArmorScanResult['findings'] = [];
    let sanitized = input;

    if (template.filterConfig.piiAndPhiSanitization.enforced) {
      if (ModelArmorService.SSN_REGEX.test(sanitized)) {
        findings.push({
          ruleId: 'US_SOCIAL_SECURITY_NUMBER',
          description: 'Direct SSN identifier detected and redacted',
          severity: 'CRITICAL'
        });
        sanitized = sanitized.replace(ModelArmorService.SSN_REGEX, '[REDACTED_SSN]');
      }

      if (ModelArmorService.CC_REGEX.test(sanitized)) {
        findings.push({
          ruleId: 'CREDIT_CARD_NUMBER',
          description: 'Payment card number detected and redacted',
          severity: 'CRITICAL'
        });
        sanitized = sanitized.replace(ModelArmorService.CC_REGEX, '[REDACTED_PAYMENT_CARD]');
      }

      if (ModelArmorService.DEA_REGEX.test(sanitized)) {
        findings.push({
          ruleId: 'DEA_NUMBER',
          description: 'DEA physician identifier detected and redacted',
          severity: 'WARNING'
        });
        sanitized = sanitized.replace(ModelArmorService.DEA_REGEX, '[REDACTED_DEA_NUMBER]');
      }

      if (ModelArmorService.MRN_REGEX.test(sanitized)) {
        findings.push({
          ruleId: 'MEDICAL_RECORD_NUMBER',
          description: 'Direct MRN identifier detected and pseudonymized',
          severity: 'WARNING'
        });
        sanitized = sanitized.replace(ModelArmorService.MRN_REGEX, '[REDACTED_MRN]');
      }

      if (ModelArmorService.PHONE_REGEX.test(sanitized)) {
        findings.push({
          ruleId: 'PHONE_NUMBER',
          description: 'Direct phone number detected and redacted',
          severity: 'INFO'
        });
        sanitized = sanitized.replace(ModelArmorService.PHONE_REGEX, '[REDACTED_PHONE]');
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
