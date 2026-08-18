import { Injectable, signal, computed, inject } from '@angular/core';

export type VoicePersonaId = 'aoede' | 'puck' | 'charon' | 'kore' | 'fenrir';

export interface IVoicePersona {
  id: VoicePersonaId;
  name: string;
  avatar: string;
  role: string;
  geminiVoice: string;
  description: string;
  rate: number;
  pitch: number;
  speechSynthesisVoiceMatchers: string[];
}

export const VOICE_PERSONAS: Record<VoicePersonaId, IVoicePersona> = {
  aoede: {
    id: 'aoede',
    name: 'Aoede',
    avatar: '🕊️',
    role: 'Serene Calm & Functional Medicine',
    geminiVoice: 'Aoede',
    description: 'Warm, lyrical, natural human cadence designed for de-escalating anxiety and clinical counseling.',
    rate: 0.95,
    pitch: 1.02,
    speechSynthesisVoiceMatchers: [
      'Google UK English Female',
      'Microsoft Jenny Online (Natural)',
      'Microsoft Aria Online (Natural)',
      'Microsoft Sonia Online (Natural)',
      'Samantha',
      'Karen',
      'Victoria',
      'female'
    ]
  },
  puck: {
    id: 'puck',
    name: 'Puck',
    avatar: '⚡',
    role: 'Rapid Clinical Triage & Scribe',
    geminiVoice: 'Puck',
    description: 'Crisp, articulate British clinical cadence tailored for high-speed diagnostic differential analysis.',
    rate: 1.05,
    pitch: 1.0,
    speechSynthesisVoiceMatchers: [
      'Google UK English Male',
      'Microsoft Ryan Online (Natural)',
      'Microsoft Guy Online (Natural)',
      'Daniel',
      'Oliver',
      'en-GB',
      'male'
    ]
  },
  charon: {
    id: 'charon',
    name: 'Charon',
    avatar: '🦅',
    role: 'Deep Resonant Critical Care',
    geminiVoice: 'Charon',
    description: 'Deep, steady, baritone vocal timbre providing authoritative grounding during acute trauma review.',
    rate: 0.88,
    pitch: 0.82,
    speechSynthesisVoiceMatchers: [
      'Microsoft Christopher Online (Natural)',
      'Google US English Male',
      'Microsoft David',
      'Alex',
      'male'
    ]
  },
  kore: {
    id: 'kore',
    name: 'Kore',
    avatar: '🌿',
    role: 'Compassionate Perinatal Doula',
    geminiVoice: 'Kore',
    description: 'Gentle, soothing, empathetic cadence tailored for maternal, postpartum, and pediatric comfort.',
    rate: 0.92,
    pitch: 1.08,
    speechSynthesisVoiceMatchers: [
      'Microsoft Sonia Online (Natural)',
      'Google US English Female',
      'Microsoft Zira',
      'Moira',
      'female'
    ]
  },
  fenrir: {
    id: 'fenrir',
    name: 'Fenrir',
    avatar: '🛡️',
    role: 'Tactical Paramedic & EMT SBAR',
    geminiVoice: 'Fenrir',
    description: 'Assertive, clear, command-grade vocal delivery optimized for high-noise pre-hospital emergency handoffs.',
    rate: 1.08,
    pitch: 0.92,
    speechSynthesisVoiceMatchers: [
      'Microsoft Roger Online (Natural)',
      'Google UK English Male',
      'Arthur',
      'male'
    ]
  }
};

@Injectable({
  providedIn: 'root'
})
export class VoicePersonaService {
  /** Active voice persona selection from Business Site profiles */
  readonly activePersonaId = signal<VoicePersonaId>('aoede');

  /** List of all available voice personas */
  readonly allPersonas = signal<IVoicePersona[]>(Object.values(VOICE_PERSONAS));

  /** Active voice persona metadata */
  readonly currentPersona = computed(() => VOICE_PERSONAS[this.activePersonaId()]);

  /** Cached browser voices */
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initStoredVoice();
    this.initSpeechVoices();
  }

  private initStoredVoice(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('pocketgull_voice_persona') as VoicePersonaId | null;
      if (stored && VOICE_PERSONAS[stored]) {
        this.activePersonaId.set(stored);
      }
    } catch {
      // Storage unavailable in private browsing mode
    }
  }

  private initSpeechVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  /**
   * Sets the active voice persona and persists to localStorage.
   */
  setPersona(id: VoicePersonaId): void {
    if (!VOICE_PERSONAS[id]) return;
    this.activePersonaId.set(id);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('pocketgull_voice_persona', id);
      } catch {
        // Ignore storage quota
      }
    }
  }

  /**
   * Cycles to the next available voice persona.
   */
  cyclePersona(): void {
    const ids: VoicePersonaId[] = ['aoede', 'puck', 'charon', 'kore', 'fenrir'];
    const currentIndex = ids.indexOf(this.activePersonaId());
    const nextIndex = (currentIndex + 1) % ids.length;
    this.setPersona(ids[nextIndex]);
  }

  /**
   * Finds the most natural, human-like neural voice matching the active persona.
   * Filters out robotic default synthesizers when high-quality neural voices exist.
   */
  getBestVoiceForPersona(personaId: VoicePersonaId = this.activePersonaId()): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.aoede;
    const matchers = persona.speechSynthesisVoiceMatchers;

    // 1. Try exact or prioritized neural/natural voice name matches
    for (const matcher of matchers) {
      const found = this.cachedVoices.find(v => 
        v.name.toLowerCase().includes(matcher.toLowerCase()) && 
        (v.lang.startsWith('en') || !v.lang)
      );
      if (found) return found;
    }

    // 2. Try any English voice with 'Natural', 'Enhanced', or 'Premium' in name
    const naturalVoice = this.cachedVoices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Premium') || v.name.includes('Google'))
    );
    if (naturalVoice) return naturalVoice;

    // 3. Fallback to first available English voice
    return this.cachedVoices.find(v => v.lang.startsWith('en')) || this.cachedVoices[0] || null;
  }

  /**
   * Speaks the provided text using the natural voice and calibrated prosody parameters.
   */
  speakText(text: string, personaId?: VoicePersonaId): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const targetId = personaId || this.activePersonaId();
      const persona = VOICE_PERSONAS[targetId] || VOICE_PERSONAS.aoede;
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = persona.rate;
      utterance.pitch = persona.pitch;

      const voice = this.getBestVoiceForPersona(targetId);
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('[VoicePersonaService] Speech synthesis error:', (err as Error)?.message);
      return false;
    }
  }

  /**
   * Cancels any active speech synthesis.
   */
  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
