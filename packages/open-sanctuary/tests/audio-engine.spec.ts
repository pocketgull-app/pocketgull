import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvsAudioEngine } from '../src/audio-engine';

describe('AvsAudioEngine', () => {
  let engine: AvsAudioEngine;

  beforeEach(() => {
    engine = new AvsAudioEngine({
      carrierFreqHz: 432,
      beatFreqHz: 10.0,
      volume: 0.5
    });
  });

  it('initializes with specified configuration', () => {
    expect(engine.isPlaying).toBe(false);
    expect(engine.config.carrierFreqHz).toBe(432);
    expect(engine.config.beatFreqHz).toBe(10.0);
    expect(engine.config.volume).toBe(0.5);
  });

  it('updates configuration dynamically', () => {
    engine.updateConfig({ carrierFreqHz: 528, beatFreqHz: 7.83 });
    expect(engine.config.carrierFreqHz).toBe(528);
    expect(engine.config.beatFreqHz).toBe(7.83);
  });

  it('handles getByteFrequencyData safely when not playing', () => {
    const buffer = new Uint8Array(32);
    buffer.fill(99);
    engine.getByteFrequencyData(buffer);
    // Should fill with 0 when no analyser active
    expect(buffer[0]).toBe(0);
    expect(buffer[31]).toBe(0);
  });

  it('handles getByteTimeDomainData safely when not playing', () => {
    const buffer = new Uint8Array(32);
    buffer.fill(0);
    engine.getByteTimeDomainData(buffer);
    // Should fill with 128 (center line) when no analyser active
    expect(buffer[0]).toBe(128);
    expect(buffer[31]).toBe(128);
  });

  it('gracefully handles stop() when already stopped', () => {
    expect(() => engine.stop()).not.toThrow();
    expect(engine.isPlaying).toBe(false);
  });
});
