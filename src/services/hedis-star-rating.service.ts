import { Injectable, signal, computed } from '@angular/core';

export type HedisMeasureId = 
  | 'CBP' // Controlling High Blood Pressure (<140/90 mmHg)
  | 'HBD' // Hemoglobin A1c Control for Patients With Diabetes (<=8.0%)
  | 'MAD' // Medication Adherence for Diabetes (PDC >= 80%)
  | 'MAH' // Medication Adherence for Hypertension / RAS (PDC >= 80%)
  | 'MAS' // Medication Adherence for Cholesterol / Statins (PDC >= 80%)
  | 'COL' // Colorectal Cancer Screening
  | 'EED';// Eye Exam for Patients With Diabetes

export interface IHedisMeasureResult {
  id: HedisMeasureId;
  name: string;
  category: 'Triple-Weighted Adherence' | 'Clinical Outcome' | 'Preventive Screening';
  weight: number; // 1x or 3x triple-weighted adherence for Star Ratings
  isMet: boolean;
  currentValueDisplay: string;
  targetThresholdDisplay: string;
  starRating: number; // 1 to 5 Stars
  careGapDirective?: string;
}

export interface IHedisOverallSummary {
  patientId: string;
  overallStarRating: number; // Composite 1.0 to 5.0
  isQualityBonusEligible: boolean; // >= 4.0 Stars qualifies for CMS Quality Bonus Payment (QBP)
  estQbpBonusPerMemberAnnual: number; // e.g. ~$500/member/yr for 4+ stars
  activeCareGapsCount: number;
  measures: IHedisMeasureResult[];
  summaryDirective: string;
}

@Injectable({
  providedIn: 'root'
})
export class HedisStarRatingService {

  /**
   * Calculates Proportion of Days Covered (PDC) percentage for medication adherence.
   */
  public calculatePdc(daysSupplyRefilled: number, totalDaysInPeriod: number = 365): number {
    if (totalDaysInPeriod <= 0) return 0;
    const pdc = (daysSupplyRefilled / totalDaysInPeriod) * 100;
    return Math.min(100, Math.max(0, pdc));
  }

  /**
   * Evaluates CMS 1-5 Star Rating based on PDC percentage.
   * CMS standard cutpoints: 5 Stars >=85%, 4 Stars >=80%, 3 Stars >=75%, 2 Stars >=70%, 1 Star <70%.
   */
  public getStarRatingForPdc(pdc: number): number {
    if (pdc >= 85) return 5;
    if (pdc >= 80) return 4;
    if (pdc >= 75) return 3;
    if (pdc >= 70) return 2;
    return 1;
  }

  /**
   * Evaluates individual HEDIS measures for a patient profile.
   */
  public evaluatePatientHedisMeasures(profile: {
    systolicBp?: number;
    diastolicBp?: number;
    hbA1c?: number;
    diabetesRefillDays?: number;
    hypertensionRefillDays?: number;
    statinRefillDays?: number;
    hasColorectalScreening?: boolean;
    hasDiabeticEyeExam?: boolean;
    hasDiabetes?: boolean;
    hasHypertension?: boolean;
  }): IHedisMeasureResult[] {
    const results: IHedisMeasureResult[] = [];

    // 1. Controlling High Blood Pressure (CBP)
    if (profile.hasHypertension || profile.systolicBp !== undefined) {
      const sbp = profile.systolicBp ?? 130;
      const dbp = profile.diastolicBp ?? 82;
      const isMet = sbp < 140 && dbp < 90;
      results.push({
        id: 'CBP',
        name: 'Controlling High Blood Pressure',
        category: 'Clinical Outcome',
        weight: 3,
        isMet,
        currentValueDisplay: `${sbp}/${dbp} mmHg`,
        targetThresholdDisplay: '< 140/90 mmHg',
        starRating: isMet ? 5 : 2,
        careGapDirective: isMet ? undefined : 'BP is >= 140/90 mmHg. Re-evaluate antihypertensive titration or DASH lifestyle adjuncts.'
      });
    }

    // 2. HbA1c Control for Patients With Diabetes (HBD)
    if (profile.hasDiabetes || profile.hbA1c !== undefined) {
      const a1c = profile.hbA1c ?? 7.2;
      const isMet = a1c <= 8.0;
      results.push({
        id: 'HBD',
        name: 'Hemoglobin A1c Control (<=8.0%)',
        category: 'Clinical Outcome',
        weight: 3,
        isMet,
        currentValueDisplay: `${a1c.toFixed(1)}%`,
        targetThresholdDisplay: '<= 8.0%',
        starRating: a1c <= 7.0 ? 5 : (a1c <= 8.0 ? 4 : 1),
        careGapDirective: isMet ? undefined : 'HbA1c > 8.0%. Schedule GLP-1/SGLT2 co-formulation consult and dietary audit.'
      });
    }

    // 3. Medication Adherence for Diabetes (MAD - Triple Weighted)
    if (profile.hasDiabetes || profile.diabetesRefillDays !== undefined) {
      const pdc = this.calculatePdc(profile.diabetesRefillDays ?? 310);
      const isMet = pdc >= 80;
      results.push({
        id: 'MAD',
        name: 'Medication Adherence for Diabetes (PDC)',
        category: 'Triple-Weighted Adherence',
        weight: 3,
        isMet,
        currentValueDisplay: `${pdc.toFixed(1)}% PDC`,
        targetThresholdDisplay: '>= 80.0% PDC',
        starRating: this.getStarRatingForPdc(pdc),
        careGapDirective: isMet ? undefined : `PDC is ${pdc.toFixed(1)}% (<80%). Enroll patient in auto-refill & MPPP monthly payment plan.`
      });
    }

    // 4. Medication Adherence for RAS Antagonists (MAH - Triple Weighted)
    if (profile.hasHypertension || profile.hypertensionRefillDays !== undefined) {
      const pdc = this.calculatePdc(profile.hypertensionRefillDays ?? 300);
      const isMet = pdc >= 80;
      results.push({
        id: 'MAH',
        name: 'Medication Adherence for RAS Antagonists (PDC)',
        category: 'Triple-Weighted Adherence',
        weight: 3,
        isMet,
        currentValueDisplay: `${pdc.toFixed(1)}% PDC`,
        targetThresholdDisplay: '>= 80.0% PDC',
        starRating: this.getStarRatingForPdc(pdc),
        careGapDirective: isMet ? undefined : `PDC is ${pdc.toFixed(1)}% (<80%). Set 90-day mail-order pharmacy refill preference.`
      });
    }

    // 5. Medication Adherence for Statins (MAS - Triple Weighted)
    if (profile.statinRefillDays !== undefined) {
      const pdc = this.calculatePdc(profile.statinRefillDays);
      const isMet = pdc >= 80;
      results.push({
        id: 'MAS',
        name: 'Medication Adherence for Cholesterol / Statins (PDC)',
        category: 'Triple-Weighted Adherence',
        weight: 3,
        isMet,
        currentValueDisplay: `${pdc.toFixed(1)}% PDC`,
        targetThresholdDisplay: '>= 80.0% PDC',
        starRating: this.getStarRatingForPdc(pdc),
        careGapDirective: isMet ? undefined : `PDC is ${pdc.toFixed(1)}% (<80%). Review statin intolerance symptoms and optimize dose.`
      });
    }

    // 6. Colorectal Cancer Screening (COL)
    const colMet = profile.hasColorectalScreening ?? true;
    results.push({
      id: 'COL',
      name: 'Colorectal Cancer Screening',
      category: 'Preventive Screening',
      weight: 1,
      isMet: colMet,
      currentValueDisplay: colMet ? 'Screening Documented' : 'Missing Screening',
      targetThresholdDisplay: 'Colonoscopy / FIT / Cologuard Up to Date',
      starRating: colMet ? 5 : 1,
      careGapDirective: colMet ? undefined : 'CARE GAP: No active colorectal screening on file. Order non-invasive stool DNA test.'
    });

    // 7. Diabetic Eye Exam (EED)
    if (profile.hasDiabetes) {
      const eedMet = profile.hasDiabeticEyeExam ?? true;
      results.push({
        id: 'EED',
        name: 'Diabetic Retinal Eye Exam',
        category: 'Preventive Screening',
        weight: 1,
        isMet: eedMet,
        currentValueDisplay: eedMet ? 'Dilated Retinal Exam Complete' : 'Exam Overdue',
        targetThresholdDisplay: 'Annual Retinal Examination',
        starRating: eedMet ? 5 : 1,
        careGapDirective: eedMet ? undefined : 'CARE GAP: Overdue for annual diabetic retinal eye exam. Refer to optometrist/ophthalmologist.'
      });
    }

    return results;
  }

  /**
   * Generates composite HEDIS Star Rating overview and CMS Quality Bonus Payment (QBP) assessment.
   */
  public generateOverallSummary(patientId: string, profile: Parameters<typeof this.evaluatePatientHedisMeasures>[0]): IHedisOverallSummary {
    const measures = this.evaluatePatientHedisMeasures(profile);
    
    // Calculate weighted average Star Rating
    let totalWeightedStars = 0;
    let totalWeight = 0;
    let careGaps = 0;

    for (const m of measures) {
      totalWeightedStars += m.starRating * m.weight;
      totalWeight += m.weight;
      if (!m.isMet) careGaps++;
    }

    const overallStarRating = totalWeight > 0 ? Number((totalWeightedStars / totalWeight).toFixed(1)) : 5.0;
    const isQualityBonusEligible = overallStarRating >= 4.0;
    const estQbpBonusPerMemberAnnual = isQualityBonusEligible ? 500 : 0;

    let summaryDirective = '';
    if (careGaps === 0) {
      summaryDirective = `🌟 EXCELLENT QUALITY: 0 Care Gaps. Overall ${overallStarRating} Star Rating qualifies plan for CMS Quality Bonus Payment (~$500/member/yr).`;
    } else {
      summaryDirective = `⚠️ ${careGaps} ACTIVE CARE GAP(S): Overall ${overallStarRating} Star Rating. Address triple-weighted adherence gaps to unlock 4+ Star CMS Bonus eligibility.`;
    }

    return {
      patientId,
      overallStarRating,
      isQualityBonusEligible,
      estQbpBonusPerMemberAnnual,
      activeCareGapsCount: careGaps,
      measures,
      summaryDirective
    };
  }
}
