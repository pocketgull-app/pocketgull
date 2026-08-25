import { Injectable } from '@angular/core';
import * as DOMPurify from 'dompurify';

export interface IVitalBoundaryResult {
  heartRate: number;
  systolicBp: number;
  diastolicBp: number;
  spo2: number;
  sibiScore: number;
  isClamped: boolean;
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DefensiveGuardrailsService {
  private readonly PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /system\s+prompt\s+(override|reset)/i,
    /you\s+are\s+now\s+a/i,
    /disregard\s+all\s+rules/i,
    /<script\b[^>]*>([\s\S]*?)<\/script[^>]*>/gi,
    /javascript:/i,
    /onload\s*=/i,
    /onerror\s*=/i
  ];

  /**
   * Defensive Prompt Injection & Input Sanitization
   * Neutralizes prompt injection payloads before passing to Gemini AI providers.
   */
  sanitizePromptInput(input: string): { safeInput: string; isInjected: boolean } {
    if (!input || typeof input !== 'string') {
      return { safeInput: '', isInjected: false };
    }

    let isInjected = false;
    let safeInput = input;

    // Use DOMPurify for HIPAA & OWASP compliant script & HTML tag sanitization
    const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
    const purify = hasOwnDefault ? (DOMPurify as any).default : (DOMPurify as any);

    if (typeof window !== 'undefined' && purify && typeof purify.sanitize === 'function') {
      const sanitized = purify.sanitize(safeInput, { ALLOWED_TAGS: [] });
      if (sanitized !== safeInput) {
        isInjected = true;
        safeInput = sanitized;
      }
    }

    for (const pattern of this.PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(safeInput)) {
        isInjected = true;
        safeInput = safeInput.replace(pattern, '[DEFENSIVE_GUARDRAIL_BLOCKED]');
      }
    }

    return { safeInput, isInjected };
  }

  /**
   * Defensive Clinical Vital Range Validation
   * Clamps out-of-bounds physiological anomalies and logs warnings.
   */
  validateClinicalVitals(vitals: {
    heartRate?: number;
    systolicBp?: number;
    diastolicBp?: number;
    spo2?: number;
    sibiScore?: number;
  }): IVitalBoundaryResult {
    const warnings: string[] = [];
    let isClamped = false;

    // Heart Rate (20 - 250 bpm)
    let hr = vitals.heartRate ?? 72;
    if (hr < 20) { hr = 20; isClamped = true; warnings.push('Heart rate clamped to 20 bpm minimum.'); }
    if (hr > 250) { hr = 250; isClamped = true; warnings.push('Heart rate clamped to 250 bpm maximum.'); }

    // Systolic BP (40 - 260 mmHg)
    let sbp = vitals.systolicBp ?? 120;
    if (sbp < 40) { sbp = 40; isClamped = true; warnings.push('Systolic BP clamped to 40 mmHg minimum.'); }
    if (sbp > 260) { sbp = 260; isClamped = true; warnings.push('Systolic BP clamped to 260 mmHg maximum.'); }

    // Diastolic BP (20 - 160 mmHg)
    let dbp = vitals.diastolicBp ?? 80;
    if (dbp < 20) { dbp = 20; isClamped = true; warnings.push('Diastolic BP clamped to 20 mmHg minimum.'); }
    if (dbp > 160) { dbp = 160; isClamped = true; warnings.push('Diastolic BP clamped to 160 mmHg maximum.'); }

    // SpO2 (50 - 100 %)
    let spo2 = vitals.spo2 ?? 98;
    if (spo2 < 50) { spo2 = 50; isClamped = true; warnings.push('SpO2 clamped to 50% minimum.'); }
    if (spo2 > 100) { spo2 = 100; isClamped = true; warnings.push('SpO2 clamped to 100% maximum.'); }

    // SIBI Score (0 - 100)
    let sibi = vitals.sibiScore ?? 0;
    if (sibi < 0) { sibi = 0; isClamped = true; warnings.push('SIBI score clamped to 0 minimum.'); }
    if (sibi > 100) { sibi = 100; isClamped = true; warnings.push('SIBI score clamped to 100 maximum.'); }

    return {
      heartRate: hr,
      systolicBp: sbp,
      diastolicBp: dbp,
      spo2,
      sibiScore: sibi,
      isClamped,
      warnings
    };
  }

  /**
   * Safe Object Property Dereferencer
   * Prevents runtime NullPointerExceptions on nested structures.
   */
  safelyAccess<T>(fn: () => T, fallback: T): T {
    try {
      const val = fn();
      return val !== undefined && val !== null ? val : fallback;
    } catch (e) {
      console.debug('[DefensiveGuardrails] safelyAccess fallback triggered:', (e as Error)?.message);
      return fallback;
    }
  }
}
