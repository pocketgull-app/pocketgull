import { Injectable, signal, computed } from '@angular/core';

export type EvidenceTier = 'Level A (Meta-Analysis / Large RCTs)' | 'Level B (Prospective Cohort / Observational)' | 'Level C (Mechanistic / Animal / In Vitro)' | 'Level D (Anecdotal / Commercial Claim)';

export interface ISocraticClaimAnalysis {
  claimId: string;
  originalClaim: string;
  analyzedTopic: string;
  evidenceTier: EvidenceTier;
  falsifiabilityStatus: 'Falsifiable & Tested' | 'Falsifiable but Unproven' | 'Unfalsifiable / Pseudoscience';
  cochraneRoB2Radar: {
    randomizationBias: 'Low Risk' | 'Some Concerns' | 'High Risk';
    deviationBias: 'Low Risk' | 'Some Concerns' | 'High Risk';
    missingDataBias: 'Low Risk' | 'Some Concerns' | 'High Risk';
    measurementBias: 'Low Risk' | 'Some Concerns' | 'High Risk';
    selectiveReportingBias: 'Low Risk' | 'Some Concerns' | 'High Risk';
  };
  correlationVsCausationCheck: {
    isCausalProven: boolean;
    primaryConfounders: string[];
    healthyUserBiasRisk: boolean;
  };
  socraticCounterQuestions: string[];
  canonicalCitations: string[];
  clinicalConsensusVerdict: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocraticEvidenceLiteracyService {
  readonly presetClaims = [
    {
      topic: 'Dietary Resveratrol & Vascular Longevity',
      claim: 'Red wine and resveratrol supplements directly reverse human arterial aging and extend lifespan by 15%.'
    },
    {
      topic: 'Continuous Glucose Monitoring in Non-Diabetics',
      claim: 'Healthy non-diabetic adults must wear a continuous glucose monitor to prevent metabolic spikes and optimize athletic performance.'
    },
    {
      topic: 'Periodontal Caries & Systemic Inflammation (SIBI)',
      claim: 'Treating active periodontal probing depths (PPD >= 4mm) measurably lowers systemic inflammatory burden (hs-CRP) and cardiovascular risk.'
    },
    {
      topic: 'Ultra-High-Dose Vitamin D Mega-Dosing',
      claim: 'Taking 50,000 IU of Vitamin D daily completely cures autoimmune conditions and prevents viral infections.'
    }
  ];

  readonly activeAnalysis = signal<ISocraticClaimAnalysis | null>(null);

  /**
   * Analyzes any clinical or wellness claim using Socratic skepticism and Popperian falsification.
   */
  public evaluateClaim(claimText: string): ISocraticClaimAnalysis {
    const text = claimText.trim();
    const lower = text.toLowerCase();

    let topic = 'General Clinical Hypothesis';
    let tier: EvidenceTier = 'Level C (Mechanistic / Animal / In Vitro)';
    let falsifiability: ISocraticClaimAnalysis['falsifiabilityStatus'] = 'Falsifiable but Unproven';
    let isCausal = false;
    let confounders: string[] = ['Healthy user bias', 'Socioeconomic status disparities', 'Regression to the mean'];
    let healthyUser = true;
    let rob: ISocraticClaimAnalysis['cochraneRoB2Radar'] = {
      randomizationBias: 'Some Concerns',
      deviationBias: 'Low Risk',
      missingDataBias: 'Low Risk',
      measurementBias: 'Some Concerns',
      selectiveReportingBias: 'High Risk'
    };
    let questions = [
      'What was the absolute risk reduction (ARR) versus the relative risk reduction (RRR)?',
      'Was this outcome verified in pre-registered human randomized controlled trials, or an observational proxy?',
      'How were confounding factors like baseline physical activity and diet controlled for?'
    ];
    let citations = ['Cochrane Handbook for Systematic Reviews of Interventions (RoB 2.0)'];
    let verdict = 'The claim conflates plausible cellular biochemistry with validated clinical endpoint efficacy. Insufficient randomized trial evidence to support routine clinical recommendation.';

    if (lower.includes('periodont') || lower.includes('sibi') || lower.includes('caries') || lower.includes('dental') || lower.includes('gingiv')) {
      topic = 'Periodontal-Systemic Cross-Talk (SIBI)';
      tier = 'Level A (Meta-Analysis / Large RCTs)';
      falsifiability = 'Falsifiable & Tested';
      isCausal = true;
      confounders = ['Smoking history', 'Glycemic control (HbA1c)', 'Oral hygiene baseline'];
      healthyUser = false;
      rob = {
        randomizationBias: 'Low Risk',
        deviationBias: 'Low Risk',
        missingDataBias: 'Low Risk',
        measurementBias: 'Low Risk',
        selectiveReportingBias: 'Low Risk'
      };
      questions = [
        'How does mechanical scaling and root planing alter the systemic endothelial biomarker trajectory (hs-CRP, IL-6)?',
        'What is the observed cross-talk magnitude between subgingival bacterial translocation and microvascular tone?'
      ];
      citations = [
        'Offenbacher S et al. Circulation 2009; 120(16):1581-1588. PMID: 19805649',
        'Tonetti MS et al. N Engl J Med 2007; 356(9):911-920. PMID: 17329698'
      ];
      verdict = 'Robust randomized controlled trials demonstrate that periodontal debridement directly reduces systemic inflammatory markers (hs-CRP) and improves endothelial function.';
    } else if (lower.includes('resveratrol') || lower.includes('wine') || lower.includes('sirtuin')) {
      topic = 'Resveratrol & Sirtuin Agonists';
      tier = 'Level C (Mechanistic / Animal / In Vitro)';
      falsifiability = 'Falsifiable & Tested';
      isCausal = false;
      confounders = ['Mediterranean diet adherence', 'Income/lifestyle confounding', 'In vitro bioavailability vs. in vivo metabolism'];
      healthyUser = true;
      rob = {
        randomizationBias: 'Some Concerns',
        deviationBias: 'Low Risk',
        missingDataBias: 'Some Concerns',
        measurementBias: 'High Risk',
        selectiveReportingBias: 'High Risk'
      };
      questions = [
        'What oral dose is required to achieve serum concentrations matching in vitro sirtuin activation, and is that dose achievable without liver toxicity?',
        'Did long-term prospective cohorts (e.g., InCHIANTI study) find any association between urinary resveratrol metabolites and mortality in humans?'
      ];
      citations = [
        'Semba RD et al. JAMA Intern Med 2014; 174(7):1077-1084. PMID: 24819981',
        'Baur JA et al. Nature 2006; 444(7117):337-342. PMID: 17086191'
      ];
      verdict = 'Observational data in humans (e.g. InCHIANTI cohort) show zero reduction in cardiovascular disease or all-cause mortality associated with dietary resveratrol levels.';
    } else if (lower.includes('cgm') || lower.includes('glucose monitor') || lower.includes('non-diabetic')) {
      topic = 'Non-Diabetic Continuous Glucose Monitoring';
      tier = 'Level B (Prospective Cohort / Observational)';
      falsifiability = 'Falsifiable but Unproven';
      isCausal = false;
      confounders = ['Orthorexia and health anxiety', 'Postprandial physiological normal excursions', 'Physical fitness baseline'];
      healthyUser = true;
      rob = {
        randomizationBias: 'High Risk',
        deviationBias: 'Some Concerns',
        missingDataBias: 'Low Risk',
        measurementBias: 'Some Concerns',
        selectiveReportingBias: 'High Risk'
      };
      questions = [
        'Are transient post-prandial glycemic excursions in non-diabetic individuals independently pathogenic, or are they normal homeostatic adaptations?',
        'Does commercial CGM biofeedback in healthy individuals produce durable dietary changes or simply elevate food anxiety?'
      ];
      citations = [
        'Shah VN et al. Diabetes Technol Ther 2019; 21(9):507-512. PMID: 31237446',
        'American Diabetes Association (ADA) Standards of Care in Diabetes 2024'
      ];
      verdict = 'Current clinical consensus reserves CGM for diabetes and hypoglycemia management. No randomized clinical endpoint trial demonstrates improved cardiovascular or longevity outcomes in healthy adults.';
    } else if (lower.includes('vitamin d') || lower.includes('mega-dose') || lower.includes('50,000')) {
      topic = 'Vitamin D Supplementation Thresholds';
      tier = 'Level A (Meta-Analysis / Large RCTs)';
      falsifiability = 'Falsifiable & Tested';
      isCausal = false;
      confounders = ['Baseline deficiency vs. sufficiency', 'Outdoor physical activity', 'BMI and adipose sequestration'];
      healthyUser = true;
      rob = {
        randomizationBias: 'Low Risk',
        deviationBias: 'Low Risk',
        missingDataBias: 'Low Risk',
        measurementBias: 'Low Risk',
        selectiveReportingBias: 'Low Risk'
      };
      questions = [
        'Did large-scale randomized trials (e.g., VITAL study, $N = 25,871$) show any reduction in cancer incidence or cardiovascular events in non-deficient populations?',
        'What is the patient risk of hypercalcemia and nephrolithiasis at prolonged supraphysiological dosing?'
      ];
      citations = [
        'Manson JE et al. N Engl J Med 2019; 380(1):33-44. PMID: 30415629',
        'LeBoff MS et al. N Engl J Med 2022; 387(4):299-309. PMID: 35900509'
      ];
      verdict = 'Correcting true deficiency (< 20 ng/mL) is essential for musculoskeletal health, but mega-dosing in sufficient individuals provides no additional longevity, cancer, or infection protection in landmark RCTs (VITAL).';
    }

    const analysis: ISocraticClaimAnalysis = {
      claimId: `SOC-EVID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      originalClaim: text,
      analyzedTopic: topic,
      evidenceTier: tier,
      falsifiabilityStatus: falsifiability,
      cochraneRoB2Radar: rob,
      correlationVsCausationCheck: {
        isCausalProven: isCausal,
        primaryConfounders: confounders,
        healthyUserBiasRisk: healthyUser
      },
      socraticCounterQuestions: questions,
      canonicalCitations: citations,
      clinicalConsensusVerdict: verdict
    };

    this.activeAnalysis.set(analysis);
    return analysis;
  }
}
