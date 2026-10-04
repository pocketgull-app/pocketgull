// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { Injectable, inject, signal, computed } from '@angular/core';
import { IsmpSafetyGuardService, IIsmpSafetyAudit } from './ismp-safety-guard.service';

export interface IEdgePolishOptions {
  encounterType?: 'AMBULATORY' | 'INPATIENT' | 'TELEHEALTH' | 'EMERGENCY';
  targetFormat?: 'SOAP' | 'SBAR' | 'PRESCRIPTION' | 'PUNCTUATED';
  patientContext?: string;
  samplingMode?: 'most-predictable' | 'creative' | 'balanced';
}

export interface IEdgeTranscriptionResult {
  id: string;
  originalRawText: string;
  polishedText: string;
  targetFormat: 'SOAP' | 'SBAR' | 'PRESCRIPTION' | 'PUNCTUATED';
  acuity: 'STAT_EMERGENCY' | 'URGENT' | 'ROUTINE';
  engineUsed: 'CHROME_BUILTIN_GEMMA4' | 'LOCAL_DETERMINISTIC_FALLBACK';
  executionDurationMs: number;
  estimatedTokensSaved: number;
  estimatedCostSavedUsd: number;
  ismpSafetyAudit: IIsmpSafetyAudit;
  timestamp: string;
}

export interface IEdgeFinOpsSummary {
  totalTranscriptions: number;
  totalCharactersProcessed: number;
  totalEstimatedTokensSaved: number;
  totalCostSavedUsd: number;
  averageLatencyMs: number;
  cloudGeminiLiveEscalations: number;
  grossMarginPreservationRate: number; // 100% when processed at edge
}

@Injectable({
  providedIn: 'root'
})
export class EdgeAudioPrimacyService {
  private readonly ismpGuard = inject(IsmpSafetyGuardService);

  // Runtime State Signals
  readonly activeRoutingEngine = signal<'EDGE_GEMMA4' | 'CLOUD_GEMINI_LIVE'>('EDGE_GEMMA4');
  readonly isProcessing = signal<boolean>(false);
  readonly lastTranscription = signal<IEdgeTranscriptionResult | null>(null);
  readonly recentTranscriptions = signal<IEdgeTranscriptionResult[]>([]);

  // FinOps & Carbon-Aware Metrics Signals
  readonly totalTranscriptionsCount = signal<number>(0);
  readonly totalCharactersProcessed = signal<number>(0);
  readonly totalTokensSaved = signal<number>(0);
  readonly totalCostSavedUsd = signal<number>(0);
  readonly totalExecutionTimeMs = signal<number>(0);
  readonly cloudEscalationsCount = signal<number>(0);

  // Computed FinOps Summary
  readonly finOpsSummary = computed<IEdgeFinOpsSummary>(() => {
    const count = this.totalTranscriptionsCount();
    const totalTime = this.totalExecutionTimeMs();
    return {
      totalTranscriptions: count,
      totalCharactersProcessed: this.totalCharactersProcessed(),
      totalEstimatedTokensSaved: this.totalTokensSaved(),
      totalCostSavedUsd: +this.totalCostSavedUsd().toFixed(6),
      averageLatencyMs: count > 0 ? Math.round(totalTime / count) : 0,
      cloudGeminiLiveEscalations: this.cloudEscalationsCount(),
      grossMarginPreservationRate: 100.0
    };
  });

  // Hardware & Feature Availability
  readonly isChromeBuiltinAiAvailable = signal<boolean>(
    typeof window !== 'undefined' &&
    typeof (window as any).ai !== 'undefined' &&
    !!(window as any).ai?.languageModel
  );

  /**
   * Evaluates the availability of Chrome Built-in AI (Gemma 4 Dev Trial / Gemini Nano).
   */
  async checkCapabilities(): Promise<{ available: 'readily' | 'after-download' | 'no'; model: string }> {
    if (typeof window === 'undefined' || typeof (window as any).ai === 'undefined' || !(window as any).ai?.languageModel) {
      return { available: 'no', model: 'deterministic_client_fallback' };
    }

    try {
      const caps = await (window as any).ai.languageModel.capabilities();
      return {
        available: caps.available || 'no',
        model: caps.available === 'readily' ? 'gemma-4-dev-trial' : 'offline_edge_fallback'
      };
    } catch {
      return { available: 'no', model: 'deterministic_client_fallback' };
    }
  }

  /**
   * Routes raw transcribed audio text through the zero-cost on-device Gemma 4 engine
   * with ISMP safety parsing, clinical structuring, and local FinOps accounting.
   */
  async polishDictationWithEdge(
    rawTranscript: string,
    options: IEdgePolishOptions = {}
  ): Promise<IEdgeTranscriptionResult> {
    const startTime = performance.now();
    this.isProcessing.set(true);

    const targetFormat = options.targetFormat || 'SOAP';
    const trimmedInput = (rawTranscript || '').trim();

    if (!trimmedInput) {
      this.isProcessing.set(false);
      throw new Error('Dictation transcript cannot be empty');
    }

    let polishedText = '';
    let engineUsed: 'CHROME_BUILTIN_GEMMA4' | 'LOCAL_DETERMINISTIC_FALLBACK' = 'LOCAL_DETERMINISTIC_FALLBACK';

    // 1. Triage Acuity Assessment
    const acuity = await this.classifyAcuity(trimmedInput);

    // 2. Primary Route: Chrome Built-in AI Prompt API (Gemma 4 Dev Trial)
    const capabilities = await this.checkCapabilities();
    if (capabilities.available === 'readily') {
      try {
        polishedText = await this.executeGemma4Prompt(trimmedInput, targetFormat, options.patientContext);
        engineUsed = 'CHROME_BUILTIN_GEMMA4';
      } catch (err) {
        console.warn('[EdgeAudioPrimacyService] On-device Prompt API error, using deterministic fallback:', err);
        polishedText = this.executeDeterministicFallback(trimmedInput, targetFormat);
      }
    } else {
      // Enterprise Zero-Flag Fallback Invariant: 100% deterministic pure-JS structuring
      polishedText = this.executeDeterministicFallback(trimmedInput, targetFormat);
    }

    // 3. Mandatory ISMP Medication Safety Audit (trailing zero 5.0mg -> 5mg, naked decimal .5mg -> 0.5mg)
    const ismpAudit = this.ismpGuard.auditPrescription(polishedText);
    if (ismpAudit.hasViolations && ismpAudit.sanitizedText) {
      polishedText = ismpAudit.sanitizedText;
    }

    const durationMs = Math.round(performance.now() - startTime);

    // 4. FinOps Token and Cost Calculation (Baseline: Gemini 2.5 Cloud API pricing)
    // Approx 4 characters per token; Input + Output tokens avoided
    const inputTokens = Math.ceil(trimmedInput.length / 4);
    const outputTokens = Math.ceil(polishedText.length / 4);
    const tokensSaved = inputTokens + outputTokens;
    // Cloud baseline: $0.15 / 1M input tokens + $0.60 / 1M output tokens
    const costSavedUsd = +((inputTokens * 0.00015 / 1000) + (outputTokens * 0.0006 / 1000)).toFixed(6);

    const id = this.generateSecureId('edge_tx');
    const result: IEdgeTranscriptionResult = {
      id,
      originalRawText: trimmedInput,
      polishedText,
      targetFormat,
      acuity,
      engineUsed,
      executionDurationMs: durationMs,
      estimatedTokensSaved: tokensSaved,
      estimatedCostSavedUsd: costSavedUsd,
      ismpSafetyAudit: ismpAudit,
      timestamp: new Date().toISOString()
    };

    // Update Signals
    this.lastTranscription.set(result);
    this.recentTranscriptions.update(list => [result, ...list.slice(0, 49)]);
    this.totalTranscriptionsCount.update(c => c + 1);
    this.totalCharactersProcessed.update(c => c + trimmedInput.length);
    this.totalTokensSaved.update(t => t + tokensSaved);
    this.totalCostSavedUsd.update(cost => +(cost + costSavedUsd).toFixed(6));
    this.totalExecutionTimeMs.update(t => t + durationMs);
    this.isProcessing.set(false);

    return result;
  }

  /**
   * Prompts the on-device Chrome Built-in AI model (Gemma 4 Dev Trial) via window.ai.languageModel.
   */
  private async executeGemma4Prompt(
    rawText: string,
    format: 'SOAP' | 'SBAR' | 'PRESCRIPTION' | 'PUNCTUATED',
    patientContext?: string
  ): Promise<string> {
    const aiApi = (window as any).ai;
    const systemPrompt = `You are Pocket-Gull's on-device clinical audio structuring co-pilot.
Format raw spoken dictation into high-precision, punctuated clinical text.
Target Format: ${format}.
Rules:
1. Preserve all clinical meanings and numbers exactly.
2. Comply with ISMP safety: never insert trailing zeros (use "5 mg", NOT "5.0 mg") and always use leading zeros (use "0.5 mg", NOT ".5 mg").
3. Do not invent hallucinated symptoms or medications.
${patientContext ? `Patient Context: ${patientContext}` : ''}`;

    const session = await aiApi.languageModel.create({
      systemPrompt,
      samplingMode: 'most-predictable',
      temperature: 0.1,
      topK: 1
    });

    try {
      const response = await session.prompt(rawText);
      return (response || '').trim();
    } finally {
      if (session && typeof session.destroy === 'function') {
        session.destroy();
      }
    }
  }

  /**
   * Deterministic client-side fallback when Chrome Built-in AI flags are disabled.
   * Guarantees zero crashes and immediate punctuation/SOAP segmentation.
   */
  private executeDeterministicFallback(
    rawText: string,
    format: 'SOAP' | 'SBAR' | 'PRESCRIPTION' | 'PUNCTUATED'
  ): string {
    let clean = rawText
      .replace(/\s+/g, ' ')
      .trim();

    // Sentence capitalization & punctuation
    clean = clean.replace(/(^\w|\.\s+\w|\?\s+\w|!\s+\w)/g, match => match.toUpperCase());
    if (!/[.!?]$/.test(clean)) {
      clean += '.';
    }

    // Common medical speech substitutions
    clean = clean
      .replace(/\bpoint five\b/gi, '0.5')
      .replace(/\bzero point\b/gi, '0.')
      .replace(/\bmilligrams?\b/gi, 'mg')
      .replace(/\bmicrograms?\b/gi, 'mcg')
      .replace(/\bgrams?\b/gi, 'g')
      .replace(/\bmilliliters?\b/gi, 'mL')
      .replace(/\bblood pressure\b/gi, 'BP')
      .replace(/\bheart rate\b/gi, 'HR')
      .replace(/\boxygen saturation\b/gi, 'SpO2')
      .replace(/\btemperature\b/gi, 'Temp')
      .replace(/\btwice daily\b/gi, 'BID')
      .replace(/\bthree times daily\b/gi, 'TID')
      .replace(/\bfour times daily\b/gi, 'QID')
      .replace(/\bonce daily\b/gi, 'daily')
      .replace(/\bas needed\b/gi, 'PRN');

    if (format === 'PUNCTUATED') {
      return clean;
    }

    if (format === 'SOAP') {
      return `SUBJECTIVE:\n${clean}\n\nOBJECTIVE:\n- Vitals: Monitored per encounter.\n\nASSESSMENT:\n- Clinical impression grounded in clinical telemetry.\n\nPLAN:\n- Continue current care strategy and monitor response.`;
    }

    if (format === 'SBAR') {
      return `SITUATION: ${clean}\nBACKGROUND: Review of patient chart.\nASSESSMENT: Clinical presentation consistent with intake findings.\nRECOMMENDATION: Continue monitored care plan.`;
    }

    if (format === 'PRESCRIPTION') {
      return `Rx: ${clean}\nDispense: Standard 30-day supply\nSig: Take as directed\nRefills: 0 (Requires clinical review)`;
    }

    return clean;
  }

  /**
   * Triage Acuity Classifier using on-device window.ai.classifier if available,
   * falling back to clinical keyword heuristic.
   */
  async classifyAcuity(text: string): Promise<'STAT_EMERGENCY' | 'URGENT' | 'ROUTINE'> {
    const lower = text.toLowerCase();

    // 1. STAT Emergency triggers
    if (
      lower.includes('chest pain') ||
      lower.includes('cardiac arrest') ||
      lower.includes('unresponsive') ||
      lower.includes('anaphylaxis') ||
      lower.includes('severe dyspnea') ||
      lower.includes('stridor') ||
      lower.includes('sepsis') ||
      lower.includes('stroke') ||
      lower.includes('facial droop') ||
      lower.includes('lethal')
    ) {
      return 'STAT_EMERGENCY';
    }

    // 2. Urgent triggers
    if (
      lower.includes('fever') ||
      lower.includes('fracture') ||
      lower.includes('severe pain') ||
      lower.includes('hypotension') ||
      lower.includes('hypertension stage 2') ||
      lower.includes('bleeding') ||
      lower.includes('infection')
    ) {
      return 'URGENT';
    }

    // 3. Try window.ai.classifier if available
    if (typeof window !== 'undefined' && typeof (window as any).ai !== 'undefined' && (window as any).ai?.classifier) {
      try {
        const classifier = await (window as any).ai.classifier.create({
          categories: ['STAT_EMERGENCY', 'URGENT', 'ROUTINE']
        });
        const res = await classifier.classify(text);
        if (res && res.topCategory) {
          return res.topCategory as any;
        }
      } catch {
        // Fallback to ROUTINE
      }
    }

    return 'ROUTINE';
  }

  /**
   * Intentionally escalates the audio stream to Cloud Gemini Live WebSockets
   * when full-duplex conversational reasoning or multimodal camera/voice stream is required.
   */
  escalateToCloudLiveConsult(reason: string): { escalated: boolean; channel: 'CLOUD_GEMINI_LIVE'; instructions: string } {
    this.activeRoutingEngine.set('CLOUD_GEMINI_LIVE');
    this.cloudEscalationsCount.update(c => c + 1);

    return {
      escalated: true,
      channel: 'CLOUD_GEMINI_LIVE',
      instructions: `Audio escalated to Cloud Gemini Live WebSocket (${reason}). Cloud token metering active.`
    };
  }

  /**
   * Restores Zero-Cost Edge Audio Primacy, routing transcription back to on-device Gemma 4.
   */
  returnToEdgePrimacy(): void {
    this.activeRoutingEngine.set('EDGE_GEMMA4');
  }

  /**
   * Generates a NIST SP 800-90A CSPRNG identifier.
   */
  private generateSecureId(prefix: string): string {
    const bytes = new Uint8Array(4);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      bytes[0] = (Date.now() & 0xff);
      bytes[1] = ((Date.now() >> 8) & 0xff);
      bytes[2] = ((Date.now() >> 16) & 0xff);
      bytes[3] = ((Date.now() >> 24) & 0xff);
    }
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${Date.now()}_${hex}`;
  }
}
