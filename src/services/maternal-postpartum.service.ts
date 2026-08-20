import { Injectable, signal, computed } from '@angular/core';
import { scoreEpds, IClinicalScoreResult } from '../../packages/core-sdk/src/assessments/index';

export type LactMedRiskTier = 'L1 — Safest' | 'L2 — Safer' | 'L3 — Moderately Safe' | 'L4 — Possibly Hazardous' | 'L5 — Contraindicated';

export interface ILactMedEntry {
  drugName: string;
  category: string;
  riskTier: LactMedRiskTier;
  relativeInfantDosePercent: number; // RID % (<10% generally considered safe)
  milkPlasmaRatio: number;
  clinicalSummary: string;
  alternativesSuggested?: string[];
}

export interface IRecoveryMilestone {
  dayOrWeek: string;
  phaseName: string;
  clinicalCheckpoints: string[];
  physiologicalNotes: string;
  completed: boolean;
}

export interface IMaternalVitals {
  restingHeartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  sleepDurationHours: number;
  sleepFragmentationAwakenings: number;
  hydrationLiters: number;
  pelvicDiscomfortScale: number; // 0-10
}

@Injectable({
  providedIn: 'root'
})
export class MaternalPostpartumService {
  // State Signals
  readonly epdsAnswers = signal<number[]>([0, 1, 0, 1, 0, 1, 0, 0, 1, 0]); // 10 items (0-3 each)
  readonly activePostpartumDay = signal<number>(21); // Day 21 (Week 3) default
  readonly maternalVitals = signal<IMaternalVitals>({
    restingHeartRateBpm: 68,
    systolicBp: 118,
    diastolicBp: 76,
    sleepDurationHours: 6.2,
    sleepFragmentationAwakenings: 3,
    hydrationLiters: 2.8,
    pelvicDiscomfortScale: 2
  });

  // LactMed Drug Safety Database
  readonly lactMedCatalog: ILactMedEntry[] = [
    {
      drugName: 'Acetaminophen (Tylenol)',
      category: 'Analgesic / Antipyretic',
      riskTier: 'L1 — Safest',
      relativeInfantDosePercent: 1.8,
      milkPlasmaRatio: 0.8,
      clinicalSummary: 'Excreted in breast milk in negligible amounts; first-line agent for postpartum pain and fever.'
    },
    {
      drugName: 'Ibuprofen (Advil / Motrin)',
      category: 'NSAID Analgesic',
      riskTier: 'L1 — Safest',
      relativeInfantDosePercent: 0.6,
      milkPlasmaRatio: 0.01,
      clinicalSummary: 'High protein binding (>99%) and short half-life prevent clinically significant transfer to infant.'
    },
    {
      drugName: 'Sertraline (Zoloft)',
      category: 'SSRI Antidepressant',
      riskTier: 'L1 — Safest',
      relativeInfantDosePercent: 2.2,
      milkPlasmaRatio: 0.89,
      clinicalSummary: 'Lowest milk transfer among SSRIs; preferred first-line for postpartum depression & anxiety.'
    },
    {
      drugName: 'Labetalol',
      category: 'Beta-Blocker / Antihypertensive',
      riskTier: 'L2 — Safer',
      relativeInfantDosePercent: 1.5,
      milkPlasmaRatio: 0.8,
      clinicalSummary: 'Preferred agent for postpartum hypertension and pre-eclampsia monitoring.'
    },
    {
      drugName: 'Amoxicillin / Clavulanate',
      category: 'Antibiotic',
      riskTier: 'L1 — Safest',
      relativeInfantDosePercent: 1.1,
      milkPlasmaRatio: 0.04,
      clinicalSummary: 'Compatible with breastfeeding for acute postpartum mastitis.'
    },
    {
      drugName: 'Fluoxetine (Prozac)',
      category: 'SSRI Antidepressant',
      riskTier: 'L3 — Moderately Safe',
      relativeInfantDosePercent: 8.5,
      milkPlasmaRatio: 1.2,
      clinicalSummary: 'Long half-life of active metabolite (norfluoxetine) may cause mild infant colic; monitor infant alertness.',
      alternativesSuggested: ['Sertraline', 'Paroxetine']
    },
    {
      drugName: 'Codeine',
      category: 'Opioid Analgesic',
      riskTier: 'L4 — Possibly Hazardous',
      relativeInfantDosePercent: 12.0,
      milkPlasmaRatio: 2.1,
      clinicalSummary: 'FDA black box warning for ultra-rapid CYP2D6 metabolizers leading to severe infant respiratory depression.',
      alternativesSuggested: ['Ibuprofen', 'Acetaminophen']
    }
  ];

  // 4th Trimester Recovery Milestones
  readonly recoveryMilestones = signal<IRecoveryMilestone[]>([
    {
      dayOrWeek: 'Days 1–3',
      phaseName: 'Colostrum Transition & Uterine Involution',
      clinicalCheckpoints: [
        'Lochia rubra monitoring (< 1 heavy pad/hour)',
        'Colostrum transition to transitional milk',
        'Early skin-to-skin vagal co-regulation'
      ],
      physiologicalNotes: 'Oxytocin release during infant latch accelerates uterine fundal descent toward true pelvis.',
      completed: true
    },
    {
      dayOrWeek: 'Days 4–14',
      phaseName: 'Transitional Recovery & Circadian Priming',
      clinicalCheckpoints: [
        'Lochia serosa pinkish-brown transition',
        'Baby blues screening vs. early onset EPDS elevation',
        'Gentle diaphragmatic 4-7-8 vagal breathing'
      ],
      physiologicalNotes: 'Estrogen and progesterone nadir; prolactin receptor upregulation in alveolar epithelial cells.',
      completed: true
    },
    {
      dayOrWeek: 'Weeks 3–6',
      phaseName: 'Tissue Remodeling & Core Stabilization',
      clinicalCheckpoints: [
        'Lochia alba resolution',
        'Transverse abdominis & pelvic floor rehabilitation (no heavy strain)',
        'Routine 6-week obstetric / midwifery comprehensive exam'
      ],
      physiologicalNotes: 'Connective tissue collagen cross-linking; resting heart rate returns toward pre-pregnancy baseline.',
      completed: false
    },
    {
      dayOrWeek: 'Months 2–6',
      phaseName: 'Endocrine Equilibrium & Long-Term Vitality',
      clinicalCheckpoints: [
        'Maternal iron & ferritin store repletion check',
        'Postpartum thyroiditis screening (Free T4 / TSH)',
        'Return to full physical activity & aerobic conditioning'
      ],
      physiologicalNotes: 'Hypothalamic-pituitary-ovarian axis recalibration depending on lactation frequency.',
      completed: false
    }
  ]);

  // Computed Signals
  readonly epdsScore = computed<IClinicalScoreResult>(() => {
    return scoreEpds(this.epdsAnswers());
  });

  readonly isHighRiskEpds = computed(() => {
    return this.epdsScore().totalScore >= 13 || this.epdsScore().criticalAlert === true;
  });

  /**
   * Updates an individual item answer in the EPDS screener (0-3)
   */
  setEpdsAnswer(itemIndex: number, score: number): void {
    if (itemIndex < 0 || itemIndex > 9) return;
    const clamped = Math.max(0, Math.min(3, Math.floor(score)));
    this.epdsAnswers.update(answers => {
      const copy = [...answers];
      copy[itemIndex] = clamped;
      return copy;
    });
  }

  /**
   * Checks a medication name against the LactMed safety catalog
   */
  lookupLactMedSafety(medicationName: string): ILactMedEntry | null {
    const q = medicationName.toLowerCase().trim();
    return this.lactMedCatalog.find(entry => entry.drugName.toLowerCase().includes(q) || q.includes(entry.drugName.toLowerCase())) || null;
  }

  /**
   * Updates maternal biophysical telemetry vitals
   */
  updateMaternalVitals(vitals: Partial<IMaternalVitals>): void {
    this.maternalVitals.update(v => ({ ...v, ...vitals }));
  }

  /**
   * Toggles milestone completion state
   */
  toggleMilestone(index: number): void {
    this.recoveryMilestones.update(milestones => {
      const copy = [...milestones];
      if (copy[index]) {
        copy[index] = { ...copy[index], completed: !copy[index].completed };
      }
      return copy;
    });
  }

  /**
   * Exports the Postpartum Assessment as a standard FHIR R4 Bundle
   */
  exportFhirR4PostpartumBundle(patientId: string = 'homo-sapiens-34y'): Record<string, any> {
    const epds = this.epdsScore();
    const vitals = this.maternalVitals();
    const bundleId = `bundle-postpartum-${Date.now()}`;
    const epdsObsId = `obs-epds-${Date.now()}`;
    const hrObsId = `obs-maternal-hr-${Date.now()}`;

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/bundle']
      },
      type: 'collection',
      entry: [
        {
          fullUrl: `urn:uuid:${epdsObsId}`,
          resource: {
            resourceType: 'Observation',
            id: epdsObsId,
            status: 'final',
            code: {
              coding: [{ system: 'http://loinc.org', code: '71354-5', display: 'Edinburgh Postnatal Depression Scale [EPDS]' }]
            },
            subject: { reference: `Patient/${patientId}` },
            valueInteger: epds.totalScore,
            interpretation: [
              {
                coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: epds.criticalAlert ? 'AA' : (epds.totalScore >= 13 ? 'A' : 'N') }],
                text: epds.severity
              }
            ],
            note: [{ text: epds.clinicalAction }]
          }
        },
        {
          fullUrl: `urn:uuid:${hrObsId}`,
          resource: {
            resourceType: 'Observation',
            id: hrObsId,
            status: 'final',
            code: {
              coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }]
            },
            subject: { reference: `Patient/${patientId}` },
            valueQuantity: {
              value: vitals.restingHeartRateBpm,
              unit: 'bpm',
              system: 'http://unitsofmeasure.org',
              code: '/min'
            }
          }
        }
      ]
    };
  }
}
