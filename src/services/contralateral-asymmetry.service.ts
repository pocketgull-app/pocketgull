/**
 * @file contralateral-asymmetry.service.ts
 * @description Contralateral Bilateral Asymmetry Service for Musculoskeletal & Neurovascular Evaluation.
 * 
 * Computes bilateral Left vs Right anatomical loading asymmetry indices:
 * Index = (L - R) / ((|L| + |R|) / 2 + eps)
 */

import { Injectable } from '@angular/core';

export interface IBilateralJointInput {
  readonly medialJointSpaceMm: number;
  readonly lateralJointSpaceMm: number;
  readonly meniscalExtrusionMm: number;
  readonly cartilageThicknessMm: number;
  readonly subchondralBmlScore: number;
}

export interface IBilateralAsymmetryReport {
  readonly jointSpaceAsymmetryIndex: number;
  readonly meniscalExtrusionAsymmetryIndex: number;
  readonly cartilageWearAsymmetryIndex: number;
  readonly overallKineticAsymmetryIndex: number;
  readonly dominantSide: 'Left Dominant' | 'Right Dominant' | 'Bilateral Symmetric';
  readonly mechanicalAlignmentRisk: 'Varus Overload' | 'Valgus Overload' | 'Neutral Balanced';
  readonly clinicalRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContralateralAsymmetryService {
  private readonly eps = 1e-6;

  public computeAsymmetryIndex(left: number, right: number): number {
    const mean = (Math.abs(left) + Math.abs(right)) / 2.0 + this.eps;
    return (left - right) / mean;
  }

  public evaluateBilateralKnees(
    left: IBilateralJointInput,
    right: IBilateralJointInput
  ): IBilateralAsymmetryReport {
    // Joint space narrowing (JSN): lower space = more wear
    const jsnLeft = 5.0 - left.medialJointSpaceMm;
    const jsnRight = 5.0 - right.medialJointSpaceMm;
    const jsnAsym = this.computeAsymmetryIndex(jsnLeft, jsnRight);

    const extAsym = this.computeAsymmetryIndex(left.meniscalExtrusionMm, right.meniscalExtrusionMm);
    const cartAsym = this.computeAsymmetryIndex(
      5.0 - left.cartilageThicknessMm,
      5.0 - right.cartilageThicknessMm
    );

    const kineticAsym = 0.4 * jsnAsym + 0.35 * extAsym + 0.25 * cartAsym;

    let dominantSide: 'Left Dominant' | 'Right Dominant' | 'Bilateral Symmetric' = 'Bilateral Symmetric';
    if (kineticAsym > 0.15) {
      dominantSide = 'Left Dominant';
    } else if (kineticAsym < -0.15) {
      dominantSide = 'Right Dominant';
    }

    // Varus vs Valgus check
    const medialWearL = left.medialJointSpaceMm < left.lateralJointSpaceMm;
    const medialWearR = right.medialJointSpaceMm < right.lateralJointSpaceMm;
    let alignment: 'Varus Overload' | 'Valgus Overload' | 'Neutral Balanced' = 'Neutral Balanced';
    if (medialWearL || medialWearR) {
      alignment = 'Varus Overload';
    } else if (left.lateralJointSpaceMm < left.medialJointSpaceMm || right.lateralJointSpaceMm < right.medialJointSpaceMm) {
      alignment = 'Valgus Overload';
    }

    let recommendation = 'Bilateral mechanical load is well-balanced across lower extremities.';
    if (dominantSide !== 'Bilateral Symmetric') {
      recommendation = `Significant ${dominantSide} kinetic overload detected (Index: ${kineticAsym.toFixed(2)}). Prescribe unilateral kinetic offloader wedge and unweighted gait retraining.`;
    }

    return {
      jointSpaceAsymmetryIndex: jsnAsym,
      meniscalExtrusionAsymmetryIndex: extAsym,
      cartilageWearAsymmetryIndex: cartAsym,
      overallKineticAsymmetryIndex: kineticAsym,
      dominantSide,
      mechanicalAlignmentRisk: alignment,
      clinicalRecommendation: recommendation
    };
  }
}
