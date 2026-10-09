import { Injectable, signal, computed } from '@angular/core';

export type BiologicalSex = 'male' | 'female';
export type ClinicalHydrationState =
  | 'euvolemic'
  | 'hypovolemic_dehydrated'
  | 'septic_capillary_leak'
  | 'burn_trauma'
  | 'cirrhotic_ascites'
  | 'congestive_heart_failure';

export type FluidInfusionType =
  | 'normal_saline_09'
  | 'lactated_ringers'
  | 'plasmalyte_a'
  | 'hypertonic_saline_3'
  | 'hypertonic_saline_75'
  | 'd5w'
  | 'half_normal_saline_045'
  | 'albumin_5'
  | 'albumin_25';

export interface IFluidDefinition {
  id: FluidInfusionType;
  name: string;
  category: 'Isotonic Crystalloid' | 'Balanced Crystalloid' | 'Hypertonic Crystalloid' | 'Hypotonic Solution' | 'Colloid';
  osmolarityMOsm: number;
  sodiumMEq: number;
  chlorideMEq: number;
  potassiumMEq: number;
  lactateOrBufferMEq: number;
  strongIonDifference: number; // mEq/L
  colloidOncoticPressureMmHg: number;
  description: string;
}

export interface IFluidShiftInputs {
  patientWeightKg: number;
  biologicalSex: BiologicalSex;
  isElderly: boolean;
  baselineSerumSodiumMEq: number;
  baselineSerumChlorideMEq: number;
  baselineSerumPotassiumMEq: number;
  baselineSerumAlbuminGDl: number;
  hydrationState: ClinicalHydrationState;
  burnTbsaPercent: number; // Wallace Rule of 9s (0 - 100%)
  fluidType: FluidInfusionType;
  infusionVolumeMl: number;
  infusionDurationHours: number;
}

export interface ICompartmentVolumes {
  totalBodyWaterL: number;
  intracellularL: number;
  interstitialL: number;
  intravascularPlasmaL: number;
}

export interface ICompartmentShifts {
  deltaIntravascularMl: number;
  deltaInterstitialMl: number;
  deltaIntracellularMl: number;
  intravascularRetentionPercent: number;
  finalIntravascularPlasmaL: number;
  finalInterstitialL: number;
  finalIntracellularL: number;
}

export interface IFluidResuscitationResult {
  baselineVolumes: ICompartmentVolumes;
  shifts: ICompartmentShifts;
  predictedSodiumMEq: number;
  deltaSodiumMEq: number;
  predictedChlorideMEq: number;
  predictedSidMEq: number;
  hyperchloremicAcidosisRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  osmoticDemyelinationRisk: boolean;
  cerebralEdemaRisk: boolean;
  maintenanceRateMlHr: number; // 4-2-1 rule
  maintenanceVolume24hMl: number;
  parklandTotal24hMl: number; // Parkland formula
  parklandFirst8hMl: number;
  clinicalGuidance: string[];
}

export const FLUID_CATALOG: Record<FluidInfusionType, IFluidDefinition> = {
  normal_saline_09: {
    id: 'normal_saline_09',
    name: '0.9% Normal Saline (NaCl)',
    category: 'Isotonic Crystalloid',
    osmolarityMOsm: 308,
    sodiumMEq: 154,
    chlorideMEq: 154,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 0,
    colloidOncoticPressureMmHg: 0,
    description: '154 mEq/L Na+ and Cl-. Strong Ion Difference of 0 mEq/L. Risk of hyperchloremic metabolic acidosis with large volume resuscitation.'
  },
  lactated_ringers: {
    id: 'lactated_ringers',
    name: "Lactated Ringer's (Hartmann's)",
    category: 'Balanced Crystalloid',
    osmolarityMOsm: 273,
    sodiumMEq: 130,
    chlorideMEq: 109,
    potassiumMEq: 4,
    lactateOrBufferMEq: 28,
    strongIonDifference: 25,
    colloidOncoticPressureMmHg: 0,
    description: "Physiologic balanced crystalloid with 28 mEq/L sodium lactate buffer metabolized to bicarbonate. Renal-protective in SMART and SALT-ED trials."
  },
  plasmalyte_a: {
    id: 'plasmalyte_a',
    name: 'Plasma-Lyte A (Normosol-R)',
    category: 'Balanced Crystalloid',
    osmolarityMOsm: 294,
    sodiumMEq: 140,
    chlorideMEq: 98,
    potassiumMEq: 5,
    lactateOrBufferMEq: 50, // 27 acetate + 23 gluconate
    strongIonDifference: 47,
    colloidOncoticPressureMmHg: 0,
    description: 'Metabolically balanced crystalloid buffered with acetate and gluconate. Preserves plasma SID and prevents renal vasoconstriction.'
  },
  hypertonic_saline_3: {
    id: 'hypertonic_saline_3',
    name: '3% Hypertonic Saline (NaCl)',
    category: 'Hypertonic Crystalloid',
    osmolarityMOsm: 1026,
    sodiumMEq: 513,
    chlorideMEq: 513,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 0,
    colloidOncoticPressureMmHg: 0,
    description: 'High osmolar solution creating transcellular osmotic gradient. Shrinks swollen intracellular brain tissue; rapidly reduces ICP in impending herniation.'
  },
  hypertonic_saline_75: {
    id: 'hypertonic_saline_75',
    name: '7.5% Hypertonic Saline (NaCl)',
    category: 'Hypertonic Crystalloid',
    osmolarityMOsm: 2566,
    sodiumMEq: 1283,
    chlorideMEq: 1283,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 0,
    colloidOncoticPressureMmHg: 0,
    description: 'Ultra-concentrated osmotic agent for refractory intracranial hypertension or severe polytrauma small-volume resuscitation.'
  },
  d5w: {
    id: 'd5w',
    name: '5% Dextrose in Water (D5W)',
    category: 'Hypotonic Solution',
    osmolarityMOsm: 252,
    sodiumMEq: 0,
    chlorideMEq: 0,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 0,
    colloidOncoticPressureMmHg: 0,
    description: 'Iso-osmolar in vial but rapidly metabolized to 100% free water by hexokinase. Distributes 2/3 into ICF. Dangerous in elevated ICP / TBI.'
  },
  half_normal_saline_045: {
    id: 'half_normal_saline_045',
    name: '0.45% Half-Normal Saline',
    category: 'Hypotonic Solution',
    osmolarityMOsm: 154,
    sodiumMEq: 77,
    chlorideMEq: 77,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 0,
    colloidOncoticPressureMmHg: 0,
    description: 'Hypotonic crystalloid delivering 50% isotonic fluid and 50% free water. Used in severe hypernatremic dehydration with water deficit.'
  },
  albumin_5: {
    id: 'albumin_5',
    name: '5% Human Albumin (Iso-Oncotic)',
    category: 'Colloid',
    osmolarityMOsm: 308,
    sodiumMEq: 154,
    chlorideMEq: 128,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 26,
    colloidOncoticPressureMmHg: 20,
    description: 'Natural colloid matching physiological oncotic pressure. Retained 70-80% intravascularly when endothelial glycocalyx is intact.'
  },
  albumin_25: {
    id: 'albumin_25',
    name: '25% Human Albumin ("Salt-Poor")',
    category: 'Colloid',
    osmolarityMOsm: 308,
    sodiumMEq: 154,
    chlorideMEq: 128,
    potassiumMEq: 0,
    lactateOrBufferMEq: 0,
    strongIonDifference: 26,
    colloidOncoticPressureMmHg: 100,
    description: 'Hyper-oncotic colloid. Draws 400-500 mL of interstitial fluid into intravascular space per 100 mL infused. Indicated in large-volume paracentesis and HRS.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class FluidTonicityResuscitationService {
  // Reactive inputs
  readonly inputs = signal<IFluidShiftInputs>({
    patientWeightKg: 70,
    biologicalSex: 'male',
    isElderly: false,
    baselineSerumSodiumMEq: 140,
    baselineSerumChlorideMEq: 102,
    baselineSerumPotassiumMEq: 4.0,
    baselineSerumAlbuminGDl: 4.0,
    hydrationState: 'euvolemic',
    burnTbsaPercent: 0,
    fluidType: 'lactated_ringers',
    infusionVolumeMl: 1000,
    infusionDurationHours: 2
  });

  // Reactive computed simulation
  readonly simulation = computed<IFluidResuscitationResult>(() => {
    return this.calculateFluidShifts(this.inputs());
  });

  /**
   * Pure calculation engine mapping patient parameters and fluid prescription
   * to multi-compartment fluid translocations, electrolyte shifts, and safety guardrails.
   */
  calculateFluidShifts(inp: IFluidShiftInputs): IFluidResuscitationResult {
    const weight = Math.max(10, inp.patientWeightKg);
    const fluidDef = FLUID_CATALOG[inp.fluidType] || FLUID_CATALOG.lactated_ringers;
    const volL = Math.max(0, inp.infusionVolumeMl) / 1000;

    // 1. Total Body Water (TBW) & Compartment Baselines
    let tbwCoeff = 0.60;
    if (inp.biologicalSex === 'female') {
      tbwCoeff = inp.isElderly ? 0.45 : 0.50;
    } else {
      tbwCoeff = inp.isElderly ? 0.50 : 0.60;
    }

    const totalBodyWaterL = weight * tbwCoeff;
    const intracellularL = totalBodyWaterL * (2 / 3);
    const extracellularL = totalBodyWaterL * (1 / 3);
    const interstitialL = extracellularL * 0.75;
    const intravascularPlasmaL = extracellularL * 0.25;

    const baselineVolumes: ICompartmentVolumes = {
      totalBodyWaterL: Number(totalBodyWaterL.toFixed(2)),
      intracellularL: Number(intracellularL.toFixed(2)),
      interstitialL: Number(interstitialL.toFixed(2)),
      intravascularPlasmaL: Number(intravascularPlasmaL.toFixed(2))
    };

    // 2. Compartment Distribution Fractions based on Fluid Dynamics & Glycocalyx Integrity
    let ivFraction = 0.25;
    let isfFraction = 0.75;
    let icfFraction = 0.0;
    let osmoticDrawFromIcfMl = 0;
    let osmoticDrawFromIsfMl = 0;

    // Glycocalyx permeability attenuation in sepsis/burn/capillary leak
    const isCapillaryLeak = inp.hydrationState === 'septic_capillary_leak' || inp.hydrationState === 'burn_trauma';
    const leakFactor = isCapillaryLeak ? 0.55 : 1.0;

    switch (inp.fluidType) {
      case 'normal_saline_09':
      case 'lactated_ringers':
      case 'plasmalyte_a':
        // Standard isotonic crystalloid stays in ECF (25% IV, 75% ISF)
        ivFraction = 0.25 * leakFactor;
        isfFraction = 1.0 - ivFraction;
        icfFraction = 0.0;
        break;

      case 'd5w':
        // D5W is rapidly metabolized to pure free water -> distributes across all TBW
        // 2/3 (66.7%) to ICF, 1/3 to ECF (of which 25% is IV = 8.3% IV, 25.0% ISF)
        icfFraction = 2 / 3;
        ivFraction = (1 / 3) * 0.25;
        isfFraction = (1 / 3) * 0.75;
        break;

      case 'half_normal_saline_045':
        // 50% acts like normal saline (ECF only), 50% acts like free water (TBW)
        icfFraction = 0.50 * (2 / 3); // 33.3%
        ivFraction = (0.50 * 0.25 + 0.50 * (1 / 3) * 0.25) * leakFactor;
        isfFraction = 1.0 - icfFraction - ivFraction;
        break;

      case 'hypertonic_saline_3':
        // 3% NaCl (1026 mOsm/L). Infused volume is in ECF, plus pulls water out of ICF
        // Every 1 mL of 3% pulls ~1.5 mL out of ICF into ECF
        ivFraction = 0.35 * leakFactor;
        isfFraction = 0.65;
        icfFraction = 0.0;
        osmoticDrawFromIcfMl = inp.infusionVolumeMl * 1.5;
        break;

      case 'hypertonic_saline_75':
        // 7.5% NaCl (2566 mOsm/L). Pulls ~3.5 mL out of ICF per mL infused
        ivFraction = 0.40 * leakFactor;
        isfFraction = 0.60;
        icfFraction = 0.0;
        osmoticDrawFromIcfMl = inp.infusionVolumeMl * 3.5;
        break;

      case 'albumin_5':
        // Iso-oncotic colloid. Retained largely in intravascular space
        ivFraction = 0.75 * leakFactor;
        isfFraction = 1.0 - ivFraction;
        icfFraction = 0.0;
        break;

      case 'albumin_25':
        // Hyper-oncotic colloid (~100 mmHg). Infused 100 mL draws ~450 mL from ISF into IV
        ivFraction = 1.0;
        isfFraction = 0.0;
        icfFraction = 0.0;
        osmoticDrawFromIsfMl = inp.infusionVolumeMl * 4.5;
        break;
    }

    // 3. Net Compartment Delta Calculations (in mL)
    let deltaIntravascularMl = inp.infusionVolumeMl * ivFraction;
    let deltaInterstitialMl = inp.infusionVolumeMl * isfFraction;
    let deltaIntracellularMl = inp.infusionVolumeMl * icfFraction;

    if (osmoticDrawFromIcfMl > 0) {
      deltaIntracellularMl -= osmoticDrawFromIcfMl;
      // The drawn water enters ECF (25% IV, 75% ISF)
      deltaIntravascularMl += osmoticDrawFromIcfMl * 0.35;
      deltaInterstitialMl += osmoticDrawFromIcfMl * 0.65;
    }

    if (osmoticDrawFromIsfMl > 0) {
      deltaInterstitialMl -= osmoticDrawFromIsfMl;
      deltaIntravascularMl += osmoticDrawFromIsfMl;
    }

    const intravascularRetentionPercent = inp.infusionVolumeMl > 0
      ? Math.max(0, Math.round((deltaIntravascularMl / inp.infusionVolumeMl) * 100))
      : 0;

    const shifts: ICompartmentShifts = {
      deltaIntravascularMl: Math.round(deltaIntravascularMl),
      deltaInterstitialMl: Math.round(deltaInterstitialMl),
      deltaIntracellularMl: Math.round(deltaIntracellularMl),
      intravascularRetentionPercent,
      finalIntravascularPlasmaL: Number((intravascularPlasmaL + deltaIntravascularMl / 1000).toFixed(2)),
      finalInterstitialL: Number((interstitialL + deltaInterstitialMl / 1000).toFixed(2)),
      finalIntracellularL: Number((intracellularL + deltaIntracellularMl / 1000).toFixed(2))
    };

    // 4. Adrogué-Madias Formula for Predicted Change in Serum Sodium:
    // Δ[Na+] = ( [Na+]_infusate + [K+]_infusate - [Na+]_serum ) / ( TBW + 1 )
    const infusateCations = fluidDef.sodiumMEq + fluidDef.potassiumMEq;
    const adrogueDeltaPerLiter = (infusateCations - inp.baselineSerumSodiumMEq) / (totalBodyWaterL + 1);
    const deltaSodiumMEq = Number((adrogueDeltaPerLiter * volL).toFixed(1));
    const predictedSodiumMEq = Number((inp.baselineSerumSodiumMEq + deltaSodiumMEq).toFixed(1));

    // 5. Predicted Serum Chloride & Strong Ion Difference (SID)
    const infusateChloride = fluidDef.chlorideMEq;
    const deltaChloridePerLiter = (infusateChloride - inp.baselineSerumChlorideMEq) / (totalBodyWaterL + 1);
    const deltaChlorideMEq = Number((deltaChloridePerLiter * volL).toFixed(1));
    const predictedChlorideMEq = Number((inp.baselineSerumChlorideMEq + deltaChlorideMEq).toFixed(1));
    const predictedSidMEq = Number((predictedSodiumMEq - predictedChlorideMEq).toFixed(1));

    // 6. Hyperchloremic Metabolic Acidosis Risk
    let hyperchloremicAcidosisRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    if (predictedChlorideMEq >= 115 || (inp.fluidType === 'normal_saline_09' && inp.infusionVolumeMl >= 3000)) {
      hyperchloremicAcidosisRisk = 'Severe';
    } else if (predictedChlorideMEq >= 110 || (inp.fluidType === 'normal_saline_09' && inp.infusionVolumeMl >= 2000)) {
      hyperchloremicAcidosisRisk = 'High';
    } else if (predictedChlorideMEq >= 106 || (inp.fluidType === 'normal_saline_09' && inp.infusionVolumeMl >= 1000)) {
      hyperchloremicAcidosisRisk = 'Moderate';
    }

    // 7. Safety Guardrails: Osmotic Demyelination Syndrome (ODS) & Cerebral Edema
    // ODS risk triggers if sodium rises by >= 8 mEq/L over 24h in chronic hyponatremia
    const osmoticDemyelinationRisk = deltaSodiumMEq >= 8.0 || (inp.baselineSerumSodiumMEq < 125 && deltaSodiumMEq >= 6.0);

    // Cerebral edema risk triggers if significant hypotonic fluid expands ICF in neuro/trauma
    const cerebralEdemaRisk = (inp.fluidType === 'd5w' || inp.fluidType === 'half_normal_saline_045') &&
      deltaIntracellularMl > 400 &&
      (inp.hydrationState === 'burn_trauma' || inp.baselineSerumSodiumMEq < 135);

    // 8. Holiday-Segar 4-2-1 Maintenance Fluid Rule:
    // 4 mL/kg for first 10 kg, 2 mL/kg for 11-20 kg, 1 mL/kg for each kg > 20
    let maintenanceRate = 0;
    if (weight <= 10) {
      maintenanceRate = weight * 4;
    } else if (weight <= 20) {
      maintenanceRate = 40 + (weight - 10) * 2;
    } else {
      maintenanceRate = 40 + 20 + (weight - 20) * 1;
    }
    const maintenanceRateMlHr = Math.round(maintenanceRate);
    const maintenanceVolume24hMl = maintenanceRateMlHr * 24;

    // 9. Parkland Burn Resuscitation Formula (if TBSA > 0):
    // Volume (24h) = 4 mL * weight (kg) * %TBSA (Lactated Ringer's)
    const parklandTotal24hMl = Math.round(4 * weight * Math.max(0, inp.burnTbsaPercent));
    const parklandFirst8hMl = Math.round(parklandTotal24hMl / 2);

    // 10. Clinical Guidance Synthesis
    const clinicalGuidance: string[] = [];

    if (inp.fluidType === 'normal_saline_09' && inp.infusionVolumeMl >= 2000) {
      clinicalGuidance.push('⚠️ High Normal Saline Volume: Strong Ion Difference (SID = 0) induces hyperchloremic non-anion gap metabolic acidosis and reduces renal cortical blood flow. Consider switching to balanced crystalloids (Lactated Ringer\'s or Plasma-Lyte A) per SMART / SALT-ED trials.');
    }

    if (osmoticDemyelinationRisk) {
      clinicalGuidance.push('🚨 ODS GUARD ALERT: Predicted serum sodium rise exceeds safe physiological bounds (≥8 mEq/L/24h). Rapid osmotic shrinkage of pontine oligodendrocytes risks irreversible Osmotic Demyelination Syndrome (Central Pontine Myelinolysis). Cap sodium correction at ≤6–8 mEq/L per 24 hours.');
    }

    if (cerebralEdemaRisk) {
      clinicalGuidance.push('🧠 Cerebral Swelling Warning: Hypotonic infusion generates an acute transcellular free water shift into brain parenchyma, elevating intracranial pressure (ICP). Contraindicated in neurotrauma or elevated ICP.');
    }

    if (inp.fluidType === 'hypertonic_saline_3' || inp.fluidType === 'hypertonic_saline_75') {
      clinicalGuidance.push(`💡 Hypertonic Osmotherapy: Expands intravascular volume by +${shifts.deltaIntravascularMl} mL while drawing ${Math.abs(shifts.deltaIntracellularMl)} mL from swollen intracellular compartments. Monitor serum sodium q2-4h.`);
    }

    if (inp.fluidType === 'albumin_25') {
      clinicalGuidance.push(`🩸 Hyper-Oncotic Colloid Action: Infused 25% Albumin draws ${osmoticDrawFromIsfMl} mL of interstitial edema into the intravascular space, increasing plasma volume by ${shifts.deltaIntravascularMl} mL without fluid overload.`);
    }

    if (inp.burnTbsaPercent > 0) {
      clinicalGuidance.push(`🔥 Parkland Formula Target: Total 24h Lactated Ringer's requirement is ${parklandTotal24hMl} mL. Deliver ${parklandFirst8hMl} mL (${Math.round(parklandFirst8hMl / 8)} mL/hr) within the first 8 hours post-injury.`);
    }

    if (clinicalGuidance.length === 0) {
      clinicalGuidance.push(`✅ Fluid Resuscitation Stable: Intravascular expansion of +${shifts.deltaIntravascularMl} mL (${intravascularRetentionPercent}% retention). Strong Ion Difference (${predictedSidMEq} mEq/L) remains balanced.`);
    }

    return {
      baselineVolumes,
      shifts,
      predictedSodiumMEq,
      deltaSodiumMEq,
      predictedChlorideMEq,
      predictedSidMEq,
      hyperchloremicAcidosisRisk,
      osmoticDemyelinationRisk,
      cerebralEdemaRisk,
      maintenanceRateMlHr,
      maintenanceVolume24hMl,
      parklandTotal24hMl,
      parklandFirst8hMl,
      clinicalGuidance
    };
  }

  updateInput<K extends keyof IFluidShiftInputs>(key: K, value: IFluidShiftInputs[K]): void {
    this.inputs.update(prev => ({
      ...prev,
      [key]: value
    }));
  }

  loadPreset(preset: 'sepsis_resuscitation' | 'cerebral_edema_3pct' | 'dka_euvolemic' | 'severe_burn_parkland' | 'cirrhotic_paracentesis'): void {
    switch (preset) {
      case 'sepsis_resuscitation':
        this.inputs.set({
          patientWeightKg: 70,
          biologicalSex: 'male',
          isElderly: false,
          baselineSerumSodiumMEq: 138,
          baselineSerumChlorideMEq: 101,
          baselineSerumPotassiumMEq: 4.1,
          baselineSerumAlbuminGDl: 2.8,
          hydrationState: 'septic_capillary_leak',
          burnTbsaPercent: 0,
          fluidType: 'lactated_ringers',
          infusionVolumeMl: 2100, // 30 mL/kg
          infusionDurationHours: 3
        });
        break;

      case 'cerebral_edema_3pct':
        this.inputs.set({
          patientWeightKg: 75,
          biologicalSex: 'male',
          isElderly: false,
          baselineSerumSodiumMEq: 136,
          baselineSerumChlorideMEq: 100,
          baselineSerumPotassiumMEq: 3.9,
          baselineSerumAlbuminGDl: 4.2,
          hydrationState: 'euvolemic',
          burnTbsaPercent: 0,
          fluidType: 'hypertonic_saline_3',
          infusionVolumeMl: 250,
          infusionDurationHours: 1
        });
        break;

      case 'dka_euvolemic':
        this.inputs.set({
          patientWeightKg: 68,
          biologicalSex: 'female',
          isElderly: false,
          baselineSerumSodiumMEq: 132,
          baselineSerumChlorideMEq: 96,
          baselineSerumPotassiumMEq: 5.2,
          baselineSerumAlbuminGDl: 4.1,
          hydrationState: 'hypovolemic_dehydrated',
          burnTbsaPercent: 0,
          fluidType: 'plasmalyte_a',
          infusionVolumeMl: 1000,
          infusionDurationHours: 2
        });
        break;

      case 'severe_burn_parkland':
        this.inputs.set({
          patientWeightKg: 70,
          biologicalSex: 'male',
          isElderly: false,
          baselineSerumSodiumMEq: 140,
          baselineSerumChlorideMEq: 102,
          baselineSerumPotassiumMEq: 4.4,
          baselineSerumAlbuminGDl: 3.1,
          hydrationState: 'burn_trauma',
          burnTbsaPercent: 35,
          fluidType: 'lactated_ringers',
          infusionVolumeMl: 4900, // First 8h half of 4 * 70 * 35 = 9800 mL
          infusionDurationHours: 8
        });
        break;

      case 'cirrhotic_paracentesis':
        this.inputs.set({
          patientWeightKg: 80,
          biologicalSex: 'male',
          isElderly: false,
          baselineSerumSodiumMEq: 131,
          baselineSerumChlorideMEq: 97,
          baselineSerumPotassiumMEq: 3.8,
          baselineSerumAlbuminGDl: 2.3,
          hydrationState: 'cirrhotic_ascites',
          burnTbsaPercent: 0,
          fluidType: 'albumin_25',
          infusionVolumeMl: 200, // 50g albumin for ~6-7L paracentesis
          infusionDurationHours: 2
        });
        break;
    }
  }
}
