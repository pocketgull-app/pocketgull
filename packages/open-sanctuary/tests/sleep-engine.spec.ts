import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SleepEngine } from '../src/sleep-engine';
import { AvsAudioEngine } from '../src/audio-engine';

describe('SleepEngine Suite', () => {
  let sleepEngine: SleepEngine;
  let audioEngine: AvsAudioEngine;

  beforeEach(() => {
    sleepEngine = new SleepEngine();
    audioEngine = new AvsAudioEngine();
    sleepEngine.connectAudioEngine(audioEngine);
  });

  it('correctly estimates sleep stages from movement and respiration', () => {
    // High movement -> awake
    expect(sleepEngine.estimateSleepStage(0.5, 18)).toBe('awake');

    // Moderate stillness and calm breathing -> light/REM
    expect(sleepEngine.estimateSleepStage(0.12, 14)).toBe('light_rem');

    // Deep stillness and slow respiration -> deep delta
    expect(sleepEngine.estimateSleepStage(0.02, 10)).toBe('deep_delta');
  });

  it('calculates adaptive step-down pacing targets smoothly over time', () => {
    const startBpm = 16;
    // At 0 minutes, should equal initial rate
    expect(sleepEngine.calculateAdaptivePacingTarget(startBpm, 0)).toBe(16);

    // At 7.5 minutes (halfway), should be halfway down to 6.0 bpm
    expect(sleepEngine.calculateAdaptivePacingTarget(startBpm, 7.5)).toBeCloseTo(11.0, 1);

    // At 15+ minutes, should reach the target floor of 6.0 bpm
    expect(sleepEngine.calculateAdaptivePacingTarget(startBpm, 15)).toBe(6.0);
    expect(sleepEngine.calculateAdaptivePacingTarget(startBpm, 30)).toBe(6.0);
  });

  it('calculates circadian sleep gate and melatonin onset accurately', () => {
    const gate = sleepEngine.calculateSleepGate(7, 0); // 7:00 AM wake time
    expect(gate.idealWakeTimeStr).toBe('07:00');
    expect(gate.idealBedtimeStr).toBe('23:00'); // 8 hours before 7:00 AM
    expect(gate.melatoninOnsetWindow).toBe('21:00 – 23:00');
  });

  it('processes sensor reading and dispatches updates via callbacks', () => {
    let lastStage = '';
    sleepEngine.onReadingUpdate = (reading) => {
      lastStage = reading.estimatedStage;
    };

    const reading = sleepEngine.processSensorReading(0.03, 11, false, -40);
    expect(reading.estimatedStage).toBe('deep_delta');
    expect(lastStage).toBe('deep_delta');
  });

  it('triggers snore callback when snoring is detected and enabled', () => {
    let snoreFired = false;
    sleepEngine.onSnoreNudge = () => {
      snoreFired = true;
    };

    sleepEngine.processSensorReading(0.04, 12, true, -18);
    expect(snoreFired).toBe(true);
  });
});
