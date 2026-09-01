import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatBionicHtml,
  tokenizeRsvp,
  getOptimalRecognitionPoint,
  BionicReaderEngine
} from '../src/bionic-reader';
import { AvsAudioEngine } from '../src/audio-engine';

describe('BionicReaderEngine Suite', () => {
  it('correctly calculates Optimal Recognition Point (ORP) index', () => {
    expect(getOptimalRecognitionPoint(1)).toBe(0); // "a" -> index 0
    expect(getOptimalRecognitionPoint(4)).toBe(1); // "read" -> index 1 ('e')
    expect(getOptimalRecognitionPoint(8)).toBe(2); // "sanctuary" -> index 2 ('n')
    expect(getOptimalRecognitionPoint(12)).toBe(3); // "neuroplastic" -> index 3 ('r')
    expect(getOptimalRecognitionPoint(16)).toBe(4); // "psychoneuroimmunology" -> index 4
  });

  it('formats text to Bionic HTML with bold initial 40-50% letters', () => {
    const raw = 'Deep restorative sleep heals neural tissues.';
    const bionic = formatBionicHtml(raw);

    expect(bionic).toContain('<b class="bionic-bold">De</b>ep');
    expect(bionic).toContain('<b class="bionic-bold">resto</b>rative');
    expect(bionic).toContain('<b class="bionic-bold">sle</b>ep');
    expect(bionic).toContain('<b class="bionic-bold">hea</b>ls');
  });

  it('tokenizes text into RSVP tokens with punctuation pause weighting', () => {
    const text = 'Breathe in, hold for a moment. Then exhale completely!';
    const tokens = tokenizeRsvp(text, 400, true);

    expect(tokens.length).toBe(9);
    expect(tokens[0].raw).toBe('Breathe');
    expect(tokens[1].hasCommaOrPause).toBe(true);
    expect(tokens[5].hasSentenceEnd).toBe(true);

    // Tokens with punctuation should have longer duration delays
    expect(tokens[1].delayMs).toBeGreaterThan(tokens[0].delayMs);
    expect(tokens[5].delayMs).toBeGreaterThan(tokens[0].delayMs);
  });

  it('controls reading playback and dispatches token callbacks', () => {
    const engine = new BionicReaderEngine({ wpm: 500, entrainmentMode: 'gamma40' });
    const audioEngine = new AvsAudioEngine();
    engine.connectAudioEngine(audioEngine);

    engine.loadText('Optimal cognitive performance requires parasympathetic autonomic balance.');
    expect(engine.tokenCount).toBe(7);
    expect(engine.currentIndex).toBe(0);

    let emittedToken = '';
    engine.onTokenUpdate = (token) => {
      emittedToken = token.raw;
    };

    engine.seekTo(3);
    expect(engine.currentIndex).toBe(3);
    expect(emittedToken).toBe('requires');

    engine.stepForward(2);
    expect(engine.currentIndex).toBe(5);

    engine.stepBackward(1);
    expect(engine.currentIndex).toBe(4);
  });
});
