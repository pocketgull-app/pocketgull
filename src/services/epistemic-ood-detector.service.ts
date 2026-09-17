import { Injectable } from '@angular/core';

export interface IOodEvaluationResult {
  isOod: boolean;
  domain: string;
  mahalanobisDistanceSquared: number;
  criticalThreshold: number;
  action: 'PROCEED' | 'ABSTAIN_OUT_OF_DISTRIBUTION';
  clinicalAdvisory: string;
}

@Injectable({
  providedIn: 'root'
})
export class EpistemicOodDetectorService {
  /**
   * Evaluates Mahalanobis distance squared against reference distribution parameters
   * for clinical domain safety.
   */
  evaluateInputDistribution(
    domain: 'METABOLIC' | 'ANTICHOLINERGIC_DELIRIUM' | 'MS_PIRA' | 'ORAL_SYSTEMIC',
    features: number[]
  ): IOodEvaluationResult {
    // Reference centroid and diagonal variances based on calibrated clinical cohort
    let centroid: number[] = [];
    let variances: number[] = [];
    let criticalThreshold = 16.27; // Chi-square critical value for alpha=0.001 (df=3)

    switch (domain) {
      case 'METABOLIC':
        // features: [age, crcl, baseline_cyp_clearance]
        centroid = [52.0, 85.0, 75.0];
        variances = [250.0, 400.0, 300.0];
        criticalThreshold = 16.27;
        break;

      case 'ANTICHOLINERGIC_DELIRIUM':
        // features: [age, crcl, acb_score, prior_falls]
        centroid = [74.0, 48.0, 2.5, 0.8];
        variances = [80.0, 200.0, 2.5, 1.2];
        criticalThreshold = 18.47; // df=4
        break;

      case 'MS_PIRA':
        // features: [age, baseline_edss, s_nfl, t2_lesion_volume]
        centroid = [38.0, 2.5, 12.0, 8.5];
        variances = [120.0, 1.8, 45.0, 25.0];
        criticalThreshold = 18.47; // df=4
        break;

      case 'ORAL_SYSTEMIC':
        // features: [max_ppd, sibi_index, hs_crp]
        centroid = [4.2, 45.0, 2.8];
        variances = [1.5, 180.0, 3.5];
        criticalThreshold = 16.27; // df=3
        break;
    }

    if (features.length !== centroid.length) {
      return {
        isOod: true,
        domain,
        mahalanobisDistanceSquared: 999.0,
        criticalThreshold,
        action: 'ABSTAIN_OUT_OF_DISTRIBUTION',
        clinicalAdvisory: `Feature dimension mismatch: expected ${centroid.length}, received ${features.length}.`
      };
    }

    // Compute diagonal Mahalanobis distance squared: D_M² = sum((x_i - mu_i)^2 / var_i)
    let d2 = 0;
    for (let i = 0; i < features.length; i++) {
      const diff = features[i] - centroid[i];
      d2 += (diff * diff) / variances[i];
    }

    const isOod = d2 > criticalThreshold;

    return {
      isOod,
      domain,
      mahalanobisDistanceSquared: Number(d2.toFixed(2)),
      criticalThreshold: Number(criticalThreshold.toFixed(2)),
      action: isOod ? 'ABSTAIN_OUT_OF_DISTRIBUTION' : 'PROCEED',
      clinicalAdvisory: isOod
        ? `ALERT: Patient features lie outside verified clinical training manifold (D_M²=${d2.toFixed(1)} > ${criticalThreshold.toFixed(1)}). Automated inference abstained.`
        : 'Observation lies safely within verified clinical distribution.'
    };
  }
}
