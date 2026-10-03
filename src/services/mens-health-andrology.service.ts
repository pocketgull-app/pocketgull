/**
 * @file mens-health-andrology.service.ts
 * @description Evidence-grounded Men's Health & Andrological Vitality Service.
 * Implements:
 * 1. The Princeton Consensus III Cardiovascular-Endothelial Risk Stratification (ED as microvascular CAD predictor).
 * 2. Hard ISMP Nitrate-PDE5 Inhibitor Co-Administration Fatal Hypotension Guard.
 * 3. International Prostate Symptom Score (IPSS, LOINC 80976-4) & Quality of Life (QoL) index.
 * 4. St. Louis University ADAM (Androgen Deficiency in the Aging Male) Screener & Circadian Hormone Invariants.
 * 5. PSA Velocity, Free/Total PSA ratio calibration & PI-RADS mpMRI triage.
 * 6. Standard FHIR R4 Bundle Export for Men's Urological/Cardiovascular Health.
 */

import { Injectable, signal, computed } from '@angular/core';

export type IpssSeverity = 'Mild (0-7)' | 'Moderate (8-19)' | 'Severe (20-35)';
export type PrincetonCvRiskTier = 'Low Risk' | 'Intermediate Risk' | 'High Risk';

export interface IIpssScoreResult {
  totalScore: number;
  qolScore: number; // 0 (Delighted) to 6 (Terrible)
  severity: IpssSeverity;
  clinicalAction: string;
}

export interface IPrincetonCvEvaluation {
  riskTier: PrincetonCvRiskTier;
  endothelialWarning: string;
  pde5PrescriptionSafe: boolean;
  nitrateContraindicationActive: boolean;
  recommendedDiagnostics: string[];
}

export interface IPsaInterpretation {
  totalPsaNgMl: number;
  freePsaPercent: number;
  psaVelocityNgMlYr: number;
  riskCategory: 'Normal Baseline' | 'Benign Hypertrophy / Indeterminate' | 'High Biopsy / mpMRI Indication';
  clinicalRecommendation: string;
}

export interface IAdamScreenerResult {
  positiveResponsesCount: number;
  libidoDecreased: boolean;
  erectionStrengthDecreased: boolean;
  isPositiveForHypogonadism: boolean;
  clinicalGuidance: string;
}

@Injectable({
  providedIn: 'root'
})
export class MensHealthAndrologyService {
  // IPSS 7-item scores (0-5 each) + 1 QoL score (0-6)
  // [Incomplete emptying, Frequency, Intermittency, Urgency, Weak stream, Straining, Nocturia]
  readonly ipssAnswers = signal<number[]>([1, 2, 1, 1, 2, 1, 2]); // default score = 10 (Moderate)
  readonly ipssQolAnswer = signal<number>(2); // 2 = Mostly satisfied

  // Cardiovascular & Medication Toggles
  readonly takesNitroglycerinOrNitrates = signal<boolean>(false);
  readonly hasKnownCadOrPriorMi = signal<boolean>(false);
  readonly hasPoorExerciseTolerance = signal<boolean>(false); // < 4 METs (cannot climb 2 flights of stairs)
  readonly systolicBp = signal<number>(128);
  readonly diastolicBp = signal<number>(82);

  // Urological & Andrological Biomarkers
  readonly totalPsa = signal<number>(2.4); // ng/mL
  readonly freePsaPercent = signal<number>(22); // %
  readonly priorYearPsa = signal<number>(2.1); // ng/mL for velocity calculation

  // ADAM 10-Item Questionnaire Booleans
  // [1: Libido drop, 2: Energy lack, 3: Strength decrease, 4: Height loss, 5: Life enjoyment drop,
  //  6: Sad/grumpy, 7: Erection strength drop, 8: Sports ability drop, 9: Falling asleep after dinner, 10: Work performance drop]
  readonly adamAnswers = signal<boolean[]>([
    true,  // 1: Decreased libido
    true,  // 2: Lack of energy
    false, // 3: Decreased strength
    false, // 4: Lost height
    false, // 5: Decreased enjoyment of life
    false, // 6: Sad/grumpy
    true,  // 7: Erections less strong
    false, // 8: Deterioration in sports
    true,  // 9: Falling asleep after dinner
    false  // 10: Work performance deterioration
  ]);

  /**
   * Evaluates International Prostate Symptom Score (IPSS)
   */
  readonly ipssScore = computed<IIpssScoreResult>(() => {
    const answers = this.ipssAnswers();
    const qol = this.ipssQolAnswer();
    const total = answers.reduce((sum, val) => sum + val, 0);

    let severity: IpssSeverity = 'Mild (0-7)';
    let action = 'Watchful waiting; lifestyle modifications (limit evening fluid/caffeine/alcohol intake).';

    if (total >= 20) {
      severity = 'Severe (20-35)';
      action = 'Urology referral indicated. Consider alpha-blockers (tamsulosin) and/or 5-ARIs (finasteride) or surgical intervention.';
    } else if (total >= 8) {
      severity = 'Moderate (8-19)';
      action = 'Medical therapy candidate. Assess baseline prostate volume and discuss alpha-1-adrenergic receptor antagonists.';
    }

    return {
      totalScore: total,
      qolScore: qol,
      severity,
      clinicalAction: action
    };
  });

  /**
   * Evaluates Cardiovascular Risk per Princeton Consensus Conference III
   */
  readonly princetonEvaluation = computed<IPrincetonCvEvaluation>(() => {
    const nitrates = this.takesNitroglycerinOrNitrates();
    const priorMi = this.hasKnownCadOrPriorMi();
    const poorMets = this.hasPoorExerciseTolerance();
    const sbp = this.systolicBp();
    const dbp = this.diastolicBp();

    const isHighRisk = priorMi || poorMets || sbp >= 160 || dbp >= 100;
    const isIntermediate = !isHighRisk && (sbp >= 140 || dbp >= 90);

    let riskTier: PrincetonCvRiskTier = 'Low Risk';
    if (isHighRisk) riskTier = 'High Risk';
    else if (isIntermediate) riskTier = 'Intermediate Risk';

    let warning = 'Penile cavernosal vessels (1-2mm) mirror coronary microvasculature. Low global cardiovascular risk profile.';
    if (riskTier === 'High Risk') {
      warning = 'CRITICAL: High cardiovascular risk. Sexual activity and PDE5 inhibitors are deferred pending comprehensive cardiac evaluation / stress testing.';
    } else if (riskTier === 'Intermediate Risk') {
      warning = 'Intermediate risk. Recommend exercise treadmill stress testing and coronary artery calcium (CAC) scan before PDE5 initiation.';
    }

    const pde5PrescriptionSafe = !nitrates && riskTier !== 'High Risk';

    return {
      riskTier,
      endothelialWarning: warning,
      pde5PrescriptionSafe,
      nitrateContraindicationActive: nitrates,
      recommendedDiagnostics: [
        'Apolipoprotein B (ApoB) & High-Sensitivity CRP (hs-CRP)',
        'Coronary Artery Calcium (CAC) CT scan',
        'Fasting Lipid Panel & Morning Total/Free Testosterone',
        'Exercise Treadmill Stress ECG (if intermediate/high risk)'
      ]
    };
  });

  /**
   * Interprets PSA Biomarker & Velocity
   */
  readonly psaInterpretation = computed<IPsaInterpretation>(() => {
    const total = this.totalPsa();
    const freePct = this.freePsaPercent();
    const prior = this.priorYearPsa();
    const velocity = +(total - prior).toFixed(2);

    let category: 'Normal Baseline' | 'Benign Hypertrophy / Indeterminate' | 'High Biopsy / mpMRI Indication' = 'Normal Baseline';
    let recommendation = 'Age-appropriate surveillance. Repeat PSA in 12-24 months.';

    if (total > 10.0 || velocity > 0.75 || (total >= 4.0 && freePct < 10)) {
      category = 'High Biopsy / mpMRI Indication';
      recommendation = 'Urgent multiparametric prostate MRI (mpMRI with PI-RADS scoring) and urological consultation. Elevated malignancy index.';
    } else if (total >= 4.0 || (total >= 2.5 && freePct < 15)) {
      category = 'Benign Hypertrophy / Indeterminate';
      recommendation = 'Indeterminate zone (PSA 4-10 ng/mL). Evaluate free-to-total PSA ratio, prostate volume (PSA density), and consider mpMRI before blind biopsy.';
    }

    return {
      totalPsaNgMl: total,
      freePsaPercent: freePct,
      psaVelocityNgMlYr: velocity,
      riskCategory: category,
      clinicalRecommendation: recommendation
    };
  });

  /**
   * Evaluates St. Louis ADAM Questionnaire for Androgen Deficiency
   * Positive if: Item 1 (libido) OR Item 7 (erection strength) is YES, OR any 3 other items are YES.
   */
  readonly adamResult = computed<IAdamScreenerResult>(() => {
    const answers = this.adamAnswers();
    const libido = answers[0];
    const erections = answers[6];

    let otherCount = 0;
    answers.forEach((ans, idx) => {
      if (idx !== 0 && idx !== 6 && ans) otherCount++;
    });

    const isPositive = libido || erections || otherCount >= 3;
    const totalCount = answers.filter(Boolean).length;

    let guidance = 'Screening negative for clinical androgen deficiency. Maintain metabolic resistance training and restorative sleep hygiene.';
    if (isPositive) {
      guidance = 'Screening POSITIVE for symptomatic hypogonadism. Requires two separate morning (8:00–10:00 AM) fasting total & free testosterone draws before diagnosing hypogonadism.';
    }

    return {
      positiveResponsesCount: totalCount,
      libidoDecreased: libido,
      erectionStrengthDecreased: erections,
      isPositiveForHypogonadism: isPositive,
      clinicalGuidance: guidance
    };
  });

  // Mutator methods
  setIpssAnswer(index: number, score: number): void {
    const updated = [...this.ipssAnswers()];
    updated[index] = Math.max(0, Math.min(5, score));
    this.ipssAnswers.set(updated);
  }

  setIpssQol(score: number): void {
    this.ipssQolAnswer.set(Math.max(0, Math.min(6, score)));
  }

  setAdamAnswer(index: number, value: boolean): void {
    const updated = [...this.adamAnswers()];
    updated[index] = value;
    this.adamAnswers.set(updated);
  }

  setNitrateUsage(active: boolean): void {
    this.takesNitroglycerinOrNitrates.set(active);
  }

  setPriorMi(active: boolean): void {
    this.hasKnownCadOrPriorMi.set(active);
  }

  setPsaValues(total: number, freePct: number, prior: number): void {
    this.totalPsa.set(total);
    this.freePsaPercent.set(freePct);
    this.priorYearPsa.set(prior);
  }

  /**
   * Exports Men's Health Assessment as standard FHIR R4 Bundle
   */
  exportFhirR4MensHealthBundle(patientId: string = 'homo-sapiens-male-58y'): Record<string, any> {
    const timestamp = new Date().toISOString();
    const ipss = this.ipssScore();
    const psa = this.psaInterpretation();
    const princeton = this.princetonEvaluation();

    const ipssObsId = `obs-ipss-${Date.now()}`;
    const psaObsId = `obs-psa-${Date.now()}`;

    return {
      resourceType: 'Bundle',
      id: `bundle-mens-health-${Date.now()}`,
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/StructureDefinition/bundle']
      },
      type: 'collection',
      entry: [
        {
          fullUrl: `urn:uuid:${ipssObsId}`,
          resource: {
            resourceType: 'Observation',
            id: ipssObsId,
            status: 'final',
            code: {
              coding: [{ system: 'http://loinc.org', code: '80976-4', display: 'International Prostate Symptom Score [IPSS]' }]
            },
            subject: { reference: `Patient/${patientId}` },
            valueInteger: ipss.totalScore,
            interpretation: [{ text: ipss.severity }],
            note: [{ text: ipss.clinicalAction }]
          }
        },
        {
          fullUrl: `urn:uuid:${psaObsId}`,
          resource: {
            resourceType: 'Observation',
            id: psaObsId,
            status: 'final',
            code: {
              coding: [{ system: 'http://loinc.org', code: '2857-1', display: 'Prostate specific Ag [Mass/volume] in Serum or Plasma' }]
            },
            subject: { reference: `Patient/${patientId}` },
            valueQuantity: {
              value: psa.totalPsaNgMl,
              unit: 'ng/mL',
              system: 'http://unitsofmeasure.org',
              code: 'ng/mL'
            },
            interpretation: [{ text: psa.riskCategory }],
            note: [{ text: `Free PSA: ${psa.freePsaPercent}%. Velocity: ${psa.psaVelocityNgMlYr} ng/mL/yr. Princeton CV Tier: ${princeton.riskTier}.` }]
          }
        }
      ]
    };
  }
}
