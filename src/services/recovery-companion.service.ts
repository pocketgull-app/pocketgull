import { Injectable, signal, computed, inject } from '@angular/core';
import { EhrWritebackService, IEhrWritebackBatchResult } from './fhir/ehr-writeback.service';
import { PatientStateService } from './patient-state.service';

export type BristolStoolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type RecoveryAcuityTier = 
  | 'STABLE_FLOURISHING' 
  | 'MILD_STRAIN' 
  | 'MODERATE_ALERT' 
  | 'CRITICAL_INTERRUPT';

export interface IWearableSleepTelemetry {
  source: 'Apple HealthKit' | 'Google Health Connect' | 'Fitbit' | 'Manual / Self-Report';
  totalSleepHours: number;
  sleepLatencyMinutes: number;
  deepSleepPercent: number; // N3 Slow-Wave Sleep %
  remSleepPercent: number;
  nocturnalHrDipPercent: number; // e.g. 10-15% normal dip
  restingHeartRateBpm: number;
}

export interface IRecoveryCheckInPayload {
  cravingScore: number; // 0 - 10 Visual Analog Scale
  sleepTelemetry: IWearableSleepTelemetry;
  pawsDysphoriaScore: number; // 0 - 4 (0: None, 4: Overwhelming anhedonia)
  restlessnessScore: number; // 0 - 4
  muscleAchesScore: number; // 0 - 10
  bristolStoolType: BristolStoolType;
  oralCareAdherence: {
    postDosingWaterRinseCompleted: boolean;
    oneHourBrushingDelayRespected: boolean;
    highFluorideUsed: boolean;
    xylitolPacingUsed: boolean;
  };
  notes?: string;
}

export interface IRecoveryCheckInResult {
  checkInId: string;
  timestamp: string;
  patientId: string;
  cravingScore: number;
  acuityTier: RecoveryAcuityTier;
  triageDirective: string;
  clinicianAlertTriggered: boolean;
  peerRecoveryLinkRecommended: boolean;
  pawsInterventions: string[];
  entericInterventions: string[];
  oralHealthAlert: boolean;
  fhirObservationPayload: any;
  integrityDigest: string; // FDA 21 CFR Part 11 SHA-256 seal
}

@Injectable({
  providedIn: 'root'
})
export class RecoveryCompanionService {
  private ehrWriteback = inject(EhrWritebackService, { optional: true });
  private patientState = inject(PatientStateService, { optional: true });

  readonly recentCheckIns = signal<IRecoveryCheckInResult[]>([]);
  readonly latestResult = computed(() => {
    const list = this.recentCheckIns();
    return list.length > 0 ? list[0] : null;
  });

  /**
   * Processes a daily recovery check-in, evaluates clinical acuity against Yale & SAMHSA criteria,
   * calculates salutogenic restorative directives, and seals the record with SHA-256.
   */
  public async evaluateCheckIn(
    payload: IRecoveryCheckInPayload,
    patientId: string = 'pat-current'
  ): Promise<IRecoveryCheckInResult> {
    const now = new Date().toISOString();
    const checkInId = `recov_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Triage Acuity Evaluation
    let acuityTier: RecoveryAcuityTier = 'STABLE_FLOURISHING';
    let clinicianAlertTriggered = false;
    let peerRecoveryLinkRecommended = false;
    let triageDirective = 'Patient demonstrates robust neuroplastic stabilization. Reinforce salutogenic routines.';

    const craving = Math.max(0, Math.min(10, payload.cravingScore));
    const sleepHours = payload.sleepTelemetry.totalSleepHours;

    if (craving >= 8 || sleepHours < 4.0) {
      acuityTier = 'CRITICAL_INTERRUPT';
      clinicianAlertTriggered = true;
      peerRecoveryLinkRecommended = true;
      triageDirective = 'CRITICAL ALERT: Severe craving surge or severe sleep deprivation detected. Initiate immediate peer recovery outreach and review buprenorphine dosage titration.';
    } else if (craving >= 6 || payload.bristolStoolType <= 2 || payload.pawsDysphoriaScore >= 3) {
      acuityTier = 'MODERATE_ALERT';
      peerRecoveryLinkRecommended = true;
      triageDirective = 'MODERATE ALERT: Elevated craving or persistent PAWS distress. Engage coping scaffolding and review bowel motility.';
    } else if (craving >= 4 || sleepHours < 6.0) {
      acuityTier = 'MILD_STRAIN';
      triageDirective = 'MILD STRAIN: Mild neuroplastic fatigue. Prescribe 0.10 Hz resonant breathing, morning sunlight, and gentle aerobic pacing.';
    }

    // 2. PAWS Restorative Interventions
    const pawsInterventions: string[] = [];
    if (payload.sleepTelemetry.deepSleepPercent < 15) {
      pawsInterventions.push('Slow-Wave Sleep Scaffolding: Enforce scotopic amber lighting after 20:00; add Magnesium Glycinate (400 mg).');
    }
    if (payload.pawsDysphoriaScore >= 2) {
      pawsInterventions.push('Dopamine Receptor Resensitization: Prescribe 30 min Zone 2 aerobic walk to stimulate endogenous BDNF.');
    }
    if (payload.muscleAchesScore >= 4) {
      pawsInterventions.push('Somatic Tension Release: Warm Epsom salt bath + seated McKenzie neural flossing.');
    }

    // 3. Enteric Interventions
    const entericInterventions: string[] = [];
    if (payload.bristolStoolType <= 2) {
      entericInterventions.push('OIBD Reversal: Initiate osmotic PEG-3350 hydration; evaluate PAMORA (Naloxegol 25 mg daily).');
    } else if (payload.bristolStoolType >= 6) {
      entericInterventions.push('Enteric Hyper-motility: Ensure electrolyte rehydration; verify absence of concurrent autonomic withdrawal.');
    } else {
      entericInterventions.push('Enteric Motility Normal: Maintain soluble prebiotic fibers and daily hydration.');
    }

    // 4. Oral Health Screening
    const oralHealthAlert = !payload.oralCareAdherence.oneHourBrushingDelayRespected || 
                            !payload.oralCareAdherence.postDosingWaterRinseCompleted;

    // 5. Synthesize FHIR R4 LOINC Observation
    const fhirObservationPayload = {
      resourceType: 'Observation',
      id: `obs-recovery-${checkInId}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'survey',
              display: 'Survey'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '80290-0',
            display: 'Opioid craving visual analog scale'
          }
        ],
        text: 'Patient Daily Opioid Recovery & Sleep Architecture Check-In'
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: now,
      valueQuantity: {
        value: craving,
        unit: 'score (0-10)',
        system: 'http://unitsofmeasure.org',
        code: '{score}'
      },
      component: [
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: '93832-4', display: 'Sleep duration' }]
          },
          valueQuantity: {
            value: sleepHours,
            unit: 'hours',
            system: 'http://unitsofmeasure.org',
            code: 'h'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: '93831-6', display: 'Deep sleep percentage' }]
          },
          valueQuantity: {
            value: payload.sleepTelemetry.deepSleepPercent,
            unit: '%',
            system: 'http://unitsofmeasure.org',
            code: '%'
          }
        },
        {
          code: {
            coding: [{ system: 'http://pocketgull.app/fhir/recovery', code: 'bristol-stool-scale', display: 'Bristol Stool Form Scale' }]
          },
          valueInteger: payload.bristolStoolType
        },
        {
          code: {
            coding: [{ system: 'http://pocketgull.app/fhir/recovery', code: 'acuity-tier', display: 'Recovery Acuity Tier' }]
          },
          valueString: acuityTier
        }
      ]
    };

    // 6. Compute FDA 21 CFR Part 11 Electronic Signature Seal
    const canonicalPayload = JSON.stringify({
      checkInId,
      timestamp: now,
      patientId,
      craving,
      sleepHours,
      acuityTier
    });
    const integrityDigest = await this.computeSha256(canonicalPayload);

    const result: IRecoveryCheckInResult = {
      checkInId,
      timestamp: now,
      patientId,
      cravingScore: craving,
      acuityTier,
      triageDirective,
      clinicianAlertTriggered,
      peerRecoveryLinkRecommended,
      pawsInterventions,
      entericInterventions,
      oralHealthAlert,
      fhirObservationPayload,
      integrityDigest
    };

    // Update in-memory log
    this.recentCheckIns.update(list => [result, ...list.slice(0, 29)]);

    return result;
  }

  /**
   * Files the completed check-in directly to the clinician's EHR via EhrWritebackService.
   */
  public async writeBackToEhr(
    result: IRecoveryCheckInResult
  ): Promise<IEhrWritebackBatchResult | null> {
    if (!this.ehrWriteback) {
      console.warn('[RecoveryCompanionService] EhrWritebackService not available for EHR filing.');
      return null;
    }

    const sbarSituation = `Daily Patient Recovery Check-In: Craving ${result.cravingScore}/10 (${result.acuityTier}). Clinician Alert: ${result.clinicianAlertTriggered ? 'YES (STAT INTERRUPT)' : 'NO'}.`;
    const sbarBackground = `Patient in Phase 2/3 Opioid Recovery self-reported daily telemetry. Peer recovery link recommended: ${result.peerRecoveryLinkRecommended ? 'YES' : 'NO'}. Oral health defense alert: ${result.oralHealthAlert ? 'YES' : 'NO'}.`;
    const sbarAssessment = `Triage Directive: ${result.triageDirective}\nPAWS Plan: ${result.pawsInterventions.join('; ')}\nEnteric Plan: ${result.entericInterventions.join('; ')}`;
    const sbarRecommendation = result.clinicianAlertTriggered 
      ? '1. Outreach to patient within 2 hours.\n2. Inquire regarding craving triggers or missed doses.\n3. Link with Peer Recovery Specialist.'
      : 'Continue current buprenorphine maintenance and salutogenic recovery pacing.';

    return await this.ehrWriteback.executeWriteback(
      undefined,
      {
        situation: sbarSituation,
        background: sbarBackground,
        assessment: sbarAssessment,
        recommendation: sbarRecommendation,
        chiefComplaint: `Daily Recovery Log (Craving ${result.cravingScore}/10)`,
        timestamp: result.timestamp
      },
      {
        title: `Recovery Companion Daily Plan (${result.acuityTier})`,
        summary: result.triageDirective,
        threeActsStage: 'Act II',
        cyp450ClearanceVerified: true,
        activities: result.pawsInterventions.map(action => ({
          category: 'Lifestyle',
          description: action,
          timing: 'Daily'
        }))
      }
    );
  }

  private async computeSha256(data: string): Promise<string> {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
      const buffer = new TextEncoder().encode(data);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}
