/**
 * @pocketgull/open-sanctuary
 * Sleep Chronobiology & Contactless Respiration Suite (Sleep as Android inspired).
 */

import {
  ISleepSessionConfig,
  ISleepTrackingReading,
  ISleepGateRecommendation,
  SleepStageEstimate
} from './types';
import { AvsAudioEngine } from './audio-engine';

export class SleepEngine {
  private config: ISleepSessionConfig;
  private audioEngine: AvsAudioEngine | null = null;
  private isTracking = false;
  private trackingIntervalId: number | null = null;

  private recentReadings: ISleepTrackingReading[] = [];
  private consecutiveStillPeriods = 0;
  private hasTriggeredAutoFadeout = false;
  private isAlarmRamping = false;

  public onReadingUpdate?: (reading: ISleepTrackingReading) => void;
  public onSleepDetected?: () => void;
  public onSmartAlarmTriggered?: () => void;
  public onSnoreNudge?: () => void;

  constructor(config?: Partial<ISleepSessionConfig>) {
    this.config = {
      autoFadeoutOnSleep: true,
      autoFadeoutDurationMin: 10,
      antiSnoreNudgeEnabled: true,
      adaptivePacingEnabled: true,
      smartAlarm: {
        enabled: false,
        targetWakeTimestamp: Date.now() + 8 * 3600 * 1000, // 8 hours default
        windowMinutes: 20,
        carrierFreqHz: 432,
        volumeRampSeconds: 45
      },
      ...config
    };
  }

  public connectAudioEngine(engine: AvsAudioEngine): void {
    this.audioEngine = engine;
  }

  public updateConfig(configUpdate: Partial<ISleepSessionConfig>): void {
    this.config = { ...this.config, ...configUpdate };
  }

  public getConfig(): ISleepSessionConfig {
    return { ...this.config };
  }

  /**
   * Evaluates sleep stage based on motion stillness and respiration rate stability
   */
  public estimateSleepStage(movementIntensity: number, respirationBpm: number): SleepStageEstimate {
    if (movementIntensity > 0.35 || respirationBpm > 17) {
      return 'awake';
    } else if (movementIntensity > 0.08 || respirationBpm > 13) {
      return 'light_rem';
    } else {
      return 'deep_delta';
    }
  }

  /**
   * Generates next adaptive respiratory pacing target (breaths per minute)
   */
  public calculateAdaptivePacingTarget(currentBpm: number, elapsedMinutes: number): number {
    // Step down from current rate toward 6.0 bpm over 15 minutes
    const targetFloor = 6.0;
    if (elapsedMinutes >= 15) return targetFloor;
    const progress = Math.min(1.0, elapsedMinutes / 15.0);
    return Math.max(targetFloor, currentBpm - (currentBpm - targetFloor) * progress);
  }

  /**
   * Calculates optimal Circadian "Sleep Gate" and melatonin onset based on target wake time
   */
  public calculateSleepGate(targetWakeHour = 7, targetWakeMinute = 0): ISleepGateRecommendation {
    const idealSleepDurationHours = 8.0;
    let sleepHour = (targetWakeHour - idealSleepDurationHours + 24) % 24;
    const sleepMinute = targetWakeMinute;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const bedtimeStr = `${pad(Math.floor(sleepHour))}:${pad(sleepMinute)}`;
    const wakeStr = `${pad(targetWakeHour)}:${pad(targetWakeMinute)}`;

    const melatoninOnsetHour = (sleepHour - 1.5 + 24) % 24;
    const melatoninWindowStr = `${pad(Math.floor(melatoninOnsetHour))}:${pad(sleepMinute)} – ${bedtimeStr}`;

    return {
      idealBedtimeStr: bedtimeStr,
      idealWakeTimeStr: wakeStr,
      circadianPhaseLabel: 'Evening Melatonin Gateway',
      melatoninOnsetWindow: melatoninWindowStr,
      sleepDebtMinutes: 0,
      suggestedPresetId: 'theta-meditation'
    };
  }

  /**
   * Ingests a new sensor reading (from microphone acoustic FFT or motion sensor)
   */
  public processSensorReading(
    movementIntensity: number,
    respirationBpm: number,
    isSnoring = false,
    ambientDb = -35
  ): ISleepTrackingReading {
    const stage = this.estimateSleepStage(movementIntensity, respirationBpm);
    const reading: ISleepTrackingReading = {
      timestamp: Date.now(),
      respirationRateBpm: respirationBpm,
      movementIntensity,
      isSnoringDetected: isSnoring,
      estimatedStage: stage,
      ambientNoiseDb: ambientDb
    };

    this.recentReadings.push(reading);
    if (this.recentReadings.length > 60) {
      this.recentReadings.shift();
    }

    // 1. Hypnagogic Fall-Asleep Detection
    if (stage !== 'awake') {
      this.consecutiveStillPeriods++;
      if (this.consecutiveStillPeriods >= 6 && !this.hasTriggeredAutoFadeout && this.config.autoFadeoutOnSleep) {
        this.hasTriggeredAutoFadeout = true;
        this.triggerAutoFadeout();
        this.onSleepDetected?.();
      }
    } else {
      this.consecutiveStillPeriods = 0;
    }

    // 2. Anti-Snore Positional Micro-Nudge
    if (isSnoring && this.config.antiSnoreNudgeEnabled) {
      this.triggerSnoreNudge();
    }

    // 3. Smart Alarm Window Check
    if (this.config.smartAlarm.enabled && !this.isAlarmRamping) {
      this.checkSmartAlarmTrigger(reading);
    }

    this.onReadingUpdate?.(reading);
    return reading;
  }

  private triggerAutoFadeout(): void {
    if (!this.audioEngine || !this.audioEngine.isPlaying) return;

    const initialVol = this.audioEngine.config.volume;
    const fadeSteps = 20;
    const stepDurationMs = (this.config.autoFadeoutDurationMin * 60 * 1000) / fadeSteps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (!this.audioEngine || !this.audioEngine.isPlaying) {
        clearInterval(interval);
        return;
      }

      const remainingFraction = Math.max(0, 1.0 - currentStep / fadeSteps);
      const newVol = initialVol * remainingFraction;
      this.audioEngine.updateConfig({ volume: newVol });

      if (currentStep >= fadeSteps) {
        clearInterval(interval);
        this.audioEngine.stop();
      }
    }, stepDurationMs);
  }

  private triggerSnoreNudge(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {}
    }
    this.onSnoreNudge?.();
  }

  private checkSmartAlarmTrigger(reading: ISleepTrackingReading): void {
    const now = Date.now();
    const target = this.config.smartAlarm.targetWakeTimestamp;
    const windowMs = this.config.smartAlarm.windowMinutes * 60 * 1000;
    const windowStart = target - windowMs;

    if (now >= windowStart && now <= target + 60000) {
      // Trigger if light sleep detected or deadline reached
      if (reading.estimatedStage === 'light_rem' || now >= target) {
        this.isAlarmRamping = true;
        this.triggerSmartAlarm();
      }
    }
  }

  private triggerSmartAlarm(): void {
    this.onSmartAlarmTriggered?.();
    if (!this.audioEngine) return;

    // Start gentle 432Hz Segah sunrise chime ramp
    this.audioEngine.start({
      carrierFreqHz: this.config.smartAlarm.carrierFreqHz,
      beatFreqHz: 10.0, // Alpha wakefulness
      binauralEnabled: true,
      waveform: 'triangle',
      volume: 0.05,
      noiseProfile: 'off'
    });

    const rampSteps = 15;
    const stepMs = (this.config.smartAlarm.volumeRampSeconds * 1000) / rampSteps;
    let step = 0;

    const rampInterval = setInterval(() => {
      step++;
      if (!this.audioEngine || !this.audioEngine.isPlaying) {
        clearInterval(rampInterval);
        return;
      }

      const vol = Math.min(0.85, 0.05 + (step / rampSteps) * 0.8);
      this.audioEngine.updateConfig({ volume: vol });

      if (step >= rampSteps) {
        clearInterval(rampInterval);
      }
    }, stepMs);
  }

  /**
   * Starts periodic background simulation/polling for sensor stream
   */
  public startTracking(): void {
    if (this.isTracking) return;
    this.isTracking = true;
    this.hasTriggeredAutoFadeout = false;
    this.consecutiveStillPeriods = 0;

    // In a real device, this hooks to mic or accelerometer.
    // In engine standalone mode, it provides clean periodic updates.
    this.trackingIntervalId = setInterval(() => {
      // Default baseline calm breathing simulation
      const mockMovement = Math.random() * 0.05;
      const mockRespiration = 12 + Math.sin(Date.now() / 8000) * 2;
      this.processSensorReading(mockMovement, mockRespiration, false, -38);
    }, 2000) as unknown as number;
  }

  public stopTracking(): void {
    this.isTracking = false;
    if (this.trackingIntervalId !== null) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }
  }
}
