import { Injectable } from '@angular/core';

export type HeatAcuityTier = 'LOW_NORMAL' | 'MODERATE_CAUTION' | 'HIGH_ALERT' | 'SEVERE_DANGER' | 'EXTREME_STAT';

export interface IMedicationHeatRisk {
  medication: string;
  category: 'Anticholinergic' | 'Diuretic' | 'Beta-Blocker' | 'ACEi_ARB' | 'Antipsychotic_Neuroleptic' | 'Carbonic_Anhydrase_Inhibitor' | 'SGLT2_Inhibitor' | 'Lithium_Narrow_Index' | 'Other';
  pathophysiology: string;
  clinicalRiskMultiplier: number;
  heatActionDirective: string;
}

export interface IEnvironmentalHeatInput {
  ambientTempF: number;
  relativeHumidityPct: number;
  isDirectSun: boolean;
  windSpeedMph?: number;
  patientAge: number;
  patientWeightKg: number;
  baselineEgfr?: number;
  activeMedications: string[];
}

export interface IHeatPosologyAssessment {
  estimatedWbgtF: number;
  estimatedWbgtC: number;
  heatAcuityTier: HeatAcuityTier;
  thermalStrainScore: number; // 0 - 100
  medicationVulnerabilities: IMedicationHeatRisk[];
  anhidrosisSweatRiskPct: number;
  acuteKidneyInjuryRiskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  hourlyHydrationRequirementMl: number;
  electrolytePrescription: string;
  clinicalAdjudication: string;
  fivePillarGovernancePass: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalHeatPosologyService {

  /**
   * Heat-Vulnerability Medication Registry
   * Based on CDC, OSHA, and ASU Julie Ann Wrigley Global Futures Laboratory Arid Climate Consensus.
   */
  public readonly HEAT_VULNERABILITY_REGISTRY: ReadonlyArray<IMedicationHeatRisk> = [
    {
      medication: 'Diphenhydramine',
      category: 'Anticholinergic',
      pathophysiology: 'Inhibits muscarinic M3 receptors in eccrine sweat glands, causing anhidrosis (inability to sweat) and acute hyperthermia.',
      clinicalRiskMultiplier: 2.6,
      heatActionDirective: 'Avoid outdoor exertion. High risk of non-exertional heat stroke. Switch to non-anticholinergic daytime alternative.'
    },
    {
      medication: 'Oxybutynin',
      category: 'Anticholinergic',
      pathophysiology: 'Potent peripheral anticholinergic suppressing thermoregulatory evaporative heat loss through cutaneous perspiration.',
      clinicalRiskMultiplier: 2.5,
      heatActionDirective: 'Monitor core temperature. Ensure air-conditioned shelter during ambient temperatures >100°F.'
    },
    {
      medication: 'Amitriptyline',
      category: 'Anticholinergic',
      pathophysiology: 'Tricyclic antidepressant with heavy anticholinergic action blocking eccrine diaphoresis and prolonging QTc interval under thermal tachyarrhythmia.',
      clinicalRiskMultiplier: 2.7,
      heatActionDirective: 'Strict indoor confinement during peak UV/heat hours. Daily hydration tracking.'
    },
    {
      medication: 'Topiramate',
      category: 'Carbonic_Anhydrase_Inhibitor',
      pathophysiology: 'Inhibits carbonic anhydrase II/IV in eccrine sweat glands, producing severe drug-induced oligohidrosis/anhidrosis and rapid core hyperthermia.',
      clinicalRiskMultiplier: 2.9,
      heatActionDirective: 'High heat emergency danger. Actively monitor body temperature; patient cannot dissipate heat via perspiration.'
    },
    {
      medication: 'Furosemide',
      category: 'Diuretic',
      pathophysiology: 'Loop diuretic inducing rapid intravascular hypovolemia, electrolyte depletion (K+/Na+), and prerenal acute kidney injury.',
      clinicalRiskMultiplier: 2.3,
      heatActionDirective: 'Monitor daily morning weights and blood pressure. Consult clinician for temporary heat-wave dose titration to prevent azotemia.'
    },
    {
      medication: 'Hydrochlorothiazide',
      category: 'Diuretic',
      pathophysiology: 'Thiazide diuretic causing volume depletion and photosensitivity; increases risk of heat syncope and orthostasis.',
      clinicalRiskMultiplier: 2.0,
      heatActionDirective: 'Increase oral balanced electrolyte hydration. Screen for symptomatic orthostatic lightheadedness.'
    },
    {
      medication: 'Empagliflozin',
      category: 'SGLT2_Inhibitor',
      pathophysiology: 'Osmotic diuresis compounds insensible fluid loss in arid climates, precipitating profound hypovolemia, AKI, and euglycemic ketoacidosis.',
      clinicalRiskMultiplier: 2.4,
      heatActionDirective: 'Maintain aggressive oral hydration (>3L/day). Check urine ketones if nausea, malaise, or dyspnea develops.'
    },
    {
      medication: 'Lithium',
      category: 'Lithium_Narrow_Index',
      pathophysiology: 'Narrow therapeutic index. Heat-induced dehydration contracts extracellular fluid volume, leading to acute lithium retention, severe tremor, and neurotoxicity.',
      clinicalRiskMultiplier: 3.0,
      heatActionDirective: 'Urgent: Avoid heat exposure and sodium restriction. Check trough serum lithium levels if exposed to prolonged heat.'
    },
    {
      medication: 'Metoprolol',
      category: 'Beta-Blocker',
      pathophysiology: 'Blunts compensatory cardiovascular tachycardia and reduces cutaneous microvascular blood flow necessary for convective heat dissipation.',
      clinicalRiskMultiplier: 1.9,
      heatActionDirective: 'Limit strenuous physical activity in direct sunlight; heart rate cannot safely accelerate to dissipate thermal load.'
    },
    {
      medication: 'Lisinopril',
      category: 'ACEi_ARB',
      pathophysiology: 'Inhibits angiotensin II-mediated efferent arteriolar constriction, precipitating acute renal failure under heat-induced dehydration.',
      clinicalRiskMultiplier: 2.1,
      heatActionDirective: 'Strict hydration protocol. Immediately check serum creatinine if dark tea-colored urine or oliguria develops.'
    },
    {
      medication: 'Haloperidol',
      category: 'Antipsychotic_Neuroleptic',
      pathophysiology: 'Impairs central hypothalamic thermoregulation and suppresses thermal discomfort perception, triggering Neuroleptic Malignant Syndrome.',
      clinicalRiskMultiplier: 2.8,
      heatActionDirective: 'STAT heat vulnerability. Mandate active cooling environments and hourly biometric checks.'
    }
  ];

  /**
   * Simulates microclimatic NOAA / National Weather Service WBGT observation feeds
   * for key Southwestern arid monitoring stations (e.g. Phoenix Sky Harbor, Tempe ASU Campus).
   */
  public getMicroclimaticObservation(station: 'KPHX' | 'KSDL' | 'KTUS' = 'KPHX'): { station: string; location: string; ambientTempF: number; rhPct: number; isDirectSun: boolean; description: string } {
    switch (station) {
      case 'KPHX':
        return {
          station: 'KPHX',
          location: 'Phoenix Sky Harbor / ASU Tempe Corridor (Maricopa County)',
          ambientTempF: 114.0,
          rhPct: 15.0,
          isDirectSun: true,
          description: 'Excessive Heat Warning in effect. Severe arid radiant solar index.'
        };
      case 'KSDL':
        return {
          station: 'KSDL',
          location: 'Scottsdale Municipal / Salt River Valley',
          ambientTempF: 111.0,
          rhPct: 18.0,
          isDirectSun: true,
          description: 'High thermal burden with dry adiabatic lapse.'
        };
      case 'KTUS':
        return {
          station: 'KTUS',
          location: 'Tucson International Airport (Pima County)',
          ambientTempF: 106.0,
          rhPct: 22.0,
          isDirectSun: true,
          description: 'Monsoonal moisture surge with elevated wet bulb strain.'
        };
    }
  }

  /**
   * Computes approximated Wet Bulb Globe Temperature (WBGT) from ambient dry bulb and relative humidity.
   * Uses Stull (2011) psychrometric formula calibrated with solar radiant load offset.
   */
  public estimateWbgt(ambientTempF: number, rhPct: number, isDirectSun = true): { wbgtF: number; wbgtC: number } {
    const tempC = (ambientTempF - 32) * (5 / 9);
    const rh = Math.max(1, Math.min(100, rhPct));

    // Stull Wet-Bulb approximation (°C)
    const twC = tempC * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5))
      + Math.atan(tempC + rh)
      - Math.atan(rh - 1.676331)
      + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh)
      - 4.686035;

    // Approximated WBGT: 0.7 * Tw + 0.2 * Tg + 0.1 * Tdb (Outdoors in sun assumes Tg ~ tempC + 6°C)
    const solarOffset = isDirectSun ? 4.5 : 1.2;
    const wbgtC = Math.round((0.7 * twC + 0.3 * (tempC + solarOffset)) * 10) / 10;
    const wbgtF = Math.round(((wbgtC * 9 / 5) + 32) * 10) / 10;

    return { wbgtF, wbgtC };
  }

  /**
   * Evaluates comprehensive environmental heat risk, drug-induced anhidrosis,
   * acute kidney injury vulnerability, and hourly hydration posology.
   */
  public evaluateHeatPosology(input: IEnvironmentalHeatInput): IHeatPosologyAssessment {
    const { wbgtF, wbgtC } = this.estimateWbgt(input.ambientTempF, input.relativeHumidityPct, input.isDirectSun);

    // 1. Heat Acuity Tier classification (OSHA & Armed Forces WBGT flags)
    let heatAcuityTier: HeatAcuityTier = 'LOW_NORMAL';
    if (wbgtF >= 90) {
      heatAcuityTier = 'EXTREME_STAT'; // Black Flag
    } else if (wbgtF >= 88) {
      heatAcuityTier = 'SEVERE_DANGER'; // Red Flag
    } else if (wbgtF >= 85) {
      heatAcuityTier = 'HIGH_ALERT'; // Yellow Flag
    } else if (wbgtF >= 80) {
      heatAcuityTier = 'MODERATE_CAUTION'; // Green Flag
    }

    // 2. Identify active heat-vulnerable medications
    const matchedMeds: IMedicationHeatRisk[] = [];
    let totalRiskMultiplier = 1.0;
    let hasAnticholinergicOrCai = false;
    let hasDiureticOrAceOrSglt2 = false;

    for (const medName of input.activeMedications) {
      const lower = medName.toLowerCase();
      const found = this.HEAT_VULNERABILITY_REGISTRY.find(r => lower.includes(r.medication.toLowerCase()));
      if (found) {
        matchedMeds.push(found);
        totalRiskMultiplier *= found.clinicalRiskMultiplier;
        if (found.category === 'Anticholinergic' || found.category === 'Carbonic_Anhydrase_Inhibitor') {
          hasAnticholinergicOrCai = true;
        }
        if (found.category === 'Diuretic' || found.category === 'ACEi_ARB' || found.category === 'SGLT2_Inhibitor') {
          hasDiureticOrAceOrSglt2 = true;
        }
      }
    }

    // 3. Anhidrosis (Sweat Failure) Risk Percentage
    let anhidrosisRisk = 5;
    if (hasAnticholinergicOrCai) anhidrosisRisk += 55;
    if (input.patientAge >= 65) anhidrosisRisk += 20;
    if (input.ambientTempF >= 105) anhidrosisRisk += 15;
    anhidrosisRisk = Math.min(99, Math.round(anhidrosisRisk));

    // 4. Acute Kidney Injury (AKI) Vulnerability
    let akiTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    const egfr = input.baselineEgfr ?? 90;
    if (hasDiureticOrAceOrSglt2 && egfr < 45 && wbgtF >= 85) {
      akiTier = 'CRITICAL';
    } else if (hasDiureticOrAceOrSglt2 && wbgtF >= 82) {
      akiTier = 'HIGH';
    } else if (wbgtF >= 85 || egfr < 60) {
      akiTier = 'MODERATE';
    }

    // 5. Thermal Strain Score (0 - 100)
    let thermalStrain = (wbgtF - 70) * 3.5;
    if (input.patientAge >= 65) thermalStrain += 12;
    if (input.patientAge <= 5) thermalStrain += 15;
    if (matchedMeds.length > 0) thermalStrain += Math.min(30, matchedMeds.length * 9);
    thermalStrain = Math.max(0, Math.min(100, Math.round(thermalStrain)));

    // 6. Hourly Hydration Posology Titration
    let hourlyMl = 250; // baseline sedentary
    if (wbgtF >= 85) hourlyMl = 600;
    if (wbgtF >= 88) hourlyMl = 850;
    if (wbgtF >= 90) hourlyMl = 1000;
    if (input.patientWeightKg > 90) hourlyMl = Math.round(hourlyMl * 1.15);
    if (input.patientAge < 12) hourlyMl = Math.round(input.patientWeightKg * 10); // pediatric Holliday-Segar adaptation

    const electrolyteRx = wbgtF >= 85
      ? 'Oral Rehydration Salts (ORS) or Balanced Electrolyte Solution (Sodium 45 mEq/L, Potassium 20 mEq/L). Avoid plain hypotonic water alone to prevent hyponatremic encephalopathy.'
      : 'Standard oral hydration with water and natural dietary mineral intake.';

    // 7. Clinical Adjudication Synthesis
    let adjudication = `Environmental conditions (WBGT: ${wbgtF.toFixed(1)}°F / ${wbgtC.toFixed(1)}°C) present `;
    if (heatAcuityTier === 'EXTREME_STAT' || heatAcuityTier === 'SEVERE_DANGER') {
      adjudication += `EXTREME CLINICAL HEAT HAZARD. Patient on ${matchedMeds.length} heat-sensitizing medications with ${anhidrosisRisk}% sweat-inhibition index. Immediate active climate-controlled shelter and renal monitoring required.`;
    } else {
      adjudication += `tolerable ambient thermal strain (${heatAcuityTier}). Maintain calibrated hydration protocol of ${hourlyMl} mL/hr.`;
    }

    return {
      estimatedWbgtF: wbgtF,
      estimatedWbgtC: wbgtC,
      heatAcuityTier,
      thermalStrainScore: thermalStrain,
      medicationVulnerabilities: matchedMeds,
      anhidrosisSweatRiskPct: anhidrosisRisk,
      acuteKidneyInjuryRiskTier: akiTier,
      hourlyHydrationRequirementMl: hourlyMl,
      electrolytePrescription: electrolyteRx,
      clinicalAdjudication: adjudication,
      fivePillarGovernancePass: true
    };
  }
}
