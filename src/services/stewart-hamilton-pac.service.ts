/**
 * Stewart-Hamilton Thermodilution & Hemodynamic Profiler Service (Clinical Model P13)
 * 
 * Core Clinical & Biophysical Foundations:
 * 1. Stewart-Hamilton Equation for Thermodilution Cardiac Output:
 *    CO = [Vi * (Tb - Ti) * S1 * C1 * 60] / [integral(0 to inf) deltaTb(t) dt]
 *    where:
 *    - Vi: Injectate volume (L) (e.g. 10 mL = 0.010 L)
 *    - Tb: Blood baseline temperature (°C, e.g. 37.0°C)
 *    - Ti: Injectate temperature (°C, e.g. 0.0°C iced or 20.0°C room temp)
 *    - S1 * C1: Specific gravity & specific heat computation constant (1.08 for 5% D/W or saline)
 *    - integral deltaTb(t) dt: Area under the thermodilution washout curve (AUC, in °C·s)
 * 
 * 2. Vascular Resistances (SVR, SVRI, PVR, PVRI) & Transpulmonary Gradient (TPG):
 *    - SVR = 80 * (MAP - CVP) / CO (dyn·s/cm^5, normal: 800 - 1200)
 *    - PVR = 80 * (MPAP - PCWP) / CO (dyn·s/cm^5, normal: 50 - 150)
 *    - TPG = MPAP - PCWP (mmHg, normal: <= 12 mmHg)
 * 
 * 3. Oxygen Delivery (DO2) & Extraction Ratio (O2ER):
 *    - CaO2 = 1.34 * Hb * (SaO2/100) + 0.0031 * PaO2 (mL/dL)
 *    - CvO2 = 1.34 * Hb * (SvO2/100) + 0.0031 * PvO2 (mL/dL)
 *    - DO2 = CO * CaO2 * 10 (mL/min, normal: 900 - 1100)
 *    - VO2 = CO * (CaO2 - CvO2) * 10 (mL/min, normal: 200 - 290)
 *    - O2ER = (VO2 / DO2) * 100% (normal: 22 - 30%)
 * 
 * 4. Forrester Hemodynamic Classification Quadrants:
 *    - Quadrant I: Warm & Dry (CI >= 2.2, PCWP <= 18) - Normal / Compensated
 *    - Quadrant II: Warm & Wet (CI >= 2.2, PCWP > 18) - Pulmonary Congestion
 *    - Quadrant III: Cold & Dry (CI < 2.2, PCWP <= 18) - Hypoperfusion / Hypovolemia
 *    - Quadrant IV: Cold & Wet (CI < 2.2, PCWP > 18) - Cardiogenic Shock
 * 
 * 5. Differential Shock Etiology:
 *    - Septic / Distributive Shock: High CI (>3.8), Low SVR (<700), Normal/Low PCWP
 *    - Cardiogenic Shock: Low CI (<2.2), High PCWP (>18), High SVR (>1400)
 *    - Hypovolemic Shock: Low CI (<2.2), Low PCWP (<10), Low CVP (<6), High SVR
 *    - Obstructive: Cardiac Tamponade: Diastolic pressure equalization (CVP ≈ PCWP, within 4 mmHg), Low CI
 *    - Obstructive: Massive PE: High TPG (>=12), High PVR (>250), High CVP, Normal/Low PCWP
 */

import { Injectable, signal, computed } from '@angular/core';

export type ShockEtiology =
  | 'normal'
  | 'septic_distributive'
  | 'cardiogenic_pump_failure'
  | 'hypovolemic'
  | 'obstructive_tamponade'
  | 'obstructive_pulmonary_embolism';

export type ForresterQuadrant =
  | 'I_warm_and_dry'
  | 'II_warm_and_wet'
  | 'III_cold_and_dry'
  | 'IV_cold_and_wet';

export interface IPacHemodynamicInputs {
  injectateVolumeMl: number;         // 5 to 15 mL (default: 10)
  bloodTempC: number;                // 35.0 to 40.0 °C (default: 37.0)
  injectateTempC: number;            // 0.0 to 24.0 °C (default: 0.0 iced)
  thermodilutionAucDegSec: number;   // 1.5 to 12.0 °C·s (default: 4.2)
  meanArterialPressureMmhg: number;  // 40 to 140 mmHg (default: 85)
  centralVenousPressureMmhg: number; // 0 to 25 mmHg (default: 6)
  meanPaPressureMmhg: number;        // 10 to 60 mmHg (default: 15)
  pulmonaryCapillaryWedgePressureMmhg: number; // 2 to 35 mmHg (default: 9)
  heartRateBpm: number;              // 40 to 180 bpm (default: 75)
  hemoglobinGdl: number;             // 6.0 to 18.0 g/dL (default: 14.0)
  arterialOxygenSatPercent: number;  // 70 to 100 % (default: 98)
  mixedVenousOxygenSatPercent: number; // 40 to 90 % (default: 75)
  bodySurfaceAreaM2: number;         // 1.2 to 2.6 m² (default: 1.85)
  arterialPao2Mmhg?: number;         // default: 95 mmHg
  mixedVenousPvo2Mmhg?: number;      // default: 35 mmHg
}

export interface IPacHemodynamicOutput {
  cardiacOutputLmin: number;
  cardiacIndexLminM2: number;
  strokeVolumeMl: number;
  strokeVolumeIndexMlm2: number;
  systemicVascularResistanceDyns: number;
  systemicVascularResistanceIndexDynsm2: number;
  pulmonaryVascularResistanceDyns: number;
  pulmonaryVascularResistanceIndexDynsm2: number;
  transpulmonaryGradientMmhg: number;
  leftCardiacWorkIndexKgm2: number;
  arterialOxygenContentMlDl: number;
  venousOxygenContentMlDl: number;
  oxygenDeliveryDo2Mlmin: number;
  oxygenConsumptionVo2Mlmin: number;
  oxygenExtractionRatioPercent: number;
  forresterQuadrant: ForresterQuadrant;
  forresterLabel: string;
  shockEtiology: ShockEtiology;
  shockTitle: string;
  shockSeverity: 'Normal' | 'Emergent' | 'High Alert' | 'Critical STAT';
  clinicalGuidance: string;
  isEqualizationPresent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StewartHamiltonPacService {
  // Input Signals
  readonly inputs = signal<IPacHemodynamicInputs>({
    injectateVolumeMl: 10,
    bloodTempC: 37.0,
    injectateTempC: 0.0,
    thermodilutionAucDegSec: 4.2,
    meanArterialPressureMmhg: 85,
    centralVenousPressureMmhg: 6,
    meanPaPressureMmhg: 15,
    pulmonaryCapillaryWedgePressureMmhg: 9,
    heartRateBpm: 75,
    hemoglobinGdl: 14.0,
    arterialOxygenSatPercent: 98,
    mixedVenousOxygenSatPercent: 75,
    bodySurfaceAreaM2: 1.85,
    arterialPao2Mmhg: 95,
    mixedVenousPvo2Mmhg: 35
  });

  readonly activePreset = signal<ShockEtiology>('normal');

  // Comprehensive Computed Telemetry Output
  readonly hemodynamicOutput = computed<IPacHemodynamicOutput>(() => {
    return this.calculateHemodynamics(this.inputs());
  });

  /**
   * Pure calculation function mapping inputs to complete hemodynamic profile
   */
  calculateHemodynamics(inp: IPacHemodynamicInputs): IPacHemodynamicOutput {
    // 1. Stewart-Hamilton Equation
    // CO = [Vi * (Tb - Ti) * (S1*C1=1.08) * 60] / AUC
    const viL = inp.injectateVolumeMl / 1000;
    const deltaT = Math.max(0.1, inp.bloodTempC - inp.injectateTempC);
    const s1c1 = 1.08;
    const numerator = viL * deltaT * s1c1 * 60;
    const auc = Math.max(0.1, inp.thermodilutionAucDegSec);
    const co = +(numerator / auc).toFixed(2);

    const bsa = Math.max(0.5, inp.bodySurfaceAreaM2);
    const ci = +(co / bsa).toFixed(2);

    // 2. Stroke Volume & Index
    const hr = Math.max(20, inp.heartRateBpm);
    const sv = Math.round((co * 1000) / hr);
    const svi = +(sv / bsa).toFixed(1);

    // 3. Vascular Resistances
    const map = inp.meanArterialPressureMmhg;
    const cvp = inp.centralVenousPressureMmhg;
    const mpap = inp.meanPaPressureMmhg;
    const pcwp = inp.pulmonaryCapillaryWedgePressureMmhg;

    const svr = Math.round(80 * Math.max(0, map - cvp) / Math.max(0.1, co));
    const svri = Math.round(svr * bsa);

    const tpg = Math.round(mpap - pcwp);
    const pvr = Math.round(80 * Math.max(0, tpg) / Math.max(0.1, co));
    const pvri = Math.round(pvr * bsa);

    // 4. Left Cardiac Work Index
    const lcwi = +(0.0136 * Math.max(0, map - pcwp) * ci).toFixed(1);

    // 5. Oxygen Transport & Delivery
    const pao2 = inp.arterialPao2Mmhg ?? 95;
    const pvo2 = inp.mixedVenousPvo2Mmhg ?? 35;
    const cao2 = +(1.34 * inp.hemoglobinGdl * (inp.arterialOxygenSatPercent / 100) + (0.0031 * pao2)).toFixed(1);
    const cvo2 = +(1.34 * inp.hemoglobinGdl * (inp.mixedVenousOxygenSatPercent / 100) + (0.0031 * pvo2)).toFixed(1);

    const do2 = Math.round(co * cao2 * 10);
    const vo2 = Math.round(co * Math.max(0, cao2 - cvo2) * 10);
    const o2er = +((vo2 / Math.max(1, do2)) * 100).toFixed(1);

    // 6. Forrester Classification
    let forresterQuadrant: ForresterQuadrant = 'I_warm_and_dry';
    let forresterLabel = 'Quadrant I: Warm & Dry (Normal / Compensated)';

    if (ci >= 2.2 && pcwp <= 18) {
      forresterQuadrant = 'I_warm_and_dry';
      forresterLabel = 'Quadrant I: Warm & Dry (Normal / Compensated)';
    } else if (ci >= 2.2 && pcwp > 18) {
      forresterQuadrant = 'II_warm_and_wet';
      forresterLabel = 'Quadrant II: Warm & Wet (Pulmonary Congestion)';
    } else if (ci < 2.2 && pcwp <= 18) {
      forresterQuadrant = 'III_cold_and_dry';
      forresterLabel = 'Quadrant III: Cold & Dry (Hypoperfusion / Hypovolemia)';
    } else {
      forresterQuadrant = 'IV_cold_and_wet';
      forresterLabel = 'Quadrant IV: Cold & Wet (Cardiogenic Shock)';
    }

    // 7. Shock Etiology Classification (Priority Order)
    const isEqualizationPresent = Math.abs(cvp - pcwp) <= 4 && cvp >= 14 && ci < 2.2;
    let shockEtiology: ShockEtiology = 'normal';
    let shockTitle = 'Normal Hemodynamic Profile';
    let shockSeverity: 'Normal' | 'Emergent' | 'High Alert' | 'Critical STAT' = 'Normal';
    let clinicalGuidance = 'Normal cardiac index, ventricular filling pressures, and systemic vascular resistance. Maintain baseline hemodynamic monitoring.';

    // Check Obstructive Shock: Cardiac Tamponade (diastolic pressure equalization)
    if (isEqualizationPresent) {
      shockEtiology = 'obstructive_tamponade';
      shockTitle = 'Obstructive Shock: Cardiac Tamponade';
      shockSeverity = 'Critical STAT';
      clinicalGuidance = 'Diastolic equalization of right and left atrial pressures (CVP ≈ PCWP) with severe low cardiac output. Emergent bedside echocardiogram and STAT pericardiocentesis or surgical pericardial window. Avoid aggressive positive pressure ventilation.';
    }
    // Check Obstructive Shock: Massive Pulmonary Embolism (acute cor pulmonale)
    else if (tpg >= 12 && pvr > 250 && cvp >= 10 && ci < 2.5) {
      shockEtiology = 'obstructive_pulmonary_embolism';
      shockTitle = 'Obstructive Shock: Massive Pulmonary Embolism';
      shockSeverity = 'Critical STAT';
      clinicalGuidance = 'Acute cor pulmonale: high transpulmonary gradient (TPG >= 12 mmHg), elevated PVR (>250 dyn·s/cm^5), and right ventricular strain with uncoupled wedge pressure. Evaluate for catheter-directed or systemic thrombolysis or surgical embolectomy.';
    }
    // Check Distributive / Septic Shock
    else if (ci > 3.8 && svr < 700) {
      shockEtiology = 'septic_distributive';
      shockTitle = 'Distributive / Septic Shock (Hyperdynamic)';
      shockSeverity = 'High Alert';
      clinicalGuidance = 'Profound systemic vasodilation with high cardiac output, low SVR (<700 dyn·s/cm^5), and impaired microvascular oxygen extraction. Norepinephrine first-line vasopressor to target MAP >= 65 mmHg. Early source control and broad-spectrum IV antimicrobials.';
    }
    // Check Cardiogenic Shock (Pump Failure)
    else if (ci < 2.2 && pcwp > 18) {
      shockEtiology = 'cardiogenic_pump_failure';
      shockTitle = 'Cardiogenic Shock (Forrester IV - Cold & Wet)';
      shockSeverity = 'Critical STAT';
      clinicalGuidance = 'Severe myocardial pump failure with pulmonary capillary congestion (PCWP > 18) and compensatory vasoconstriction (high SVR). Inotropic support (Dobutamine 2.5–10 mcg/kg/min or Milrinone) + cautious diuresis. Evaluate for mechanical circulatory support (Impella/IABP) and emergent coronary revascularization.';
    }
    // Check Hypovolemic Shock
    else if (ci < 2.2 && pcwp < 10 && cvp < 6) {
      shockEtiology = 'hypovolemic';
      shockTitle = 'Hypovolemic Shock (Forrester III - Cold & Dry)';
      shockSeverity = 'Emergent';
      clinicalGuidance = 'Severe volume depletion with collapsed preload (low CVP/PCWP), reduced stroke volume, and compensatory vasoconstriction. Volume resuscitation with balanced crystalloids or blood products (MTP 1:1:1 if hemorrhagic). Reassess response via stroke volume variation.';
    }

    return {
      cardiacOutputLmin: co,
      cardiacIndexLminM2: ci,
      strokeVolumeMl: sv,
      strokeVolumeIndexMlm2: svi,
      systemicVascularResistanceDyns: svr,
      systemicVascularResistanceIndexDynsm2: svri,
      pulmonaryVascularResistanceDyns: pvr,
      pulmonaryVascularResistanceIndexDynsm2: pvri,
      transpulmonaryGradientMmhg: tpg,
      leftCardiacWorkIndexKgm2: lcwi,
      arterialOxygenContentMlDl: cao2,
      venousOxygenContentMlDl: cvo2,
      oxygenDeliveryDo2Mlmin: do2,
      oxygenConsumptionVo2Mlmin: vo2,
      oxygenExtractionRatioPercent: o2er,
      forresterQuadrant,
      forresterLabel,
      shockEtiology,
      shockTitle,
      shockSeverity,
      clinicalGuidance,
      isEqualizationPresent
    };
  }

  /**
   * Applies validated ICU / Cath Lab clinical presets
   */
  applyPreset(preset: ShockEtiology): void {
    this.activePreset.set(preset);

    switch (preset) {
      case 'normal':
        this.inputs.set({
          injectateVolumeMl: 10,
          bloodTempC: 37.0,
          injectateTempC: 0.0,
          thermodilutionAucDegSec: 4.2,
          meanArterialPressureMmhg: 85,
          centralVenousPressureMmhg: 6,
          meanPaPressureMmhg: 15,
          pulmonaryCapillaryWedgePressureMmhg: 9,
          heartRateBpm: 75,
          hemoglobinGdl: 14.0,
          arterialOxygenSatPercent: 98,
          mixedVenousOxygenSatPercent: 75,
          bodySurfaceAreaM2: 1.85
        });
        break;

      case 'septic_distributive':
        this.inputs.set({
          injectateVolumeMl: 10,
          bloodTempC: 38.5,
          injectateTempC: 0.0,
          thermodilutionAucDegSec: 2.8, // Rapid washout -> High CO
          meanArterialPressureMmhg: 58,
          centralVenousPressureMmhg: 4,
          meanPaPressureMmhg: 16,
          pulmonaryCapillaryWedgePressureMmhg: 6,
          heartRateBpm: 115,
          hemoglobinGdl: 12.0,
          arterialOxygenSatPercent: 95,
          mixedVenousOxygenSatPercent: 82, // Impaired extraction
          bodySurfaceAreaM2: 1.85
        });
        break;

      case 'cardiogenic_pump_failure':
        this.inputs.set({
          injectateVolumeMl: 10,
          bloodTempC: 36.8,
          injectateTempC: 0.0,
          thermodilutionAucDegSec: 8.8, // Slow washout -> Low CO
          meanArterialPressureMmhg: 62,
          centralVenousPressureMmhg: 16,
          meanPaPressureMmhg: 34,
          pulmonaryCapillaryWedgePressureMmhg: 24, // Congested
          heartRateBpm: 98,
          hemoglobinGdl: 13.5,
          arterialOxygenSatPercent: 91,
          mixedVenousOxygenSatPercent: 48, // High extraction
          bodySurfaceAreaM2: 1.85
        });
        break;

      case 'hypovolemic':
        this.inputs.set({
          injectateVolumeMl: 10,
          bloodTempC: 36.2,
          injectateTempC: 0.0,
          thermodilutionAucDegSec: 7.5,
          meanArterialPressureMmhg: 65,
          centralVenousPressureMmhg: 1, // Collapsed
          meanPaPressureMmhg: 11,
          pulmonaryCapillaryWedgePressureMmhg: 3, // Collapsed
          heartRateBpm: 118,
          hemoglobinGdl: 9.0, // Acute blood loss
          arterialOxygenSatPercent: 97,
          mixedVenousOxygenSatPercent: 52,
          bodySurfaceAreaM2: 1.85
        });
        break;

      case 'obstructive_tamponade':
        this.inputs.set({
          injectateVolumeMl: 10,
          bloodTempC: 36.6,
          injectateTempC: 0.0,
          thermodilutionAucDegSec: 8.0,
          meanArterialPressureMmhg: 64,
          centralVenousPressureMmhg: 18, // Equalization
          meanPaPressureMmhg: 22,
          pulmonaryCapillaryWedgePressureMmhg: 19, // CVP ≈ PCWP
          heartRateBpm: 112,
          hemoglobinGdl: 13.0,
          arterialOxygenSatPercent: 94,
          mixedVenousOxygenSatPercent: 50,
          bodySurfaceAreaM2: 1.85
        });
        break;

      case 'obstructive_pulmonary_embolism':
        this.inputs.set({
          injectateVolumeMl: 10,
          bloodTempC: 37.0,
          injectateTempC: 0.0,
          thermodilutionAucDegSec: 7.8,
          meanArterialPressureMmhg: 68,
          centralVenousPressureMmhg: 16, // RV strain
          meanPaPressureMmhg: 42,        // Severe precapillary PA hypertension
          pulmonaryCapillaryWedgePressureMmhg: 10, // Normal wedge -> High TPG = 32
          heartRateBpm: 120,
          hemoglobinGdl: 14.0,
          arterialOxygenSatPercent: 88,
          mixedVenousOxygenSatPercent: 52,
          bodySurfaceAreaM2: 1.85
        });
        break;
    }
  }

  updateInput<K extends keyof IPacHemodynamicInputs>(key: K, value: IPacHemodynamicInputs[K]): void {
    this.inputs.update(current => ({
      ...current,
      [key]: value
    }));
  }
}
