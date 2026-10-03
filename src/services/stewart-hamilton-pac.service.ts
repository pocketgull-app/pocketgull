import { Injectable, signal, computed } from '@angular/core';

export type PacPresetMode =
  | 'euvolemic_healthy'
  | 'cardiogenic_shock_forrester_iv'
  | 'hyperdynamic_septic_shock'
  | 'hypovolemic_hemorrhagic_shock'
  | 'massive_pulmonary_embolism'
  | 'cardiac_tamponade_equalization';

export type ForresterSubset =
  | 'Subset I: Warm & Dry (Normal / Compensated)'
  | 'Subset II: Warm & Wet (Pulmonary Congestion)'
  | 'Subset III: Cold & Dry (Hypovolemia / Low Output)'
  | 'Subset IV: Cold & Wet (Cardiogenic Shock)';

export type ShockClassification =
  | 'No Shock (Compensated Hemodynamics)'
  | 'Distributive Shock (Hyperdynamic Vasoplegia / Sepsis)'
  | 'Cardiogenic Shock (Pump Failure / Elevated PCWP)'
  | 'Hypovolemic Shock (Volume Depletion / Low Filling)'
  | 'Obstructive Shock (Pulmonary Embolism / High PVR)'
  | 'Obstructive Shock (Cardiac Tamponade / Equalization)';

export interface IPacVitalsInput {
  meanArterialPressureMap: number; // mmHg (e.g. 65 - 100)
  centralVenousPressureCvp: number; // mmHg (e.g. 2 - 14)
  meanPulmonaryArteryPressureMpap: number; // mmHg (e.g. 10 - 35)
  pulmonaryCapillaryWedgePressurePcwp: number; // mmHg (e.g. 6 - 25)
  heartRateBpm: number; // bpm
  bodySurfaceAreaBsaM2: number; // m^2 (typically 1.8 - 2.0)
  hemoglobinGdl: number; // g/dL (e.g. 10 - 15)
  arterialOxygenSatSaO2Pct: number; // % (e.g. 90 - 100)
  mixedVenousOxygenSatSvO2Pct: number; // % (e.g. 50 - 80)
  pao2Mmhg: number; // mmHg (e.g. 80 - 100)
  // Stewart-Hamilton thermodilution injectate inputs
  injectateVolumeMl: number; // mL (standard 10 mL)
  bloodTemperatureTbC: number; // °C (standard 37.0 °C)
  injectateTemperatureTiC: number; // °C (ice cold 0.0 or room 20.0 °C)
  areaUnderThermodilutionCurveDegSec: number; // ∫ ΔTb(t) dt in °C·s (typically 15 - 80 °C·s)
}

export interface IPacHemodynamicOutput {
  cardiacOutputLmin: number; // CO via Stewart-Hamilton (L/min)
  cardiacIndexLminM2: number; // CI (L/min/m^2)
  strokeVolumeMl: number; // SV (mL/beat)
  strokeVolumeIndexMlM2: number; // SVI (mL/beat/m^2)
  systemicVascularResistanceDyns: number; // SVR (dyn·s/cm^5)
  systemicVascularResistanceIndexDynsM2: number; // SVRI (dyn·s·m^2/cm^5)
  pulmonaryVascularResistanceDyns: number; // PVR (dyn·s/cm^5)
  pulmonaryVascularResistanceIndexDynsM2: number; // PVRI (dyn·s·m^2/cm^5)
  transpulmonaryGradientMmhg: number; // TPG = MPAP - PCWP
  arterialOxygenContentCao2Mldl: number; // CaO2 (mL/dL)
  mixedVenousOxygenContentCvo2Mldl: number; // CvO2 (mL/dL)
  oxygenDeliveryDo2Mlmin: number; // DO2 (mL/min)
  oxygenConsumptionVo2Mlmin: number; // VO2 (mL/min)
  oxygenExtractionRatioPct: number; // O2ER (%)
  forresterSubset: ForresterSubset;
  shockClassification: ShockClassification;
  clinicalGuidance: string;
  recommendedInterventions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StewartHamiltonPacService {
  readonly activePreset = signal<PacPresetMode>('euvolemic_healthy');

  readonly vitals = signal<IPacVitalsInput>({
    meanArterialPressureMap: 85,
    centralVenousPressureCvp: 6,
    meanPulmonaryArteryPressureMpap: 15,
    pulmonaryCapillaryWedgePressurePcwp: 10,
    heartRateBpm: 75,
    bodySurfaceAreaBsaM2: 1.9,
    hemoglobinGdl: 13.5,
    arterialOxygenSatSaO2Pct: 98,
    mixedVenousOxygenSatSvO2Pct: 75,
    pao2Mmhg: 95,
    injectateVolumeMl: 10,
    bloodTemperatureTbC: 37.0,
    injectateTemperatureTiC: 0.0,
    areaUnderThermodilutionCurveDegSec: 4.2
  });

  /**
   * Primary Hemodynamic Calculation Engine using Stewart-Hamilton & Fick Equations
   */
  readonly hemodynamicOutput = computed<IPacHemodynamicOutput>(() => {
    const v = this.vitals();

    // 1. Stewart-Hamilton Equation for Cardiac Output:
    // CO = (Vi * (Tb - Ti) * (S1 * C1)) / (AUC_Tb) * 60
    // Density/specific heat constant (S1 * C1) for saline in blood = 1.08
    const s1c1 = 1.08;
    const deltaT = Math.max(0.1, v.bloodTemperatureTbC - v.injectateTemperatureTiC);
    const auc = Math.max(1.0, v.areaUnderThermodilutionCurveDegSec);
    const viLiters = v.injectateVolumeMl / 1000.0;
    // Stewart-Hamilton Equation for Cardiac Output:
    // CO = (Vi * (Tb - Ti) * (S1 * C1)) / (AUC_Tb) * 60
    const rawCo = ((viLiters * deltaT * s1c1) / auc) * 60.0;
    const co = Math.round(rawCo * 100) / 100;

    // 2. Cardiac Index (CI) & Stroke Volume
    const bsa = Math.max(1.0, v.bodySurfaceAreaBsaM2);
    const ci = Math.round((co / bsa) * 100) / 100;
    const hr = Math.max(30, v.heartRateBpm);
    const sv = Math.round(((co * 1000) / hr) * 10) / 10;
    const svi = Math.round((sv / bsa) * 10) / 10;

    // 3. Vascular Resistances (SVR & PVR in dyn·s/cm^5)
    // SVR = 80 * (MAP - CVP) / CO
    const svr = Math.round((80.0 * Math.max(0, v.meanArterialPressureMap - v.centralVenousPressureCvp)) / Math.max(0.5, co));
    const svri = Math.round(svr * bsa);

    // PVR = 80 * (MPAP - PCWP) / CO
    const tpg = Math.round((v.meanPulmonaryArteryPressureMpap - v.pulmonaryCapillaryWedgePressurePcwp) * 10) / 10;
    const pvr = Math.round((80.0 * Math.max(0, tpg)) / Math.max(0.5, co));
    const pvri = Math.round(pvr * bsa);

    // 4. Oxygen Contents & Transport (CaO2, CvO2, DO2, VO2, O2ER)
    // CaO2 = 1.34 * Hb * (SaO2 / 100) + 0.0031 * PaO2
    const cao2 = 1.34 * v.hemoglobinGdl * (v.arterialOxygenSatSaO2Pct / 100.0) + 0.0031 * v.pao2Mmhg;
    const cvo2 = 1.34 * v.hemoglobinGdl * (v.mixedVenousOxygenSatSvO2Pct / 100.0) + 0.0031 * 40.0; // Pvo2 ~ 40
    const roundedCao2 = Math.round(cao2 * 10) / 10;
    const roundedCvo2 = Math.round(cvo2 * 10) / 10;

    // DO2 = CO * CaO2 * 10 (mL/min)
    const do2 = Math.round(co * cao2 * 10);
    // VO2 = CO * (CaO2 - CvO2) * 10 (mL/min)
    const vo2 = Math.round(co * Math.max(0, cao2 - cvo2) * 10);
    // O2ER = (VO2 / DO2) * 100%
    const o2er = do2 > 0 ? Math.round((vo2 / do2) * 100) : 0;

    // 5. Forrester Hemodynamic Classification Quadrants
    let forrester: ForresterSubset;
    if (ci >= 2.2 && v.pulmonaryCapillaryWedgePressurePcwp <= 18) {
      forrester = 'Subset I: Warm & Dry (Normal / Compensated)';
    } else if (ci >= 2.2 && v.pulmonaryCapillaryWedgePressurePcwp > 18) {
      forrester = 'Subset II: Warm & Wet (Pulmonary Congestion)';
    } else if (ci < 2.2 && v.pulmonaryCapillaryWedgePressurePcwp <= 18) {
      forrester = 'Subset III: Cold & Dry (Hypovolemia / Low Output)';
    } else {
      forrester = 'Subset IV: Cold & Wet (Cardiogenic Shock)';
    }

    // 6. Shock Etiology Classification (Prioritize specific obstructive etiologies first)
    let shock: ShockClassification = 'No Shock (Compensated Hemodynamics)';
    const interventions: string[] = [];
    let guidance = '';

    // Distributive (Septic) Shock: low SVR (< 700), high or normal CI, low/normal PCWP
    if (svr < 700 && ci >= 2.4 && v.mixedVenousOxygenSatSvO2Pct >= 65) {
      shock = 'Distributive Shock (Hyperdynamic Vasoplegia / Sepsis)';
      guidance = 'Severe vasoplegia with hyperdynamic cardiac output and low SVR. Tissue dysoxia secondary to microvascular shunting.';
      interventions.push('Norepinephrine infusion (titrate MAP >= 65 mmHg)');
      interventions.push('Vasopressin (0.03 units/min second-line non-adrenergic pressor)');
      interventions.push('Crystalloid fluid bolus if fluid-responsive (passive leg raise / SVV)');
      interventions.push('Broad-spectrum empiric IV antimicrobials within 1 hour');
    }
    // Cardiac Tamponade: Diastolic pressure equalization (CVP ~= PCWP) with low CI
    else if (Math.abs(v.centralVenousPressureCvp - v.pulmonaryCapillaryWedgePressurePcwp) <= 3 && v.centralVenousPressureCvp >= 14 && ci < 2.2) {
      shock = 'Obstructive Shock (Cardiac Tamponade / Equalization)';
      guidance = 'Pericardial restraint causing near-equalization of diastolic filling pressures (CVP ~= PCWP). Ventricular interdependence and severe preload limitation.';
      interventions.push('Emergent pericardiocentesis or subxiphoid pericardial window');
      interventions.push('Temporizing volume loading to maintain intracardiac pressures');
      interventions.push('Avoid positive pressure ventilation / mechanical ventilation if possible (drops venous return)');
    }
    // Massive PE (Obstructive): high PVR, high MPAP, TPG > 12, elevated CVP, low/normal PCWP
    else if (pvr > 250 && v.meanPulmonaryArteryPressureMpap >= 28 && tpg >= 12 && v.centralVenousPressureCvp >= 12 && v.pulmonaryCapillaryWedgePressurePcwp <= 15) {
      shock = 'Obstructive Shock (Pulmonary Embolism / High PVR)';
      guidance = 'Acute right ventricular pressure overload and uncoupling caused by acute pulmonary vascular obstruction. Preload dependent; avoiding excessive fluid.';
      interventions.push('Immediate systemic thrombolysis (Alteplase 100 mg over 2h) or catheter-directed embolectomy');
      interventions.push('Inhaled pulmonary vasodilators (iNO or Epoprostenol) to unload RV');
      interventions.push('Norepinephrine to support RV coronary perfusion');
      interventions.push('Avoid aggressive fluid boluses (worsens RV dilatation and septal shift)');
    }
    // Cardiogenic Shock: CI < 2.2, PCWP >= 18, SVR elevated
    else if (ci < 2.2 && v.pulmonaryCapillaryWedgePressurePcwp >= 18) {
      shock = 'Cardiogenic Shock (Pump Failure / Elevated PCWP)';
      guidance = 'Left ventricular forward pump failure with hydrostatic pulmonary congestion and compensatory peripheral vasoconstriction.';
      interventions.push('Inotrope: Dobutamine (2.5 - 10 mcg/kg/min) or Milrinone');
      interventions.push('Norepinephrine to maintain coronary perfusion pressure if MAP < 65');
      interventions.push('Gentle diuresis / loop diuretic only once perfusion restored');
      interventions.push('Emergent cath lab / revascularization or mechanical circulatory support (Impella / IABP)');
    }
    // Hypovolemic Shock: CI < 2.2, low CVP (< 5), low PCWP (< 10), high SVR
    else if (ci < 2.2 && v.centralVenousPressureCvp <= 5 && v.pulmonaryCapillaryWedgePressurePcwp <= 10 && svr > 1100) {
      shock = 'Hypovolemic Shock (Volume Depletion / Low Filling)';
      guidance = 'Critical circulating blood volume deficit causing low stroke volume, compensatory intense peripheral vasoconstriction, and low tissue oxygen delivery.';
      interventions.push('Rapid crystalloid resuscitation or balanced salt solutions');
      interventions.push('If hemorrhagic: 1:1:1 MTP (PRBCs, FFP, Platelets) and TXA 1g IV');
      interventions.push('Hold vasodilators and pressors until intravascular volume restored');
      interventions.push('Serial ultrasound of IVC collapsibility and dynamic stroke volume variation');
    }
    else {
      guidance = 'Hemodynamic parameters within stable physiologic boundaries. Cardiac index and systemic vascular resistance well matched to metabolic demand.';
      interventions.push('Maintain current supportive regimen and continue hemodynamic trending');
      interventions.push('Routine PAC line hygiene and continuous pressure transducer leveling to phlebostatic axis');
    }

    return {
      cardiacOutputLmin: co,
      cardiacIndexLminM2: ci,
      strokeVolumeMl: sv,
      strokeVolumeIndexMlM2: svi,
      systemicVascularResistanceDyns: svr,
      systemicVascularResistanceIndexDynsM2: svri,
      pulmonaryVascularResistanceDyns: pvr,
      pulmonaryVascularResistanceIndexDynsM2: pvri,
      transpulmonaryGradientMmhg: tpg,
      arterialOxygenContentCao2Mldl: roundedCao2,
      mixedVenousOxygenContentCvo2Mldl: roundedCvo2,
      oxygenDeliveryDo2Mlmin: do2,
      oxygenConsumptionVo2Mlmin: vo2,
      oxygenExtractionRatioPct: o2er,
      forresterSubset: forrester,
      shockClassification: shock,
      clinicalGuidance: guidance,
      recommendedInterventions: interventions
    };
  });

  applyPreset(preset: PacPresetMode): void {
    this.activePreset.set(preset);

    switch (preset) {
      case 'euvolemic_healthy':
        this.vitals.set({
          meanArterialPressureMap: 85,
          centralVenousPressureCvp: 6,
          meanPulmonaryArteryPressureMpap: 15,
          pulmonaryCapillaryWedgePressurePcwp: 10,
          heartRateBpm: 75,
          bodySurfaceAreaBsaM2: 1.9,
          hemoglobinGdl: 13.5,
          arterialOxygenSatSaO2Pct: 98,
          mixedVenousOxygenSatSvO2Pct: 75,
          pao2Mmhg: 95,
          injectateVolumeMl: 10,
          bloodTemperatureTbC: 37.0,
          injectateTemperatureTiC: 0.0,
          areaUnderThermodilutionCurveDegSec: 4.2 // CO ~ 5.7 L/min
        });
        break;

      case 'cardiogenic_shock_forrester_iv':
        this.vitals.set({
          meanArterialPressureMap: 58,
          centralVenousPressureCvp: 16,
          meanPulmonaryArteryPressureMpap: 35,
          pulmonaryCapillaryWedgePressurePcwp: 26,
          heartRateBpm: 108,
          bodySurfaceAreaBsaM2: 1.85,
          hemoglobinGdl: 11.5,
          arterialOxygenSatSaO2Pct: 89,
          mixedVenousOxygenSatSvO2Pct: 48,
          pao2Mmhg: 62,
          injectateVolumeMl: 10,
          bloodTemperatureTbC: 36.8,
          injectateTemperatureTiC: 0.0,
          areaUnderThermodilutionCurveDegSec: 8.8 // CO ~ 2.7 L/min, CI ~ 1.46
        });
        break;

      case 'hyperdynamic_septic_shock':
        this.vitals.set({
          meanArterialPressureMap: 55,
          centralVenousPressureCvp: 8,
          meanPulmonaryArteryPressureMpap: 20,
          pulmonaryCapillaryWedgePressurePcwp: 12,
          heartRateBpm: 115,
          bodySurfaceAreaBsaM2: 1.95,
          hemoglobinGdl: 10.2,
          arterialOxygenSatSaO2Pct: 95,
          mixedVenousOxygenSatSvO2Pct: 82, // High Svo2 due to microvascular shunting
          pao2Mmhg: 80,
          injectateVolumeMl: 10,
          bloodTemperatureTbC: 38.5,
          injectateTemperatureTiC: 0.0,
          areaUnderThermodilutionCurveDegSec: 2.8 // CO ~ 8.6 L/min, CI ~ 4.4
        });
        break;

      case 'hypovolemic_hemorrhagic_shock':
        this.vitals.set({
          meanArterialPressureMap: 52,
          centralVenousPressureCvp: 2,
          meanPulmonaryArteryPressureMpap: 11,
          pulmonaryCapillaryWedgePressurePcwp: 5,
          heartRateBpm: 128,
          bodySurfaceAreaBsaM2: 1.8,
          hemoglobinGdl: 7.2,
          arterialOxygenSatSaO2Pct: 94,
          mixedVenousOxygenSatSvO2Pct: 52,
          pao2Mmhg: 85,
          injectateVolumeMl: 10,
          bloodTemperatureTbC: 36.2,
          injectateTemperatureTiC: 0.0,
          areaUnderThermodilutionCurveDegSec: 8.2 // CO ~ 2.9 L/min, CI ~ 1.6
        });
        break;

      case 'massive_pulmonary_embolism':
        this.vitals.set({
          meanArterialPressureMap: 60,
          centralVenousPressureCvp: 18,
          meanPulmonaryArteryPressureMpap: 38,
          pulmonaryCapillaryWedgePressurePcwp: 11, // High TPG = 38 - 11 = 27 mmHg!
          heartRateBpm: 120,
          bodySurfaceAreaBsaM2: 1.9,
          hemoglobinGdl: 12.8,
          arterialOxygenSatSaO2Pct: 86,
          mixedVenousOxygenSatSvO2Pct: 50,
          pao2Mmhg: 54,
          injectateVolumeMl: 10,
          bloodTemperatureTbC: 37.0,
          injectateTemperatureTiC: 0.0,
          areaUnderThermodilutionCurveDegSec: 7.2 // CO ~ 3.3 L/min, PVR > 600
        });
        break;

      case 'cardiac_tamponade_equalization':
        this.vitals.set({
          meanArterialPressureMap: 56,
          centralVenousPressureCvp: 19,
          meanPulmonaryArteryPressureMpap: 24,
          pulmonaryCapillaryWedgePressurePcwp: 18, // CVP (19) ~= PCWP (18) equalization
          heartRateBpm: 118,
          bodySurfaceAreaBsaM2: 1.85,
          hemoglobinGdl: 12.0,
          arterialOxygenSatSaO2Pct: 92,
          mixedVenousOxygenSatSvO2Pct: 54,
          pao2Mmhg: 70,
          injectateVolumeMl: 10,
          bloodTemperatureTbC: 36.6,
          injectateTemperatureTiC: 0.0,
          areaUnderThermodilutionCurveDegSec: 7.8 // CO ~ 3.1 L/min, CI ~ 1.6
        });
        break;
    }
  }
}
