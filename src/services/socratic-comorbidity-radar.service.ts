import { Injectable, inject, computed, signal } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { ClinicalAssessmentsService } from './clinical-assessments/clinical-assessments.service';

export interface IComorbidityReferral {
  id: string;
  sourcePartId: string;
  targetPartId: string;
  targetPartName: string;
  referralType: 'neural_phrenic' | 'viscerosomatic' | 'systemic_inflammatory' | 'cervicogenic' | 'cardiovascular_angina' | 'renal_colic';
  title: string;
  mechanism: string;
  differentialConsiderations: string[];
  evidenceLevel: 'Level A (High RCT)' | 'Level B (Cohort)' | 'Level C (Physiological Plausibility)';
  urgency: 'routine' | 'urgent' | 'critical';
  dismissed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocraticComorbidityRadarService {
  private patientState = inject(PatientStateService);
  private assessmentsService = inject(ClinicalAssessmentsService, { optional: true });

  private dismissedReferralIds = signal<Set<string>>(new Set<string>());

  /**
   * Authoritative referral knowledge matrix mapping localized pain/symptom sites
   * to distant referred structures and systemic cross-talk drivers.
   */
  private readonly referralRules: Array<{
    triggerPartIds: string[];
    referral: Omit<IComorbidityReferral, 'dismissed'>;
    condition?: () => boolean;
  }> = [
    {
      triggerPartIds: ['r_shoulder', 'neck', 'spine_cervical'],
      referral: {
        id: 'ref_r_shoulder_phrenic',
        sourcePartId: 'r_shoulder',
        targetPartId: 'liver',
        targetPartName: 'Liver & Diaphragm (Phrenic C3-C5)',
        referralType: 'neural_phrenic',
        title: 'Phrenic Nerve Referral / Hepato-Biliary Radar',
        mechanism: 'Sensory afferents from diaphragmatic peritoneum share spinal cord segments (C3-C5) with supraclavicular nerves supplying the right shoulder.',
        differentialConsiderations: [
          'Subdiaphragmatic irritation / Acute cholecystitis',
          'Hepatic capsule distension',
          'Cervical C5 radiculopathy vs. Rotator cuff pathology'
        ],
        evidenceLevel: 'Level A (High RCT)',
        urgency: 'urgent'
      }
    },
    {
      triggerPartIds: ['l_shoulder', 'l_arm', 'jaw', 'neck'],
      referral: {
        id: 'ref_l_arm_cardiac',
        sourcePartId: 'l_shoulder',
        targetPartId: 'heart',
        targetPartName: 'Myocardium / Coronary Circuit',
        referralType: 'cardiovascular_angina',
        title: 'Anginal Viscerosomatic Referral Radar',
        mechanism: 'Cardiac sympathetic afferents enter spinal cord levels T1-T4, referring dermatomal pain to the left shoulder, inner arm, and inferior mandible.',
        differentialConsiderations: [
          'Acute Coronary Syndrome (ACS) / Angina Pectoris',
          'Thoracic Outlet Syndrome',
          'Subacromial Impingement'
        ],
        evidenceLevel: 'Level A (High RCT)',
        urgency: 'critical'
      }
    },
    {
      triggerPartIds: ['r_knee', 'l_knee', 'r_shoulder', 'l_shoulder', 'pelvis'],
      referral: {
        id: 'ref_sibi_periodontal_synovial',
        sourcePartId: 'oral_fdi_teeth',
        targetPartId: 'oral_fdi_teeth',
        targetPartName: 'Oral Cavity (Periodontal SIBI Index)',
        referralType: 'systemic_inflammatory',
        title: 'SIBI Periodontal-Synovial Cross-Talk Radar',
        mechanism: 'Porphyromonas gingivalis lipopolysaccharides and elevated periodontal probing depths (PPD >= 4mm) elevate systemic IL-6 and hs-CRP, accelerating synovial matrix degradation.',
        differentialConsiderations: [
          'Periodontitis-induced inflammatory arthritis aggravation',
          'Systemic Inflammatory Burden Index (SIBI) elevation',
          'Bacteremia-driven endothelial stress'
        ],
        evidenceLevel: 'Level B (Cohort)',
        urgency: 'routine'
      },
      condition: () => {
        const sibiScore = this.assessmentsService?.sibiScore() ?? 0;
        return sibiScore >= 4 || !!this.patientState.issues()['oral_fdi_teeth']?.length;
      }
    },
    {
      triggerPartIds: ['spine_lumbar', 'pelvis', 'r_thigh', 'l_thigh'],
      referral: {
        id: 'ref_lumbar_renal',
        sourcePartId: 'spine_lumbar',
        targetPartId: 'kidneys',
        targetPartName: 'Renal / Nephro-Ureteral Tract',
        referralType: 'renal_colic',
        title: 'Nephro-Ureteral Viscerosomatic Radar',
        mechanism: 'Renal and upper ureteral visceral afferents travel via T10-L1 sympathetic splanchnic nerves, producing severe flank pain radiating to the groin and lumbar spine.',
        differentialConsiderations: [
          'Nephrolithiasis (Renal Calculi)',
          'Pyelonephritis / Renal Infarction',
          'Acute Lumbar Facet / Disc Herniation'
        ],
        evidenceLevel: 'Level A (High RCT)',
        urgency: 'urgent'
      }
    },
    {
      triggerPartIds: ['head', 'brain'],
      referral: {
        id: 'ref_head_tmj_cervical',
        sourcePartId: 'head',
        targetPartId: 'spine_cervical',
        targetPartName: 'Cervical Spine (C1-C3) & Suboccipital Axis',
        referralType: 'cervicogenic',
        title: 'Cervicogenic & TMJ Trigeminocervical Radar',
        mechanism: 'Nociceptive convergence within the trigeminocervical nucleus receives dual inputs from upper cervical spinal nerves (C1-C3) and ophthalmic/maxillary trigeminal branches.',
        differentialConsiderations: [
          'Cervicogenic headache vs. Primary Migraine',
          'Temporomandibular Joint (TMJ) internal derangement',
          'Suboccipital myofascial trigger point tension'
        ],
        evidenceLevel: 'Level B (Cohort)',
        urgency: 'routine'
      }
    }
  ];

  /**
   * Computed active comorbidity referrals based on currently selected/active anatomical parts.
   */
  readonly activeReferrals = computed<IComorbidityReferral[]>(() => {
    const selectedId = this.patientState.selectedPartId()?.toLowerCase();
    const activeIssueKeys = Object.keys(this.patientState.issues()).map(k => k.toLowerCase());
    const dismissed = this.dismissedReferralIds();

    const activeParts = new Set<string>();
    if (selectedId) activeParts.add(selectedId);
    activeIssueKeys.forEach(k => activeParts.add(k));

    if (activeParts.size === 0) return [];

    const matched: IComorbidityReferral[] = [];

    for (const rule of this.referralRules) {
      if (dismissed.has(rule.referral.id)) continue;

      const matchesPart = rule.triggerPartIds.some(id => activeParts.has(id.toLowerCase()));
      const passesCondition = rule.condition ? rule.condition() : true;

      if (matchesPart && passesCondition) {
        matched.push({
          ...rule.referral,
          dismissed: false
        });
      }
    }

    return matched;
  });

  /**
   * Computed set of target body part IDs that should display glowing peripheral radar auras in 3D.
   */
  readonly radarTargetPartIds = computed<Set<string>>(() => {
    const referrals = this.activeReferrals();
    const targetSet = new Set<string>();
    referrals.forEach(r => targetSet.add(r.targetPartId.toLowerCase()));
    return targetSet;
  });

  /**
   * Dismisses a referral card for the current session.
   */
  dismissReferral(referralId: string): void {
    const next = new Set(this.dismissedReferralIds());
    next.add(referralId);
    this.dismissedReferralIds.set(next);
  }

  /**
   * Clears dismissed referrals to re-evaluate.
   */
  resetDismissed(): void {
    this.dismissedReferralIds.set(new Set<string>());
  }
}
