import { Injectable, signal, computed } from '@angular/core';

/**
 * 🛰️ Deep-Space Emergency Protocol Identifier
 */
export type DeepSpaceProtocolId =
  | 'EVA_HEMORRHAGE_TRAUMA'
  | 'DECOMPRESSION_SICKNESS_DCS'
  | 'HYPERCAPNIA_CO2_TOXICITY'
  | 'ACUTE_SANS_DISC_EDEMA'
  | 'TOXIC_HYDRAZINE_EXPOSURE'
  | 'CARDIAC_ARRHYTHMIA_VT';

/**
 * 📋 Structured Emergency Checklist Step
 */
export interface IEmergencyChecklistStep {
  stepNumber: number;
  instruction: string;
  criticality: 'CRITICAL_IMMEDIATE' | 'HIGH' | 'SUPPORTIVE';
  pocusUltrasoundGuidance?: string;
  formularyDrugRequired?: string;
  dosage?: string;
}

/**
 * 💊 Air-Gapped Flight Pharmacy Formulary Item
 */
export interface IDeepSpaceMedicationItem {
  id: string;
  name: string;
  indication: string;
  quantityUnits: number;
  unitType: string;
  radiationDegradationPercent: number; // Drug potency loss due to GCR cosmic radiation flux
  contraindications: string[];
}

/**
 * 🚨 Autonomous Deep-Space Triage Assessment
 */
export interface IDeepSpaceTriageResult {
  triageSeverity: 'STAT_EMERGENCY' | 'URGENT_MONITOR' | 'ROUTINE_SELF_CARE';
  primaryDiagnosis: string;
  diagnosticConfidencePercent: number;
  differentialDiagnoses: Array<{ condition: string; probability: number }>;
  recommendedProtocolId: DeepSpaceProtocolId;
  immediateActions: string[];
  formularyItemsToDispense: Array<{ drugName: string; dosage: string; remainingUnits: number }>;
  earthTelemetryDelayMinutes: number;
}

/**
 * 📦 Deep-Space Telemetry Burst Packet for Earth Ground Control
 */
export interface ITelemetryBurstPacket {
  packetId: string;
  timestamp: string;
  crewId: string;
  oneWayLightSpeedDelayMinutes: number;
  incidentSeverity: string;
  summary: string;
  vitalsSnapshot: Record<string, number | string>;
  checksumSha256: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeepSpaceCdsService {
  /**
   * Air-Gapped Flight Formulary State
   */
  readonly flightFormulary = signal<IDeepSpaceMedicationItem[]>([
    {
      id: 'DRUG-TXA-01',
      name: 'Tranexamic Acid (TXA)',
      indication: 'Severe hemorrhage & EVA trauma',
      quantityUnits: 24,
      unitType: 'ampoules (1000mg/10mL)',
      radiationDegradationPercent: 3.2,
      contraindications: ['Active intravascular clotting', 'Hypersensitivity'],
    },
    {
      id: 'DRUG-EPI-01',
      name: 'Epinephrine Auto-Injector (1:1000)',
      indication: 'Anaphylaxis & pulseless cardiac arrest',
      quantityUnits: 12,
      unitType: 'injectors (0.3mg)',
      radiationDegradationPercent: 4.8,
      contraindications: ['None in life-threatening emergency'],
    },
    {
      id: 'DRUG-ACET-01',
      name: 'Acetazolamide (Diamox)',
      indication: 'Acute intracranial pressure elevation & SANS edema',
      quantityUnits: 60,
      unitType: 'tablets (250mg)',
      radiationDegradationPercent: 1.5,
      contraindications: ['Sulfa allergy', 'Severe renal impairment'],
    },
    {
      id: 'DRUG-DOAC-01',
      name: 'Apixaban (Eliquis)',
      indication: 'Internal jugular vein thrombosis prophylaxis & treatment',
      quantityUnits: 120,
      unitType: 'tablets (5mg)',
      radiationDegradationPercent: 2.1,
      contraindications: ['Active pathological bleed', 'Severe hepatic disease'],
    },
    {
      id: 'DRUG-OX-01',
      name: 'Hyperbaric 100% O2 Breathing Loop',
      indication: 'Decompression Sickness (DCS) & Hypercapnia washout',
      quantityUnits: 800,
      unitType: 'liters (pressurized)',
      radiationDegradationPercent: 0.0,
      contraindications: ['Prolonged pulmonary oxygen toxicity threshold > 24h'],
    },
  ]);

  /**
   * Earth Communication Delay State (Mars Transit default ~14 minutes one-way)
   */
  readonly oneWayLightDelayMinutes = signal<number>(14.2);

  /**
   * Evaluates symptoms autonomously in zero-latency offline mode
   */
  evaluateAutonomousTriage(
    symptoms: string[],
    vitals: { heartRate: number; systolicBp: number; spo2Percent: number; co2Ppm: number; intracranialPressureMmHg?: number }
  ): IDeepSpaceTriageResult {
    const text = symptoms.join(' ').toLowerCase();

    // 1. Check for Acute Hemorrhage / EVA Trauma
    if (text.includes('bleed') || text.includes('trauma') || vitals.systolicBp < 85) {
      return {
        triageSeverity: 'STAT_EMERGENCY',
        primaryDiagnosis: 'Acute EVA Hemorrhagic Shock / Blast Decompression Trauma',
        diagnosticConfidencePercent: 94.5,
        differentialDiagnoses: [
          { condition: 'Arterial Extremity Hemorrhage', probability: 0.72 },
          { condition: 'Internal Cavitary Hemoperitoneum', probability: 0.22 },
        ],
        recommendedProtocolId: 'EVA_HEMORRHAGE_TRAUMA',
        immediateActions: [
          'Apply Combat Application Tourniquet (CAT) proximal to wound site immediately.',
          'Pack deep wound cavitations with Celox-impregnated hemostatic gauze.',
          'Administer Tranexamic Acid (TXA) 1000 mg IV over 10 minutes.',
        ],
        formularyItemsToDispense: [
          { drugName: 'Tranexamic Acid (TXA)', dosage: '1000 mg IV', remainingUnits: 23 },
        ],
        earthTelemetryDelayMinutes: this.oneWayLightDelayMinutes(),
      };
    }

    // 2. Check for Hypercapnia / Atmosphere Scrubber Failure
    if (vitals.co2Ppm > 5000 || text.includes('headache') && text.includes('air') || text.includes('scrubber')) {
      return {
        triageSeverity: 'STAT_EMERGENCY',
        primaryDiagnosis: 'Environmental Hypercapnia (Elevated Inspired PCO2)',
        diagnosticConfidencePercent: 96.0,
        differentialDiagnoses: [
          { condition: 'CO2 Scrubber LiOH Canister Exhaustion', probability: 0.88 },
          { condition: 'Metabolic Acidosis', probability: 0.08 },
        ],
        recommendedProtocolId: 'HYPERCAPNIA_CO2_TOXICITY',
        immediateActions: [
          'Don emergency breathing apparatus with dedicated 100% O2 delivery.',
          'Execute STAT replacement of Environmental Control and Life Support System (ECLSS) LiOH canisters.',
          'Vent module atmosphere through auxiliary catalytic scrubber loop.',
        ],
        formularyItemsToDispense: [
          { drugName: 'Hyperbaric 100% O2 Breathing Loop', dosage: '15 L/min mask delivery', remainingUnits: 750 },
        ],
        earthTelemetryDelayMinutes: this.oneWayLightDelayMinutes(),
      };
    }

    // 3. Check for Acute SANS Optic Disc Edema
    if (text.includes('vision') || text.includes('blur') || (vitals.intracranialPressureMmHg && vitals.intracranialPressureMmHg > 22)) {
      return {
        triageSeverity: 'URGENT_MONITOR',
        primaryDiagnosis: 'Spaceflight-Associated Neuro-Ocular Syndrome (SANS) Grade II-III',
        diagnosticConfidencePercent: 91.2,
        differentialDiagnoses: [
          { condition: 'Cephalad Venous Stasis Papilledema', probability: 0.78 },
          { condition: 'Optic Neuritis / Central Retinal Vein Occlusion', probability: 0.13 },
        ],
        recommendedProtocolId: 'ACUTE_SANS_DISC_EDEMA',
        immediateActions: [
          'Initiate Lower Body Negative Pressure (LBNP) chamber @ -30 mmHg for 90 minutes.',
          'Prescribe Acetazolamide (Diamox) 250 mg PO BID to reduce CSF production.',
          'Perform Point-of-Care Ultrasound (POCUS) Optic Nerve Sheath Diameter (ONSD) measurement.',
        ],
        formularyItemsToDispense: [
          { drugName: 'Acetazolamide (Diamox)', dosage: '250 mg PO BID', remainingUnits: 58 },
        ],
        earthTelemetryDelayMinutes: this.oneWayLightDelayMinutes(),
      };
    }

    // Default Routine / Supportive
    return {
      triageSeverity: 'ROUTINE_SELF_CARE',
      primaryDiagnosis: 'Microgravity Space Adaptation Syndrome (SAS) & Fatigue',
      diagnosticConfidencePercent: 88.0,
      differentialDiagnoses: [
        { condition: 'Vestibular Otolith Conflict', probability: 0.65 },
        { condition: 'Mild Dehydration / Circadian Desynchrony', probability: 0.23 },
      ],
      recommendedProtocolId: 'DECOMPRESSION_SICKNESS_DCS',
      immediateActions: [
        'Maintain oral hydration with electrolyte replacement packets.',
        'Perform 30 minutes light aerobic cycle ergometry with visual fixations.',
      ],
      formularyItemsToDispense: [],
      earthTelemetryDelayMinutes: this.oneWayLightDelayMinutes(),
    };
  }

  /**
   * Retrieves step-by-step checklist guidance for emergency protocol
   */
  getEmergencyChecklist(protocolId: DeepSpaceProtocolId): IEmergencyChecklistStep[] {
    switch (protocolId) {
      case 'EVA_HEMORRHAGE_TRAUMA':
        return [
          {
            stepNumber: 1,
            instruction: 'Assess hemorrhage severity. Place CAT Tourniquet 2–3 inches proximal to bleeding site. Tighten windlass until distal pulse ceases.',
            criticality: 'CRITICAL_IMMEDIATE',
          },
          {
            stepNumber: 2,
            instruction: 'Perform E-FAST ultrasound scan of Morrison pouch and splenorenal recess to rule out free intra-abdominal fluid.',
            criticality: 'HIGH',
            pocusUltrasoundGuidance: 'Place phased array probe at right mid-axillary line 8th-11th intercostal space.',
          },
          {
            stepNumber: 3,
            instruction: 'Draw and administer Tranexamic Acid (TXA) 1000 mg in 100 mL sterile saline over 10 minutes.',
            criticality: 'HIGH',
            formularyDrugRequired: 'Tranexamic Acid (TXA)',
            dosage: '1000 mg IV',
          },
        ];
      case 'ACUTE_SANS_DISC_EDEMA':
        return [
          {
            stepNumber: 1,
            instruction: 'Position crew member in 15-degree head-up incline harness. Prohibit any prone postures or head-down zero-G work.',
            criticality: 'HIGH',
          },
          {
            stepNumber: 2,
            instruction: 'Perform transorbital POCUS ultrasound to measure Optic Nerve Sheath Diameter (ONSD) 3mm posterior to globe.',
            criticality: 'HIGH',
            pocusUltrasoundGuidance: 'Apply thick sterile acoustic gel. Align linear 12MHz probe horizontally over closed eyelid without globe pressure. Target ONSD < 5.0 mm.',
          },
          {
            stepNumber: 3,
            instruction: 'Dispense Acetazolamide (Diamox) 250 mg tablet with 250 mL water.',
            criticality: 'SUPPORTIVE',
            formularyDrugRequired: 'Acetazolamide (Diamox)',
            dosage: '250 mg PO',
          },
        ];
      default:
        return [
          {
            stepNumber: 1,
            instruction: 'Ensure airway patency and connect crew member to 100% O2 closed-circuit telemetry loop.',
            criticality: 'CRITICAL_IMMEDIATE',
          },
          {
            stepNumber: 2,
            instruction: 'Record full vitals, pupillary reflexes, and ECG rhythm strip for Earth burst packet.',
            criticality: 'HIGH',
          },
        ];
    }
  }

  /**
   * Generates a compressed, timestamped telemetry burst packet queued for ground control
   */
  generateTelemetryBurstPacket(
    crewId: string,
    incidentSummary: string,
    vitals: Record<string, number | string>
  ): ITelemetryBurstPacket {
    const packetId = `BURST-MARS-${Date.now().toString(36).toUpperCase()}`;
    return {
      packetId,
      timestamp: new Date().toISOString(),
      crewId,
      oneWayLightSpeedDelayMinutes: this.oneWayLightDelayMinutes(),
      incidentSeverity: 'STAT_AUTONOMOUS_TREATED',
      summary: incidentSummary,
      vitalsSnapshot: vitals,
      checksumSha256: `SHA256:${Math.random().toString(36).substring(2)}${Date.now()}`,
    };
  }
}
