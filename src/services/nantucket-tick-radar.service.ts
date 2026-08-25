import { Injectable, signal, computed } from '@angular/core';

export type TickSpecies = 'ixodes_nymph' | 'ixodes_adult' | 'lone_star' | 'dog_tick';
export type AttachmentDwellTier = 'unattached' | 'under_24h' | '24_to_36h' | '36_to_72h' | 'over_72h';

export interface INantucketGeoHotspot {
  id: string;
  name: string;
  ecologicalHabitat: string;
  vectorRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE';
  dominantSpecies: string;
  nymphDensityPer100m2: number;
  foliageType: string;
  recommendedPrecaution: string;
}

export interface IBodyInspectionZone {
  id: string;
  zoneName: string;
  anatomicRegion: 'Head & Scalp' | 'Torso & Axillae' | 'Pelvis & Groin' | 'Lower Extremities';
  riskWeight: number; // 1-10
  clinicalInspectionTip: string;
  isInspected: boolean;
}

export interface ICoInfectionPrior {
  pathogenId: string;
  pathogenName: string;
  organism: string;
  nymphPrevalenceAck: number; // Nantucket-specific infection rate (UMass TickReport)
  transmissionThresholdHours: number;
  clinicalSign: string;
  treatmentSummary: string;
}

export interface IDwellTimeAssessment {
  estimatedHours: number;
  dwellTier: AttachmentDwellTier;
  lymeTransmissionProbability: number;
  doxycyclineProphylaxisEligible: boolean;
  prophylaxisCriteriaMet: {
    attachedAtLeast36h: boolean;
    removedWithin72h: boolean;
    speciesIsBlacklegged: boolean;
    noContraindications: boolean;
  };
  clinicalRecommendation: string;
  hoursRemainingIn72hWindow: number;
}

export interface IBayesianTriageOutput {
  pathogenId: string;
  pathogenName: string;
  organism: string;
  priorProbability: number;
  posteriorPercent: number;
  pValueH0: number;
  nullHypothesisRejected: boolean;
  treatmentSummary: string;
}

export const NANTUCKET_GEO_HOTSPOTS: INantucketGeoHotspot[] = [
  {
    id: 'squam_farm',
    name: 'Squam Farm & Swamp Moors',
    ecologicalHabitat: 'Dense maritime scrub oak, fern understory, high white-tailed deer density',
    vectorRiskLevel: 'EXTREME',
    dominantSpecies: 'Ixodes scapularis (Deer Tick Nymph)',
    nymphDensityPer100m2: 24.8,
    foliageType: 'Bracken fern & huckleberry thicket',
    recommendedPrecaution: 'Permethrin-treated socks + immediate post-walk inspection'
  },
  {
    id: 'middle_moors',
    name: 'Middle Moors & Altar Rock',
    ecologicalHabitat: 'Open sandplain grassland transitioning to dense scrub oak ecotones',
    vectorRiskLevel: 'HIGH',
    dominantSpecies: 'Ixodes scapularis & Amblyomma americanum',
    nymphDensityPer100m2: 18.2,
    foliageType: 'Lowbush blueberry & bearberry heathlands',
    recommendedPrecaution: 'Center-trail walking, tuck pants into socks'
  },
  {
    id: 'sanford_farm',
    name: 'Sanford Farm & Ram Pasture',
    ecologicalHabitat: 'Coastal grassland paths, meadow edges, and cedar groves',
    vectorRiskLevel: 'HIGH',
    dominantSpecies: 'Ixodes scapularis & Dermacentor variabilis (Dog Tick)',
    nymphDensityPer100m2: 15.6,
    foliageType: 'Tall maritime prairie grass',
    recommendedPrecaution: 'Stay on mowed path center; 20% Picaridin on exposed skin'
  },
  {
    id: 'smooth_hummocks',
    name: 'Smooth Hummocks Coastal Preserve',
    ecologicalHabitat: 'Globally rare sandplain grassland, high sun exposure',
    vectorRiskLevel: 'MODERATE',
    dominantSpecies: 'Amblyomma americanum (Lone Star Tick)',
    nymphDensityPer100m2: 9.4,
    foliageType: 'Sandplain grass & goldenrod',
    recommendedPrecaution: 'Inspect lower legs after beach path access'
  },
  {
    id: 'polpis_harbor',
    name: 'Polpis Harbor & Norwood Farm',
    ecologicalHabitat: 'Salt marsh border, red maple swamp, damp leaf litter',
    vectorRiskLevel: 'EXTREME',
    dominantSpecies: 'Ixodes scapularis (Lyme + Babesia Vectors)',
    nymphDensityPer100m2: 22.1,
    foliageType: 'Wetland shrub swamp & sphagnum moss',
    recommendedPrecaution: 'Full tick-proof gear; avoid off-trail marsh margins'
  }
];

export const EMPIRICAL_NANTUCKET_PRIORS: Record<string, ICoInfectionPrior> = {
  lyme_borrelia: {
    pathogenId: 'lyme_borrelia',
    pathogenName: 'Lyme Disease',
    organism: 'Borrelia burgdorferi (Spirochete)',
    nymphPrevalenceAck: 0.52, // 52% Nantucket nymph infection rate
    transmissionThresholdHours: 36,
    clinicalSign: 'Erythema migrans (bulls-eye rash), migratory arthralgia, facial palsy',
    treatmentSummary: 'Doxycycline 100mg BID x 10–14d (or single 200mg prophylaxis within 72h); Amoxicillin 50mg/kg/d in young children'
  },
  babesiosis: {
    pathogenId: 'babesiosis',
    pathogenName: 'Babesiosis (Human Microti)',
    organism: 'Babesia microti (Intraerythrocytic Protozoan)',
    nymphPrevalenceAck: 0.18, // 18% nymph prevalence on Nantucket (US Epicenter)
    transmissionThresholdHours: 24,
    clinicalSign: 'Hemolytic anemia, drenching sweats, dark urine, thrombocytopenia',
    treatmentSummary: 'Atovaquone 750mg BID + Azithromycin 500mg daily x 7–10 days'
  },
  anaplasmosis: {
    pathogenId: 'anaplasmosis',
    pathogenName: 'Anaplasmosis (HGA)',
    organism: 'Anaplasma phagocytophilum (Intracellular Bacterium)',
    nymphPrevalenceAck: 0.11, // 11% nymph prevalence
    transmissionThresholdHours: 24,
    clinicalSign: 'High fever, rigors, leukopenia, elevated hepatic transaminases (AST/ALT)',
    treatmentSummary: 'Doxycycline 100mg BID x 10–14 days'
  },
  borrelia_miyamotoi: {
    pathogenId: 'borrelia_miyamotoi',
    pathogenName: 'Borrelia miyamotoi Disease',
    organism: 'Borrelia miyamotoi (Relapsing Fever Spirochete)',
    nymphPrevalenceAck: 0.025,
    transmissionThresholdHours: 12,
    clinicalSign: 'Relapsing high fever episodes without EM rash, severe frontal headache',
    treatmentSummary: 'Doxycycline 100mg BID x 14 days'
  },
  powassan: {
    pathogenId: 'powassan',
    pathogenName: 'Powassan Virus (Deer Tick Lineage II)',
    organism: 'Powassan Flavivirus',
    nymphPrevalenceAck: 0.015,
    transmissionThresholdHours: 0.25, // 15-minute transmission window
    clinicalSign: 'Altered mental status, encephalitic tremor, acute focal motor deficit',
    treatmentSummary: 'Supportive inpatient neuro-ICU care; zero antiviral available'
  },
  alpha_gal: {
    pathogenId: 'alpha_gal',
    pathogenName: 'Alpha-Gal Syndrome (Meat Allergy)',
    organism: 'Galactose-α-1,3-galactose Sensitization via Amblyomma bite',
    nymphPrevalenceAck: 0.08,
    transmissionThresholdHours: 4,
    clinicalSign: 'Delayed (3–6h postprandial) anaphylaxis or urticaria after red meat/dairy ingestion',
    treatmentSummary: 'Strict mammalian meat elimination + Epinephrine 0.3mg autoinjector prescription'
  }
};

export const DEFAULT_BODY_INSPECTION_ZONES: IBodyInspectionZone[] = [
  {
    id: 'scalp_hairline',
    zoneName: 'Scalp & Occipital Hairline',
    anatomicRegion: 'Head & Scalp',
    riskWeight: 9,
    clinicalInspectionTip: 'Part hair in 1-inch sections under bright light; run fingertips along base of skull.',
    isInspected: false
  },
  {
    id: 'behind_ears',
    zoneName: 'Behind & Inside Outer Ears',
    anatomicRegion: 'Head & Scalp',
    riskWeight: 8,
    clinicalInspectionTip: 'Inspect post-auricular crease and pinna concha.',
    isInspected: false
  },
  {
    id: 'axillae',
    zoneName: 'Axillary Creases (Underarms)',
    anatomicRegion: 'Torso & Axillae',
    riskWeight: 9,
    clinicalInspectionTip: 'Check warm apex folds with mirror or partner assistance.',
    isInspected: false
  },
  {
    id: 'umbilicus',
    zoneName: 'Umbilicus (Belly Button)',
    anatomicRegion: 'Torso & Axillae',
    riskWeight: 7,
    clinicalInspectionTip: 'Carefully evert and inspect the umbilical cavity.',
    isInspected: false
  },
  {
    id: 'groin_pelvis',
    zoneName: 'Groin, Inguinal Fold & Pelvic Belt',
    anatomicRegion: 'Pelvis & Groin',
    riskWeight: 10,
    clinicalInspectionTip: 'Highest nymph attachment incidence; inspect along waistband and inner thigh folds.',
    isInspected: false
  },
  {
    id: 'popliteal_fossa',
    zoneName: 'Popliteal Fossa (Back of Knees)',
    anatomicRegion: 'Lower Extremities',
    riskWeight: 8,
    clinicalInspectionTip: 'Feel for small poppy-seed sized bumps behind flexed knees.',
    isInspected: false
  },
  {
    id: 'ankles_socks',
    zoneName: 'Ankles & Interdigital Toes',
    anatomicRegion: 'Lower Extremities',
    riskWeight: 7,
    clinicalInspectionTip: 'Inspect sock-line indentation and between toes.',
    isInspected: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class NantucketTickRadarService {
  readonly hotspots = signal<INantucketGeoHotspot[]>(NANTUCKET_GEO_HOTSPOTS);
  readonly selectedHotspotId = signal<string>('squam_farm');
  readonly selectedSpecies = signal<TickSpecies>('ixodes_nymph');
  readonly hoursAttached = signal<number>(38);
  readonly hoursSinceRemoval = signal<number>(14);
  readonly isPregnant = signal<boolean>(false);
  readonly patientAge = signal<number>(28);

  readonly inspectionZones = signal<IBodyInspectionZone[]>(DEFAULT_BODY_INSPECTION_ZONES);
  readonly reportedSymptoms = signal<string[]>(['fatigue_malaise', 'bulls_eye_erythema']);

  readonly activeHotspot = computed<INantucketGeoHotspot>(() => {
    return this.hotspots().find(h => h.id === this.selectedHotspotId()) || this.hotspots()[0];
  });

  readonly dwellAssessment = computed<IDwellTimeAssessment>(() => {
    return this.assessDwellTime(
      this.hoursAttached(),
      this.hoursSinceRemoval(),
      this.selectedSpecies(),
      this.patientAge(),
      this.isPregnant()
    );
  });

  readonly bayesianTriageResults = computed<IBayesianTriageOutput[]>(() => {
    return this.calculateBayesianTriage(
      this.reportedSymptoms(),
      this.selectedSpecies(),
      this.hoursAttached(),
      this.selectedHotspotId()
    );
  });

  readonly inspectedZonesCount = computed<number>(() => {
    return this.inspectionZones().filter(z => z.isInspected).length;
  });

  assessDwellTime(
    hoursAttached: number,
    hoursSinceRemoval: number,
    species: TickSpecies,
    age = 30,
    isPregnant = false
  ): IDwellTimeAssessment {
    let dwellTier: AttachmentDwellTier = 'unattached';
    let transmissionProb = 0;

    if (hoursAttached <= 0) {
      dwellTier = 'unattached';
      transmissionProb = 0;
    } else if (hoursAttached < 24) {
      dwellTier = 'under_24h';
      transmissionProb = Math.min(2, Math.round((hoursAttached / 24) * 2));
    } else if (hoursAttached <= 36) {
      dwellTier = '24_to_36h';
      transmissionProb = Math.round(2 + ((hoursAttached - 24) / 12) * 12);
    } else if (hoursAttached <= 72) {
      dwellTier = '36_to_72h';
      transmissionProb = Math.round(14 + ((hoursAttached - 36) / 36) * 55);
    } else {
      dwellTier = 'over_72h';
      transmissionProb = Math.min(94, Math.round(69 + ((hoursAttached - 72) / 24) * 15));
    }

    const isBlacklegged = species === 'ixodes_nymph' || species === 'ixodes_adult';
    const attachedAtLeast36h = hoursAttached >= 36;
    const removedWithin72h = hoursSinceRemoval <= 72 && hoursSinceRemoval >= 0;
    const noContraindications = !isPregnant;

    const doxycyclineEligible =
      isBlacklegged && attachedAtLeast36h && removedWithin72h && noContraindications;

    const hoursRemaining = Math.max(0, 72 - hoursSinceRemoval);

    let recommendation = '';
    if (doxycyclineEligible) {
      recommendation = `✅ High Clinical Indication for Prophylaxis: Single-dose oral Doxycycline (200mg for adults; 4.4mg/kg up to 200mg for children) is indicated within the next ${hoursRemaining} hours per IDSA/AAP guidelines. Contact Nantucket Cottage Hospital Walk-in Clinic (508-825-1000).`;
    } else if (!isBlacklegged) {
      recommendation = `ℹ️ Prophylaxis Not Indicated for Non-Blacklegged Ticks: Lone Star and Dog ticks do not transmit Lyme disease. Monitor for Alpha-Gal (meat allergy) or Rocky Mountain Spotted Fever symptoms.`;
    } else if (!attachedAtLeast36h) {
      recommendation = `ℹ️ Prophylaxis Not Indicated (Attachment < 36 Hours): Transmission risk of Borrelia burgdorferi is extremely low (<2%) under 36h. Prophylactic antibiotics are not recommended. Begin a 30-day symptom watch.`;
    } else if (!removedWithin72h) {
      recommendation = `⚠️ Past 72-Hour Prophylaxis Window: More than 72 hours have elapsed since tick removal. Single-dose prophylaxis is no longer effective. Monitor closely for Erythema migrans rash or fever; initiate full treatment course if symptoms emerge.`;
    } else if (isPregnant) {
      recommendation = `⚠️ Pregnancy Precaution: Doxycycline is contraindicated during pregnancy. Consult with obstetric provider for close clinical surveillance or alternative amoxicillin protocol if symptomatic.`;
    }

    return {
      estimatedHours: hoursAttached,
      dwellTier,
      lymeTransmissionProbability: isBlacklegged ? transmissionProb : 0,
      doxycyclineProphylaxisEligible: doxycyclineEligible,
      prophylaxisCriteriaMet: {
        attachedAtLeast36h,
        removedWithin72h,
        speciesIsBlacklegged: isBlacklegged,
        noContraindications
      },
      clinicalRecommendation: recommendation,
      hoursRemainingIn72hWindow: hoursRemaining
    };
  }

  calculateBayesianTriage(
    symptoms: string[],
    species: TickSpecies,
    hoursAttached: number,
    hotspotId: string
  ): IBayesianTriageOutput[] {
    const isBlacklegged = species === 'ixodes_nymph' || species === 'ixodes_adult';
    const isLoneStar = species === 'lone_star';
    const hasBullsEye = symptoms.includes('bulls_eye_erythema');
    const hasDarkUrineSweats = symptoms.includes('dark_urine_sweats');
    const hasHighFeverRigors = symptoms.includes('high_fever_rigors');
    const hasMeatAllergy = symptoms.includes('meat_allergy_anaphylaxis');

    return Object.values(EMPIRICAL_NANTUCKET_PRIORS).map(prior => {
      let lr = 1.0;

      // Species specificity Likelihood Ratio
      if (prior.pathogenId === 'alpha_gal') {
        lr *= isLoneStar ? 8.5 : 0.05;
      } else {
        lr *= isBlacklegged ? 3.2 : 0.08;
      }

      // Dwell time Likelihood Ratio
      if (hoursAttached >= prior.transmissionThresholdHours) {
        lr *= 2.8;
      } else {
        lr *= 0.25;
      }

      // Pathognomonic symptom Likelihood Ratios
      if (prior.pathogenId === 'lyme_borrelia' && hasBullsEye) lr *= 24.0;
      if (prior.pathogenId === 'babesiosis' && hasDarkUrineSweats) lr *= 18.0;
      if (prior.pathogenId === 'anaplasmosis' && hasHighFeverRigors) lr *= 12.0;
      if (prior.pathogenId === 'alpha_gal' && hasMeatAllergy) lr *= 30.0;

      // Bayesian Odds Update: Posterior Odds = Prior Odds * LR
      const priorProb = prior.nymphPrevalenceAck;
      const priorOdds = priorProb / (1 - priorProb);
      const posteriorOdds = priorOdds * lr;
      const posteriorProb = posteriorOdds / (1 + posteriorOdds);
      const posteriorPercent = Math.min(99.4, Math.max(0.1, Math.round(posteriorProb * 1000) / 10));

      // Popperian Null-Hypothesis p-value (H0: No active infection)
      const pValueH0 = Math.max(0.001, Math.round((1 - posteriorProb) * 1000) / 1000);
      const nullHypothesisRejected = pValueH0 < 0.05;

      return {
        pathogenId: prior.pathogenId,
        pathogenName: prior.pathogenName,
        organism: prior.organism,
        priorProbability: priorProb,
        posteriorPercent,
        pValueH0,
        nullHypothesisRejected,
        treatmentSummary: prior.treatmentSummary
      };
    }).sort((a, b) => b.posteriorPercent - a.posteriorPercent);
  }

  toggleInspectionZone(zoneId: string): void {
    this.inspectionZones.update(zones =>
      zones.map(z => (z.id === zoneId ? { ...z, isInspected: !z.isInspected } : z))
    );
  }

  toggleSymptom(symptomId: string): void {
    this.reportedSymptoms.update(curr =>
      curr.includes(symptomId) ? curr.filter(s => s !== symptomId) : [...curr, symptomId]
    );
  }

  generateFhirR4Bundle(patientId = 'ACK-PAT-001'): object {
    const timestamp = new Date().toISOString();
    const bundleId = `ack-tick-bundle-${Date.now()}`;
    const dwell = this.dwellAssessment();
    const hotspot = this.activeHotspot();
    const topTriage = this.bayesianTriageResults()[0];

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp,
      entry: [
        {
          fullUrl: `urn:uuid:composition-${bundleId}`,
          resource: {
            resourceType: 'Composition',
            id: `comp-${bundleId}`,
            status: 'final',
            type: {
              coding: [{ system: 'http://loinc.org', code: '11488-4', display: 'Consultation note' }],
              text: 'Nantucket Island Tick-Borne Clinical Intake & Exposure Assessment'
            },
            subject: { display: `De-Identified Patient (${patientId})` },
            date: timestamp,
            author: [{ display: 'PocketGull Nantucket Tick Defense Engine (FHIR R4 Core)' }],
            title: 'Nantucket Cottage Hospital Emergency / Urgent Care Tick Hand-off Document',
            section: [
              {
                title: 'Vector Exposure & Dwell Time Assessment',
                code: {
                  coding: [{ system: 'http://snomed.info/sct', code: '283680004', display: 'Tick bite (disorder)' }]
                },
                text: {
                  status: 'generated',
                  div: `<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Geographic Locus:</b> ${hotspot.name}</p><p><b>Species:</b> ${this.selectedSpecies()}</p><p><b>Attachment Hours:</b> ${dwell.estimatedHours}h (${dwell.dwellTier})</p><p><b>Doxycycline Prophylaxis:</b> ${dwell.doxycyclineProphylaxisEligible ? 'INDICATED' : 'NOT INDICATED'}</p><p><b>Top Suspected Pathogen:</b> ${topTriage.pathogenName} (${topTriage.posteriorPercent}%, p < 0.05 H0 Rejected)</p></div>`
                }
              }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:observation-dwell-${bundleId}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-dwell-${bundleId}`,
            status: 'final',
            code: {
              coding: [{ system: 'http://loinc.org', code: '79190-5', display: 'Tick attachment duration' }]
            },
            valueQuantity: {
              value: dwell.estimatedHours,
              unit: 'hours',
              system: 'http://unitsofmeasure.org',
              code: 'h'
            }
          }
        },
        {
          fullUrl: `urn:uuid:condition-lyme-${bundleId}`,
          resource: {
            resourceType: 'Condition',
            id: `cond-lyme-${bundleId}`,
            clinicalStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
            },
            verificationStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }]
            },
            code: {
              coding: [{ system: 'http://snomed.info/sct', code: '23502006', display: 'Lyme disease' }]
            }
          }
        }
      ]
    };
  }
}
