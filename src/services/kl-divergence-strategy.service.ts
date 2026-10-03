/**
 * @file kl-divergence-strategy.service.ts
 * @description Information-Theoretic KL Divergence Strategy Engine.
 * 
 * Enforces the formal distinction between:
 * - Forward KL (Mode-Covering): D_KL(P || Q) ensures all plausible differential diagnoses
 *   are covered without missing rare, high-stakes etiologies.
 * - Reverse KL (Mode-Seeking): D_KL(Q || P) focuses on the single most probable, conservative,
 *   low-entropy clinical order or surgical plan to eliminate hallucinatory over-treatment.
 */

import { Injectable } from '@angular/core';

export type KlRoutingMode = 'forward_mode_covering' | 'reverse_mode_seeking' | 'symmetric_jensen_shannon';

export interface IDifferentialCandidate {
  readonly conditionName: string;
  readonly probability: number;
  readonly clinicalAcuity: 'STAT_EMERGENCY' | 'URGENT' | 'ROUTINE';
  readonly icd10Code?: string;
}

export interface IEntropyRoutingResult {
  readonly mode: KlRoutingMode;
  readonly forwardKlDivergence: number;
  readonly reverseKlDivergence: number;
  readonly jensenShannonDistance: number;
  readonly prioritizedDifferential: readonly IDifferentialCandidate[];
  readonly entropyBits: number;
  readonly rationale: string;
}

@Injectable({
  providedIn: 'root'
})
export class KlDivergenceStrategyService {
  private readonly eps = 1e-7;

  /**
   * Computes Forward KL: D_KL(P || Q) = sum(P(x) * log(P(x) / Q(x)))
   * Penalizes Q(x) = 0 when P(x) > 0 -> Mode-covering.
   */
  public computeForwardKl(p: number[], q: number[]): number {
    this.validateProbabilities(p, q);
    let kl = 0;
    for (let i = 0; i < p.length; i++) {
      const pi = Math.max(p[i], this.eps);
      const qi = Math.max(q[i], this.eps);
      kl += pi * Math.log2(pi / qi);
    }
    return Math.max(0, kl);
  }

  /**
   * Computes Reverse KL: D_KL(Q || P) = sum(Q(x) * log(Q(x) / P(x)))
   * Penalizes Q(x) > 0 when P(x) = 0 -> Mode-seeking (avoids zero-support regions).
   */
  public computeReverseKl(p: number[], q: number[]): number {
    return this.computeForwardKl(q, p);
  }

  /**
   * Computes Symmetric Jensen-Shannon Distance: sqrt(0.5 * D_KL(P || M) + 0.5 * D_KL(Q || M))
   */
  public computeJensenShannonDistance(p: number[], q: number[]): number {
    this.validateProbabilities(p, q);
    const m: number[] = [];
    for (let i = 0; i < p.length; i++) {
      m.push(0.5 * (p[i] + q[i]));
    }
    const klPm = this.computeForwardKl(p, m);
    const klQm = this.computeForwardKl(q, m);
    const jsd = 0.5 * klPm + 0.5 * klQm;
    return Math.sqrt(Math.max(0, jsd));
  }

  /**
   * Evaluates and routes a clinical differential distribution according to target clinical intent.
   */
  public routeDifferentialStrategy(
    rawCandidates: readonly IDifferentialCandidate[],
    targetMode: KlRoutingMode
  ): IEntropyRoutingResult {
    if (rawCandidates.length === 0) {
      return {
        mode: targetMode,
        forwardKlDivergence: 0,
        reverseKlDivergence: 0,
        jensenShannonDistance: 0,
        prioritizedDifferential: [],
        entropyBits: 0,
        rationale: 'No candidates provided.'
      };
    }

    // Normalize raw probabilities
    const sumP = rawCandidates.reduce((acc, c) => acc + c.probability, 0) || 1.0;
    const normalized = rawCandidates.map(c => ({
      ...c,
      probability: c.probability / sumP
    }));

    const pDist = normalized.map(c => c.probability);
    const uniformDist = new Array(normalized.length).fill(1 / normalized.length);

    const fKl = this.computeForwardKl(pDist, uniformDist);
    const rKl = this.computeReverseKl(pDist, uniformDist);
    const jsd = this.computeJensenShannonDistance(pDist, uniformDist);

    // Compute Shannon Entropy in bits
    const entropy = -pDist.reduce((acc, p) => {
      const safeP = Math.max(p, this.eps);
      return acc + safeP * Math.log2(safeP);
    }, 0);

    let prioritized: IDifferentialCandidate[];
    let rationale: string;

    if (targetMode === 'forward_mode_covering') {
      // Retain all non-negligible tail possibilities (coverage > 2%)
      prioritized = normalized
        .filter(c => c.probability >= 0.02 || c.clinicalAcuity === 'STAT_EMERGENCY')
        .sort((a, b) => b.probability - a.probability);
      rationale = 'Forward KL Mode-Covering: Enforces broad differential exploration to prevent catastrophic false negatives on acute conditions.';
    } else if (targetMode === 'reverse_mode_seeking') {
      // Focus strictly on the dominant mode(s) with highest confidence (> 15% or top 2)
      const sorted = [...normalized].sort((a, b) => b.probability - a.probability);
      prioritized = sorted.slice(0, Math.min(2, sorted.length)).filter(c => c.probability >= 0.15);
      if (prioritized.length === 0 && sorted.length > 0) {
        prioritized = [sorted[0]];
      }
      rationale = 'Reverse KL Mode-Seeking: Concentrates on primary high-confidence mode for safe, un-hallucinated clinical order commitment.';
    } else {
      prioritized = [...normalized].sort((a, b) => b.probability - a.probability);
      rationale = 'Symmetric Jensen-Shannon: Balanced consensus representation.';
    }

    return {
      mode: targetMode,
      forwardKlDivergence: fKl,
      reverseKlDivergence: rKl,
      jensenShannonDistance: jsd,
      prioritizedDifferential: prioritized,
      entropyBits: entropy,
      rationale
    };
  }

  private validateProbabilities(p: number[], q: number[]): void {
    if (p.length !== q.length || p.length === 0) {
      throw new Error(`Dimension mismatch: p (${p.length}) vs q (${q.length})`);
    }
  }
}
