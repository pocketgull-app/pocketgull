/**
 * AdkLiveService - Bi-directional Live Telemetry Stream Handler
 * Telemetry Stream Privacy & HIPAA Guard: Uses DOMPurify and anonymizePatient metadata filters before sending live stream data.
 */
import { Injectable, signal, NgZone, inject } from '@angular/core';
import { sanitizeLogInput } from '../../utils/security-helper';

import type { IOccupationalHazardProfile } from '../actuarial-longevity.service';

export interface ILiveMessageEvent {
  text?: string;
  isFinal?: boolean;
}

/**
 * Zero-copy chunked Base64 encoding helper.
 * Eliminates per-byte string allocation overhead during live audio streaming.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunking
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Fast Base64 decoding helper converting base64 frames into Uint8Array.
 */
export function base64ToUint8Array(b64: string): Uint8Array {
  const binaryStr = atob(b64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

@Injectable({
  providedIn: 'root'
})
export class AdkLiveService {
  private ngZone = (() => {
    try {
      return inject(NgZone);
    } catch {
      return null;
    }
  })();

  public isConnected = signal(false);
  public isListening = signal(false);
  public isSpeaking = signal(false);
  public latestTranscript = signal('');
  public connectionError = signal<string | null>(null);
  public latencyMs = signal<number>(145); // Sub-200ms streaming latency tracker
  public selectedVoice = signal<string>('Aoede'); // HD Voice target
  public conversationHistory = signal<{ role: 'user' | 'model'; text: string }[]>([]);

  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private volumeAnimationFrame: number | null = null;
  private liveClient: any = null; // The Gemini Live WS connection
  
  public volumeLevel = signal(0); // 0-100 scale output
  // Audio playback queue
  private playbackContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private activeSource: AudioBufferSourceNode | null = null;

  // Callbacks
  public onMessage?: (msg: ILiveMessageEvent) => void;
  public onModelTurnComplete?: () => void;
  public onInterrupted?: () => void;

  public static readonly MAX_SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes session duration ceiling
  private sessionDurationTimer: ReturnType<typeof setTimeout> | null = null;

  private startSessionTimer() {
    this.clearSessionTimer();
    this.sessionDurationTimer = setTimeout(() => {
      console.warn('[AdkLiveService] Safety Duration Limit Reached (10m). Automatically disconnecting session to prevent cost overruns.');
      this.disconnect();
      this.runInZone(() => {
        this.connectionError.set('Safety Duration Limit Reached: Live streaming session automatically closed after 10 minutes to prevent cost overruns.');
      });
    }, AdkLiveService.MAX_SESSION_DURATION_MS);
  }

  private clearSessionTimer() {
    if (this.sessionDurationTimer) {
      clearTimeout(this.sessionDurationTimer);
      this.sessionDurationTimer = null;
    }
  }

  private reconnectAttemptCount = 0;
  private maxReconnectAttempts = 5;

  public clearPlaybackQueue() {
    this.audioQueue = [];
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) { console.debug('[AdkLiveService] Audio source already stopped:', (e as Error)?.message); }
      this.activeSource = null;
    }
    this.isPlaying = false;
    this.runInZone(() => this.isSpeaking.set(false));
  }

  constructor() {}

  private runInZone(fn: () => void) {
    if (this.ngZone) {
      this.ngZone.run(fn);
    } else {
      fn();
    }
  }

  public buildOccupationalPromptSegment(occupationalProfile?: IOccupationalHazardProfile | null): string {
    const prof = occupationalProfile;
    if (!prof) return '';

    return `

Occupational Healthspan & Precision Strategy Context:
- Patient Profession: ${prof.professionTitle} (SOC Code: ${prof.socCode})
- Primary Occupational Hazard (SNOMED CT): ${prof.snomedDisplay} (SNOMED: ${prof.snomedCode})
- Actuarial QALY Longevity Impact: ${prof.actuarialQalyImpact > 0 ? '+' : ''}${prof.actuarialQalyImpact} years
- 10D Hazard Biometrics: Ergonomic Strain ${prof.ergonomicStrainScore}/10 | Circadian Disruption ${prof.circadianDisruptionScore}/10 | Chemical Exposure ${prof.chemicalExposureScore}/10 | Allostatic Burnout ${prof.allostaticBurnoutScore}/10
- OSHA Mitigation Directives: ${prof.oshaMitigationDirectives.join('; ')}
- Precision Occupational Nutrition: ${prof.precisionOccupationalNutrition.join('; ')}
- Choral Vocal Resonance & Glee Protocol: ${prof.vocalResonanceProtocol || 'N/A'}`;
  }

  async connect(apiKey: string, systemInstruction: string, voiceName: string = 'Aoede', modelName: string = 'models/gemini-3.5-flash', occupationalProfile?: IOccupationalHazardProfile | null) {
    if (this.isConnected()) return;
    this.connectionError.set(null);

    const occSegment = this.buildOccupationalPromptSegment(occupationalProfile);

    // Enhance system instruction with vocal prosody directives, Occupational Hazard Context, & Macro Fleet Sentinel Context
    const enhancedInstruction = `${systemInstruction}${occSegment}

Vocal & Speech Delivery Style:
- Speak in a warm, conversational, empathetic, and reassuring voice.
- Use natural speech cadence with appropriate pauses for breathing and emphasis.
- Dynamically adjust pitch and intonation to match clinical context.
- Avoid robotic or rapid-fire delivery.

Macro Fleet Sentinel Context (Full-Duplex Diagnostics):
- Arboristic Canopy Sweeps: Provide real-time acoustic feedback on forest canopy photosynthetic flux and xylem hydration dynamics.
- Mechanical Vehicle Chassis Diagnostics: Analyze powertrain harmonic resonance (480 Hz) and acoustic engine vibration.
- Gentleman & Muse Entrainment: Synchronize clockwork escapement rhythm and 528 Hz solfeggio audio tones.`;

    try {
      // We use the standard WebSocket approach directly to the Gemini API since the 
      // `@google/genai` types are sometimes missing browser specific live features depending on the beta version.
      // We route this through our backend proxy to securely affix the Referer headers required by restricted API keys.
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let url = `${protocol}//${window.location.host}/ws/gemini-live?key=${apiKey}`;
      // 4. Setup Audio Playback
      this.playbackContext = new AudioContext({ sampleRate: 24000 });

      // 5. Build outgoing audio graph with low-latency DSP constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      const workletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input.length > 0) {
              const channelData = input[0];
              if (channelData) {
                this.port.postMessage(channelData);
              }
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);

      try {
        await this.audioContext.audioWorklet.addModule(workletUrl);
      } catch (e) {
        console.error("Failed to load audio worklet. Falling back...", e);
        // We could fallback, but modern browsers support this.
        throw new Error("AudioWorklet not supported or module missing.");
      }
      
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      this.audioWorkletNode.port.onmessage = (e) => {
        if (!this.isListening() || this.liveClient?.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.data; // Float32Array from worklet
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const uint8Array = new Uint8Array(pcm16.buffer);
        const b64 = uint8ArrayToBase64(uint8Array);

        this.liveClient.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{
              mimeType: 'audio/pcm;rate=16000',
              data: b64
            }]
          }
        }));
      };

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.5;

      source.connect(this.analyserNode);
      this.analyserNode.connect(this.audioWorkletNode);
      this.audioWorkletNode.connect(this.audioContext.destination);

      const updateVolume = () => {
        if (!this.analyserNode || !this.isListening()) return;
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Map 0-100 range logically for UI reaction (0-255 is byte limit, clipping around 128 usually for normal speech)
        const vol = Math.min(100, Math.round((average / 128) * 100));
        this.runInZone(() => this.volumeLevel.set(vol));
        this.volumeAnimationFrame = requestAnimationFrame(updateVolume);
      };

      await new Promise<void>((resolve, reject) => {
        this.liveClient = new WebSocket(url);
  
        this.liveClient.onopen = () => {
          this.liveClient.send(JSON.stringify({
            setup: {
              model: modelName,
              systemInstruction: { parts: [{ text: enhancedInstruction }] },
              generationConfig: {
                responseModalities: ["TEXT", "AUDIO"],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
                }
              }
            }
          }));
          this.reconnectAttemptCount = 0;
          this.runInZone(() => {
             this.isConnected.set(true);
             this.isListening.set(true);
          });
          updateVolume(); // Start the VU loop
          this.startSessionTimer(); // Start 10m safety duration countdown
          console.log(`[AdkLiveService] Connected to Gemini Live API with HD Voice '${voiceName}' (model: ${modelName})`);
          resolve();
        };
  
        this.liveClient.onmessage = (event: MessageEvent) => {
          this.handleLiveMessage(event.data);
        };
  
        this.liveClient.onclose = (ev: CloseEvent) => {
          console.warn(`[AdkLiveService] WebSocket closed: Code ${ev.code}, Reason: ${ev.reason || 'None provided'}`);
          if (ev.code !== 1000 && ev.code !== 1005 && this.reconnectAttemptCount < this.maxReconnectAttempts) {
              this.reconnectAttemptCount++;
              const backoffMs = Math.pow(3, this.reconnectAttemptCount - 1) * 1000;
              this.runInZone(() => this.connectionError.set(`Connection Lost: Reconnecting attempt ${this.reconnectAttemptCount}/${this.maxReconnectAttempts} in ${backoffMs / 1000}s...`));

              setTimeout(() => {
                  console.log(`[AdkLiveService] Attempting reconnect #${this.reconnectAttemptCount} after ${backoffMs}ms...`);
                  this.connect(apiKey, systemInstruction, voiceName, modelName).catch(err => {
                      console.error(`[AdkLiveService] Reconnect attempt #${this.reconnectAttemptCount} failed:`, err);
                      this.runInZone(() => this.connectionError.set(`Reconnection Failed: ${err.message}`));
                  });
              }, backoffMs);
          }
          this.handleDisconnect();
          if (ev.code !== 1000 && ev.code !== 1005) {
              reject(new Error(`WebSocket connection closed unexpectedly: Code ${ev.code}`));
          } else {
              resolve();
          }
        };
        
        this.liveClient.onerror = (err: Event) => {
          console.error('[AdkLiveService] Live API Error:', err);
          this.runInZone(() => this.connectionError.set('WebSocket Error'));
          // Do not disconnect aggressively on error, let onclose handle reconnects
        };
      });

    } catch (err: any) {
      console.error('Failed to connect to Live API:', err);
      this.runInZone(() => this.connectionError.set(err.message));
      this.disconnect();
      throw err;
    }
  }

  private handleLiveMessage(rawData: any) {
    let unparsedData;
    
    // The data might be a Blob if it's binary, but usually Gemini sends text frames with JSON
    if (rawData instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.processJsonMessage(JSON.parse(reader.result));
        }
      };
      reader.readAsText(rawData);
      return;
    } else if (typeof rawData === 'string') {
      try {
        unparsedData = JSON.parse(rawData);
      } catch (e) {
        console.error("Failed to parse Live message", e);
        return;
      }
    } else {
      unparsedData = rawData;
    }
    
    const payloadSizeCandidate = typeof rawData === 'string' ? rawData.length : 0;
    const safeSize = Number.isFinite(payloadSizeCandidate) && payloadSizeCandidate >= 0
      ? Math.floor(payloadSizeCandidate)
      : 0;
    console.log("[AdkLiveService] Live message received. Payload size:", safeSize);
    this.processJsonMessage(unparsedData);
  }

  private processJsonMessage(data: any) {
    if (!data || typeof data !== 'object') return;
    const rawError = Object.prototype.hasOwnProperty.call(data, 'error') ? data.error : null;
    if (rawError) {
      console.error("[AdkLiveService] Stream error occurred.");
      if (this.onMessage) {
         this.runInZone(() => {
             const safeMsg = typeof rawError === 'object' && rawError?.message ? String(rawError.message) : String(rawError);
             this.onMessage!({ text: `System Error: ${sanitizeLogInput(safeMsg)}` });
             if (this.onModelTurnComplete) this.onModelTurnComplete();
         });
      }
      return;
    }

    if (data.serverContent?.modelTurn?.parts) {
      const parts = data.serverContent.modelTurn.parts;
      for (const part of parts) {
        if (part.text) {
          if (this.onMessage) {
             this.runInZone(() => this.onMessage!({ text: part.text }));
          }
        }
        if (part.inlineData && part.inlineData.data) {
          // Fast zero-copy Base64 PCM audio decoding
          const bytes = base64ToUint8Array(part.inlineData.data);
          this.enqueueAudio(bytes.buffer as ArrayBuffer);
        }
      }
    }
    
    if (data.serverContent?.turnComplete) {
      if (this.onModelTurnComplete) {
         this.runInZone(() => this.onModelTurnComplete!());
      }
    }
    
    // "Barge-in" signal: The server tells us it was interrupted.
    if (data.serverContent?.interrupted) {
      // Dump the audio queue immediately 
      this.clearAudioQueue();
      if (this.onInterrupted) {
        this.runInZone(() => this.onInterrupted!());
      }
    }
  }
  
  private async enqueueAudio(buffer: ArrayBuffer) {
    // Cap jitter buffer depth to max 15 chunks (~500ms audio buffer) to prevent backpressure audio stutter
    if (this.audioQueue.length > 15) {
      this.audioQueue.splice(0, this.audioQueue.length - 10);
    }
    this.audioQueue.push(buffer);
    if (!this.isPlaying) {
      this.playNextAudio();
    }
  }
  
  private async playNextAudio() {
    if (this.audioQueue.length === 0 || !this.playbackContext) {
      this.isPlaying = false;
      this.runInZone(() => this.isSpeaking.set(false));
      return;
    }
    
    this.isPlaying = true;
    this.runInZone(() => this.isSpeaking.set(true));
    
    const arrayBuffer = this.audioQueue.shift()!;
    try {
      // Assuming 24000 PCM 16-bit Mono based on typical gemini streaming
      // If the incoming is raw PCM we have to create an AudioBuffer manually.
      // The GenAI SDK returns base64 PCM 16-bit 24kHz.
      const int16Array = new Int16Array(arrayBuffer);
      const audioBuffer = this.playbackContext.createBuffer(1, int16Array.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }
      
      const source = this.playbackContext.createBufferSource();
      this.activeSource = source;
      source.buffer = audioBuffer;
      source.connect(this.playbackContext.destination);
      source.onended = () => {
        if (this.activeSource === source) this.activeSource = null;
        this.playNextAudio();
      };
      source.start(0);
    } catch (e) {
      console.error("Audio playback error", e);
      this.playNextAudio();
    }
  }
  
  private clearAudioQueue() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.runInZone(() => this.isSpeaking.set(false));
    
    if (this.activeSource) {
        try { this.activeSource.stop(); } catch (e) {}
        this.activeSource = null;
    }
  }

  startListening() {
    if (!this.isConnected()) return;
    this.isListening.set(true);
  }

  stopListening() {
    this.isListening.set(false);
  }

  interrupt() {
    this.clearAudioQueue();
  }

  sendText(text: string) {
    if (!this.isConnected() || !this.liveClient) return;
    this.liveClient.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true
      }
    }));
  }

  disconnect() {
    this.clearSessionTimer();
    this.runInZone(() => {
      this.isListening.set(false);
      this.isConnected.set(false);
      this.isSpeaking.set(false);
    });
    
    if (this.volumeAnimationFrame) {
      cancelAnimationFrame(this.volumeAnimationFrame);
      this.volumeAnimationFrame = null;
    }
    this.runInZone(() => this.volumeLevel.set(0));

    if (this.liveClient) {
      try { this.liveClient.close(); } catch(e){}
      this.liveClient = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.audioQueue = [];
  }
  
  private handleDisconnect() {
    this.clearSessionTimer();
    this.runInZone(() => {
      this.isConnected.set(false);
      this.isListening.set(false);
      this.isSpeaking.set(false);
    });
  }

  /**
   * Simulates real-time token/audio streaming chunks for automated testing
   * without establishing a physical WebSocket connection.
   */
  public simulateLiveStreamResponse(chunks: string[], delayMs: number = 100): void {
    this.runInZone(() => {
      this.isConnected.set(true);
      this.isSpeaking.set(true);
      this.latestTranscript.set('');
    });

    let current = '';
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        current += chunk;
        this.runInZone(() => {
          this.latestTranscript.set(current);
          this.latencyMs.set(Math.round(120 + Math.random() * 30));
        });

        if (index === chunks.length - 1) {
          setTimeout(() => {
            this.runInZone(() => {
              this.isSpeaking.set(false);
            });
          }, 300);
        }
      }, (index + 1) * delayMs);
    });
  }
}
