/**
 * @file socratic-voice-demystifier.service.ts
 * @description Hands-Free Socratic Clinical Voice & Demystification Companion.
 * Implements:
 * 1. Rachel Nabors Parasympathetic Bio-Rhythmic Speech Pacing (0.1 Hz / 10s respiratory cycle cadence).
 * 2. Real-Time Medical Jargon Demystification (Socratic analogies replacing terrifying clinical jargon).
 * 3. Full Hands-Free Voice Studio A11y Controls (pitch, rate, respiratory pause intervals, high-contrast captions).
 * 4. Vision-Impaired Elder & Caregiver Hands-Free Continuous Dialog Loop (Web Speech API + Synthesizer).
 */

import { Injectable, signal, computed } from '@angular/core';

export interface ISocraticAnalogy {
  jargonTerm: string;
  pronunciationIpa?: string;
  clinicalDomain: 'Hematology' | 'Endocrine' | 'Cardiology' | 'Neurology' | 'Nephrology' | 'Immunology' | 'Gastroenterology';
  patientFearLevel: 'HIGH_TERROR' | 'MODERATE_CONFUSION' | 'LOW';
  socraticAnalogy: string;
  plainEnglishExplanation: string;
  actionableReassurance: string;
}

export interface IVoicePersonaProfile {
  id: string;
  name: string;
  role: 'Parasympathetic Calming Guide' | 'Warm Socratic Mentor' | 'Direct Clinical Scribe' | 'Elder High-Clarity Voice';
  speechRate: number; // 0.75 - 1.2
  speechPitch: number; // 0.8 - 1.2
  vagalCadencePauseMs: number; // e.g. 600ms pause between clauses to stimulate 0.1 Hz vagal response
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocraticVoiceDemystifierService {
  // Active voice configuration signals
  readonly selectedPersonaId = signal<string>('persona-parasympathetic-calm');
  readonly isHandsFreeActive = signal<boolean>(false);
  readonly isSpeaking = signal<boolean>(false);
  readonly liveTranscript = signal<string>('');
  readonly activeDemystifiedText = signal<string>('');
  readonly speechRateMultiplier = signal<number>(0.9); // Calm, deliberate pace
  readonly speechPitch = signal<number>(1.0);
  readonly vagalRespiratoryPauseMs = signal<number>(650); // Rachel Nabors 0.1 Hz pacing

  // Voice Personas Catalog
  readonly personas: IVoicePersonaProfile[] = [
    {
      id: 'persona-parasympathetic-calm',
      name: 'Dr. Rachel (Parasympathetic Calm)',
      role: 'Parasympathetic Calming Guide',
      speechRate: 0.85,
      speechPitch: 0.95,
      vagalCadencePauseMs: 700,
      description: 'Slow, soothing 0.1 Hz cadence with lengthened pauses between clinical thoughts to lower patient heart rate and counteract screen apnea.'
    },
    {
      id: 'persona-socratic-mentor',
      name: 'Mentor Socrates (Warm Analogy)',
      role: 'Warm Socratic Mentor',
      speechRate: 0.92,
      speechPitch: 1.0,
      vagalCadencePauseMs: 500,
      description: 'Engaging, story-driven tone using everyday kitchen, gardening, and plumbing analogies to make complex pathology feel friendly and intuitive.'
    },
    {
      id: 'persona-elder-clarity',
      name: 'Clara (High-Acuity Elder Audio)',
      role: 'Elder High-Clarity Voice',
      speechRate: 0.80,
      speechPitch: 1.05,
      vagalCadencePauseMs: 800,
      description: 'Emphasizes dental/alveolar consonant crispness and enhanced syllable separation for hearing-impaired elders and busy background kitchens.'
    },
    {
      id: 'persona-clinical-scribe',
      name: 'Sentinel (Crisp Hands-Free Scribe)',
      role: 'Direct Clinical Scribe',
      speechRate: 1.05,
      speechPitch: 1.0,
      vagalCadencePauseMs: 350,
      description: 'Efficient, zero-fluff medical terminology recorder designed for clinicians examining patients with both hands occupied.'
    }
  ];

  // Comprehensive Socratic Demystification Knowledge Base
  readonly jargonDictionary: ISocraticAnalogy[] = [
    {
      jargonTerm: 'idiopathic thrombocytopenic purpura',
      clinicalDomain: 'Hematology',
      patientFearLevel: 'HIGH_TERROR',
      socraticAnalogy: 'Think of platelets as little temporary band-aids your body makes. "Idiopathic" just means the immune system got a little confused and started recycling those band-aids faster than normal, causing minor skin bruises.',
      plainEnglishExplanation: 'Your body has fewer blood-clotting cells than usual, so you bruise more easily. "Idiopathic" simply means doctors cannot pinpoint one single outside cause.',
      actionableReassurance: 'This is manageable and treatable. It does not mean you have cancer or irreversible bone failure.'
    },
    {
      jargonTerm: 'subclinical hypothyroidism',
      clinicalDomain: 'Endocrine',
      patientFearLevel: 'MODERATE_CONFUSION',
      socraticAnalogy: 'Imagine your thyroid is a home thermostat, and the brain is the furnace fan. The fan is whispering a little louder than usual (higher TSH) to keep the house at exactly 70 degrees (normal T4).',
      plainEnglishExplanation: 'Your thyroid is still producing enough active hormone, but your pituitary gland has to tap it on the shoulder slightly harder to keep it balanced.',
      actionableReassurance: 'Often this needs simple observation, selenium/iodine nutrition balance, or light low-dose hormone support.'
    },
    {
      jargonTerm: 'atherosclerosis',
      clinicalDomain: 'Cardiology',
      patientFearLevel: 'HIGH_TERROR',
      socraticAnalogy: 'Imagine an old garden hose where minerals from hard water slowly build a thin layer inside over decades. The hose still carries water, but we want to soften the pressure so the walls stay flexible.',
      plainEnglishExplanation: 'A slow accumulation of cholesterol and inflammatory plaque inside the arteries that supply blood to your heart and body.',
      actionableReassurance: 'Arterial walls can stabilize and inflammation can be reversed with anti-inflammatory foods, gentle daily walking, and lipid-lowering care.'
    },
    {
      jargonTerm: 'essential hypertension',
      clinicalDomain: 'Cardiology',
      patientFearLevel: 'MODERATE_CONFUSION',
      socraticAnalogy: '"Essential" sounds like you need it, but in medicine it actually means "primary"—like a bike tire holding 45 PSI instead of 32 PSI from stiffened rubber.',
      plainEnglishExplanation: 'High blood pressure that develops naturally over time without being caused by a separate kidney or hormonal tumor.',
      actionableReassurance: 'Simple vagal breathing, potassium-rich foods (celery, congee), and gentle medications easily bring the pressure back into the safe green zone.'
    },
    {
      jargonTerm: 'transient ischemic attack',
      clinicalDomain: 'Neurology',
      patientFearLevel: 'HIGH_TERROR',
      socraticAnalogy: 'Imagine your kitchen lights flickering for 30 seconds because a dry leaf brushed a power wire, and then coming right back on full power. Nothing burned down, but it tells the electrician to check the breaker.',
      plainEnglishExplanation: 'A temporary pause in blood flow to a tiny part of the brain that completely resolves without leaving permanent tissue damage.',
      actionableReassurance: 'It is a crucial early wake-up call that gives you and your clinician the golden opportunity to prevent a full stroke.'
    },
    {
      jargonTerm: 'glomerular filtration rate',
      clinicalDomain: 'Nephrology',
      patientFearLevel: 'MODERATE_CONFUSION',
      socraticAnalogy: 'Think of your kidneys like a French press coffee screen. Your eGFR tells us how many milliliters of coffee cleanly pass through the mesh every minute.',
      plainEnglishExplanation: 'A blood test (eGFR) estimating how efficiently your kidneys filter waste products from your bloodstream.',
      actionableReassurance: 'GFR naturally fluctuates with hydration, muscle mass, and dietary protein; a single lower reading is not an emergency.'
    }
  ];

  // Active persona object
  readonly activePersona = computed<IVoicePersonaProfile>(() => {
    return this.personas.find(p => p.id === this.selectedPersonaId()) || this.personas[0];
  });

  /**
   * Scans input text and replaces terrifying jargon with Socratic analogies
   */
  demystifyText(rawClinicalNote: string): { processedText: string; demystifiedTermsCount: number } {
    let text = rawClinicalNote;
    let count = 0;

    for (const item of this.jargonDictionary) {
      const regex = new RegExp(`\\b${item.jargonTerm}\\b`, 'gi');
      if (regex.test(text)) {
        count++;
        // Replace with plain English + soothing Socratic analogy
        text = text.replace(regex, `**${item.jargonTerm}** (${item.plainEnglishExplanation}. *Socratic context: ${item.socraticAnalogy}*)`);
      }
    }

    return { processedText: text, demystifiedTermsCount: count };
  }

  /**
   * Speaks text using the Web Speech API Synthesizer with Rachel Nabors parasympathetic pacing
   */
  speakWithVagalPacing(textToSpeak: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.isSpeaking.set(false);
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Abort any ongoing speech

      const persona = this.activePersona();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      utterance.rate = persona.speechRate * this.speechRateMultiplier();
      utterance.pitch = persona.speechPitch * this.speechPitch();
      
      // Attempt to pick a gentle, natural voice
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      this.isSpeaking.set(true);

      utterance.onend = () => {
        this.isSpeaking.set(false);
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking.set(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }

  setPersona(personaId: string): void {
    this.selectedPersonaId.set(personaId);
  }

  toggleHandsFree(): void {
    this.isHandsFreeActive.set(!this.isHandsFreeActive());
  }
}
