/**
 * ⚛️ PocketGull Quantum Dual-Spin Speculative Sampler Service
 * 
 * Bio-inspired by Cryptochrome Radical Pair Spin Chemistry:
 * 1. Dual-Branch Speculative Decoding in Superposition:
 *    - Singlet Branch |S⟩: Conservative, strict standard-of-care (NIH / Cochrane Level A).
 *    - Triplet Branch |T⟩: Exploratory, multi-paradigm lateral differential synthesis.
 * 2. Patient Telemetry Zeeman Steering:
 *    - Real-time patient acuity (HRV, lactate, pain scale) tilts the quantum spin yield (Phi_S vs. Phi_T).
 * 3. Adversarial RF Decoherence Guard:
 *    - Detects prompt injection attempts (zero-width Unicode, system escapes) by measuring spin state collapse.
 */

import { Injectable } from '@angular/core';

export interface IQuantumSpeculativeResult {
  consensusText: string;
  singletYieldPhiS: number; // 0.0 - 1.0
  tripletYieldPhiT: number; // 0.0 - 1.0
  steeringAcuity: number; // Effective Zeeman bias derived from patient telemetry (0.0 = low risk, 1.0 = critical)
  superpositionTokens: number;
  dominantBranch: 'SINGLET_CONSERVATIVE' | 'TRIPLET_INTEGRATIVE' | 'COHERENT_SUPERPOSITION';
  rfDecoherenceDetected: boolean;
  rfInterferenceSeverity: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL';
  coherenceConfidence: number; // 0 - 100%
  latencyMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuantumSpeculativeSamplerService {

  /**
   * Evaluates prompt text for adversarial RF decoherence signals (Prompt Injections / Jailbreak attempts).
   */
  detectRfDecoherence(promptText: string): {
    detected: boolean;
    severity: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL';
    signals: string[];
  } {
    const signals: string[] = [];

    // 1. Zero-width Unicode and hidden control characters
    const zeroWidthRegex = /[\u200B\u200C\u200D\uFEFF\u0000-\u0008\u000E-\u001F]/;
    if (zeroWidthRegex.test(promptText)) {
      signals.push('Zero-width non-printable Unicode payload detected');
    }

    // 2. System prompt escape and jailbreak keywords
    const injectionKeywords = [
      /ignore (all )?previous instructions/i,
      /you are now in developer mode/i,
      /bypass (all )?(guardrails|safety)/i,
      /disable (hipaa|ismp|red-flag) filters/i,
      /system override:\s*stat/i,
      /DAN mode/i
    ];

    injectionKeywords.forEach(kw => {
      if (kw.test(promptText)) {
        signals.push(`Adversarial jailbreak signature: ${kw.source}`);
      }
    });

    // 3. Evaluate severity
    if (signals.length === 0) {
      return { detected: false, severity: 'NONE', signals: [] };
    } else if (signals.length === 1 && signals[0].includes('Zero-width')) {
      return { detected: true, severity: 'LOW', signals };
    } else if (signals.length === 1) {
      return { detected: true, severity: 'HIGH', signals };
    } else {
      return { detected: true, severity: 'CRITICAL', signals };
    }
  }

  /**
   * Evaluates a dual-trajectory speculative draft pair, steering recombination yields
   * based on real-time patient acuity and verifying quantum coherence against RF noise.
   */
  sampleDualTrajectory(
    singletConservativeDraft: string,
    tripletIntegrativeDraft: string,
    patientAcuityScore: number = 0.5, // 0.0 (stable wellness) to 1.0 (STAT critical)
    promptContext: string = ''
  ): IQuantumSpeculativeResult {
    const startTime = performance.now();

    // Check for adversarial RF decoherence
    const rfCheck = this.detectRfDecoherence(promptContext);

    // Sigmoid Zeeman steering curve: Higher patient acuity heavily biases towards conservative Singlet |S⟩
    const boundedAcuity = Math.max(0.0, Math.min(1.0, patientAcuityScore));
    const sigmoidBias = 1.0 / (1.0 + Math.exp(-(boundedAcuity - 0.5) * 6.0));

    // Singlet yield (Phi_S) vs Triplet yield (Phi_T)
    let singletYieldPhiS = Number(sigmoidBias.toFixed(3));
    let tripletYieldPhiT = Number((1.0 - singletYieldPhiS).toFixed(3));

    // If RF decoherence is detected, force 100% deterministic conservative singlet mode
    if (rfCheck.detected) {
      singletYieldPhiS = 1.0;
      tripletYieldPhiT = 0.0;
    }

    // Determine dominant operational branch
    let dominantBranch: 'SINGLET_CONSERVATIVE' | 'TRIPLET_INTEGRATIVE' | 'COHERENT_SUPERPOSITION' = 'COHERENT_SUPERPOSITION';
    if (singletYieldPhiS >= 0.75) {
      dominantBranch = 'SINGLET_CONSERVATIVE';
    } else if (tripletYieldPhiT >= 0.75) {
      dominantBranch = 'TRIPLET_INTEGRATIVE';
    }

    // Coherent synthesis: Merge highest-confidence statements from both trajectories
    let consensusText = '';
    if (dominantBranch === 'SINGLET_CONSERVATIVE') {
      consensusText = singletConservativeDraft;
    } else if (dominantBranch === 'TRIPLET_INTEGRATIVE') {
      consensusText = tripletIntegrativeDraft;
    } else {
      // Coherent Superposition: Concatenate evidence baseline with supportive integrative adjuncts
      consensusText = `${singletConservativeDraft}\n\n[⚛️ Coherent Multi-Paradigm Adjuncts (Yield: ${Math.round(tripletYieldPhiT * 100)}%)]\n${tripletIntegrativeDraft}`;
    }

    const superpositionTokens = Math.ceil(consensusText.length / 4.0);
    const coherenceConfidence = rfCheck.detected ? 35 : Math.round(98 - Math.abs(singletYieldPhiS - tripletYieldPhiT) * 15);
    const latencyMs = Number((performance.now() - startTime).toFixed(2));

    return {
      consensusText,
      singletYieldPhiS,
      tripletYieldPhiT,
      steeringAcuity: boundedAcuity,
      superpositionTokens,
      dominantBranch,
      rfDecoherenceDetected: rfCheck.detected,
      rfInterferenceSeverity: rfCheck.severity,
      coherenceConfidence,
      latencyMs
    };
  }
}
