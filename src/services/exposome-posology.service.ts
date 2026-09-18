import { Injectable } from '@angular/core';

export type AtmosphericHazardType =
  | 'WILDFIRE_SMOKE_PM25'
  | 'OZONE_SURGE'
  | 'BAROMETRIC_DROP'
  | 'POLLEN_SPORE_SURGE'
  | 'EXTREME_HEAT_INDEX';

export interface IEnvironmentalTelemetrySnapshot {
  aqiPm25: number;
  ozonePpm: number;
  pollenSporeIndex: number; // 0 to 12 scale
  barometricPressureDeltaHpa6h: number; // e.g. -7 hPa drop in 6 hours
  heatIndexFahrenheit: number;
  forecastHorizonHours: number;
}

export interface IExposomePosologyDirective {
  id: string;
  hazard: AtmosphericHazardType;
  severity: 'ADVISORY' | 'WARNING' | 'EMERGENCY_PROTECTION';
  leadTimeHours: number;
  affectedConditions: string[];
  advancePosologyInstruction: string;
  environmentalMitigationAction: string;
  clinicalEvidenceGrounding: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExposomePosologyService {

  /**
   * Correlates real-time environmental telemetry forecasts with patient chronic conditions
   * to deliver 12–24h advance protective posology and environmental shielding directives.
   */
  evaluateAtmosphericFlareRisk(
    telemetry: IEnvironmentalTelemetrySnapshot,
    patientConditions: string[]
  ): IExposomePosologyDirective[] {
    const directives: IExposomePosologyDirective[] = [];
    const lowerConditions = patientConditions.map(c => c.toLowerCase());

    const hasPulmonary = lowerConditions.some(c => c.includes('asthma') || c.includes('copd') || c.includes('pulmon') || c.includes('bronch'));
    const hasMigraine = lowerConditions.some(c => c.includes('migraine') || c.includes('headache') || c.includes('trigeminal'));
    const hasDysautonomia = lowerConditions.some(c => c.includes('pots') || c.includes('autonomic') || c.includes('dysautonomia') || c.includes('orthostatic'));
    const hasAllergic = lowerConditions.some(c => c.includes('rhinitis') || c.includes('allergy') || c.includes('atopic'));

    // 1. Wildfire Smoke PM2.5 Trigger (> 100 AQI)
    if (telemetry.aqiPm25 >= 101 && (hasPulmonary || telemetry.aqiPm25 >= 150)) {
      const isSevere = telemetry.aqiPm25 >= 151;
      directives.push({
        id: `dir_pm25_${Date.now()}`,
        hazard: 'WILDFIRE_SMOKE_PM25',
        severity: isSevere ? 'EMERGENCY_PROTECTION' : 'WARNING',
        leadTimeHours: telemetry.forecastHorizonHours || 18,
        affectedConditions: ['Asthma', 'COPD', 'Cardiopulmonary'],
        advancePosologyInstruction: 'Pre-treat with prescribed maintenance inhaled corticosteroid (ICS) 1 hour prior to planned morning departure. Carry rescue short-acting beta-agonist (Albuterol) on person.',
        environmentalMitigationAction: 'Seal windows, set residential HVAC to recirculate mode with MERV-13 or true HEPA filtration, and cancel outdoor aerobic exertion.',
        clinicalEvidenceGrounding: 'Fine particulate matter (PM2.5) induces alveolar oxidative stress and interleukin-6 surges, triggering severe bronchospasm within 4–6 hours of outdoor exposure (NEJM Air Pollution & Health).'
      });
    }

    // 2. Barometric Pressure Drop (<= -5.0 hPa in 6 hours) -> Migraine / POTS
    if (telemetry.barometricPressureDeltaHpa6h <= -5.0 && (hasMigraine || hasDysautonomia)) {
      directives.push({
        id: `dir_baro_${Date.now()}`,
        hazard: 'BAROMETRIC_DROP',
        severity: 'WARNING',
        leadTimeHours: 12,
        affectedConditions: ['Migraine', 'Dysautonomia / POTS'],
        advancePosologyInstruction: 'Atmospheric low-pressure front approaching in 12 hours. Drink 500 mL electrolyte fluid + take 400 mg Magnesium Glycinate immediately. Keep prescribed abortive triptan accessible.',
        environmentalMitigationAction: 'Maintain dark, temperature-stable indoor environment. Pre-hydrate to expand plasma volume against sudden intracranial venous compliance shifts.',
        clinicalEvidenceGrounding: 'Rapid barometric declines (>5 hPa) dilate cranial vasculature and trigger meningeal trigeminovascular nociceptors in migraineurs (Cephalalgia).'
      });
    }

    // 3. Extreme Heat Index (>= 95°F) -> POTS / Dysautonomia
    if (telemetry.heatIndexFahrenheit >= 95 && (hasDysautonomia || hasPulmonary)) {
      directives.push({
        id: `dir_heat_${Date.now()}`,
        hazard: 'EXTREME_HEAT_INDEX',
        severity: telemetry.heatIndexFahrenheit >= 105 ? 'EMERGENCY_PROTECTION' : 'WARNING',
        leadTimeHours: 24,
        affectedConditions: ['POTS', 'Orthostatic Hypotension', 'Autonomic Neuropathy'],
        advancePosologyInstruction: 'Thermal vasodilatory surge forecasted: increase daily oral sodium by 2.0–2.5g and water intake to 3.0 L. Don 20–30 mmHg waist-high compression garments before rising from bed.',
        environmentalMitigationAction: 'Pre-cool bedroom below 68°F. Use evaporative cooling towels or ice-vests if transit in unconditioned outdoor spaces is unavoidable.',
        clinicalEvidenceGrounding: 'Heat-induced cutaneous vasodilatation pools 1.0–1.5 L of venous volume in lower extremities, precipitating severe reflex tachycardia and presyncope in dysautonomia.'
      });
    }

    // 4. Pollen Spore Surge (>= 8.5 on 12 scale) -> Reactive Airway / Allergic Rhinitis
    if (telemetry.pollenSporeIndex >= 8.5 && (hasAllergic || hasPulmonary)) {
      directives.push({
        id: `dir_pollen_${Date.now()}`,
        hazard: 'POLLEN_SPORE_SURGE',
        severity: 'ADVISORY',
        leadTimeHours: 18,
        affectedConditions: ['Allergic Rhinitis', 'Atopic Asthma'],
        advancePosologyInstruction: 'Administer second-generation H1-antihistamine (Cetirizine / Fexofenadine) at bedtime. Use intranasal fluticasone propionate 1 spray per nostril.',
        environmentalMitigationAction: 'Shower and change clothes immediately after returning indoors to prevent transferring outdoor pollen spores to sleeping pillows.',
        clinicalEvidenceGrounding: 'Evening antihistamine timing ensures peak steady-state receptor saturation during early morning airborne pollen concentration peaks (5 AM–9 AM).'
      });
    }

    return directives;
  }
}
