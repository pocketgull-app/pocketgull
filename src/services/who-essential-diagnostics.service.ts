/**
 * WHO Essential Diagnostics List (EDL-4) & Cold-Chain Telemetry Service
 * 
 * Clinical & Statutory Foundations:
 * 1. WHO Model List of Essential In Vitro Diagnostics (EDL-4, 2023/2024):
 *    - Validated diagnostics for primary care & community health centers without laboratories.
 * 2. Point-of-Care Rapid Diagnostic Tests (RDTs):
 *    - Dual HIV/Syphilis Rapid Test (Prenatal transmission elimination mandate).
 *    - Malaria Pf/Pv Antigen RDT (HRP2 / pLDH differential with G6PD-safe therapy).
 *    - Dengue NS1 / IgM-IgG (Acute viremia triage + strict NSAID prohibition).
 *    - Sickle Cell Disease (SCD) Rapid Lateral Flow (Early childhood penicillin/pneumococcal bundle).
 * 3. WHO PQS Cold-Chain & Solar Microgrid Watchdog:
 *    - Continuous vaccine & reagent storage temperature monitoring (+2°C to +8°C).
 *    - Freeze-damage risk (<0°C) for freeze-sensitive biologicals (HepB, DTP, Td, HPV).
 *    - Solar PV microgrid autonomy projection (hours remaining to battery cutoff).
 */

import { Injectable, signal, computed } from '@angular/core';

// ────────────────────────────────────────────────────────────────────────────
// RDT Test Types & Result Data Contracts
// ────────────────────────────────────────────────────────────────────────────

export type RdtTestType =
  | 'hiv_syphilis_dual'
  | 'malaria_pf_pv'
  | 'dengue_ns1_ab'
  | 'sickle_cell_rdt';

export interface IHivSyphilisRdtResult {
  controlLineValid: boolean;
  hivResult: 'NON_REACTIVE' | 'REACTIVE';
  syphilisResult: 'NON_REACTIVE' | 'REACTIVE';
  classification: 'NON_REACTIVE' | 'HIV_MONO_REACTIVE' | 'SYPHILIS_MONO_REACTIVE' | 'DUAL_REACTIVE' | 'INVALID';
  gestationalState: boolean; // Pregnant patient
  clinicalAction: string;
  mandatoryFormulary: string[];
  acuityTier: 'GREEN' | 'YELLOW' | 'RED';
}

export interface IMalariaRdtResult {
  controlLineValid: boolean;
  hrp2PfResult: boolean; // P. falciparum HRP2
  pLdhPvResult: boolean; // P. vivax pLDH
  speciesClassification: 'NEGATIVE' | 'P_FALCIPARUM' | 'P_VIVAX' | 'MIXED_INFECTION' | 'INVALID';
  hasDangerSigns: boolean; // Vomiting, altered mentation, severe anemia
  clinicalAction: string;
  firstLineTherapy: string;
  g6pdWarningRequired: boolean;
  acuityTier: 'GREEN' | 'YELLOW' | 'RED';
}

export interface IDengueRdtResult {
  controlLineValid: boolean;
  ns1AgResult: boolean; // Days 1-5 acute
  igmResult: boolean;   // Days 5+ recent
  iggResult: boolean;   // Secondary infection (higher DHF risk)
  infectionStage: 'NEGATIVE' | 'ACUTE_PRIMARY' | 'RECENT_PRIMARY' | 'SECONDARY_HIGH_RISK' | 'INVALID';
  hasWarningSigns: boolean; // Severe abdominal pain, mucosal bleed, fluid accumulation
  clinicalAction: string;
  contraindicatedMedications: string[];
  acuityTier: 'GREEN' | 'YELLOW' | 'RED';
}

export interface ISickleCellRdtResult {
  controlLineValid: boolean;
  phenotypeResult: 'HB_AA_NORMAL' | 'HB_AS_TRAIT' | 'HB_SS_DISEASE' | 'HB_SC_OR_THAL' | 'INVALID';
  patientAgeMonths: number;
  clinicalAction: string;
  preventiveBundle: string[];
  acuityTier: 'GREEN' | 'YELLOW' | 'RED';
}

export interface IColdChainTelemetry {
  fridgeTempCelsius: number;        // Ideal: +2.0 to +8.0 °C
  ambientTempCelsius: number;       // External field temp
  vvmStage: 1 | 2 | 3 | 4;          // Vaccine Vial Monitor: 1-2 OK, 3-4 DISCARD
  batteryVoltageVolts: number;      // 12.0V - 14.6V
  batteryStateOfChargePct: number;  // 0 - 100%
  solarIrradianceWattsM2: number;   // 0 - 1000 W/m²
  fridgeCompressorActive: boolean;
  statusTier: 'OPTIMAL' | 'COLD_EXCURSION' | 'FREEZE_HAZARD' | 'HEAT_EXCURSION' | 'BATTERY_CRITICAL';
  statusLabel: string;
  projectedAutonomyHours: number;
  actionGuidance: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhoEssentialDiagnosticsService {

  // Active Selected Test View
  readonly activeRdtType = signal<RdtTestType>('hiv_syphilis_dual');

  // RDT 1: Dual HIV / Syphilis Signals
  readonly hivSyphilisControl = signal<boolean>(true);
  readonly hivReactive = signal<boolean>(false);
  readonly syphilisReactive = signal<boolean>(true);
  readonly isPregnant = signal<boolean>(true);

  // RDT 2: Malaria Pf / Pv Signals
  readonly malariaControl = signal<boolean>(true);
  readonly malariaPfHrp2 = signal<boolean>(true);
  readonly malariaPvLdh = signal<boolean>(false);
  readonly malariaDangerSigns = signal<boolean>(false);

  // RDT 3: Dengue NS1 / Ab Signals
  readonly dengueControl = signal<boolean>(true);
  readonly dengueNs1 = signal<boolean>(true);
  readonly dengueIgm = signal<boolean>(false);
  readonly dengueIgg = signal<boolean>(false);
  readonly dengueWarningSigns = signal<boolean>(false);

  // RDT 4: Sickle Cell Signals
  readonly sickleControl = signal<boolean>(true);
  readonly sicklePhenotype = signal<'HB_AA_NORMAL' | 'HB_AS_TRAIT' | 'HB_SS_DISEASE' | 'HB_SC_OR_THAL'>('HB_SS_DISEASE');
  readonly sicklePatientAgeMonths = signal<number>(14);

  // Cold Chain Telemetry Signal
  readonly coldChainInputs = signal<{
    fridgeTempC: number;
    ambientTempC: number;
    vvmStage: 1 | 2 | 3 | 4;
    batteryVoltageV: number;
    batterySocPct: number;
    solarWattsM2: number;
  }>({
    fridgeTempC: 4.5,
    ambientTempC: 34.0,
    vvmStage: 1,
    batteryVoltageV: 13.2,
    batterySocPct: 82,
    solarWattsM2: 650
  });

  // ────────────────────────────────────────────────────────────────────────
  // Computed Clinical Outputs
  // ────────────────────────────────────────────────────────────────────────

  readonly hivSyphilisAssessment = computed<IHivSyphilisRdtResult>(() => {
    const valid = this.hivSyphilisControl();
    if (!valid) {
      return {
        controlLineValid: false,
        hivResult: 'NON_REACTIVE',
        syphilisResult: 'NON_REACTIVE',
        classification: 'INVALID',
        gestationalState: this.isPregnant(),
        clinicalAction: 'INVALID TEST: Control line missing. Retest immediately with a new test cassette from a verified pouch.',
        mandatoryFormulary: [],
        acuityTier: 'RED'
      };
    }

    const hiv = this.hivReactive();
    const syph = this.syphilisReactive();
    const preg = this.isPregnant();

    let classification: 'NON_REACTIVE' | 'HIV_MONO_REACTIVE' | 'SYPHILIS_MONO_REACTIVE' | 'DUAL_REACTIVE' = 'NON_REACTIVE';
    if (hiv && syph) classification = 'DUAL_REACTIVE';
    else if (hiv) classification = 'HIV_MONO_REACTIVE';
    else if (syph) classification = 'SYPHILIS_MONO_REACTIVE';

    const formularies: string[] = [];
    let action = '';
    let acuity: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';

    if (classification === 'DUAL_REACTIVE') {
      acuity = 'RED';
      action = preg
        ? '🚨 DUAL REACTIVE IN PREGNANCY: Urgent prevention of mother-to-child transmission (MTCT). Administer Benzathine Penicillin G STAT. Initiate WHO first-line ART (TLD) linkage. Partner notification and treatment.'
        : '🚨 DUAL REACTIVE: Syphilis curative therapy + HIV confirmatory algorithm (WHO 3-test strategy). Initiate immediate TLD counseling.';
      formularies.push('Benzathine Penicillin G 2.4 MU IM single dose', 'Tenofovir / Lamivudine / Dolutegravir (TLD) fixed-dose');
    } else if (classification === 'SYPHILIS_MONO_REACTIVE') {
      acuity = preg ? 'RED' : 'YELLOW';
      action = preg
        ? '⚠️ SYPHILIS IN PREGNANCY: Immediate single-dose Benzathine Penicillin G 2.4 MU IM prevents stillbirth, congenital syphilis, and neonatal death. Treat partner simultaneously.'
        : 'Syphilis active antibodies detected. Administer Benzathine Penicillin G 2.4 MU IM single dose (or Doxycycline 100mg BID x14d if non-pregnant penicillin-allergic).';
      formularies.push('Benzathine Penicillin G 2.4 MU IM', 'Doxycycline 100mg (alternative in non-pregnant)');
    } else if (classification === 'HIV_MONO_REACTIVE') {
      acuity = 'YELLOW';
      action = 'HIV-1/2 antibodies reactive. Perform second confirmatory RDT per national algorithm. If confirmed, initiate sameday ART counseling & linkage (TLD).';
      formularies.push('Tenofovir / Lamivudine / Dolutegravir (TLD)', 'Cotrimoxazole 960mg (prophylaxis if CD4 low)');
    } else {
      action = 'Non-reactive for HIV and Syphilis antibodies. Reassure patient. Retest in 3rd trimester if pregnant in high-incidence setting.';
    }

    return {
      controlLineValid: true,
      hivResult: hiv ? 'REACTIVE' : 'NON_REACTIVE',
      syphilisResult: syph ? 'REACTIVE' : 'NON_REACTIVE',
      classification,
      gestationalState: preg,
      clinicalAction: action,
      mandatoryFormulary: formularies,
      acuityTier: acuity
    };
  });

  readonly malariaAssessment = computed<IMalariaRdtResult>(() => {
    const valid = this.malariaControl();
    if (!valid) {
      return {
        controlLineValid: false,
        hrp2PfResult: false,
        pLdhPvResult: false,
        speciesClassification: 'INVALID',
        hasDangerSigns: this.malariaDangerSigns(),
        clinicalAction: 'INVALID TEST: Control line failed. Discard cassette and re-test with new lancet and buffer.',
        firstLineTherapy: 'None',
        g6pdWarningRequired: false,
        acuityTier: 'RED'
      };
    }

    const pf = this.malariaPfHrp2();
    const pv = this.malariaPvLdh();
    const danger = this.malariaDangerSigns();

    let species: 'NEGATIVE' | 'P_FALCIPARUM' | 'P_VIVAX' | 'MIXED_INFECTION' = 'NEGATIVE';
    if (pf && pv) species = 'MIXED_INFECTION';
    else if (pf) species = 'P_FALCIPARUM';
    else if (pv) species = 'P_VIVAX';

    let acuity: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    let therapy = 'None';
    let action = '';
    let g6pdWarning = false;

    if (danger && species !== 'NEGATIVE') {
      acuity = 'RED';
      action = '🚨 SEVERE COMPLICATED MALARIA WITH DANGER SIGNS (Cerebral / Severe Anemia / Repeated Vomiting). Administer IM/IV Artesunate 2.4 mg/kg STAT before transfer to higher-level facility.';
      therapy = 'Parenteral Artesunate 2.4 mg/kg STAT (pre-referral)';
    } else if (species === 'P_FALCIPARUM' || species === 'MIXED_INFECTION') {
      acuity = 'YELLOW';
      action = 'Uncomplicated P. falciparum malaria. Administer weight-based Artemether-Lumefantrine (AL) 6-dose regimen over 3 days. Take with milk or fatty meal.';
      therapy = 'Artemether 20mg / Lumefantrine 120mg (AL) 6-dose regimen';
    } else if (species === 'P_VIVAX') {
      acuity = 'YELLOW';
      g6pdWarning = true;
      action = 'P. vivax malaria confirmed. Treat acute parasitemia with ACT (or Chloroquine if chloroquine-sensitive). Add Primaquine 0.25-0.5 mg/kg/day x 14 days to clear liver hypnozoites and prevent relapse. G6PD test mandatory prior to Primaquine to prevent hemolysis.';
      therapy = 'ACT (3 days) + Primaquine 0.25-0.5 mg/kg/day x 14 days';
    } else {
      action = 'Malaria RDT Negative. Investigate alternative causes of fever (viral, pneumonia, UTI, typhoid). Do not administer antimalarials.';
    }

    return {
      controlLineValid: true,
      hrp2PfResult: pf,
      pLdhPvResult: pv,
      speciesClassification: species,
      hasDangerSigns: danger,
      clinicalAction: action,
      firstLineTherapy: therapy,
      g6pdWarningRequired: g6pdWarning,
      acuityTier: acuity
    };
  });

  readonly dengueAssessment = computed<IDengueRdtResult>(() => {
    const valid = this.dengueControl();
    if (!valid) {
      return {
        controlLineValid: false,
        ns1AgResult: false,
        igmResult: false,
        iggResult: false,
        infectionStage: 'INVALID',
        hasWarningSigns: this.dengueWarningSigns(),
        clinicalAction: 'INVALID CASSETTE: Repeat test.',
        contraindicatedMedications: ['Ibuprofen', 'Aspirin', 'Naproxen', 'Diclofenac'],
        acuityTier: 'RED'
      };
    }

    const ns1 = this.dengueNs1();
    const igm = this.dengueIgm();
    const igg = this.dengueIgg();
    const warning = this.dengueWarningSigns();

    let stage: 'NEGATIVE' | 'ACUTE_PRIMARY' | 'RECENT_PRIMARY' | 'SECONDARY_HIGH_RISK' = 'NEGATIVE';
    if (igg && (ns1 || igm)) stage = 'SECONDARY_HIGH_RISK';
    else if (ns1) stage = 'ACUTE_PRIMARY';
    else if (igm) stage = 'RECENT_PRIMARY';

    let acuity: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    let action = '';

    if (warning && stage !== 'NEGATIVE') {
      acuity = 'RED';
      action = '🚨 DENGUE WITH WARNING SIGNS / SEVERE DENGUE: High risk of plasma leakage, dengue shock syndrome (DSS), and severe hemorrhage. Immediate IV isotonic crystalloid bolus (5-7 mL/kg/h) and urgent hospital transfer.';
    } else if (stage === 'SECONDARY_HIGH_RISK') {
      acuity = 'YELLOW';
      action = 'Secondary Dengue Infection (IgG+). Antibody-dependent enhancement elevates risk of Dengue Hemorrhagic Fever. Close outpatient daily monitoring of hematocrit and platelet counts.';
    } else if (stage === 'ACUTE_PRIMARY') {
      acuity = 'YELLOW';
      action = 'Acute Primary Dengue Viremia (NS1+). Initiate vigorous oral rehydration (ORS, coconut water, clean broth). Strict bed rest. Paracetamol only for fever/arthralgia.';
    } else if (stage === 'RECENT_PRIMARY') {
      acuity = 'GREEN';
      action = 'Dengue IgM positive (convalescent/late stage). Continue hydration and monitor for defervescence phase complications.';
    } else {
      action = 'Dengue rapid test negative. Monitor symptoms and consider repeat testing in 48 hours if fever persists.';
    }

    return {
      controlLineValid: true,
      ns1AgResult: ns1,
      igmResult: igm,
      iggResult: igg,
      infectionStage: stage,
      hasWarningSigns: warning,
      clinicalAction: action,
      contraindicatedMedications: ['Ibuprofen', 'Aspirin', 'Naproxen', 'Diclofenac', 'Indomethacin'],
      acuityTier: acuity
    };
  });

  readonly sickleCellAssessment = computed<ISickleCellRdtResult>(() => {
    const valid = this.sickleControl();
    if (!valid) {
      return {
        controlLineValid: false,
        phenotypeResult: 'INVALID',
        patientAgeMonths: this.sicklePatientAgeMonths(),
        clinicalAction: 'INVALID TEST: Repeat screening test.',
        preventiveBundle: [],
        acuityTier: 'RED'
      };
    }

    const pheno = this.sicklePhenotype();
    const age = this.sicklePatientAgeMonths();

    let acuity: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    let action = '';
    const bundle: string[] = [];

    if (pheno === 'HB_SS_DISEASE' || pheno === 'HB_SC_OR_THAL') {
      acuity = 'RED';
      action = `SICKLE CELL DISEASE (${pheno === 'HB_SS_DISEASE' ? 'HbSS Anemia' : 'HbSC / S-Beta Thal'}). High susceptibility to encapsulated bacterial sepsis and vaso-occlusive crisis. Initiate WHO preventive bundle immediately.`;
      bundle.push(
        'Oral Penicillin V prophylaxis (125mg BID if <3y, 250mg BID if >=3y) until age 5',
        'Folic Acid 1mg daily for ongoing erythropoiesis support',
        'Pneumococcal conjugate (PCV13) + Meningococcal (MenACWY) vaccination',
        'Hydroxyurea therapy evaluation (15-20 mg/kg/day) to boost fetal hemoglobin (HbF)',
        'Bedside hydration guidance: minimum 100-150 mL/kg/day'
      );
    } else if (pheno === 'HB_AS_TRAIT') {
      acuity = 'YELLOW';
      action = 'Sickle Cell Trait (HbAS Carrier). Asymptomatic carrier; not at risk of vaso-occlusive crisis under normal conditions. Provide genetic and pre-marital counseling. Reassure family.';
      bundle.push('Genetic & partner counseling', 'Avoid extreme dehydration and unpressurized high-altitude hypoxia');
    } else {
      action = 'Normal Adult Hemoglobin (HbAA). No sickle hemoglobin detected.';
    }

    return {
      controlLineValid: true,
      phenotypeResult: pheno,
      patientAgeMonths: age,
      clinicalAction: action,
      preventiveBundle: bundle,
      acuityTier: acuity
    };
  });

  readonly coldChainTelemetry = computed<IColdChainTelemetry>(() => {
    const { fridgeTempC, ambientTempC, vvmStage, batteryVoltageV, batterySocPct, solarWattsM2 } = this.coldChainInputs();

    let statusTier: 'OPTIMAL' | 'COLD_EXCURSION' | 'FREEZE_HAZARD' | 'HEAT_EXCURSION' | 'BATTERY_CRITICAL' = 'OPTIMAL';
    let statusLabel = 'Optimal Storage (+2°C to +8°C)';
    let action = 'Vaccine & diagnostic reagent inventory secure. Temperatures within WHO PQS certified range.';

    if (fridgeTempC < 0.0) {
      statusTier = 'FREEZE_HAZARD';
      statusLabel = 'CRITICAL FREEZE HAZARD (<0°C)';
      action = '🚨 DANGER: FREEZING TEMPERATURE DETECTED! Perform WHO Shake Test on freeze-sensitive vaccines (HepB, DTP, Td, HPV, PCV). Discard frozen vials.';
    } else if (fridgeTempC < 2.0) {
      statusTier = 'COLD_EXCURSION';
      statusLabel = 'Low Temperature Warning (0°C – 2°C)';
      action = 'Adjust refrigerator thermostat up. Inspect freeze-indicator tag (FreezeTag).';
    } else if (fridgeTempC > 8.0) {
      statusTier = 'HEAT_EXCURSION';
      statusLabel = 'HEAT EXCURSION (>+8°C)';
      action = '⚠️ ELEVATED TEMPERATURE EXCURSION! Inspect VVM stickers. Avoid opening refrigerator door. Check solar PV power and compressor.';
    } else if (batterySocPct < 20 || batteryVoltageV < 11.8) {
      statusTier = 'BATTERY_CRITICAL';
      statusLabel = 'SOLAR BATTERY CRITICAL (<20%)';
      action = '⚠️ Solar microgrid battery reserve exhausted! Initiate load shedding of non-essential lights to sustain vaccine refrigerator.';
    }

    // Estimate autonomous hours remaining based on battery SoC and solar irradiance
    // Refrigerator consumes ~45W on 50% duty cycle (~22.5W average)
    // 12V 100Ah battery = 1200Wh. SoC 80% = ~960Wh.
    const nominalWh = 1200 * (batterySocPct / 100);
    const avgConsumptionWatts = 25.0;
    const solarNetGainWatts = Math.max(0, (solarWattsM2 / 1000) * 80.0); // 80W panel yield
    const netDrawWatts = Math.max(5.0, avgConsumptionWatts - solarNetGainWatts);
    const projectedAutonomyHours = Number((nominalWh / netDrawWatts).toFixed(1));

    return {
      fridgeTempCelsius: fridgeTempC,
      ambientTempCelsius: ambientTempC,
      vvmStage,
      batteryVoltageVolts: batteryVoltageV,
      batteryStateOfChargePct: batterySocPct,
      solarIrradianceWattsM2: solarWattsM2,
      fridgeCompressorActive: fridgeTempC > 4.0,
      statusTier,
      statusLabel,
      projectedAutonomyHours: Math.min(99.9, projectedAutonomyHours),
      actionGuidance: action
    };
  });

  // ────────────────────────────────────────────────────────────────────────
  // State Mutation Helpers
  // ────────────────────────────────────────────────────────────────────────

  public setRdtType(type: RdtTestType): void {
    this.activeRdtType.set(type);
  }

  public updateColdChainTelemetry(update: Partial<{
    fridgeTempC: number;
    ambientTempC: number;
    vvmStage: 1 | 2 | 3 | 4;
    batteryVoltageV: number;
    batterySocPct: number;
    solarWattsM2: number;
  }>): void {
    this.coldChainInputs.update(curr => ({ ...curr, ...update }));
  }
}
