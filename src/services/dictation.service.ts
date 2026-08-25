import { Injectable, signal, inject } from '@angular/core';
import { PatientStateService, BODY_PART_NAMES } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { PetAuditoryService } from './pet-auditory.service';
import { AmbientLightingService } from './ambient-lighting.service';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class DictationService {
  private state = inject(PatientStateService, { optional: true });
  private patientMgmt = inject(PatientManagementService, { optional: true });
  private petAuditory = inject(PetAuditoryService, { optional: true });
  private lighting = inject(AmbientLightingService, { optional: true });

  readonly isListening = signal(false);
  readonly isModalOpen = signal(false);
  readonly permissionError = signal<string | null>(null);
  readonly initialText = signal('');
  readonly lastCommand = signal<string | null>(null);
  readonly wakeWordDetected = signal<'gulliver' | 'swoop' | 'sentinel' | 'scribes' | null>(null);
  readonly selectedLanguage = signal<string>('en-US');

  readonly supportedLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish (Español)' },
    { code: 'fr-FR', name: 'French (Français)' },
    { code: 'zh-CN', name: 'Mandarin (中文)' },
    { code: 'de-DE', name: 'German (Deutsch)' },
    { code: 'ar-SA', name: 'Arabic (العربية)' },
    { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
    { code: 'pt-BR', name: 'Portuguese (Português)' },
    { code: 'vi-VN', name: 'Vietnamese (Tiếng Việt)' },
    { code: 'ja-JP', name: 'Japanese (日本語)' },
    { code: 'ko-KR', name: 'Korean (한국어)' },
    { code: 'ru-RU', name: 'Russian (Русский)' },
    { code: 'tl-PH', name: 'Tagalog (Filipino)' },
    { code: 'it-IT', name: 'Italian (Italiano)' },
    { code: 'nl-NL', name: 'Dutch (Nederlands)' },
    { code: 'pl-PL', name: 'Polish (Polski)' },
    { code: 'uk-UA', name: 'Ukrainian (Українська)' },
    { code: 'sw-KE', name: 'Swahili (Kiswahili)' },
    { code: 'tr-TR', name: 'Turkish (Türkçe)' },
    { code: 'el-GR', name: 'Greek (Ελληνικά)' },
    { code: 'he-IL', name: 'Hebrew (עברית)' },
    { code: 'th-TH', name: 'Thai (ไทย)' },
    { code: 'id-ID', name: 'Indonesian (Bahasa Indonesia)' },
    { code: 'ms-MY', name: 'Malay (Bahasa Melayu)' },
    { code: 'sv-SE', name: 'Swedish (Svenska)' },
    { code: 'no-NO', name: 'Norwegian (Norsk)' },
    { code: 'da-DK', name: 'Danish (Dansk)' },
    { code: 'fi-FI', name: 'Finnish (Suomi)' },
    { code: 'hu-HU', name: 'Hungarian (Magyar)' },
    { code: 'cs-CZ', name: 'Czech (Čeština)' },
    { code: 'ro-RO', name: 'Romanian (Română)' },
    { code: 'sk-SK', name: 'Slovak (Slovenčina)' },
    { code: 'bg-BG', name: 'Bulgarian (Български)' },
    { code: 'hr-HR', name: 'Croatian (Hrvatski)' },
    { code: 'sr-RS', name: 'Serbian (Српски)' },
    { code: 'bn-BD', name: 'Bengali (বাংলা)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'ur-PK', name: 'Urdu (اردو)' },
    { code: 'fa-IR', name: 'Persian (فارسی)' },
    { code: 'km-KH', name: 'Khmer (ភាសាខ្មែរ)' },
    { code: 'am-ET', name: 'Amharic (አማርኛ)' }
  ];

  private recognition: any;
  private onAcceptCallback: ((text: string) => void) | null = null;
  private resultCallback: ((text: string, isFinal: boolean) => void) | null = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') {
      this.permissionError.set("Voice dictation is not supported during SSR.");
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      this.permissionError.set("Voice dictation is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.lang = this.selectedLanguage();
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.permissionError.set(null);
      this.isListening.set(true);
    };

    this.recognition.onend = () => {
      this.isListening.set(false);
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        this.permissionError.set('Microphone access denied.');
      } else if (event.error === 'no-speech') {
        // Ignore
      } else {
        this.permissionError.set(`Error: ${event.error}`);
      }
      this.isListening.set(false);
    };

    // Helper map to normalize spoken body parts to keys
    const bodyPartMap = new Map(Object.entries(BODY_PART_NAMES).map(([k, v]) => [v.toLowerCase(), k]));

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      // --- COMMAND ROUTER (Intercept Voice Commands) ---
      if (final) {
        const lowerFinal = final.toLowerCase().trim();

        // --- EMERGENCY AVS OVERRIDE (High priority safety trigger, no wake word required) ---
        const isEmergencyCommand = 
            lowerFinal.includes('stop avs') || 
            lowerFinal.includes('stop session') || 
            lowerFinal.includes('seizure emergency') || 
            lowerFinal.includes('emergency stop') ||
            lowerFinal.includes('terminate avs') ||
            lowerFinal.includes('shut down avs') ||
            (lowerFinal.startsWith('gull') && (lowerFinal.includes('stop') || lowerFinal.includes('abort') || lowerFinal.includes('halt')));

        if (isEmergencyCommand) {
            console.warn("[Voice Command] EMERGENCY AVS STOP COMMAND DETECTED!");
            this.lastCommand.set("EMERGENCY AVS STOPPED");
            
            // Shut down AVS and restore normal lighting and soundscapes
            if (this.state) this.state.isAvsSessionActive.set(false);
            if (this.lighting) this.lighting.setEmergencyOverride(false);
            if (this.petAuditory) this.petAuditory.stop();
            
            setTimeout(() => this.lastCommand.set(null), 3000);
            return; // Consume the command
        }

        // --- ENHANCED WAKE WORD ENGINE ("Hey Gulliver", "Sentinel", "Swoop", "Scribes") ---
        const isHeyGull = lowerFinal.includes('hey gull') || lowerFinal.includes('hey gulliver') || lowerFinal.startsWith('gulliver') || lowerFinal.startsWith('gull');
        const isSentinel = lowerFinal.includes('sentinel') || lowerFinal.includes('hey sentinel');
        const isSwoop = lowerFinal.includes('swoop') || lowerFinal.includes('hey swoop');
        const isScribes = lowerFinal.includes('scribes') || lowerFinal.includes('hey scribes');

        if (isHeyGull || isSentinel || isSwoop || isScribes) {
          const persona = isSentinel ? 'sentinel' : (isSwoop ? 'swoop' : (isScribes ? 'scribes' : 'gulliver'));
          console.log(`[Wake Word Engine] Persona Wake Word Triggered: ${persona}`);
          this.wakeWordDetected.set(persona);
          this.lastCommand.set(`Wake Word: ${persona.toUpperCase()}`);
          this.playPersonaAudioFx(persona === 'sentinel' ? 110 : (persona === 'swoop' ? 528 : (persona === 'scribes' ? 432 : 880)));
          setTimeout(() => {
            this.wakeWordDetected.set(null);
            this.lastCommand.set(null);
          }, 3000);
        }

        // Look for the wake word "gull" (or common mishearings like "goal", "go")
        if (lowerFinal.startsWith('gull') || lowerFinal.startsWith('goal') || lowerFinal.startsWith('go ') || lowerFinal.startsWith('girl')) {
            if (lowerFinal.includes('sync') || lowerFinal.includes('save')) {
                console.log("[Voice Command] Triggering Sync...");
                this.lastCommand.set("Data Synced");
                if (this.patientMgmt) this.patientMgmt.syncToCloud();
                
                // Clear the feedback after 2s
                setTimeout(() => this.lastCommand.set(null), 2000);
                return; // Consume the command, don't pass to dictation
            }

            if (lowerFinal.includes('highlight') || lowerFinal.includes('select') || lowerFinal.includes('isolate')) {
                const words = lowerFinal.split(' ');
                for (const [partName, partKey] of bodyPartMap.entries()) {
                    if (lowerFinal.includes(partName)) {
                        console.log(`[Voice Command] Highlighting ${partName} (${partKey})`);
                        this.lastCommand.set(`Highlighted ${partName}`);
                        if (this.state) this.state.selectPart(partKey);
                        setTimeout(() => this.lastCommand.set(null), 2000);
                        return; // Consume
                    }
                }
            }
        }
      }

      // Regular dictation pass-through
      if (this.resultCallback) {
        if (final) this.resultCallback(final, true);
        if (interim) this.resultCallback(interim, false);
      }
    };
  }

  openDictationModal(initialText: string = '', onAccept: (text: string) => void) {
    this.initialText.set(initialText);
    this.onAcceptCallback = onAccept;
    this.isModalOpen.set(true);
    // We don't auto-start here, let the modal component handle starting via user action or auto-start logic
  }

  startRecognition() {
    if (!this.recognition) return;
    try {
      this.recognition.start();
    } catch (e) {
      // Already started
    }
  }

  stopRecognition() {
    if (!this.recognition) return;
    this.recognition.stop();
  }

  cancel() {
    this.stopRecognition();
    this.isModalOpen.set(false);
    this.onAcceptCallback = null;
    this.resultCallback = null;
  }

  accept(finalText: string) {
    this.stopRecognition();
    if (this.onAcceptCallback) {
      this.onAcceptCallback(finalText);
    }
    this.isModalOpen.set(false);
    this.onAcceptCallback = null;
    this.resultCallback = null;
  }

  registerResultHandler(callback: (text: string, isFinal: boolean) => void) {
    this.resultCallback = callback;
  }

  setLanguage(langCode: string) {
    this.selectedLanguage.set(langCode);
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  // ─── Avian Persona Vocal Prosody & Web Audio Synthesis ──────────────────────

  speakAvianPersonaText(text: string, persona: 'gulliver' | 'swoop' | 'sentinel' | 'scribes' = 'gulliver') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice prosody parameters per Avian persona
    switch (persona) {
      case 'gulliver':
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
        this.playPersonaAudioFx(880, 'sine');
        break;
      case 'swoop':
        utterance.pitch = 1.25;
        utterance.rate = 1.1;
        this.playPersonaAudioFx(528, 'triangle');
        break;
      case 'sentinel':
        utterance.pitch = 0.75;
        utterance.rate = 0.85;
        this.playPersonaAudioFx(110, 'sine');
        break;
      case 'scribes':
        utterance.pitch = 1.15;
        utterance.rate = 1.0;
        this.playPersonaAudioFx(432, 'sine');
        break;
    }

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(this.selectedLanguage().split('-')[0])) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public speakResponse(text: string, rate: number = 1.0, pitch: number = 1.0): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.min(2.0, Math.max(0.5, rate));
      utterance.pitch = Math.min(2.0, Math.max(0.5, pitch));
      utterance.lang = this.selectedLanguage();

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(this.selectedLanguage().split('-')[0])) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.debug('[DictationService] Speech synthesis failed:', (e as Error)?.message);
      return false;
    }
  }

  private playPersonaAudioFx(freqHz: number, waveType: OscillatorType = 'sine') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freqHz, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext silent fail safe
    }
  }
}

