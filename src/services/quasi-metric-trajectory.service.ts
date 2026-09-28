/**
 * @file quasi-metric-trajectory.service.ts
 * @description Quasi-Metric Physiological State Trajectory Service.
 * 
 * Implements asymmetric directed distances d(A -> B) != d(B -> A) over clinical state spaces.
 * Degeneration (Health -> Injury) occurs along steep, low-barrier catastrophic pathways.
 * Reconstruction/Healing (Injury -> Health) requires stepped metabolic/mechanical rehabilitation energy:
 * d(Injury -> Health) >> d(Health -> Injury).
 */

import { Injectable } from '@angular/core';

export interface IClinicalStateVector {
  readonly structuralIntegrity: number; // [0, 1] 1 = intact tissue, 0 = complete disruption
  readonly inflammatoryLoad: number;    // [0, 1] 0 = quiescent, 1 = severe synovitis/effusion
  readonly functionalRange: number;      // [0, 1] 1 = 100% flexion/extension, 0 = locked joint
  readonly painInhibition: number;       // [0, 1] 0 = painless, 1 = severe weight-bearing block
}

export interface IQuasiTrajectoryHop {
  readonly fromState: string;
  readonly toState: string;
  readonly forwardCostEnergy: number;
  readonly reverseCostEnergy: number;
  readonly hysteresisIndex: number;
  readonly estimatedRehabWeeks: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuasiMetricTrajectoryService {
  /**
   * Computes asymmetric quasi-distance d(u -> v) between two clinical state vectors.
   * Uses asymmetric Finsler-type metric tensor weighting positive vs negative gradients.
   */
  public computeQuasiDistance(
    from: IClinicalStateVector,
    to: IClinicalStateVector,
    barrierFactor: number = 3.5
  ): number {
    // Structural repair requires high active energy (barrierFactor)
    const dStruct = to.structuralIntegrity - from.structuralIntegrity;
    const structCost = dStruct >= 0
      ? dStruct * barrierFactor   // Repairing cartilage/ligament is energetically uphill
      : Math.abs(dStruct) * 1.0;   // Tearing/rupture occurs rapidly downhill

    // Resolving inflammation requires active metabolic clearance
    const dInflam = to.inflammatoryLoad - from.inflammatoryLoad;
    const inflamCost = dInflam <= 0
      ? Math.abs(dInflam) * 2.0   // Reducing effusion takes time and lymph drainage
      : dInflam * 1.0;            // Flare occurs quickly

    // Restoring range of motion vs losing mobility
    const dRange = to.functionalRange - from.functionalRange;
    const rangeCost = dRange >= 0
      ? dRange * 2.5              // Physical therapy stretching barrier
      : Math.abs(dRange) * 0.8;

    // Desensitizing pain pathways
    const dPain = to.painInhibition - from.painInhibition;
    const painCost = dPain <= 0
      ? Math.abs(dPain) * 2.0     // Central sensitization de-escalation
      : dPain * 0.5;

    const totalQuasiDistance = Math.sqrt(
      Math.pow(structCost, 2) +
      Math.pow(inflamCost, 2) +
      Math.pow(rangeCost, 2) +
      Math.pow(painCost, 2)
    );

    return totalQuasiDistance;
  }

  /**
   * Computes the Hysteresis Ratio between forward and reverse transitions:
   * H = d(Injury -> Recovery) / (d(Recovery -> Injury) + eps)
   */
  public evaluateTransitionHysteresis(
    stateA: IClinicalStateVector,
    stateB: IClinicalStateVector,
    labelA: string = 'Current State',
    labelB: string = 'Target State'
  ): IQuasiTrajectoryHop {
    const forwardCost = this.computeQuasiDistance(stateA, stateB);
    const reverseCost = this.computeQuasiDistance(stateB, stateA);
    const hysteresis = forwardCost / (reverseCost + 1e-6);

    // Approximate stepped-care rehabilitation weeks based on forward cost
    const estimatedWeeks = Math.max(1, Math.round(forwardCost * 4.0));

    return {
      fromState: labelA,
      toState: labelB,
      forwardCostEnergy: forwardCost,
      reverseCostEnergy: reverseCost,
      hysteresisIndex: hysteresis,
      estimatedRehabWeeks: estimatedWeeks
    };
  }
}
