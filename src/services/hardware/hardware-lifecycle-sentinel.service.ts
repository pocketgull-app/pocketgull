import { Injectable, signal, computed, inject } from '@angular/core';
import { TippssIngestionGuardService } from './tippss-ingestion-guard.service';

export interface IBatteryTelemetry {
  isSupported: boolean;
  levelPercent: number;
  isCharging: boolean;
  chargingTimeSec: number;
  dischargingTimeSec: number;
  swellingRiskDetected: boolean;
  recommendation: string;
}

export interface IBedsideSentinelConfig {
  isEnabled: boolean;
  dimDisplay: boolean;
  highContrastNight: boolean;
  conserveCpuHz: boolean;
  audibleAlarmsOnlyOnEmergency: boolean;
}

/**
 * Hardware Lifecycle & Circularity Sentinel:
 * Fights physical e-waste and planned obsolescence by:
 * 1. Protecting lithium-ion pouch cells from continuous-charge swelling via the Web Battery API.
 * 2. Enabling "Bedside Sentinel Kiosk" profiles to repurpose retired smartphones/tablets.
 * 3. Facilitating decoupled sensor hot-swapping so wearable displays outlive degradable transducers.
 */
@Injectable({
  providedIn: 'root'
})
export class HardwareLifecycleSentinelService {
  private tippssGuard = inject(TippssIngestionGuardService, { optional: true });

  // --- 1. Battery Health & Pouch Cell Swelling Sentry ---
  readonly batteryTelemetry = signal<IBatteryTelemetry>({
    isSupported: false,
    levelPercent: 85,
    isCharging: false,
    chargingTimeSec: 0,
    dischargingTimeSec: 0,
    swellingRiskDetected: false,
    recommendation: 'Battery API standby: monitoring cyclic degradation.'
  });

  // Time in ms spent continuously charging at >= 95%
  private overchargeStartTimeMs: number | null = null;
  readonly continuousOverchargeDurationSec = signal<number>(0);

  // --- 2. Bedside Sentinel Kiosk Configuration ---
  readonly bedsideSentinelConfig = signal<IBedsideSentinelConfig>({
    isEnabled: false,
    dimDisplay: false,
    highContrastNight: false,
    conserveCpuHz: false,
    audibleAlarmsOnlyOnEmergency: true
  });

  // --- 3. Decoupled Hardware Sensor Reclamation Stats ---
  readonly sensorHotSwapsCount = signal<number>(0);
  readonly estimatedHardwareLifespanExtensionYears = computed(() => {
    const isSentinelActive = this.bedsideSentinelConfig().isEnabled;
    const isSwellingProtected = !this.batteryTelemetry().swellingRiskDetected;
    const swaps = this.sensorHotSwapsCount();
    
    // Repurposed device base + battery preservation + modular sensor swaps
    let years = 1.5;
    if (isSentinelActive) years += 3.0; // Repurposed older handset life
    if (isSwellingProtected) years += 2.0; // Avoided lithium battery failure
    years += Math.min(swaps * 1.5, 4.5); // Modular sensor replacements
    return Math.round(years * 10) / 10;
  });

  constructor() {
    this.initBatteryMonitoring();
  }

  /**
   * Initializes real-time battery telemetry via the Web Battery API.
   * Degrades gracefully when run on desktop browsers without battery hardware or SSR.
   */
  async initBatteryMonitoring(): Promise<void> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      this.batteryTelemetry.update(curr => ({
        ...curr,
        isSupported: false,
        recommendation: 'Web Battery API not present; device running on direct AC mains or simulated power.'
      }));
      return;
    }

    try {
      const battery = await (navigator as any).getBattery();
      this.updateBatteryState(battery);

      battery.addEventListener('chargingchange', () => this.updateBatteryState(battery));
      battery.addEventListener('levelchange', () => this.updateBatteryState(battery));
      battery.addEventListener('chargingtimechange', () => this.updateBatteryState(battery));
      battery.addEventListener('dischargingtimechange', () => this.updateBatteryState(battery));
    } catch {
      this.batteryTelemetry.update(curr => ({
        ...curr,
        isSupported: false,
        recommendation: 'Battery status access restricted by browser policy.'
      }));
    }
  }

  /**
   * Updates battery telemetry and assesses lithium pouch swelling risk.
   */
  updateBatteryState(battery: {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  }): void {
    const levelPercent = Math.round(battery.level * 100);
    const isCharging = battery.charging;

    // Detect wall-tethered overcharge: charging at >= 95% triggers cell degradation
    let swellingRisk = false;
    let recommendation = '';

    if (isCharging && levelPercent >= 95) {
      if (!this.overchargeStartTimeMs) {
        this.overchargeStartTimeMs = Date.now();
      }
      const durationSec = Math.floor((Date.now() - this.overchargeStartTimeMs) / 1000);
      this.continuousOverchargeDurationSec.set(durationSec);

      swellingRisk = true;
      recommendation = '⚠️ Wall-tethered 100% overcharge detected. Cycle power between 20%–80% to prevent lithium-ion pouch cell gas expansion and extend device life by 5+ years.';
    } else {
      this.overchargeStartTimeMs = null;
      this.continuousOverchargeDurationSec.set(0);

      if (levelPercent < 20 && !isCharging) {
        recommendation = 'Low battery: connect power to prevent copper shunt deep-discharge cell damage.';
      } else if (levelPercent >= 20 && levelPercent <= 80) {
        recommendation = 'Optimal battery preservation zone (20%–80%). Anode stress and lithium plating minimized.';
      } else {
        recommendation = 'Battery status nominal. Hardware lifecycle operating within safe parameters.';
      }
    }

    this.batteryTelemetry.set({
      isSupported: true,
      levelPercent,
      isCharging,
      chargingTimeSec: battery.chargingTime || 0,
      dischargingTimeSec: battery.dischargingTime || 0,
      swellingRiskDetected: swellingRisk,
      recommendation
    });
  }

  /**
   * Manually sets simulated battery parameters (useful for kiosks, testing, and edge demonstrations).
   */
  simulateBatteryParameters(params: {
    levelPercent: number;
    isCharging: boolean;
    swellingRisk?: boolean;
  }): void {
    const swelling = params.swellingRisk ?? (params.isCharging && params.levelPercent >= 95);
    const recommendation = swelling
      ? '⚠️ Wall-tethered 100% overcharge detected. Cycle power between 20%–80% to prevent lithium-ion pouch cell gas expansion and extend device life by 5+ years.'
      : params.levelPercent >= 20 && params.levelPercent <= 80
      ? 'Optimal battery preservation zone (20%–80%). Anode stress and lithium plating minimized.'
      : 'Battery status nominal.';

    this.batteryTelemetry.set({
      isSupported: true,
      levelPercent: params.levelPercent,
      isCharging: params.isCharging,
      chargingTimeSec: params.isCharging ? 3600 : 0,
      dischargingTimeSec: !params.isCharging ? 14400 : 0,
      swellingRiskDetected: swelling,
      recommendation
    });
  }

  /**
   * Toggles Bedside Sentinel Kiosk mode:
   * Repurposes retired phones/tablets into permanent low-power clinical monitors with zero cloud waste.
   */
  toggleBedsideSentinelMode(enable?: boolean): void {
    const nextState = enable !== undefined ? enable : !this.bedsideSentinelConfig().isEnabled;
    this.bedsideSentinelConfig.update(config => ({
      ...config,
      isEnabled: nextState,
      dimDisplay: nextState,
      highContrastNight: nextState,
      conserveCpuHz: nextState
    }));

    if (this.tippssGuard) {
      this.tippssGuard.registerDevice({
        deviceId: `BEDSIDE-KIOSK-${Date.now().toString(36).toUpperCase()}`,
        manufacturer: 'Repurposed Hardware (Circular IoMT)',
        model: 'Pocket-Gull Bedside Sentinel Kiosk (Zero-Landfill)',
        hardwareRootOfTrust: 'GENERIC_SECURE_ELEMENT',
        firmwareVersion: 'v1.0-circular-sentinel',
        ieeeIcapCertified: true,
        assignedPatientId: 'PATIENT-SELF-01',
        bindingToken: 'attest_bedside_sentinel_circular_bound',
        enrolledAt: new Date().toISOString(),
        isRevoked: false,
        knownVulnerabilities: []
      });
    }
  }

  /**
   * Updates partial bedside sentinel kiosk settings.
   */
  setBedsideConfig(config: Partial<IBedsideSentinelConfig>): void {
    this.bedsideSentinelConfig.update(current => ({
      ...current,
      ...config
    }));
  }

  /**
   * Registers a decoupled transducer/sensor replacement:
   * When an optical photodiode strap or pulse ox clip wears out, hot-swap the sensor without tossing the host computer.
   */
  registerDecoupledSensorSwap(newSensorModel: string, oldSensorModel: string): void {
    this.sensorHotSwapsCount.update(count => count + 1);

    if (this.tippssGuard) {
      this.tippssGuard.registerDevice({
        deviceId: `REPLACED-SENSOR-${Date.now().toString(36).toUpperCase()}`,
        manufacturer: 'Standard Bluetooth SIG GATT Peripherals',
        model: newSensorModel,
        hardwareRootOfTrust: 'GENERIC_SECURE_ELEMENT',
        firmwareVersion: 'v1.0-standard-gatt',
        ieeeIcapCertified: true,
        assignedPatientId: 'PATIENT-SELF-01',
        bindingToken: `attest_swapped_sensor_${Date.now().toString(36)}`,
        enrolledAt: new Date().toISOString(),
        isRevoked: false,
        knownVulnerabilities: []
      });
    }
  }
}
