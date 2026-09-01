/**
 * @pocketgull/open-sanctuary
 * Neuro-Bionic Speed Reader & RSVP Bibliotherapy Engine.
 * Combines Optimal Recognition Point (ORP) fixation bolding with 40Hz Gamma & 432Hz Solfeggio soundscapes.
 */

import { IRSVPToken, IBionicReaderConfig, ReaderEntrainmentMode, IBibliotherapyText } from './types';
import { AvsAudioEngine } from './audio-engine';

/**
 * Calculates Optimal Recognition Point (ORP) character index in a word (central foveal fixation anchor)
 */
export function getOptimalRecognitionPoint(wordLength: number): number {
  if (wordLength <= 1) return 0;
  if (wordLength <= 5) return 1;
  if (wordLength <= 9) return 2;
  if (wordLength <= 13) return 3;
  return 4;
}

/**
 * Converts a plain text or HTML string into Bionic Reading HTML format (bolding initial 40-50% letters).
 */
export function formatBionicHtml(text: string, highlightClass = 'bionic-bold'): string {
  if (!text) return '';

  // Disjoint token matching: HTML tags, HTML entities, or plain non-whitespace tokens (O(N) ReDoS-immune)
  return text.replace(/<[^>\n]+>|&[a-zA-Z0-9#]+;|[^\s<>&]+/g, (match) => {
    // Preserve HTML tags and HTML entities untouched
    if ((match.startsWith('<') && match.endsWith('>')) || (match.startsWith('&') && match.endsWith(';'))) {
      return match;
    }

    // Format individual word letter/digit runs while preserving surrounding punctuation
    return match.replace(/[a-zA-Z0-9]+/g, (letters) => {
      if (letters.length <= 1) {
        return `<b class="${highlightClass}">${letters}</b>`;
      }

      const boldLen = Math.max(1, Math.ceil(letters.length * 0.45));
      const boldPart = letters.slice(0, boldLen);
      const restPart = letters.slice(boldLen);

      return `<b class="${highlightClass}">${boldPart}</b>${restPart}`;
    });
  });
}

/**
 * Tokenizes plain text into a sequence of punctuation-weighted Rapid Serial Visual Presentation (RSVP) tokens.
 */
export function tokenizeRsvp(text: string, baseWpm = 450, isWeighted = true): IRSVPToken[] {
  if (!text || !text.trim()) return [];

  const rawWords = text.trim().split(/\s+/);
  const baseMs = Math.round(60000 / Math.max(50, baseWpm));
  const tokens: IRSVPToken[] = [];

  rawWords.forEach((raw, idx) => {
    // Strip leading and trailing non-alphanumerics in two non-backtracking anchor-isolated passes (O(N))
    const cleanWord = raw.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
    const cleanLen = cleanWord.length || raw.length;
    const orpIdx = getOptimalRecognitionPoint(cleanLen);

    // Find where the clean letters start in the raw token
    const letterStart = raw.search(/[a-zA-Z0-9]/);
    const actualOrp = letterStart >= 0 ? letterStart + orpIdx : orpIdx;

    const prefix = raw.slice(0, actualOrp);
    const orpChar = raw.slice(actualOrp, actualOrp + 1) || raw.slice(0, 1);
    const suffix = raw.slice(actualOrp + 1);

    const hasCommaOrPause = /[,;:\—\-]/.test(raw);
    const hasSentenceEnd = /[.!?]/.test(raw);
    const hasParagraphBreak = raw.includes('\n');

    let delayMs = baseMs;
    if (isWeighted) {
      if (hasParagraphBreak) delayMs += 250;
      else if (hasSentenceEnd) delayMs += 160;
      else if (hasCommaOrPause) delayMs += 75;
      else if (cleanLen > 10) delayMs += 35;
    }

    tokens.push({
      raw,
      prefix,
      orpChar,
      suffix,
      hasCommaOrPause,
      hasSentenceEnd,
      hasParagraphBreak,
      wordIndex: idx,
      delayMs
    });
  });

  return tokens;
}

export class BionicReaderEngine {
  private config: IBionicReaderConfig;
  private audioEngine: AvsAudioEngine | null = null;

  private tokens: IRSVPToken[] = [];
  private currentIdx = 0;
  private isPlaying = false;
  private timeoutId: any = null;

  public onTokenUpdate?: (token: IRSVPToken, progressPct: number, currentWord: number, totalWords: number) => void;
  public onStateChange?: (isPlaying: boolean) => void;
  public onComplete?: () => void;

  constructor(config?: Partial<IBionicReaderConfig>) {
    this.config = {
      wpm: 450,
      entrainmentMode: 'gamma40',
      isBionicBoldEnabled: true,
      isPunctuationPauseWeighted: true,
      ...config
    };
  }

  public connectAudioEngine(engine: AvsAudioEngine): void {
    this.audioEngine = engine;
  }

  public loadText(text: string): void {
    this.pause();
    this.tokens = tokenizeRsvp(text, this.config.wpm, this.config.isPunctuationPauseWeighted);
    this.currentIdx = 0;
    this.emitCurrentToken();
  }

  public get tokenCount(): number {
    return this.tokens.length;
  }

  public get currentIndex(): number {
    return this.currentIdx;
  }

  public get isReaderPlaying(): boolean {
    return this.isPlaying;
  }

  public setWpm(newWpm: number): void {
    this.config.wpm = Math.max(100, Math.min(1200, newWpm));
    // Recalculate remaining token delays
    if (this.tokens.length > 0) {
      const baseMs = Math.round(60000 / this.config.wpm);
      for (const tok of this.tokens) {
        let delay = baseMs;
        if (this.config.isPunctuationPauseWeighted) {
          if (tok.hasParagraphBreak) delay += 250;
          else if (tok.hasSentenceEnd) delay += 160;
          else if (tok.hasCommaOrPause) delay += 75;
        }
        tok.delayMs = delay;
      }
    }
  }

  public setEntrainmentMode(mode: ReaderEntrainmentMode): void {
    this.config.entrainmentMode = mode;
    if (this.isPlaying) {
      this.syncEntrainmentSoundscape();
    }
  }

  public play(): void {
    if (this.isPlaying || this.tokens.length === 0) return;
    if (this.currentIdx >= this.tokens.length) {
      this.currentIdx = 0;
    }

    this.isPlaying = true;
    this.onStateChange?.(true);
    this.syncEntrainmentSoundscape();
    this.tick();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.onStateChange?.(false);

    if (this.audioEngine && this.audioEngine.isPlaying) {
      this.audioEngine.stop();
    }
  }

  public togglePlay(): void {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  public seekTo(wordIndex: number): void {
    this.currentIdx = Math.max(0, Math.min(this.tokens.length - 1, wordIndex));
    this.emitCurrentToken();
  }

  public stepForward(words = 1): void {
    this.seekTo(this.currentIdx + words);
  }

  public stepBackward(words = 1): void {
    this.seekTo(this.currentIdx - words);
  }

  private tick(): void {
    if (!this.isPlaying || this.currentIdx >= this.tokens.length) {
      this.pause();
      if (this.currentIdx >= this.tokens.length) {
        this.onComplete?.();
      }
      return;
    }

    const currentToken = this.tokens[this.currentIdx];
    this.emitCurrentToken();

    this.timeoutId = setTimeout(() => {
      this.currentIdx++;
      this.tick();
    }, currentToken.delayMs);
  }

  private emitCurrentToken(): void {
    if (this.tokens.length === 0) return;
    const token = this.tokens[Math.min(this.currentIdx, this.tokens.length - 1)];
    const progress = (this.currentIdx / this.tokens.length) * 100;
    this.onTokenUpdate?.(token, progress, this.currentIdx + 1, this.tokens.length);
  }

  private syncEntrainmentSoundscape(): void {
    if (!this.audioEngine) return;

    switch (this.config.entrainmentMode) {
      case 'gamma40':
        // 40 Hz Gamma Focus & Binding
        this.audioEngine.start({
          carrierFreqHz: 432,
          beatFreqHz: 40.0,
          binauralEnabled: true,
          waveform: 'warm_harmonic',
          noiseProfile: 'brown',
          noiseVolume: 0.08,
          volume: 0.65
        });
        break;

      case 'alpha10':
        // 10 Hz Alpha Calm Alertness
        this.audioEngine.start({
          carrierFreqHz: 432,
          beatFreqHz: 10.0,
          binauralEnabled: true,
          waveform: 'sine',
          noiseProfile: 'pink',
          noiseVolume: 0.1,
          volume: 0.65
        });
        break;

      case 'solfeggio528':
        // 528 Hz Cellular Vitality & Reassurance
        this.audioEngine.start({
          carrierFreqHz: 528,
          beatFreqHz: 7.83,
          binauralEnabled: true,
          waveform: 'triangle',
          noiseProfile: 'off',
          volume: 0.6
        });
        break;

      case 'silent':
        if (this.audioEngine.isPlaying) {
          this.audioEngine.stop();
        }
        break;
    }
  }
}
