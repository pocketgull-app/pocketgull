import { Injectable, signal, computed } from '@angular/core';

/**
 * 🌌 NASA Human Research Program (HRP) & TRISH Spaceflight Mission Phases
 */
export type SpaceflightMissionPhase =
  | 'PREFLIGHT_BASELINE'
  | 'LEO_ORBIT_ISS'
  | 'LUNAR_GATEWAY'
  | 'LUNAR_SURFACE_EVA'
  | 'MARS_TRANSIT_AIRGAPPED'
  | 'MARS_SURFACE_EXPEDITION'
  | 'POSTFLIGHT_REHAB';

/**
 * 👁️ SANS (Spaceflight-Associated Neuro-Ocular Syndrome) Frisén Edema Grade (0-5)
 */
export type FrisenGrade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 📊 Crew Biophysics & Microgravity Telemetry Payload
 */
export interface ISpaceCrewTelemetry {
  crewId: string;
  crewRole: 'COMMANDER' | 'MISSION_SPECIALIST' | 'FLIGHT_ENGINEER' | 'MEDICAL_OFFICER';
  missionPhase: SpaceflightMissionPhase;
  missionDay: number;
  // Cephalad Rostral Fluid Shift
  jugularCrossSectionalAreaMm2: number; // Baseline ~120 mm2 in 1G supine; microgravity cephalad shift expands to 200+ mm2
  internalJugularFlowState: 'NORMAL_ANTEROGRADE' | 'STAGNANT_LOW_VELOCITY' | 'RETROGRADE_REVERSAL';
  facialEdemaScorePercent: number; // 0-100% subjective/rPPG facial fluid accumulation
  // SANS (Spaceflight-Associated Neuro-Ocular Syndrome)
  octTotalRetinalThicknessUm: number; // Normal ~280-300 um; SANS edema increases to 350-500+ um
  frisenGrade: FrisenGrade;
  choroidalFoldsDetected: boolean;
  hyperopicShiftDiopters: number; // Progressive hyperopia from globe flattening (+0.25 to +2.50 D)
  // Musculoskeletal & Bone Mineral Density (BMD)
  monthlyBmdLossRatePercent: number; // Calcaneus/Lumbar spine trabecular resorption (-1.0 to -1.5%/month)
  urinaryNtxNmolBce: number; // Bone resorption marker NTx (normal 20-60; microgravity >100 nmol BCE/mmol Cr)
  aredResistanceWorkloadKjDay: number; // Daily ARED target ~250-400 kJ/day
  // Galactic Cosmic Radiation (GCR) & Solar Particle Events (SPE)
  cumulativeDoseMsv: number; // NASA Career Permissible Exposure Limit (PEL) ~600 mSv
  dailyGcrDoseRateUSvDay: number; // Deep space GCR ~1300-1800 uSv/day; LEO ~300-500 uSv/day
  speAlertActive: boolean; // Solar Particle Event active (requires storm shelter retreat)
}

/**
 * 🛡️ TRISH / NASA Microgravity Countermeasure Prescription
 */
export interface ISpaceCountermeasurePlan {
  fluidShiftProtocol: string[];
  sansMitigation: {
    lensDiopterCorrection: number;
    recommendedHeadDownBedrestInversion: string;
    lowerBodyNegativePressureLBNP: string;
    nutritionalOcularAdjuncts: string[];
  };
  musculoskeletalRegimen: {
    aredPrescribedLoadKn: number;
    t2TreadmillDurationMinutes: number;
    bisphosphonateAntiresorptiveIndicated: boolean;
  };
  radiationProtection: {
    careerPelUsedPercent: number;
    stormShelterProtocol: string;
    antioxidantRadioprotectiveDeck: string[];
  };
  overallCrewFlightReadiness: 'FLIGHT_READY' | 'MONITOR_ELEVATED_SANS' | 'STAT_COUNTERMEASURE_REQUIRED';
}

@Injectable({
  providedIn: 'root',
})
export class SpaceBiophysicsService {
  /**
   * Active Crew Telemetry State
   */
  readonly activeCrewTelemetry = signal<ISpaceCrewTelemetry>({
    crewId: 'ASTRONAUT-ARTEMIS-07',
    crewRole: 'MEDICAL_OFFICER',
    missionPhase: 'MARS_TRANSIT_AIRGAPPED',
    missionDay: 84,
    jugularCrossSectionalAreaMm2: 245,
    internalJugularFlowState: 'NORMAL_ANTEROGRADE',
    facialEdemaScorePercent: 42,
    octTotalRetinalThicknessUm: 365,
    frisenGrade: 2,
    choroidalFoldsDetected: true,
    hyperopicShiftDiopters: 1.25,
    monthlyBmdLossRatePercent: 1.2,
    urinaryNtxNmolBce: 88,
    aredResistanceWorkloadKjDay: 310,
    cumulativeDoseMsv: 142.4,
    dailyGcrDoseRateUSvDay: 1480,
    speAlertActive: false,
  });

  /**
   * Computed SANS Risk Severity Level
   */
  readonly sansRiskLevel = computed<'NORMAL' | 'MILD_SANS' | 'MODERATE_SANS' | 'SEVERE_SANS'>(() => {
    const t = this.activeCrewTelemetry();
    if (t.octTotalRetinalThicknessUm > 420 || t.frisenGrade >= 4) {
      return 'SEVERE_SANS';
    }
    if (t.octTotalRetinalThicknessUm > 350 || t.frisenGrade >= 2 || t.choroidalFoldsDetected) {
      return 'MODERATE_SANS';
    }
    if (t.octTotalRetinalThicknessUm > 310 || t.frisenGrade >= 1 || t.hyperopicShiftDiopters > 0.5) {
      return 'MILD_SANS';
    }
    return 'NORMAL';
  });

  /**
   * Computed Radiation Career PEL Usage (NASA 600 mSv Career Ceiling)
   */
  readonly radiationPelUsagePercent = computed<number>(() => {
    const dose = this.activeCrewTelemetry().cumulativeDoseMsv;
    return Math.min(100, Math.round((dose / 600) * 1000) / 10);
  });

  /**
   * Computed Comprehensive Countermeasure Plan
   */
  readonly countermeasurePlan = computed<ISpaceCountermeasurePlan>(() => {
    return this.generateCountermeasures(this.activeCrewTelemetry());
  });

  /**
   * Update active telemetry parameters cleanly via Angular Signals
   */
  updateTelemetry(patch: Partial<ISpaceCrewTelemetry>): void {
    this.activeCrewTelemetry.update((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  /**
   * Evaluates biophysical microgravity countermeasures according to TRISH/NASA standards
   */
  generateCountermeasures(telemetry: ISpaceCrewTelemetry): ISpaceCountermeasurePlan {
    // 1. Fluid Shift Protocol
    const fluidShiftProtocol: string[] = [
      'Enforce daily Lower Body Negative Pressure (LBNP) @ -25 mmHg for 60 minutes to draw venous pool caudad.',
      'Maintain thigh/calf gradient compression cuffs during operational wake cycles.',
    ];
    if (telemetry.internalJugularFlowState !== 'NORMAL_ANTEROGRADE') {
      fluidShiftProtocol.push('CRITICAL: Doppler-detected venous stasis/retrograde flow. Enforce prophylactic direct oral anticoagulant (DOAC) triage screening.');
    }

    // 2. SANS Mitigation
    const sansMitigation = {
      lensDiopterCorrection: telemetry.hyperopicShiftDiopters,
      recommendedHeadDownBedrestInversion: 'Prohibit acute prone posture; sleep with 15-degree head-elevation harness.',
      lowerBodyNegativePressureLBNP: telemetry.frisenGrade >= 2 ? 'LBNP High-Dose: 90 mins @ -30 mmHg' : 'LBNP Maintenance: 45 mins @ -20 mmHg',
      nutritionalOcularAdjuncts: [
        '1-Carbon Pathway Supplementation: L-Methylfolate (800 mcg) + Methylcobalamin (1000 mcg) (mitigate MTHFR genetic polymorphism SANS predisposition)',
        'Lutein (20 mg) + Zeaxanthin (4 mg) macular pigment protective deck',
        'Anthocyanin / Epigallocatechin gallate (EGCG) microvascular endothelial stabilization',
      ],
    };

    // 3. Musculoskeletal / ARED
    const bisphosphonateIndicated = telemetry.monthlyBmdLossRatePercent > 1.3 || telemetry.urinaryNtxNmolBce > 90;
    const musculoskeletalRegimen = {
      aredPrescribedLoadKn: Math.min(2.6, 1.8 + (telemetry.missionDay / 120) * 0.5),
      t2TreadmillDurationMinutes: 35,
      bisphosphonateAntiresorptiveIndicated: bisphosphonateIndicated,
    };

    // 4. Radiation Dosimetry
    const pelUsed = Math.min(100, Math.round((telemetry.cumulativeDoseMsv / 600) * 1000) / 10);
    const stormShelter = telemetry.speAlertActive
      ? '🚨 SPE FLUX HAZARD: Immediate crew retreat to Water-Wall Storm Shelter (attenuation factor > 4.5).'
      : 'Nominal deep-space GCR monitoring. Secondary water-shielding active.';

    const radiationProtection = {
      careerPelUsedPercent: pelUsed,
      stormShelterProtocol: stormShelter,
      antioxidantRadioprotectiveDeck: [
        'N-Acetylcysteine (NAC) 1200 mg BID (GSH precursor for reactive oxygen species neutralization)',
        'Alpha-Lipoic Acid 600 mg + CoQ10 (Ubiquinol) 200 mg mitochondrial membrane defense',
        'Astroxanthin / Melatonin 10 mg nocturnal DNA double-strand break repair entrainment',
      ],
    };

    // Flight readiness determination
    let readiness: ISpaceCountermeasurePlan['overallCrewFlightReadiness'] = 'FLIGHT_READY';
    if (telemetry.speAlertActive || telemetry.frisenGrade >= 3 || telemetry.internalJugularFlowState === 'RETROGRADE_REVERSAL') {
      readiness = 'STAT_COUNTERMEASURE_REQUIRED';
    } else if (telemetry.frisenGrade >= 1 || telemetry.octTotalRetinalThicknessUm > 330) {
      readiness = 'MONITOR_ELEVATED_SANS';
    }

    return {
      fluidShiftProtocol,
      sansMitigation,
      musculoskeletalRegimen,
      radiationProtection,
      overallCrewFlightReadiness: readiness,
    };
  }

  /**
   * Generates a FHIR R4 DiagnosticReport for TRISH / NASA Ground Control Telemetry Exchange
   */
  exportTrishFhirBundle(): Record<string, unknown> {
    const t = this.activeCrewTelemetry();
    return {
      resourceType: 'DiagnosticReport',
      id: `trish-space-telemetry-${t.crewId}-${t.missionDay}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'RAD',
              display: 'Spaceflight Radiology & Biophysical Telemetry',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '99201-9',
            display: 'NASA TRISH Spaceflight Biophysics Telemetry Assessment',
          },
        ],
      },
      subject: {
        reference: `Patient/${t.crewId}`,
        display: `Astronaut ${t.crewId} (${t.crewRole})`,
      },
      effectiveDateTime: new Date().toISOString(),
      conclusion: `TRISH Space Assessment: Mission Phase ${t.missionPhase} (Day ${t.missionDay}). SANS Frisén Grade ${t.frisenGrade}, OCT RNFL ${t.octTotalRetinalThicknessUm} µm, Cumulative Dose ${t.cumulativeDoseMsv} mSv. Readiness: ${this.countermeasurePlan().overallCrewFlightReadiness}.`,
      result: [
        {
          display: `SANS Frisén Grade: ${t.frisenGrade}`,
          valueInteger: t.frisenGrade,
        },
        {
          display: `OCT Retinal Thickness: ${t.octTotalRetinalThicknessUm} µm`,
          valueQuantity: { value: t.octTotalRetinalThicknessUm, unit: 'um', code: 'um' },
        },
        {
          display: `Cumulative Ionizing Dose: ${t.cumulativeDoseMsv} mSv`,
          valueQuantity: { value: t.cumulativeDoseMsv, unit: 'mSv', code: 'mSv' },
        },
        {
          display: `Monthly BMD Loss Rate: ${t.monthlyBmdLossRatePercent} %/mo`,
          valueQuantity: { value: t.monthlyBmdLossRatePercent, unit: '%/month', code: '%/mo' },
        },
      ],
    };
  }
}
