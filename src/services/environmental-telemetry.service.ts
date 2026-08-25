import { Injectable, signal, computed } from '@angular/core';
import { HemisphericSyncType } from './monroe-persian-trance.service';

export interface ISevenGenerationEpigeneticMetric {
  generation: 'F1 (Immediate Children)' | 'F2 (Grandchildren)' | 'F3 (Great-Grandchildren)' | 'F4' | 'F5' | 'F6' | 'F7 (Seventh Generation)';
  epigeneticShieldScore: number; // 0 to 100%
  keyProtectiveFactor: string;
  environmentalRiskMitigated: string;
}

export interface IEnvironmentalTelemetry {
  barometricPressure: number; // hPa
  pressureDelta3h: number;   // hPa change in last 3 hours
  humidityPercent: number;    // %
  temperatureF: number;       // °F
  aqi: number;                // Air Quality Index (0 - 500)
  uvIndex: number;            // UV Index (0 - 12+)
  pollenLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  locationName: string;
  solarZenithAngle: number;   // degrees for UV directional lighting
  jointCapsuleCompressionRisk: 'Low' | 'Moderate' | 'Elevated' | 'Severe';
  ambientNoiseDb: number;      // Ambient acoustic noise in dB (30-90 dB)
  geomagneticKpIndex: number;  // 0 to 9 planetary Kp index
  schumannResonanceHz: number; // 7.83 Hz fundamental
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalTelemetryService {
  readonly telemetry = signal<IEnvironmentalTelemetry>({
    barometricPressure: 1004,
    pressureDelta3h: -4.5,
    humidityPercent: 86,
    temperatureF: 62,
    aqi: 68,
    uvIndex: 7.2,
    pollenLevel: 'High',
    locationName: 'Portland, ME (Coastal Atlantic & Androscoggin Biome)',
    solarZenithAngle: 38,
    jointCapsuleCompressionRisk: 'Elevated',
    ambientNoiseDb: 42,
    geomagneticKpIndex: 2.3,
    schumannResonanceHz: 7.83
  });

  // Storm Shield trigger state
  readonly isStormShieldActive = computed(() => {
    const t = this.telemetry();
    return t.pressureDelta3h <= -3.0 || t.barometricPressure < 1008 || t.humidityPercent > 80;
  });

  // AQI risk classification
  readonly aqiRiskLabel = computed(() => {
    const aqi = this.telemetry().aqi;
    if (aqi <= 50) return { label: 'Good', color: 'emerald' };
    if (aqi <= 100) return { label: 'Moderate', color: 'amber' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'orange' };
    return { label: 'Unhealthy', color: 'red' };
  });

  // Acoustic noise environment assessment
  readonly acousticEnvironmentLabel = computed(() => {
    const db = this.telemetry().ambientNoiseDb;
    if (db < 45) return { status: 'Serene Sanctuary', advice: 'Optimal for deep research & restorative trance' };
    if (db < 65) return { status: 'Moderate Clinic Ambient', advice: 'Recommended: Canine 60 BPM or Cedar Flute to mask noise' };
    return { status: 'Acoustic Overload', advice: 'Recommended: EMDR Bilateral 8Hz + Brown Noise Shield' };
  });

  // Seven Generations Epigenetic Environmental Lineage Analysis
  readonly sevenGenLineageProtection = computed<ISevenGenerationEpigeneticMetric[]>(() => {
    const t = this.telemetry();
    const isCleanAir = t.aqi <= 50;
    const isQuiet = t.ambientNoiseDb < 50;
    const baseScore = Math.round(
      (isCleanAir ? 40 : 20) + 
      (isQuiet ? 30 : 15) + 
      (this.isStormShieldActive() ? 15 : 30)
    );

    return [
      {
        generation: 'F1 (Immediate Children)',
        epigeneticShieldScore: Math.min(100, baseScore + 10),
        keyProtectiveFactor: 'Zero phthalate/VOC exposure & maternal autonomic co-regulation',
        environmentalRiskMitigated: 'Reduced childhood asthma and neurodevelopmental inflammation'
      },
      {
        generation: 'F2 (Grandchildren)',
        epigeneticShieldScore: Math.min(100, baseScore + 5),
        keyProtectiveFactor: 'Preserved germline DNA methylation patterns via anti-inflammatory nutrition',
        environmentalRiskMitigated: 'Protection against intergenerational metabolic dysregulation'
      },
      {
        generation: 'F3 (Great-Grandchildren)',
        epigeneticShieldScore: Math.min(100, baseScore),
        keyProtectiveFactor: 'Traditional botanical biodiversity & clean watershed guardianship',
        environmentalRiskMitigated: 'Prevention of cumulative endocrine disruption'
      },
      {
        generation: 'F7 (Seventh Generation)',
        epigeneticShieldScore: Math.min(100, baseScore - 5),
        keyProtectiveFactor: 'Haudenosaunee 100-Year Soil Biome & Seed Sovereignty Stewardship',
        environmentalRiskMitigated: 'Long-term biospheric resilience and intergenerational health sovereignty'
      }
    ];
  });

  // Automatically recommend the optimal acoustic protocol based on living environmental telemetry
  readonly recommendedAcousticProtocol = computed<{ presetId: HemisphericSyncType; name: string; rationale: string }>(() => {
    const t = this.telemetry();
    if (this.isStormShieldActive()) {
      return {
        presetId: 'indigenous_cedar_flute',
        name: 'Sacred Cedar Flute (432 Hz)',
        rationale: 'Barometric low pressure detected: Soothes barometric headache & joint capsule tension.'
      };
    } else if (t.ambientNoiseDb > 60) {
      return {
        presetId: 'emdr_bilateral_alpha',
        name: 'EMDR Bilateral Panning (8 Hz)',
        rationale: 'Elevated ambient noise: Disperses sympathetic sensory overload.'
      };
    } else if (t.aqi > 75) {
      return {
        presetId: 'wabanaki_canoe_cadence',
        name: 'Wabanaki River & Pine Wind',
        rationale: 'Moderate airborne particulate: Entrains deep diaphragmatic bronchial relaxation.'
      };
    }
    return {
      presetId: 'monroe_focus_12',
      name: 'Monroe Focus 12 / Interstellar Launch',
      rationale: 'Harmonious atmospheric conditions: Primed for deep cognitive discovery.'
    };
  });

  // Update telemetry helper (for dynamic preset or location switching)
  setPreset(preset: 'coastal_storm' | 'desert_dry' | 'high_altitude' | 'optimal') {
    switch (preset) {
      case 'coastal_storm':
        this.telemetry.set({
          barometricPressure: 1001,
          pressureDelta3h: -5.8,
          humidityPercent: 92,
          temperatureF: 58,
          aqi: 45,
          uvIndex: 3.1,
          pollenLevel: 'High',
          locationName: 'Androscoggin Estuary, ME (Low Pressure Front)',
          solarZenithAngle: 55,
          jointCapsuleCompressionRisk: 'Severe',
          ambientNoiseDb: 48,
          geomagneticKpIndex: 3.2,
          schumannResonanceHz: 7.83
        });
        break;
      case 'high_altitude':
        this.telemetry.set({
          barometricPressure: 840,
          pressureDelta3h: -2.1,
          humidityPercent: 28,
          temperatureF: 48,
          aqi: 22,
          uvIndex: 9.8,
          pollenLevel: 'Low',
          locationName: 'Denver / Boulder, CO (High Altitude 5,280 ft)',
          solarZenithAngle: 15,
          jointCapsuleCompressionRisk: 'Severe',
          ambientNoiseDb: 39,
          geomagneticKpIndex: 1.8,
          schumannResonanceHz: 7.83
        });
        break;
      case 'desert_dry':
        this.telemetry.set({
          barometricPressure: 1014,
          pressureDelta3h: 0.2,
          humidityPercent: 14,
          temperatureF: 94,
          aqi: 88,
          uvIndex: 11.0,
          pollenLevel: 'Moderate',
          locationName: 'Sonoran Basin, AZ (Arid High Heat)',
          solarZenithAngle: 8,
          jointCapsuleCompressionRisk: 'Low',
          ambientNoiseDb: 52,
          geomagneticKpIndex: 4.1,
          schumannResonanceHz: 7.83
        });
        break;
      case 'optimal':
      default:
        this.telemetry.set({
          barometricPressure: 1013,
          pressureDelta3h: 0.0,
          humidityPercent: 50,
          temperatureF: 72,
          aqi: 25,
          uvIndex: 5.5,
          pollenLevel: 'Low',
          locationName: 'Casco Bay, ME (Harmonious Maritime Equilibrium)',
          solarZenithAngle: 42,
          jointCapsuleCompressionRisk: 'Low',
          ambientNoiseDb: 35,
          geomagneticKpIndex: 1.2,
          schumannResonanceHz: 7.83
        });
        break;
    }
  }
}
