import { Injectable, signal, inject, computed } from '@angular/core';
import { PatientStateService, BODY_PART_NAMES } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { PetAuditoryService } from './pet-auditory.service';
import { AmbientLightingService } from './ambient-lighting.service';
import { ClinicalMoERouterService } from './clinical-moe-router.service';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class DictationService {
  private state = inject(PatientStateService, { optional: true });
  private patientMgmt = inject(PatientManagementService, { optional: true });
  private petAuditory = inject(PetAuditoryService, { optional: true });
  private lighting = inject(AmbientLightingService, { optional: true });
  private moeRouter = inject(ClinicalMoERouterService, { optional: true });

  readonly isListening = signal(false);
  readonly isSidechainDuckingActive = computed(() => this.isListening());
  readonly sidechainDuckingDepth = signal<number>(0.85); // 85% attenuation (-16.5 dB)
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
        const isCommandConsumed = this.processVoiceCommand(final);
        if (isCommandConsumed) {
          return; // Consume the command, don't pass to dictation
        }
      }

      // Regular dictation pass-through
      if (this.resultCallback) {
        if (final) this.resultCallback(final, true);
        if (interim) this.resultCallback(interim, false);
      }
    };
  }

  /**
   * Processes a spoken command transcript and routes actions across
   * clinical emergency safety, triage rosters, SMoE adaptive canvas,
   * specialist referral, clinical trials, SDOH, environmental exposomics,
   * anatomical Three.js shaders, and cloud synchronization.
   * Returns true if the spoken phrase was consumed as a recognized voice command.
   */
  public processVoiceCommand(spokenText: string): boolean {
    if (!spokenText) return false;
    const lower = spokenText.toLowerCase().trim();

    // 1. Emergency AVS Override (High-priority safety trigger, no wake word required)
    const isEmergencyCommand = 
      lower.includes('stop avs') || 
      lower.includes('stop session') || 
      lower.includes('seizure emergency') || 
      lower.includes('emergency stop') ||
      lower.includes('terminate avs') ||
      lower.includes('shut down avs') ||
      (lower.startsWith('gull') && (lower.includes('stop') || lower.includes('abort') || lower.includes('halt')));

    if (isEmergencyCommand) {
      console.warn('[Voice Command] EMERGENCY AVS STOP COMMAND DETECTED!');
      this.lastCommand.set('EMERGENCY AVS STOPPED');
      if (this.state) this.state.isAvsSessionActive.set(false);
      if (this.lighting) this.lighting.setEmergencyOverride(false);
      if (this.petAuditory) this.petAuditory.stop();
      setTimeout(() => this.lastCommand.set(null), 3000);
      return true;
    }

    // 2. Enhanced Persona Wake Words ("Hey Gulliver", "Sentinel", "Swoop", "Scribes")
    const isHeyGull = lower.includes('hey gull') || lower.includes('hey gulliver') || lower.startsWith('gulliver') || lower.startsWith('gull');
    const isSentinel = lower.includes('sentinel') || lower.includes('hey sentinel');
    const isSwoop = lower.includes('swoop') || lower.includes('hey swoop');
    const isScribes = lower.includes('scribes') || lower.includes('hey scribes');

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

    // 3. Clinical Navigation & Action Commands (prefixed with wake word or explicit intent)
    const hasWakePrefix = lower.startsWith('gull') || lower.startsWith('goal') || lower.startsWith('go ') || lower.startsWith('girl') || lower.startsWith('hey gull');

    if (hasWakePrefix || lower.includes('show triage') || lower.includes('open triage') || lower.includes('show canvas') || lower.includes('decision flow')) {
      // Triage Command Center
      if (lower.includes('triage') || lower.includes('roster')) {
        this.lastCommand.set('Opening Triage Command Center');
        if (this.patientMgmt) this.patientMgmt.selectedPatientId.set(null);
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // Synoptic Canvas (Adaptive Multi-Specialist View) Command
      if (lower.includes('synoptic') || lower.includes('canvas') || lower.includes('smoe')) {
        this.lastCommand.set('Switching to Synoptic Canvas');
        if (this.moeRouter) this.moeRouter.analysisViewMode.set('canvas');
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // Decision Flow Explainability Trigger
      if (lower.includes('decision flow') || lower.includes('explain flow')) {
        this.lastCommand.set('Explaining Decision Flow');
        if (this.state) {
          const targetId = this.moeRouter?.activeShiftPatientId() || 'p001';
          this.state.liveAgentInput.set(`Please explain the SMoE gating decision flow for patient ${targetId}.`);
          this.state.isLiveAgentActive.set(true);
        }
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // Specialist Referral Command
      if (lower.includes('specialist') || lower.includes('referral')) {
        this.lastCommand.set('Focusing Specialist Referral Hub');
        if (this.moeRouter) this.moeRouter.pinExpert('specialist-referral');
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // Clinical Trials Command
      if (lower.includes('trial') || lower.includes('trials')) {
        this.lastCommand.set('Focusing Clinical Trials Matcher');
        if (this.moeRouter) this.moeRouter.pinExpert('clinical-trials-matcher');
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // SDOH / Food / Produce Rx Command
      if (lower.includes('sdoh') || lower.includes('food') || lower.includes('produce') || lower.includes('nutrition')) {
        this.lastCommand.set('Focusing SDOH & Produce Rx Navigator');
        if (this.moeRouter) this.moeRouter.pinExpert('sdoh-navigator');
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // Environmental Exposomics Command
      if (lower.includes('air quality') || lower.includes('exposome') || lower.includes('environmental') || lower.includes('pollen')) {
        this.lastCommand.set('Focusing Environmental Exposomics Radar');
        if (this.moeRouter) this.moeRouter.pinExpert('environmental-exposomics');
        setTimeout(() => this.lastCommand.set(null), 2500);
        return true;
      }

      // Patient Switch Command
      if (lower.includes('patient') || lower.includes('switch') || lower.includes('chart')) {
        let patientId: string | null = null;
        if (lower.includes('darwin') || lower.includes('charles')) patientId = 'p_charles_darwin';
        else if (lower.includes('curie') || lower.includes('marie')) patientId = 'p_marie_curie';
        else if (lower.includes('frida') || lower.includes('kahlo')) patientId = 'p_frida_kahlo';
        else if (lower.includes('smith') || lower.includes('edwin')) patientId = 'p_edwin_smith_3';
        else if (lower.includes('mara') || lower.includes('santos')) patientId = 'p_mara_santos';
        else if (lower.includes('ramanujan') || lower.includes('srinivasa')) patientId = 'p_srinivasa_ramanujan';
        else if (lower.includes('vance') || lower.includes('eleanor') || lower.includes('p001')) patientId = 'p001';
        else if (lower.includes('jenkins') || lower.includes('sarah') || lower.includes('p002')) patientId = 'p002';
        else if (lower.includes('wilson') || lower.includes('james') || lower.includes('p003')) patientId = 'p003';
        else if (lower.includes('chen') || lower.includes('marcus') || lower.includes('p004')) patientId = 'p004';

        if (patientId) {
          this.lastCommand.set(`Switching Chart: ${patientId}`);
          if (this.moeRouter) this.moeRouter.loadShiftPatient(patientId);
          if (this.patientMgmt) this.patientMgmt.selectPatient(patientId);
          setTimeout(() => this.lastCommand.set(null), 2500);
          return true;
        }
      }

      // Cloud Data Synchronization Command
      if (lower.includes('sync') || lower.includes('save')) {
        this.lastCommand.set('Data Synced');
        if (this.patientMgmt) this.patientMgmt.syncToCloud();
        setTimeout(() => this.lastCommand.set(null), 2000);
        return true;
      }

      // 3D Spatial Anatomy Highlight Command
      if (lower.includes('highlight') || lower.includes('select') || lower.includes('isolate')) {
        const bodyPartMap = new Map<string, string>();
        for (const [k, v] of Object.entries(BODY_PART_NAMES)) {
          bodyPartMap.set(k.toLowerCase(), k);
          bodyPartMap.set(v.toLowerCase(), k);
        }
        bodyPartMap.set('heart', 'chest');
        bodyPartMap.set('cardiac', 'chest');
        bodyPartMap.set('lungs', 'chest');
        bodyPartMap.set('lung', 'chest');
        bodyPartMap.set('brain', 'head');
        bodyPartMap.set('skull', 'head');
        bodyPartMap.set('stomach', 'abdomen');
        bodyPartMap.set('liver', 'abdomen');
        bodyPartMap.set('gut', 'abdomen');
        bodyPartMap.set('knee', 'r_shin');
        bodyPartMap.set('spine', 'upper_back');

        for (const [alias, partKey] of bodyPartMap.entries()) {
          if (lower.includes(alias)) {
            this.lastCommand.set(`Highlighted ${alias}`);
            if (this.state) this.state.selectPart(partKey);
            setTimeout(() => this.lastCommand.set(null), 2000);
            return true;
          }
        }
      }
    }

    return false;
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

  /**
   * Simulates incoming speech recognition results without requiring physical microphone input.
   * Useful for automated testing, dev environments, and agentic workflows per simulate_voice skill.
   */
  public simulateVoiceInput(transcript: string): void {
    this.isListening.set(true);
    this.initialText.set(transcript);
    this.lastCommand.set(transcript);

    // Play feedback tone
    this.playPersonaAudioFx(523.25, 'sine');

    setTimeout(() => {
      this.isListening.set(false);
    }, 400);
  }

  /**
   * Programmatically triggers a wake-word detection for automated testing.
   */
  public triggerWakeWord(wakeWord: 'gulliver' | 'swoop' | 'sentinel' | 'scribes'): void {
    this.wakeWordDetected.set(wakeWord);
    this.playPersonaAudioFx(880, 'triangle');
    setTimeout(() => {
      this.wakeWordDetected.set(null);
    }, 1500);
  }
}

