/**
 * @pocketgull/open-scribe
 * Voice Recorder & Speech Recognition Streamer.
 * Uses native browser Web Speech API with zero cloud API keys and zero server egress.
 */

import { IScribeTranscriptChunk } from './types';

export class VoiceRecorder {
  private recognition: any = null;
  private isListening = false;
  private fullTranscript = '';

  public onChunkReceived?: (chunk: IScribeTranscriptChunk) => void;
  public onFullTranscriptUpdate?: (fullText: string) => void;
  public onError?: (errorMsg: string) => void;
  public onListeningStateChange?: (isListening: boolean) => void;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            this.fullTranscript += (this.fullTranscript ? ' ' : '') + text.trim();
            this.onChunkReceived?.({
              text: text.trim(),
              isFinal: true,
              timestamp: Date.now(),
              confidence: result[0].confidence
            });
          } else {
            interimText += text;
            this.onChunkReceived?.({
              text: interimText.trim(),
              isFinal: false,
              timestamp: Date.now()
            });
          }
        }
        this.onFullTranscriptUpdate?.(this.fullTranscript);
      };

      this.recognition.onerror = (event: any) => {
        this.onError?.(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart if still in listening mode (continuous ambient capture)
          try {
            this.recognition.start();
          } catch {}
        } else {
          this.onListeningStateChange?.(false);
        }
      };
    } catch (e: any) {
      this.onError?.(`Failed to initialize speech recognition: ${e.message}`);
    }
  }

  public get isSupported(): boolean {
    return this.recognition !== null;
  }

  public get isRecording(): boolean {
    return this.isListening;
  }

  public get transcript(): string {
    return this.fullTranscript;
  }

  public start(): void {
    if (this.isListening) return;
    if (!this.recognition) {
      this.onError?.('Web Speech API is not supported in this browser. Please use text input or Chrome/Edge.');
      return;
    }

    try {
      this.isListening = true;
      this.recognition.start();
      this.onListeningStateChange?.(true);
    } catch (e: any) {
      this.onError?.(`Error starting recognition: ${e.message}`);
    }
  }

  public stop(): void {
    if (!this.isListening) return;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.onListeningStateChange?.(false);
  }

  public appendText(text: string): void {
    this.fullTranscript += (this.fullTranscript ? ' ' : '') + text.trim();
    this.onFullTranscriptUpdate?.(this.fullTranscript);
  }

  public clear(): void {
    this.fullTranscript = '';
    this.onFullTranscriptUpdate?.('');
  }
}
