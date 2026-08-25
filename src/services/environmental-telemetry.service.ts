import { Injectable, signal, computed } from '@angular/core';

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
    locationName: 'Portland, ME (Coastal Atlantic Biome)',
    solarZenithAngle: 38,
    jointCapsuleCompressionRisk: 'Elevated'
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
          jointCapsuleCompressionRisk: 'Severe'
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
          jointCapsuleCompressionRisk: 'Severe'
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
          jointCapsuleCompressionRisk: 'Low'
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
          uvIndex: 5.0,
          pollenLevel: 'Low',
          locationName: 'Portland, ME (Standard Baseline)',
          solarZenithAngle: 40,
          jointCapsuleCompressionRisk: 'Low'
        });
        break;
    }
  }
}
